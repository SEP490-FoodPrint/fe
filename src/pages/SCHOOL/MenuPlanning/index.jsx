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
import IngredientPickerModal from "./component/IngredientPickerModal"

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

  // Gia vị bữa ăn học đường (nhập định lượng, không check tồn kho)
  const [seasonings, setSeasonings] = useState(INITIAL_SEASONINGS)

  // Modal chọn nguyên liệu từ NCC liên kết (Phân loại -> NCC -> Nguyên liệu)
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [pickerContext, setPickerContext] = useState({ type: "dish", dishId: null })

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

  // Cập nhật định lượng gia vị
  const handleUpdateSeasoning = (seasoningId, newQty) => {
    setSeasonings(prev =>
      prev.map(s => (s.id === seasoningId ? { ...s, portionQty: newQty } : s))
    )
  }

  // Cập nhật thông tin món thay thế dị ứng
  const handleChangeSubstituteDish = (field, value) => {
    setSubstituteDish(prev => ({ ...prev, [field]: value }))
  }

  // Mở Popup chọn nguyên liệu cho món ăn cụ thể
  const handleOpenPickerForDish = (dishId) => {
    setPickerContext({ type: "dish", dishId })
    setIsPickerOpen(true)
  }

  // Mở Popup chọn nguyên liệu cho món thay thế dị ứng
  const handleOpenPickerForSubstitute = () => {
    setPickerContext({ type: "substitute", dishId: null })
    setIsPickerOpen(true)
  }

  // Khi người dùng chọn xong nguyên liệu từ Popup Modal
  const handleSelectIngredient = (ingredient) => {
    if (pickerContext.type === "dish" && pickerContext.dishId) {
      const existingDish = dishes.find(d => d.id === pickerContext.dishId)
      handleUpdateDish(pickerContext.dishId, {
        ingredientId: ingredient.id,
        ingredientCategory: ingredient.category,
        supplierId: ingredient.supplierId,
        portionQty: existingDish?.portionQty || 50,
        unit: existingDish?.unit || ingredient.unit || "g"
      })
      showToast(`Đã chọn nguyên liệu: "${ingredient.name}"`, "success")
    } else if (pickerContext.type === "substitute") {
      setSubstituteDish(prev => ({
        ...prev,
        ingredientId: ingredient.id,
        unit: prev.unit || ingredient.unit || "g"
      }))
      showToast(`Đã chọn nguyên liệu thay thế: "${ingredient.name}"`, "success")
    }
  }

  // Lấy ngữ cảnh tên món đang chọn để hiển thị trên tiêu đề Modal
  const currentTargetDish = pickerContext.type === "dish"
    ? dishes.find(d => d.id === pickerContext.dishId)
    : null

  const currentIngredientId = pickerContext.type === "dish"
    ? currentTargetDish?.ingredientId
    : substituteDish.ingredientId

  // Kiểm tra danh sách món có xung đột dị ứng (Đối soát ngầm sau khi đã chọn nguyên liệu)
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

        {/* Khối 2: Bảng món ăn trong thực đơn (Tên tự gõ, chọn nguyên liệu qua Popup Modal, đối soát dị ứng sau khi chọn) */}
        <MenuDishesTable
          dishes={dishes}
          onUpdateDish={handleUpdateDish}
          onAddDishRow={handleAddDishRow}
          onRemoveDish={handleRemoveDish}
          onOpenPicker={handleOpenPickerForDish}
        />

        {/* Khối 3: Bố trí suất ăn riêng cho học sinh dị ứng & Tạo món thay thế */}
        <AllergyAlternativeMealsCard
          conflictDishes={conflictDishes}
          portionCount={formState.portionCount}
          substituteDish={substituteDish}
          onChangeSubstituteDish={handleChangeSubstituteDish}
          onOpenPickerForSubstitute={handleOpenPickerForSubstitute}
        />

        {/* Khối 4: Gia vị dùng chung bữa ăn học đường (Chỉ nhập định lượng, KHÔNG check tồn kho) */}
        <MenuSeasoningCard
          seasonings={seasonings}
          portionCount={formState.portionCount}
          onUpdateSeasoning={handleUpdateSeasoning}
        />
      </div>

      {/* Sticky Bottom Action Bar */}
      <CreateMenuBottomBar
        onCancel={() => navigate(ROUTER.SCHOOL_HEALTH_OVERVIEW)}
        onSaveDraft={handleSaveDraft}
        onSubmitApproval={() => setIsConfirmModalOpen(true)}
      />

      {/* Popup Modal: Chọn nguyên liệu từ NCC liên kết (Phân loại -> NCC -> Nguyên liệu) */}
      <IngredientPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectIngredient={handleSelectIngredient}
        currentIngredientId={currentIngredientId}
        dishContextName={pickerContext.type === "dish" ? (currentTargetDish?.name || "Món ăn") : (substituteDish.name || "Món thay thế dị ứng")}
        onlySafe={pickerContext.type === "substitute"}
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
