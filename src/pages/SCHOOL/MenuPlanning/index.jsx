import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import styles from "./index.module.scss"
import ROUTER from "src/router/ROUTER"
import { INITIAL_DISHES, INITIAL_SEASONINGS, ALL_INGREDIENTS } from "./mockMenuData"

import CreateMenuHeader from "./component/CreateMenuHeader"
import MenuBasicInfoCard from "./component/MenuBasicInfoCard"
import MenuDishesTable from "./component/MenuDishesTable"
import AllergyAlternativeMealsCard from "./component/AllergyAlternativeMealsCard"
import MenuSeasoningCard from "./component/MenuSeasoningCard"
import CreateMenuBottomBar from "./component/CreateMenuBottomBar"
import ConfirmSubmitModal from "./component/ConfirmSubmitModal"

export default function MenuPlanning() {
  const navigate = useNavigate()

  // Form State
  const [formState, setFormState] = useState({
    name: "Thực đơn tuần 46 – Khối 1 & 2 – Bữa trưa",
    date: "26/10/2026",
    mealType: "LUNCH",
    targetScope: "Khối 1 & Khối 2 (Độ tuổi 6-7 tuổi)",
    portionCount: 210,
    notes: "Thực đơn giàu đạm và chất xơ, hạn chế muối theo tiêu chuẩn dinh dưỡng học đường."
  })

  // Danh sách món ăn trong thực đơn
  const [dishes, setDishes] = useState(INITIAL_DISHES)

  // Món thay thế cho học sinh dị ứng (Mặc định là suất ăn riêng)
  const [substituteDish, setSubstituteDish] = useState({
    name: "Thịt bò xào rau củ thập cẩm",
    ingredientId: "ing-vis-1",
    portionQty: 40,
    unit: "g"
  })

  // Gia vị dùng chung từ kho trường (giữ nguyên)
  const [seasonings] = useState(INITIAL_SEASONINGS)

  // Modal xác nhận gửi BGH duyệt
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [toast, setToast] = useState(null)

  // Cập nhật thông tin cơ bản
  const handleChangeField = (field, value) => {
    setFormState(prev => ({ ...prev, [field]: value }))
  }

  // Cập nhật từng món ăn trong bảng (nhận payload object)
  const handleUpdateDish = (dishId, updates) => {
    setDishes(prev =>
      prev.map(dish => {
        if (dish.id !== dishId) return dish
        return { ...dish, ...updates }
      })
    )
  }

  // Thêm dòng món ăn mới vào bảng
  const handleAddDishRow = () => {
    const newDish = {
      id: `dish-${Date.now()}`,
      name: "",
      ingredientCategory: "",
      supplierId: "",
      ingredientId: "",
      portionQty: 50,
      unit: "g"
    }
    setDishes(prev => [...prev, newDish])
    showToast("Đã thêm một dòng món ăn mới vào bảng", "info")
  }

  // Xóa món ăn khỏi bảng
  const handleRemoveDish = (dishId) => {
    setDishes(prev => prev.filter(d => d.id !== dishId))
    showToast("Đã xóa món ăn khỏi thực đơn", "info")
  }

  // Cập nhật thông tin món thay thế dị ứng
  const handleChangeSubstituteDish = (field, value) => {
    setSubstituteDish(prev => ({ ...prev, [field]: value }))
  }

  // Kiểm tra danh sách món có xung đột dị ứng
  const conflictDishes = dishes.filter(d => {
    const ing = ALL_INGREDIENTS.find(i => i.id === d.ingredientId)
    return Boolean(ing?.allergen)
  })

  const conflictCount = conflictDishes.length > 0 ? 12 : 0

  const handleSaveDraft = () => {
    showToast("Đã lưu bản nháp thực đơn thành công (Trạng thái DRAFT)", "success")
  }

  const handleConfirmSubmit = () => {
    setIsConfirmModalOpen(false)
    showToast("Đã gửi thực đơn lên Ban Giám hiệu phê duyệt thành công!", "success")
    setTimeout(() => {
      navigate(ROUTER.SCHOOL_HEALTH_OVERVIEW)
    }, 1200)
  }

  const showToast = (message, type = "success") => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 3500)
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
        {/* Page Header (Đã xóa Breadcrumb) */}
        <CreateMenuHeader onBack={() => navigate(ROUTER.SCHOOL_HEALTH_OVERVIEW)} />

        {/* Khối 1: Thông tin thực đơn (Khối lớp áp dụng nhập text tự do) */}
        <MenuBasicInfoCard
          formState={formState}
          onChangeField={handleChangeField}
        />

        {/* Khối 2: Bảng món ăn trong thực đơn (Tên tự gõ, NCC 3 cấp: Phân loại -> NCC -> Nguyên liệu, kiểm tra dị ứng inline sau khi chọn) */}
        <MenuDishesTable
          dishes={dishes}
          onUpdateDish={handleUpdateDish}
          onAddDishRow={handleAddDishRow}
          onRemoveDish={handleRemoveDish}
        />

        {/* Khối 3: Bố trí suất ăn riêng cho học sinh dị ứng & Tạo món thay thế */}
        <AllergyAlternativeMealsCard
          conflictDishes={conflictDishes}
          portionCount={formState.portionCount}
          substituteDish={substituteDish}
          onChangeSubstituteDish={handleChangeSubstituteDish}
        />

        {/* Khối 4: Gia vị dùng chung từ kho trường (giữ nguyên) */}
        <MenuSeasoningCard
          seasonings={seasonings}
          portionCount={formState.portionCount}
        />
      </div>

      {/* Sticky Bottom Action Bar */}
      <CreateMenuBottomBar
        onCancel={() => navigate(ROUTER.SCHOOL_HEALTH_OVERVIEW)}
        onSaveDraft={handleSaveDraft}
        onSubmitApproval={() => setIsConfirmModalOpen(true)}
      />

      {/* Modal xác nhận gửi BGH duyệt */}
      <ConfirmSubmitModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmSubmit}
        menuData={formState}
        dishesCount={dishes.length}
        selectedAllergyOption="OPTION_2"
        conflictCount={conflictCount}
      />
    </div>
  )
}
