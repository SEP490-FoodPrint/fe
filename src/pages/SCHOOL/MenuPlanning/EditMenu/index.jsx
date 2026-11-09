import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import styles from "./EditMenu.module.scss"
import ROUTER from "src/router/ROUTER"
import { ALL_INGREDIENTS } from "../mockMenuData"
import MenuService from "src/services/MenuService"

import EditMenuHeader from "./component/EditMenuHeader"
import MenuDetailBGHFeedback from "../MenuDetail/component/MenuDetailBGHFeedback"
import MenuBasicInfoCard from "../component/MenuBasicInfoCard"
import MenuDishesTable from "../component/MenuDishesTable"
import AllergyAlternativeMealsCard from "../component/AllergyAlternativeMealsCard"
import MenuSeasoningCard from "../component/MenuSeasoningCard"
import CreateMenuBottomBar from "../component/CreateMenuBottomBar"
import ConfirmSubmitModal from "../component/ConfirmSubmitModal"
import IngredientPickerModal from "../component/IngredientPickerModal"

export default function EditMenu() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [menu, setMenu] = useState(null)
  const [formState, setFormState] = useState(null)
  const [dishes, setDishes] = useState([])
  const [substituteDish, setSubstituteDish] = useState(null)
  const [seasonings, setSeasonings] = useState([])

  // Modals & Context
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [pickerContext, setPickerContext] = useState({ type: "dish", dishId: null })
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [toast, setToast] = useState(null)

  // Khởi tạo dữ liệu từ API hoặc mock fallback theo ID
  useEffect(() => {
    let isMounted = true
    const loadMenu = async () => {
      try {
        const res = await MenuService.getMenuDetail(id)
        const rawMenu = res?.data
        if (!isMounted || !rawMenu) return
        setMenu(rawMenu)

        // Form state
        setFormState({
          name: rawMenu.name,
          date: rawMenu.date,
          mealType: rawMenu.mealType === "AFTERNOON_SNACK" ? "AFTERNOON" : rawMenu.mealType,
          targetScope: rawMenu.targetScope || "Toàn trường",
          notes: rawMenu.feedback || ""
        })

        // Map dishes
        if (rawMenu.dishes && rawMenu.dishes.length > 0) {
          const mappedDishes = rawMenu.dishes.map((d, idx) => {
            const qtyMatch = (d.qty || "50g").match(/(\d+)/)
            const qtyNum = qtyMatch ? parseInt(qtyMatch[1], 10) : 50

            // Tìm matching ingredient IDs từ danh mục ALL_INGREDIENTS hoặc ingredientIds có sẵn
            let matchedIds = d.ingredientIds || []
            if (matchedIds.length === 0 && d.ingredients && Array.isArray(d.ingredients)) {
              d.ingredients.forEach(ingName => {
                const found = ALL_INGREDIENTS.find(ai =>
                  ai.name.toLowerCase().includes(ingName.toLowerCase().split("(")[0].trim()) ||
                  ingName.toLowerCase().includes(ai.name.toLowerCase())
                )
                if (found && !matchedIds.includes(found.id)) {
                  matchedIds.push(found.id)
                }
              })
            }

            // Nếu không khớp, gán default ingredient
            if (matchedIds.length === 0) {
              if (idx === 0) matchedIds.push("ing-sea-1")
              else if (idx === 1) matchedIds.push("ing-cp-1")
              else if (idx === 2) matchedIds.push("ing-veg-2")
              else matchedIds.push("ing-rice-1")
            }

            return {
              id: `dish-edit-${idx + 1}`,
              dishId: d.dishId || undefined,
              name: d.name,
              ingredientIds: matchedIds,
              portionQty: qtyNum,
              unit: "g"
            }
          })
          setDishes(mappedDishes)
        }

        // Map substitute dish
        if (rawMenu.substituteDish) {
          const subQtyMatch = (rawMenu.substituteDish.qty || "45g").match(/(\d+)/)
          setSubstituteDish({
            name: rawMenu.substituteDish.name || "Thịt bò xào rau củ",
            ingredientId: "ing-vis-1",
            portionQty: subQtyMatch ? parseInt(subQtyMatch[1], 10) : 45,
            unit: "g"
          })
        }

        // Map seasonings
        {
          const mappedSeasonings = (rawMenu.seasonings || []).map((s, idx) => {
            if (typeof s === "string") {
              return {
                id: `seas-edit-${idx}`,
                name: s,
                catalogId: "",
                portionQty: "",
                unit: "g"
              }
            }
            return s
          })
          setSeasonings(mappedSeasonings)
        }
      } catch (err) {
        console.warn("Lỗi load thực đơn:", err)
      }
    }
    loadMenu()
    return () => { isMounted = false }
  }, [id])

  const showToast = (message, type = "success") => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 3500)
  }

  // Cập nhật thông tin cơ bản
  const handleChangeField = (field, value) => {
    setFormState(prev => ({ ...prev, [field]: value }))
  }

  // Cập nhật từng món ăn trong bảng
  const handleUpdateDish = (dishId, updates) => {
    setDishes(prev =>
      prev.map(dish => {
        if (dish.id !== dishId) return dish
        return { ...dish, ...updates }
      })
    )
  }

  const handleAddDishRow = () => {
    const newDish = {
      id: `dish-edit-${Date.now()}`,
      name: "",
      ingredientIds: [],
      portionQty: 50,
      unit: "g"
    }
    setDishes(prev => [...prev, newDish])
    showToast("Đã thêm một dòng món ăn mới", "info")
  }

  const handleRemoveDish = (dishId) => {
    setDishes(prev => prev.filter(d => d.id !== dishId))
    showToast("Đã xóa món ăn khỏi thực đơn", "info")
  }

  const handleRemoveIngredientFromDish = (dishId, ingredientId) => {
    const targetDish = dishes.find(d => d.id === dishId)
    if (!targetDish) return
    const currentIds = targetDish.ingredientIds || (targetDish.ingredientId ? [targetDish.ingredientId] : [])
    const newIds = currentIds.filter(id => id !== ingredientId)
    handleUpdateDish(dishId, { ingredientIds: newIds })
    showToast("Đã xóa nguyên liệu khỏi món", "info")
  }

  // Seasonings
  const handleAddSeasoning = () => {
    const newSeasoning = {
      id: `seas-edit-${Date.now()}`,
      catalogId: "",
      name: "",
      portionQty: 1,
      unit: "g"
    }
    setSeasonings(prev => [...prev, newSeasoning])
    showToast("Đã thêm gia vị mới", "info")
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

  // Substitute dish
  const handleChangeSubstituteDish = (field, value) => {
    setSubstituteDish(prev => ({ ...prev, [field]: value }))
  }

  // Picker
  const handleOpenPickerForDish = (dishId) => {
    setPickerContext({ type: "dish", dishId })
    setIsPickerOpen(true)
  }

  const handleOpenPickerForSubstitute = () => {
    setPickerContext({ type: "substitute", dishId: null })
    setIsPickerOpen(true)
  }

  const handleToggleIngredient = (ingredient) => {
    if (pickerContext.type === "dish" && pickerContext.dishId) {
      const targetDish = dishes.find(d => d.id === pickerContext.dishId)
      if (!targetDish) return
      const currentIds = targetDish.ingredientIds || (targetDish.ingredientId ? [targetDish.ingredientId] : [])
      const exists = currentIds.includes(ingredient.id)
      const newIds = exists
        ? currentIds.filter(id => id !== ingredient.id)
        : [...currentIds, ingredient.id]

      handleUpdateDish(pickerContext.dishId, { ingredientIds: newIds })

      if (exists) {
        showToast(`Đã bỏ nguyên liệu "${ingredient.name}"`, "info")
      } else {
        showToast(`Đã thêm nguyên liệu "${ingredient.name}"`, "success")
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

  const currentTargetDish = pickerContext.type === "dish"
    ? dishes.find(d => d.id === pickerContext.dishId)
    : null

  const selectedIngredientIds = pickerContext.type === "dish"
    ? (currentTargetDish?.ingredientIds || (currentTargetDish?.ingredientId ? [currentTargetDish.ingredientId] : []))
    : (substituteDish?.ingredientId ? [substituteDish.ingredientId] : [])

  // Kiểm tra xung đột dị ứng
  const conflictDishes = dishes.filter(d => {
    const ids = d.ingredientIds || (d.ingredientId ? [d.ingredientId] : [])
    return ids.some(id => {
      const ing = ALL_INGREDIENTS.find(i => i.id === id)
      return Boolean(ing?.allergen)
    })
  })
  const conflictCount = conflictDishes.length > 0 ? 12 : 0

  // Actions
  const handleSaveDraft = async () => {
    try {
      const res = await MenuService.updateMenu(id, { formState, dishes, substituteDish, seasonings })
      showToast(res.message || "Đã lưu các chỉnh sửa thực đơn thành công", "success")
    } catch (err) {
      showToast("Lỗi lưu thực đơn: " + err.message, "warning")
    }
  }

  const handleConfirmSubmit = async () => {
    setIsConfirmModalOpen(false)
    try {
      await MenuService.updateMenu(id, { formState, dishes, substituteDish, seasonings })
      await MenuService.submitMenu(id)
      showToast("Đã gửi lại thực đơn lên Ban Giám Hiệu phê duyệt thành công!", "success")
      setTimeout(() => {
        navigate(ROUTER.SCHOOL_MENU_DETAIL.replace(":id", id))
      }, 1200)
    } catch (err) {
      showToast("Lỗi gửi duyệt: " + err.message, "warning")
    }
  }

  if (!menu || !formState) {
    return (
      <div className={styles.loadingContainer}>
        <span className="material-symbols-outlined text-[36px] text-[#0a8066] animate-spin">
          progress_activity
        </span>
        <p className="text-slate-600 font-medium mt-2">Đang tải dữ liệu thực đơn để chỉnh sửa...</p>
      </div>
    )
  }

  // Trường hợp thực đơn đã được duyệt hoặc đang chờ duyệt -> Khóa chỉnh sửa
  const isLocked = menu.status === "APPROVED" || menu.status === "PENDING_APPROVAL"
  if (isLocked) {
    return (
      <div className={styles.lockedContainer}>
        <div className={styles.lockedCard}>
          <div className={styles.lockedIconWrap}>
            <span className="material-symbols-outlined text-[40px] text-amber-600">lock</span>
          </div>
          <h2 className={styles.lockedTitle}>Thực đơn đang ở trạng thái {menu.statusLabel}</h2>
          <p className={styles.lockedDesc}>
            Thực đơn mã <strong>{menu.code}</strong> đã được phê duyệt chính thức hoặc đang trong phiên thẩm định trực tuyến của Ban Giám Hiệu. Bạn không thể chỉnh sửa trực tiếp nội dung thực đơn này.
          </p>
          <div className={styles.lockedActions}>
            <button
              type="button"
              className={styles.btnBackDetail}
              onClick={() => navigate(ROUTER.SCHOOL_MENU_DETAIL.replace(":id", id))}
            >
              <span className="material-symbols-outlined text-[18px]">visibility</span>
              <span>Xem chi tiết thực đơn</span>
            </button>
            <button
              type="button"
              className={styles.btnBackList}
              onClick={() => navigate(ROUTER.SCHOOL_MENU_PLANNING)}
            >
              <span>Về danh sách thực đơn</span>
            </button>
          </div>
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
        {/* Header với Tiêu đề, Mã thực đơn và Nút Quay lại */}
        <EditMenuHeader
          menu={menu}
          onBack={() => navigate(ROUTER.SCHOOL_MENU_DETAIL.replace(":id", id))}
        />

        {/* Khối Ý kiến phản hồi BGH nếu trạng thái là REVISION_REQUESTED */}
        {menu.feedback && (
          <MenuDetailBGHFeedback feedback={menu.feedback} status={menu.status} />
        )}

        {/* Khối 1: Thông tin thực đơn */}
        <MenuBasicInfoCard
          formState={formState}
          onChangeField={handleChangeField}
        />

        {/* Khối 2: Bảng món ăn trong thực đơn */}
        <MenuDishesTable
          dishes={dishes}
          onUpdateDish={handleUpdateDish}
          onAddDishRow={handleAddDishRow}
          onRemoveDish={handleRemoveDish}
          onOpenPicker={handleOpenPickerForDish}
          onRemoveIngredientFromDish={handleRemoveIngredientFromDish}
        />

        {/* Khối 3: Bố trí suất ăn riêng cho học sinh dị ứng */}
        <AllergyAlternativeMealsCard
          conflictDishes={conflictDishes}
          substituteDish={substituteDish}
          onChangeSubstituteDish={handleChangeSubstituteDish}
          onOpenPickerForSubstitute={handleOpenPickerForSubstitute}
        />

        {/* Khối 4: Gia vị dùng chung */}
        <MenuSeasoningCard
          seasonings={seasonings}
          onUpdateSeasoning={handleUpdateSeasoning}
          onAddSeasoning={handleAddSeasoning}
          onRemoveSeasoning={handleRemoveSeasoning}
        />
      </div>

      {/* Sticky Bottom Action Bar */}
      <CreateMenuBottomBar
        onCancel={() => navigate(ROUTER.SCHOOL_MENU_DETAIL.replace(":id", id))}
        onSaveDraft={handleSaveDraft}
        onSubmitApproval={() => setIsConfirmModalOpen(true)}
      />

      {/* Modal chọn nguyên liệu từ NCC liên kết */}
      <IngredientPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        selectedIngredientIds={selectedIngredientIds}
        onToggleIngredient={handleToggleIngredient}
        dishContextName={pickerContext.type === "dish" ? (currentTargetDish?.name || "Món ăn") : (substituteDish.name || "Món thay thế")}
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

