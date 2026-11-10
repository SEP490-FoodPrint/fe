import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import FoodPrintLoading from "src/components/FoodPrintLoading"
import styles from "./index.module.scss"
import ROUTER from "src/router/ROUTER"
import MenuService from "src/services/MenuService"

import MenuDetailHeader from "./component/MenuDetailHeader"
import MenuDetailBGHFeedback from "./component/MenuDetailBGHFeedback"
import MenuDetailBasicInfo from "./component/MenuDetailBasicInfo"
import MenuDetailDishesTable from "./component/MenuDetailDishesTable"
import MenuDetailAllergyCard from "./component/MenuDetailAllergyCard"
import MenuDetailSeasoningsCard from "./component/MenuDetailSeasoningsCard"
import MenuDetailTimeline from "./component/MenuDetailTimeline"
import ConfirmSubmitModal from "../component/ConfirmSubmitModal"

export default function MenuDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [menu, setMenu] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [isConfirmSubmitOpen, setIsConfirmSubmitOpen] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    let isMounted = true
    const fetchDetail = async () => {
      setLoading(true)
      setLoadError("")
      try {
        const res = await MenuService.getMenuDetail(id)
        if (isMounted && res?.data) {
          setMenu(res.data)
        }
      } catch (err) {
        if (isMounted) {
          setLoadError(err.message || "Không thể tải thông tin chi tiết thực đơn.")
          setMenu(null)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchDetail()
    return () => { isMounted = false }
  }, [id])

  const showToast = (message, type = "success") => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 3500)
  }

  // Xử lý gửi BGH duyệt từ trang chi tiết
  const handleConfirmSubmit = async () => {
    setIsConfirmSubmitOpen(false)
    const targetId = menu.weeklyMenuId || menu.id
    try {
      await MenuService.submitMenu(targetId)
      setMenu(prev => ({
        ...prev,
        status: "PENDING_APPROVAL",
        statusLabel: "Chờ BGH duyệt"
      }))
      showToast("Đã gửi hồ sơ thực đơn lên Ban Giám Hiệu phê duyệt thành công!", "success")
    } catch (e) {
      showToast(e.message || "Không thể gửi duyệt thực đơn.", "warning")
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <FoodPrintLoading size="large" />
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
          onSubmitApproval={() => setIsConfirmSubmitOpen(true)}
        />

        {/* Khối Ý kiến phản hồi của Ban Giám Hiệu (nếu có) */}
        {menu.feedback && <MenuDetailBGHFeedback feedback={menu.feedback} status={menu.status} />}

        {/* Khối 1: Thông tin kế hoạch & Phạm vi áp dụng */}
        <MenuDetailBasicInfo menu={menu} />

        {/* Khối 2: Bảng cơ cấu món ăn trong thực đơn & Đối soát định lượng */}
        <MenuDetailDishesTable dishes={menu.dishes} />

        {/* Khối 3: Phương án an toàn suất ăn riêng dị ứng */}
        <MenuDetailAllergyCard menu={menu} />

        {/* Khối 4: Danh mục gia vị sử dụng từ kho nhà trường */}
        <MenuDetailSeasoningsCard seasonings={menu.seasonings} />

        {/* Khối 5: Lịch sử theo dõi tiến trình & Kiểm duyệt */}
        <MenuDetailTimeline menu={menu} />
      </div>

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
          notes: menu.feedback
        }}
        dishesCount={menu.dishes?.length || 0}
        selectedAllergyOption="OPTION_2"
        conflictCount={menu.hasAllergyMenu ? 12 : 0}
      />
    </div>
  )
}
