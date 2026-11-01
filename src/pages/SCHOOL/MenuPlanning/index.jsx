import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import styles from "./index.module.scss"
import ROUTER from "src/router/ROUTER"
import { INITIAL_DISHES, INITIAL_SEASONINGS } from "./mockMenuData"

import CreateMenuHeader from "./component/CreateMenuHeader"
import MenuBasicInfoCard from "./component/MenuBasicInfoCard"
import MenuDishesTable from "./component/MenuDishesTable"
import MenuSeasoningCard from "./component/MenuSeasoningCard"
import AllergySafetyCard from "./component/AllergySafetyCard"
import AllergyAlternativeMealsCard from "./component/AllergyAlternativeMealsCard"
import CreateMenuBottomBar from "./component/CreateMenuBottomBar"
import AddDishModal from "./component/AddDishModal"
import ConfirmSubmitModal from "./component/ConfirmSubmitModal"

export default function MenuPlanning() {
  const navigate = useNavigate()

  // Form State
  const [formState, setFormState] = useState({
    name: "Thực đơn tiêu chuẩn tuần 46 – Bữa trưa",
    date: "26/10/2026",
    mealType: "LUNCH",
    targetScope: "ALL",
    portionCount: 520,
    notes: "Thực đơn giàu đạm và chất xơ, hạn chế muối theo tiêu chuẩn dinh dưỡng học đường."
  })

  // Dishes & Seasonings State
  const [dishes, setDishes] = useState(INITIAL_DISHES)
  const [seasonings] = useState(INITIAL_SEASONINGS)

  // Allergy Resolution Option (OPTION_1: Thay thế món, OPTION_2: Bố trí suất riêng)
  const [selectedAllergyOption, setSelectedAllergyOption] = useState("OPTION_2")

  // Modals & Feedback
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [toast, setToast] = useState(null)

  // Field change
  const handleChangeField = (field, value) => {
    setFormState(prev => {
      let portionCount = prev.portionCount
      if (field === "targetScope") {
        if (value === "ALL") portionCount = 520
        else if (value === "K1_K2") portionCount = 210
        else if (value === "K3_K5") portionCount = 310
      }
      return { ...prev, [field]: value, portionCount }
    })
  }

  // Conflict item
  const conflictDish = dishes.find(d => d.hasAllergyConflict)
  const conflictCount = conflictDish ? conflictDish.allergyCount : 0

  // Actions
  const handleRemoveDish = (dishId) => {
    setDishes(prev => prev.filter(d => d.id !== dishId))
    showToast("Đã xóa món ăn khỏi thực đơn", "info")
  }

  const handleSelectDishFromModal = (repoDish) => {
    const newDish = {
      id: `dish-${Date.now()}`,
      name: repoDish.name,
      category: repoDish.category,
      categoryType: repoDish.categoryType,
      hasAllergyConflict: Boolean(repoDish.allergenAlert),
      allergenName: repoDish.allergenAlert ? "Thủy sản / Cá" : null,
      allergyCount: repoDish.allergenAlert ? 8 : 0,
      allergyClasses: repoDish.allergenAlert ? ["Lớp 2A (3 HS)", "Lớp 4B (5 HS)"] : [],
      ingredients: [
        {
          id: `ing-${Date.now()}-1`,
          name: repoDish.ingredientsText.split("(")[0].trim(),
          supplier: repoDish.supplierName,
          portionQty: 50,
          unit: "g",
          hasAllergen: Boolean(repoDish.allergenAlert)
        }
      ]
    }

    setDishes(prev => [...prev, newDish])
    setIsAddModalOpen(false)
    showToast(`Đã thêm món "${repoDish.name}" vào thực đơn`, "success")
  }

  const handleSelectAllergyOption = (option) => {
    setSelectedAllergyOption(option)
    if (option === "OPTION_1") {
      showToast("Đã chuyển sang Phương án 1: Thay thế toàn bộ món ăn", "info")
    } else {
      showToast("Đã chọn Phương án 2: Bố trí suất ăn riêng kèm tem nhận diện", "success")
    }
  }

  const handleSaveDraft = () => {
    showToast("Đã lưu bản nháp thực đơn thành công (Trạng thái DRAFT)", "success")
  }

  const handleConfirmSubmit = () => {
    setIsConfirmModalOpen(false)
    showToast("Đã gửi thực đơn tuần 46 lên Ban Giám hiệu phê duyệt thành công!", "success")
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

      {/* Page Header with Breadcrumb */}
      <CreateMenuHeader onBack={() => navigate(ROUTER.SCHOOL_HEALTH_OVERVIEW)} />

      {/* Main 2-Column Grid (70% / 30%) */}
      <div className={styles.mainGrid}>
        {/* Left Column (70%) */}
        <div className={styles.leftCol}>
          {/* Khối A: Thông tin cơ bản */}
          <MenuBasicInfoCard
            formState={formState}
            onChangeField={handleChangeField}
          />

          {/* Khối B: Danh sách món ăn trong thực đơn */}
          <MenuDishesTable
            dishes={dishes}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onRemoveDish={handleRemoveDish}
          />

          {/* Khối C: Bố trí suất ăn riêng cho dị ứng (chỉ hiện khi chọn Phương án 2) */}
          {selectedAllergyOption === "OPTION_2" && (
            <AllergyAlternativeMealsCard
              conflictDish={conflictDish}
              portionCount={formState.portionCount}
            />
          )}

          {/* Khối D: Gia vị từ kho trường */}
          <MenuSeasoningCard
            seasonings={seasonings}
            portionCount={formState.portionCount}
          />
        </div>

        {/* Right Column (30% Sticky) */}
        <div className={styles.rightCol}>
          <AllergySafetyCard
            conflictDish={conflictDish}
            selectedOption={selectedAllergyOption}
            onSelectOption={handleSelectAllergyOption}
          />
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <CreateMenuBottomBar
        onCancel={() => navigate(ROUTER.SCHOOL_HEALTH_OVERVIEW)}
        onSaveDraft={handleSaveDraft}
        onSubmitApproval={() => setIsConfirmModalOpen(true)}
      />

      {/* Modal 24.1: Chọn món ăn vào thực đơn */}
      <AddDishModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSelectDish={handleSelectDishFromModal}
      />

      {/* Modal 24.2: Xác nhận gửi BGH duyệt */}
      <ConfirmSubmitModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmSubmit}
        menuData={formState}
        dishesCount={dishes.length}
        selectedAllergyOption={selectedAllergyOption}
        conflictCount={conflictCount}
      />
    </div>
  )
}
