import React, { useState, useEffect, useMemo, useCallback } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import FoodPrintLoading from "src/components/FoodPrintLoading"
import styles from "./index.module.scss"
import ROUTER from "src/router/ROUTER"
import http from "src/services/01_axios"
import MenuService from "src/services/MenuService"
import { apiMenuDetail } from "src/services/MenuService/urls"
import { parseDateVNToISO, menuWeekMeals, adaptBackendMenuDetailToView } from "src/services/MenuService/adapter"

import MenuDetailHeader from "./component/MenuDetailHeader"
import MenuDetailBGHFeedback from "./component/MenuDetailBGHFeedback"
import MenuDetailDishesTable from "./component/MenuDetailDishesTable"
import MenuDetailAllergyCard from "./component/MenuDetailAllergyCard"
import MenuDetailSeasoningsCard from "./component/MenuDetailSeasoningsCard"
import ConfirmSubmitModal from "../component/ConfirmSubmitModal"
import CreateMenuDayModal from "../CreateMenu/CreateMenuDayModal"

export default function MenuDetail() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const [menu, setMenu] = useState(null)
  const [rawWeeklyMenu, setRawWeeklyMenu] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")

  // Modal chỉnh sửa trực tiếp dạng popup
  const [isEditModalOpen, setIsEditModalOpen] = useState(
    Boolean(location.state?.autoOpenEdit)
  )

  const [isConfirmSubmitOpen, setIsConfirmSubmitOpen] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = "success") => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 3500)
  }

  // Tải chi tiết thực đơn và dữ liệu tuần gốc
  const fetchDetail = useCallback(async () => {
    setLoading(true)
    setLoadError("")
    let weeklyId = id
    if (typeof id === "string" && id.includes("_")) {
      weeklyId = id.split("_")[0]
    }
    try {
      const response = await http.get(apiMenuDetail(weeklyId), { notifyOnError: false })
      if (!response?.data?.id) throw new Error("Không tải được đầy đủ thực đơn tuần.")
      const parts = id.split("_")
      setRawWeeklyMenu(response.data)
      setMenu(adaptBackendMenuDetailToView(response.data, parts[1] || null, parts[2] || "LUNCH"))
    } catch (err) {
      setLoadError(err.message || "Không thể tải thông tin chi tiết thực đơn.")
      setMenu(null)
      setRawWeeklyMenu(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  // Chuẩn bị dữ liệu ngày cho CreateMenuDayModal
  const dayData = useMemo(() => {
    if (!menu) return null
    let dateISO = menu.rawDate
    if (!dateISO && menu.date) {
      dateISO = parseDateVNToISO(menu.date)
    }
    let dayLabel = "Thứ Hai"
    if (dateISO) {
      const d = new Date(dateISO)
      const dayOfWeek = d.getDay()
      const labels = ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"]
      dayLabel = labels[dayOfWeek] || "Thứ Hai"
    }
    return {
      dayLabel,
      dateVN: menu.date,
      dateISO,
    }
  }, [menu])

  // Lấy danh sách món ăn & gia vị cả 2 ca của ngày đó từ tuần thực đơn
  const dayMeals = useMemo(() => {
    if (!menu) return null
    if (rawWeeklyMenu) {
      const days = menuWeekMeals(rawWeeklyMenu)
      const dateISO = menu.rawDate || (menu.date && parseDateVNToISO(menu.date))
      const found = days.find((d) => d.date === dateISO || d.menuDayId === menu.menuDayId)
      if (found) {
        return {
          ...found,
          LUNCH: found.meals?.LUNCH?.dishes || [],
          AFTERNOON: found.meals?.AFTERNOON?.dishes || [],
          seasonings: Array.isArray(found.seasonings) ? found.seasonings : [],
          seasoningsByMeal: found.seasoningsByMeal || { LUNCH: [], AFTERNOON: [] },
        }
      }
    }
    // Fallback nếu không có rawWeeklyMenu
    const isLunch = menu.mealType !== "AFTERNOON"
    const currentDishes = (menu.dishes || []).map((d) => ({
      id: d.dishId || d.id,
      dishId: d.dishId || d.id,
      name: d.name,
      ingredientIds: d.ingredientIds || [],
      ingredientStandards: d.ingredientStandards || [],
      portionQty: d.portionQty ?? "",
      unit: d.unit || "g",
    }))
    const currentSeasonings = Array.isArray(menu.seasonings) ? menu.seasonings : []
    return {
      LUNCH: isLunch ? currentDishes : [],
      AFTERNOON: !isLunch ? currentDishes : [],
      seasonings: currentSeasonings,
      seasoningsByMeal: {
        LUNCH: isLunch ? currentSeasonings : [],
        AFTERNOON: !isLunch ? currentSeasonings : [],
      },
    }
  }, [menu, rawWeeklyMenu])

  // Lưu chỉnh sửa từ Popup trực tiếp lên Backend
  const handleSaveDay = async (updatedDay) => {
    const submit = menu.status === "PENDING_APPROVAL" || rawWeeklyMenu?.status === "PENDING_APPROVAL"
    try {
      await MenuService.saveMenuDay(menu.weeklyMenuId || id, updatedDay, { submit })
      setIsEditModalOpen(false)
      showToast(submit ? "Đã lưu và gửi BGH duyệt lại" : "Đã lưu chỉnh sửa thực đơn", "success")
      await fetchDetail()
    } catch (err) {
      showToast(err.message || "Không thể lưu cập nhật thực đơn.", "warning")
      throw err
    }
  }

  const handleConfirmSubmit = async () => {
    setIsConfirmSubmitOpen(false)
    const targetId = menu.weeklyMenuId || menu.id
    try {
      await MenuService.submitMenu(targetId)
      setMenu((prev) => ({
        ...prev,
        status: "PENDING_APPROVAL",
        statusLabel: "Chờ BGH duyệt",
      }))
      showToast("Đã gửi hồ sơ thực đơn lên Ban Giám Hiệu phê duyệt thành công!", "success")
    } catch (e) {
      showToast(e.message || "Không thể gửi duyệt thực đơn.", "warning")
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <FoodPrintLoading />
      </div>
    )
  }

  if (loadError || !menu) {
    return (
      <div className={styles.pageContainer}>
        <div className="p-8 text-center">
          <p className="text-red-600 font-medium mb-4">{loadError || "Không tìm thấy thực đơn yêu cầu."}</p>
          <button
            type="button"
            className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-800 transition"
            onClick={() => navigate(ROUTER.SCHOOL_MENU_PLANNING)}
          >
            Về danh sách thực đơn
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.pageContainer}>
      {/* Toast Notification */}
      {toast && (
        <div className={`${styles.toastNotice} ${styles[toast.type]}`}>
          <span className="material-symbols-outlined">
            {toast.type === "success" ? "check_circle" : "info"}
          </span>
          <span>{toast.message}</span>
        </div>
      )}

      <div className={styles.contentWrapper}>
        {/* Header với Tiêu đề, Mã thực đơn, Trạng thái và Nút Thao tác */}
        <MenuDetailHeader
          menu={menu}
          menuId={id}
          onEdit={() => setIsEditModalOpen(true)}
          onSubmitApproval={() => setIsConfirmSubmitOpen(true)}
        />

        {/* Khối Ý kiến phản hồi của Ban Giám Hiệu (nếu có yêu cầu chỉnh sửa) */}
        <MenuDetailBGHFeedback menu={menu} />

        {/* Khối Bảng danh sách món ăn & Định lượng nguyên liệu / suất */}
        <MenuDetailDishesTable dishes={menu.dishes} gradeIds={menu.gradeIds} />

        {/* Khối 3: Phương án an toàn suất ăn riêng dị ứng */}
        <MenuDetailAllergyCard menu={menu} />

        {/* Khối 4: Danh mục gia vị sử dụng từ kho nhà trường */}
        <MenuDetailSeasoningsCard seasonings={menu.seasonings} />
      </div>

      {/* Modal Popup Chỉnh sửa thực đơn ngày (50/50: Preview + Chọn món & Gia vị) */}
      {isEditModalOpen && rawWeeklyMenu && rawWeeklyMenu.status !== "APPROVED" && menu.status !== "APPROVED" && dayMeals?.canEdit !== false && (
        <CreateMenuDayModal
          gradeIds={menu.gradeIds}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          dayData={dayData}
          dayMenu={dayMeals}
          initialMealType={menu.mealType || "LUNCH"}
          onSaveDay={handleSaveDay}
          submitText={menu.status === "PENDING_APPROVAL" || rawWeeklyMenu.status === "PENDING_APPROVAL" ? "Lưu và gửi BGH duyệt lại" : "Lưu thay đổi"}
        />
      )}

      {/* Modal xác nhận gửi BGH duyệt */}
      <ConfirmSubmitModal
        isOpen={isConfirmSubmitOpen}
        onClose={() => setIsConfirmSubmitOpen(false)}
        onConfirm={handleConfirmSubmit}
        menuData={{
          name: menu.name,
          date: menu.date,
          mealType: menu.mealType,
          targetScope: menu.targetScope,
          portionCount: menu.portionCount,
          notes: menu.feedback,
        }}
        dishesCount={menu.dishes?.length || 0}
        selectedAllergyOption="OPTION_2"
        conflictCount={menu.hasAllergyMenu ? 12 : 0}
      />
    </div>
  )
}
