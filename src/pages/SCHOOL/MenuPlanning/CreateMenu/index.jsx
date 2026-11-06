import React, { useEffect, useState, useMemo, useCallback } from "react"
import { Alert, Button } from "@mui/material"
import { useNavigate, useLocation } from "react-router-dom"
import styles from "./CreateMenu.module.scss"
import ROUTER from "src/router/ROUTER"
import MenuService from "src/services/MenuService"
import {
  adaptBackendMenuDetailToView,
  normalizeStatus,
  parseDateVNToISO,
  formatDateVN,
  getSchoolWeekScheduleFromDate,
  getStatusLabel,
} from "src/services/MenuService/adapter"

import CreateMenuHeader from "../component/CreateMenuHeader"
import CreateMenuBottomBar from "../component/CreateMenuBottomBar"
import ConfirmSubmitModal from "../component/ConfirmSubmitModal"
import DishPickerModal from "../component/DishPickerModal"

import CreateMenuNavigator from "./CreateMenuNavigator"
import CreateMenuDishesTable from "./CreateMenuDishesTable"
import CreateMenuSidePreview from "./CreateMenuSidePreview"

export default function CreateMenu() {
  const navigate = useNavigate()
  const location = useLocation()
  const initialDate = location.state?.initialDate
  const initialMealType = location.state?.initialMealType

  // Hàm lấy ngày hôm nay theo định dạng DD/MM/YYYY (bỏ qua T7, CN)
  const getTodayFormatted = () => {
    if (initialDate) {
      if (initialDate.includes("-")) {
        const parts = initialDate.split("-")
        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
      }
      return initialDate
    }
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const currentDay = now.getDay()
    const daysSinceMonday = (currentDay + 6) % 7
    const weekendOffset = currentDay === 0 || currentDay === 6 ? 7 : 0
    now.setDate(now.getDate() - daysSinceMonday + weekendOffset)
    const d = String(now.getDate()).padStart(2, "0")
    const m = String(now.getMonth() + 1).padStart(2, "0")
    const y = now.getFullYear()
    return `${d}/${m}/${y}`
  }

  // 1. Form State (BỎ Hoàn toàn Số suất ăn dự kiến)
  const [formState, setFormState] = useState({
    name: "",
    date: getTodayFormatted(),
    mealType: initialMealType || "LUNCH",
    targetScope: "Toàn trường (Khối 1 - 5)",
    notes: "",
  })

  // 2. Danh sách món ăn trong ca ăn hiện tại
  const [dishes, setDishes] = useState([])

  // 3. Trạng thái Live Preview của cả tuần { [dateISO]: { LUNCH: [], AFTERNOON: [] } }
  const [weeklyMeals, setWeeklyMeals] = useState({})

  // 4. Modal Kho món ăn & Xác nhận
  const [isDishPickerOpen, setIsDishPickerOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [toast, setToast] = useState(null)

  // 5. Backend Menu data
  const [selectedDayMenu, setSelectedDayMenu] = useState(null)
  const [loadingSelectedDay, setLoadingSelectedDay] = useState(false)
  const [selectedDayError, setSelectedDayError] = useState("")
  const [selectedDayAttempt, setSelectedDayAttempt] = useState(0)

  // Tính toán dải tuần từ ngày hiện tại
  const weekInfo = useMemo(() => {
    return getSchoolWeekScheduleFromDate(formState.date)
  }, [formState.date])
  const schoolDays = weekInfo?.schoolDays || []

  // Đặt tên mặc định nếu chưa có tên
  useEffect(() => {
    setFormState((prev) => {
      const mealName = prev.mealType === "AFTERNOON" ? "Bữa xế" : "Bữa trưa"
      const dayLabel = weekInfo?.dayLabel || "Thứ Hai"
      return {
        ...prev,
        name: prev.name || `Thực đơn ${mealName} ${dayLabel} (${prev.date})`,
      }
    })
  }, [formState.date, formState.mealType, weekInfo?.dayLabel])

  // Nạp lịch tuần từ backend/mock
  useEffect(() => {
    let active = true
    const weekStart = schoolDays[0]?.dateISO
    if (!weekStart) return

    MenuService.getWeekSchedule(weekStart)
      .then((res) => {
        if (!active) return
        const days = res?.data?.days || []
        const mapped = {}
        days.forEach((day) => {
          if (day.date) {
            mapped[day.date] = {
              LUNCH: day.meals?.LUNCH?.dishes || [],
              AFTERNOON: day.meals?.AFTERNOON?.dishes || [],
            }
          }
        })
        setWeeklyMeals((prev) => ({
          ...mapped,
          ...prev,
        }))
      })
      .catch((err) => {
        console.warn("Lỗi nạp lịch tuần:", err)
      })

    return () => {
      active = false
    }
  }, [schoolDays[0]?.dateISO])

  // Cập nhật real-time món đang soạn thảo vào weeklyMeals để Live Preview bên phải thấy ngay
  useEffect(() => {
    const currentISO = parseDateVNToISO(formState.date)
    if (!currentISO) return

    setWeeklyMeals((prev) => {
      const existingDay = prev[currentISO] || {}
      return {
        ...prev,
        [currentISO]: {
          ...existingDay,
          [formState.mealType]: dishes.filter((d) => d.name && d.name.trim().length > 0),
        },
      }
    })
  }, [dishes, formState.date, formState.mealType])

  // Tải chi tiết thực đơn khi đổi ngày hoặc ca ăn
  useEffect(() => {
    let active = true
    const loadSelectedDay = async () => {
      setLoadingSelectedDay(true)
      setSelectedDayError("")
      try {
        const schedule = await MenuService.getWeekSchedule(formState.date)
        const selectedISO = parseDateVNToISO(formState.date)
        const selectedDate = schedule?.data?.days?.find(
          (day) => day.date === selectedISO || day.dateVN === formState.date
        )

        if (
          !selectedDate?.hasMenu ||
          !schedule?.data?.weeklyMenuId ||
          !selectedDate?.menuDayId
        ) {
          if (!active) return
          setSelectedDayMenu(
            selectedDate
              ? {
                  ...selectedDate,
                  weeklyMenuId: schedule?.data?.weeklyMenuId || null,
                  weeklyStatus: schedule?.data?.weeklyMenuStatus || "DRAFT",
                  status: selectedDate.hasMenu ? selectedDate.status : "DRAFT",
                  hasMeal: false,
                }
              : null
          )

          // Khôi phục món đã soạn từ weeklyMeals nếu có
          const cachedDishes = weeklyMeals[selectedISO]?.[formState.mealType] || []
          setDishes(cachedDishes)
          return
        }

        const menu = schedule.data.weeklyMenu?.menuDays?.[0]?.menuDayDishes?.[0]?.Dish
          ? adaptBackendMenuDetailToView(
              schedule.data.weeklyMenu,
              selectedDate.menuDayId,
              formState.mealType
            )
          : (
              await MenuService.getMenuDetail(
                `${schedule.data.weeklyMenuId}_${selectedDate.menuDayId}_${formState.mealType}`
              )
            )?.data
        if (!active) return
        if (!menu) {
          throw new Error("Không tải được thực đơn của ngày đã chọn.")
        }

        const hasMeal = Boolean(menu.hasMeal)
        const dayMenu = {
          ...selectedDate,
          weeklyMenuId: schedule.data.weeklyMenuId,
          menuDayId: selectedDate.menuDayId,
          status: menu.status || selectedDate.status,
          weeklyStatus: menu.weeklyStatus || schedule.data.weeklyMenuStatus,
          hasMeal,
          name: menu.name,
        }
        setSelectedDayMenu(dayMenu)

        if (!hasMeal) {
          const cachedDishes = weeklyMeals[selectedISO]?.[formState.mealType] || []
          setDishes(cachedDishes)
          return
        }

        setFormState((current) => ({
          ...current,
          name: menu.name || current.name,
          date: menu.date || current.date,
          mealType: menu.mealType || current.mealType,
          targetScope: menu.targetScope || current.targetScope,
          notes: menu.feedback || "",
        }))

        setDishes(
          (menu.dishes || []).map((dish, index) => ({
            id: `dish-day-${dish.dishId || dish.id || index}`,
            dishId: dish.dishId || dish.id,
            name: dish.name,
            category: dish.category,
            categoryLabel: dish.categoryLabel,
            portionQty: dish.portionQty || 50,
            unit: dish.unit || "g",
            mainIngredient: dish.mainIngredient || dish.ingredientNames?.[0] || dish.name,
            supplierName: dish.supplierName || "CP Foods Việt Nam",
            supplierBadge: dish.supplierBadge || "VietGAP",
            ingredientIds: dish.ingredientIds || [],
          }))
        )
      } catch (err) {
        if (!active) return
        setSelectedDayError(err.message || "Lỗi tải thực đơn")
      } finally {
        if (active) setLoadingSelectedDay(false)
      }
    }

    loadSelectedDay()
    return () => {
      active = false
    }
  }, [formState.date, formState.mealType, selectedDayAttempt])

  // Chuyển đổi ngày / ca ăn khi click vào ô trên Live Preview tuần
  const handleSelectMealFromPreview = useCallback((dateISO, mealType) => {
    const targetDay = schoolDays.find((sd) => sd.dateISO === dateISO)
    const dateVN = targetDay ? targetDay.dateVN : formatDateVN(dateISO)
    const mealLabel = mealType === "AFTERNOON" ? "Bữa xế" : "Bữa trưa"
    const dayLabel = targetDay?.dayLabel || "Thứ Hai"

    setFormState((prev) => ({
      ...prev,
      date: dateVN,
      mealType: mealType,
      name: `Thực đơn ${mealLabel} ${dayLabel} (${dateVN})`,
    }))
  }, [schoolDays])

  // Chọn ngày từ dải nút thứ 2 - thứ 6
  const handleSelectDay = useCallback((dayVN) => {
    const targetDay = schoolDays.find((sd) => sd.dateVN === dayVN)
    const mealLabel = formState.mealType === "AFTERNOON" ? "Bữa xế" : "Bữa trưa"
    const dayLabel = targetDay?.dayLabel || ""

    setFormState((prev) => ({
      ...prev,
      date: dayVN,
      name: `Thực đơn ${mealLabel} ${dayLabel} (${dayVN})`,
    }))
  }, [schoolDays, formState.mealType])

  // Chọn ca ăn (Bữa trưa / Bữa xế)
  const handleSelectMealType = useCallback((mealType) => {
    const mealLabel = mealType === "AFTERNOON" ? "Bữa xế" : "Bữa trưa"
    const dayLabel = weekInfo?.dayLabel || ""

    setFormState((prev) => ({
      ...prev,
      mealType: mealType,
      name: `Thực đơn ${mealLabel} ${dayLabel} (${prev.date})`,
    }))
  }, [weekInfo?.dayLabel])

  // Chuyển tuần (tuần trước / tuần sau)
  const handleShiftWeek = useCallback((offset) => {
    if (!formState.date) return
    const currentISO = parseDateVNToISO(formState.date)
    if (!currentISO) return
    const curDate = new Date(currentISO)
    curDate.setDate(curDate.getDate() + offset * 7)
    const newDateVN = formatDateVN(curDate.toISOString().slice(0, 10))
    setFormState((prev) => ({
      ...prev,
      date: newDateVN,
      name: "",
    }))
  }, [formState.date])

  const handleChangeField = useCallback((field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }, [])

  // Thêm món ăn từ Kho Món Ăn (Master Data)
  const handleSelectDishesFromPicker = useCallback((pickedList) => {
    if (!Array.isArray(pickedList) || pickedList.length === 0) return

    const newEntries = pickedList.map((picked, idx) => ({
      id: `dish-picked-${Date.now()}-${idx}`,
      dishId: picked.id,
      name: picked.name,
      category: picked.category,
      categoryLabel: picked.categoryLabel,
      portionQty: picked.portionQty || 50,
      unit: picked.unit || "g",
      mainIngredient: picked.mainIngredient || picked.ingredientNames?.[0] || picked.name,
      supplierName: picked.supplierName || "CP Foods Việt Nam",
      supplierBadge: picked.supplierBadge || "VietGAP",
      ingredientIds: picked.ingredientIds || [],
    }))

    setDishes((prev) => {
      // Loại bỏ các món trùng ID nếu có
      const existingIds = new Set(prev.map((d) => d.dishId || d.name))
      const filteredNew = newEntries.filter((n) => !existingIds.has(n.dishId || n.name))
      return [...prev, ...filteredNew]
    })

    showToast(`Đã thêm ${newEntries.length} món từ Kho vào thực đơn`, "success")
  }, [])

  // Xóa món khỏi ca ăn
  const handleRemoveDish = useCallback((dishId) => {
    setDishes((prev) => prev.filter((d) => d.id !== dishId))
    showToast("Đã xóa món khỏi ca ăn", "info")
  }, [])

  const isReadOnly = normalizeStatus(selectedDayMenu?.status) === "APPROVED"

  // Lưu bản nháp
  const handleSaveDraft = async () => {
    if (!formState.name.trim()) {
      showToast("Vui lòng nhập tên thực đơn trước khi lưu", "warning")
      return
    }
    try {
      const res = await MenuService.createMenu({
        formState,
        dishes,
        substituteDish: null,
        seasonings: [],
      })
      showToast(
        res.message || "Đã lưu bản nháp thực đơn thành công",
        "success"
      )
      setTimeout(() => {
        navigate(ROUTER.SCHOOL_MENU_PLANNING)
      }, 1000)
    } catch (err) {
      showToast("Không thể lưu bản nháp: " + err.message, "warning")
    }
  }

  // Mở modal xác nhận gửi duyệt
  const handleOpenConfirmSubmit = () => {
    if (!formState.name.trim()) {
      showToast("Vui lòng nhập tên thực đơn trước khi gửi duyệt", "warning")
      return
    }
    const hasValidDish = dishes.some((d) => d.name && d.name.trim().length > 0)
    if (!hasValidDish) {
      showToast("Vui lòng chọn ít nhất 1 món ăn từ Kho vào thực đơn", "warning")
      return
    }
    setIsConfirmModalOpen(true)
  }

  // Xác nhận gửi Ban Giám Hiệu duyệt
  const handleConfirmSubmit = async () => {
    setIsConfirmModalOpen(false)
    try {
      const created = await MenuService.createMenu({
        formState,
        dishes,
        substituteDish: null,
        seasonings: [],
      })
      if (created?.data?.id) {
        await MenuService.submitMenu(created.data.id)
      }
      showToast(
        "Đã gửi thực đơn lên Ban Giám hiệu phê duyệt thành công!",
        "success"
      )
      setTimeout(() => {
        navigate(ROUTER.SCHOOL_MENU_PLANNING)
      }, 1200)
    } catch (err) {
      showToast("Lỗi gửi duyệt: " + err.message, "warning")
    }
  }

  const showToast = (message, type = "success") => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 3500)
  }

  return (
    <div className={styles.pageContainer}>
      {/* Toast thông báo */}
      {toast && (
        <div className={`${styles.toastNotice} ${styles[toast.type]}`}>
          <span>{toast.message}</span>
        </div>
      )}

      <div className={styles.contentWrapper}>
        {/* Header trang */}
        <CreateMenuHeader
          onBack={() => navigate(ROUTER.SCHOOL_MENU_PLANNING)}
          selectedDayMenu={selectedDayMenu}
          readOnly={isReadOnly}
          statusLabel={getStatusLabel(selectedDayMenu?.status)}
        />

        {/* Thông báo trạng thái nếu có */}
        {loadingSelectedDay ? (
          <div role="status" className={styles.menuStatusNotice}>
            Đang tải thực đơn của ca ăn đã chọn…
          </div>
        ) : selectedDayError ? (
          <Alert
            severity="error"
            className={styles.menuStatusNotice}
            action={
              <Button
                color="inherit"
                onClick={() => setSelectedDayAttempt((v) => v + 1)}
              >
                Tải lại
              </Button>
            }
          >
            {selectedDayError}
          </Alert>
        ) : null}

        {/* BỐ CỤC 2 CỘT TÁCH BIỆT (SPLIT LAYOUT):
            - Cột trái: Soạn thảo ca ăn (Điều hướng ngày/ca, thông tin, bảng món ăn)
            - Cột phải: Live Preview Thực đơn Tuần (Sticky cố định, cập nhật tức thì, không cần kéo lên) */}
        <div className={styles.splitLayout}>
          {/* CỘT TRÁI: KHU VỰC SOẠN THẢO */}
          <div className={styles.editorPane}>
            {/* 1. Bộ điều hướng ngày học & thông tin ca ăn (BỎ số suất ăn dự kiến) */}
            <CreateMenuNavigator
              weekInfo={weekInfo}
              formState={formState}
              weeklyMeals={weeklyMeals}
              onChangeField={handleChangeField}
              onSelectDay={handleSelectDay}
              onSelectMealType={handleSelectMealType}
              onShiftWeek={handleShiftWeek}
              readOnly={isReadOnly}
            />

            {/* 2. Bảng món ăn trong ca ăn (Chỉ chọn từ Kho món ăn, không chọn nguyên liệu hay nhập định lượng) */}
            <CreateMenuDishesTable
              dishes={dishes}
              onOpenDishPicker={() => setIsDishPickerOpen(true)}
              onRemoveDish={handleRemoveDish}
              readOnly={isReadOnly}
            />
          </div>

          {/* CỘT PHẢI: XEM TRƯỚC THỰC ĐƠN TUẦN (STICKY LIVE PREVIEW) */}
          <div className={styles.previewPane}>
            <CreateMenuSidePreview
              schoolDays={schoolDays}
              weeklyMeals={weeklyMeals}
              activeDate={parseDateVNToISO(formState.date) || formState.date}
              activeMealType={formState.mealType}
              onSelectMeal={handleSelectMealFromPreview}
            />
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <CreateMenuBottomBar
        onCancel={() => navigate(ROUTER.SCHOOL_MENU_PLANNING)}
        onSaveDraft={handleSaveDraft}
        onSubmitApproval={handleOpenConfirmSubmit}
        isLoading={loadingSelectedDay || Boolean(selectedDayError)}
        readOnly={isReadOnly}
        onView={() =>
          selectedDayMenu?.weeklyMenuId &&
          selectedDayMenu?.menuDayId &&
          navigate(
            ROUTER.SCHOOL_MENU_DETAIL.replace(
              ":id",
              `${selectedDayMenu.weeklyMenuId}_${selectedDayMenu.menuDayId}_${formState.mealType}`
            )
          )
        }
      />

      {/* Modal: Kho Món Ăn Bán Trú (Multi-select các món chuẩn) */}
      <DishPickerModal
        isOpen={isDishPickerOpen}
        onClose={() => setIsDishPickerOpen(false)}
        onSelectDishes={handleSelectDishesFromPicker}
        currentMealType={formState.mealType}
        singleSelect={false}
        initialSelectedIds={dishes.map((d) => d.dishId || d.id)}
      />

      {/* Modal xác nhận gửi BGH duyệt */}
      <ConfirmSubmitModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmSubmit}
        menuData={formState}
        dishesCount={dishes.length}
        selectedAllergyOption="OPTION_2"
        conflictCount={0}
      />
    </div>
  )
}
