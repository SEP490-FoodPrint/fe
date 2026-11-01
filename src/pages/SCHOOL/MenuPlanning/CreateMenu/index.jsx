import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import styles from "./CreateMenu.module.scss"
import ROUTER from "src/router/ROUTER"
import { INITIAL_DISHES, INITIAL_SEASONINGS, ALL_INGREDIENTS } from "../mockMenuData"

import CreateMenuHeader from "../component/CreateMenuHeader"
import MenuBasicInfoCard from "../component/MenuBasicInfoCard"
import MenuDishesTable from "../component/MenuDishesTable"
import AllergyAlternativeMealsCard from "../component/AllergyAlternativeMealsCard"
import MenuSeasoningCard from "../component/MenuSeasoningCard"
import CreateMenuBottomBar from "../component/CreateMenuBottomBar"
import ConfirmSubmitModal from "../component/ConfirmSubmitModal"
import IngredientPickerModal from "../component/IngredientPickerModal"

export default function CreateMenu() {
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

  // Danh sách món ăn trong thực đơn (mỗi món có thể có nhiều nguyên liệu chính)
  const [dishes, setDishes] = useState(INITIAL_DISHES)

  // Món thay thế cho học sinh dị ứng (Mặc định là suất ăn riêng)
  const [substituteDish, setSubstituteDish] = useState({
    name: "Thịt bò xào rau củ thập cẩm",
    ingredientId: "ing-vis-1",
    portionQty: 40,
    unit: "g"
  })

  // Gia vị bữa ăn học đường (chọn từ danh mục kho, nhập định lượng, không check tồn kho)
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
      ingredientIds: [],
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

  // Xóa một nguyên liệu khỏi món ăn
  const handleRemoveIngredientFromDish = (dishId, ingredientId) => {
    const targetDish = dishes.find(d => d.id === dishId)
    if (!targetDish) return
    const currentIds = targetDish.ingredientIds || (targetDish.ingredientId ? [targetDish.ingredientId] : [])
    const newIds = currentIds.filter(id => id !== ingredientId)
    handleUpdateDish(dishId, { ingredientIds: newIds })
    showToast("Đã xóa nguyên liệu khỏi món", "info")
  }

  // Quản lý Gia vị (chọn từ danh mục kho nguyên liệu)
  const handleAddSeasoning = () => {
    const newSeasoning = {
      id: `seas-${Date.now()}`,
      catalogId: "",
      name: "",
      portionQty: 1,
      unit: "g"
    }
    setSeasonings(prev => [...prev, newSeasoning])
    showToast("Đã thêm một dòng gia vị mới", "info")
  }

  const handleRemoveSeasoning = (seasoningId) => {
    setSeasonings(prev => prev.filter(s => s.id !== seasoningId))
    showToast("Đã xóa gia vị", "info")
  }

  const handleUpdateSeasoning = (seasoningId, updates) => {
    setSeasonings(prev =>
      prev.map(s => (s.id === seasoningId ? { ...s, ...updates } : s))
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

  // Toggle nguyên liệu trong Popup Modal (chọn được nhiều nguyên liệu)
  const handleToggleIngredient = (ingredient) => {
    if (pickerContext.type === "dish" && pickerContext.dishId) {
      const targetDish = dishes.find(d => d.id === pickerContext.dishId)
      if (!targetDish) return
      const currentIds = targetDish.ingredientIds || (targetDish.ingredientId ? [targetDish.ingredientId] : [])
      const exists = currentIds.includes(ingredient.id)
      const newIds = exists
        ? currentIds.filter(id => id !== ingredient.id)
        : [...currentIds, ingredient.id]

      handleUpdateDish(pickerContext.dishId, {
        ingredientIds: newIds
      })

      if (exists) {
        showToast(`Đã bỏ nguyên liệu "${ingredient.name}"`, "info")
      } else {
        showToast(`Đã thêm nguyên liệu "${ingredient.name}" vào món`, "success")
      }
    } else if (pickerContext.type === "substitute") {
      setSubstituteDish(prev => ({
        ...prev,
        ingredientId: ingredient.id,
        unit: prev.unit || ingredient.unit || "g"
      }))
      showToast(`Đã chọn nguyên liệu thay thế: "${ingredient.name}"`, "success")
      setIsPickerOpen(false)
    }
  }

  // Lấy ngữ cảnh tên món đang chọn để hiển thị trên tiêu đề Modal
  const currentTargetDish = pickerContext.type === "dish"
    ? dishes.find(d => d.id === pickerContext.dishId)
    : null

  const selectedIngredientIds = pickerContext.type === "dish"
    ? (currentTargetDish?.ingredientIds || (currentTargetDish?.ingredientId ? [currentTargetDish.ingredientId] : []))
    : (substituteDish.ingredientId ? [substituteDish.ingredientId] : [])

  // Kiểm tra danh sách món có xung đột dị ứng (Kiểm tra trên TẤT CẢ các nguyên liệu đã chọn)
  const conflictDishes = dishes.filter(d => {
    const ids = d.ingredientIds || (d.ingredientId ? [d.ingredientId] : [])
    return ids.some(id => {
      const ing = ALL_INGREDIENTS.find(i => i.id === id)
      return Boolean(ing?.allergen)
    })
  })

  const conflictCount = conflictDishes.length > 0 ? 12 : 0

  const handleSaveDraft = () => {
    showToast("Đã lưu bản nháp thực đơn thành công (Trạng thái DRAFT)", "success")
  }

  const handleConfirmSubmit = () => {
    setIsConfirmModalOpen(false)
    showToast("Đã gửi thực đơn lên Ban Giám hiệu phê duyệt thành công!", "success")
    setTimeout(() => {
      navigate(ROUTER.SCHOOL_MENU_PLANNING)
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
            {toast.type === "success" ? "check_circle" : toast.type === "warning" ? "warning" : "info"}
          </span>
          <span>{toast.message}</span>
        </div>
      )}

      <div className={styles.contentWrapper}>
        {/* Page Header */}
        <CreateMenuHeader onBack={() => navigate(ROUTER.SCHOOL_MENU_PLANNING)} />

        {/* Khối 1: Thông tin thực đơn (Khối lớp áp dụng nhập text tự do) */}
        <MenuBasicInfoCard
          formState={formState}
          onChangeField={handleChangeField}
        />

        {/* Khối 2: Bảng món ăn trong thực đơn (Chọn nhiều nguyên liệu, icon thay đổi, đối soát dị ứng tự động) */}
        <MenuDishesTable
          dishes={dishes}
          onUpdateDish={handleUpdateDish}
          onAddDishRow={handleAddDishRow}
          onRemoveDish={handleRemoveDish}
          onOpenPicker={handleOpenPickerForDish}
          onRemoveIngredientFromDish={handleRemoveIngredientFromDish}
        />

        {/* Khối 3: Bố trí suất ăn riêng cho học sinh dị ứng & Tạo món thay thế */}
        <AllergyAlternativeMealsCard
          conflictDishes={conflictDishes}
          portionCount={formState.portionCount}
          substituteDish={substituteDish}
          onChangeSubstituteDish={handleChangeSubstituteDish}
          onOpenPickerForSubstitute={handleOpenPickerForSubstitute}
        />

        {/* Khối 4: Gia vị dùng chung (Chọn từ danh mục kho do Quản lý nguyên liệu nhập, nhập định lượng) */}
        <MenuSeasoningCard
          seasonings={seasonings}
          portionCount={formState.portionCount}
          onUpdateSeasoning={handleUpdateSeasoning}
          onAddSeasoning={handleAddSeasoning}
          onRemoveSeasoning={handleRemoveSeasoning}
        />
      </div>

      {/* Sticky Bottom Action Bar */}
      <CreateMenuBottomBar
        onCancel={() => navigate(ROUTER.SCHOOL_MENU_PLANNING)}
        onSaveDraft={handleSaveDraft}
        onSubmitApproval={() => setIsConfirmModalOpen(true)}
      />

      {/* Popup Modal: Chọn nguyên liệu từ NCC liên kết (hỗ trợ chọn nhiều) */}
      <IngredientPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        selectedIngredientIds={selectedIngredientIds}
        onToggleIngredient={handleToggleIngredient}
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
