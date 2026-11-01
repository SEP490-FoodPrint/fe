import React, { useEffect, useState } from "react"
import { Alert, Button } from "@mui/material"
import { useNavigate } from "react-router-dom"
import styles from "./CreateMenu.module.scss"
import ROUTER from "src/router/ROUTER"
import { INITIAL_DISHES, INITIAL_SEASONINGS, ALL_INGREDIENTS } from "../mockMenuData"
import MenuService from "src/services/MenuService"
import { adaptBackendMenuDetailToView, normalizeStatus, parseDateVNToISO, getStatusLabel } from "src/services/MenuService/adapter"

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

  // Hàm lấy ngày hôm nay theo định dạng DD/MM/YYYY
  const getTodayFormatted = () => {
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

  // Form State: Khởi tạo hoàn toàn trống để Cán bộ Y tế nhập mới
  const [formState, setFormState] = useState({
    name: "",
    date: getTodayFormatted(),
    mealType: "LUNCH",
    targetScope: "",
    notes: ""
  })

  // Danh sách món ăn trong thực đơn: Bắt đầu bằng 1 dòng trống để người dùng nhập
  const [dishes, setDishes] = useState([
    {
      id: "dish-1",
      name: "",
      ingredientIds: [],
      portionQty: 50,
      unit: "g"
    }
  ])

  // Món thay thế cho học sinh dị ứng (Mặc định là suất ăn riêng, khởi tạo trống)
  const [substituteDish, setSubstituteDish] = useState({
    name: "",
    ingredientId: null,
    portionQty: 40,
    unit: "g"
  })

  // Gia vị bữa ăn học đường: Khởi tạo danh sách rỗng, người dùng bấm thêm khi cần
  const [seasonings, setSeasonings] = useState([])
  const [selectedDayMenu, setSelectedDayMenu] = useState(null)
  const [loadingSelectedDay, setLoadingSelectedDay] = useState(false)
  const [selectedDayError, setSelectedDayError] = useState("")
  const [selectedDayAttempt, setSelectedDayAttempt] = useState(0)

  useEffect(() => {
    let active = true
    const loadSelectedDay = async () => {
      setLoadingSelectedDay(true)
      setSelectedDayError("")
      try {
        const schedule = await MenuService.getWeekSchedule(formState.date)
        const selectedISO = parseDateVNToISO(formState.date)
        const selectedDate = schedule?.data?.days?.find(
          (day) => day.date === selectedISO || day.dateVN === formState.date,
        )

        if (!selectedDate?.hasMenu || !schedule?.data?.weeklyMenuId || !selectedDate?.menuDayId) {
          if (!active) return
          setSelectedDayMenu(selectedDate ? {
            ...selectedDate,
            weeklyMenuId: schedule?.data?.weeklyMenuId || null,
            weeklyStatus: schedule?.data?.weeklyMenuStatus || "DRAFT",
            status: selectedDate.hasMenu ? selectedDate.status : "DRAFT",
            hasMeal: false,
          } : null)
          setFormState((current) => ({ ...current, name: "", notes: "" }))
          setDishes([{ id: "dish-1", name: "", ingredientIds: [], ingredientStandards: [], portionQty: 50, unit: "g" }])
          setSeasonings([])
          setSubstituteDish({ name: "", ingredientId: null, portionQty: 40, unit: "g" })
          return
        }

        const menu = schedule.data.weeklyMenu?.menuDays?.[0]?.menuDayDishes?.[0]?.Dish
          ? adaptBackendMenuDetailToView(
              schedule.data.weeklyMenu,
              selectedDate.menuDayId,
              formState.mealType,
            )
          : (await MenuService.getMenuDetail(
              `${schedule.data.weeklyMenuId}_${selectedDate.menuDayId}_${formState.mealType}`,
            ))?.data
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
          setFormState((current) => ({ ...current, name: "", notes: "" }))
          setDishes([{ id: "dish-1", name: "", ingredientIds: [], ingredientStandards: [], portionQty: 50, unit: "g" }])
          setSeasonings([])
          setSubstituteDish({ name: "", ingredientId: null, portionQty: 40, unit: "g" })
          return
        }

        setFormState((current) => ({
          ...current,
          name: menu.name || "",
          date: menu.date || current.date,
          mealType: menu.mealType || current.mealType,
          targetScope: menu.targetScope || current.targetScope,
          notes: menu.feedback || "",
        }))
        setDishes(menu.dishes.map((dish, index) => ({
          id: `dish-day-${dish.dishId || dish.id || index}`,
          dishId: dish.dishId || dish.id,
          name: dish.name,
          ingredientIds: dish.ingredientIds || [],
          ingredientDetails: dish.ingredientDetails || [],
          ingredientStandards: dish.ingredientStandards || [],
          portionQty: dish.portionQty || 50,
          unit: dish.unit || "g",
        })))
        setSeasonings(menu.seasonings || [])
        setSubstituteDish(menu.substituteDish || { name: "", ingredientId: null, portionQty: 40, unit: "g" })
      } catch (error) {
        if (active) {
          setSelectedDayError(error.message || "Không tải được thực đơn của ngày đã chọn.")
          setSelectedDayMenu(null)
          setFormState((current) => ({ ...current, name: "", notes: "" }))
          setDishes([{ id: "dish-1", name: "", ingredientIds: [], ingredientStandards: [], portionQty: 50, unit: "g" }])
          setSeasonings([])
          setSubstituteDish({ name: "", ingredientId: null, portionQty: 40, unit: "g" })
          console.warn("Không tải được dữ liệu thực đơn theo ngày:", error)
        }
      } finally {
        if (active) setLoadingSelectedDay(false)
      }
    }

    loadSelectedDay()
    return () => { active = false }
  }, [formState.date, formState.mealType, selectedDayAttempt])

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
        const updated = { ...dish, ...updates }
        if ("portionQty" in updates || "unit" in updates) {
          const ids = updated.ingredientIds || []
          updated.ingredientStandards = ids.map((ingredientId) => {
            const existing = dish.ingredientStandards?.find((line) => line.ingredientId === ingredientId)
            return {
              ingredientId,
              quantityPerPortion: String(updated.portionQty || 50),
              unit: updated.unit || "g",
            ...(existing && { ...existing, quantityPerPortion: String(updated.portionQty || existing.quantityPerPortion), unit: updated.unit || existing.unit }),
            }
          })
        }
        return updated
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

      const standards = newIds.map((ingredientId) => {
        const existing = targetDish.ingredientStandards?.find((line) => line.ingredientId === ingredientId)
        return existing || {
          ingredientId,
          quantityPerPortion: String(targetDish.portionQty || 50),
          unit: targetDish.unit || "g",
        }
      })

      handleUpdateDish(pickerContext.dishId, {
        ingredientIds: newIds,
        ingredientStandards: standards,
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

  const normalizedDayStatus = normalizeStatus(selectedDayMenu?.status)
  const normalizedWeekStatus = normalizeStatus(selectedDayMenu?.weeklyStatus)
  const isReadOnly = Boolean(selectedDayMenu && (
    !["DRAFT", "REVISION_REQUESTED"].includes(normalizedDayStatus) ||
    !["DRAFT", "REVISION_REQUESTED"].includes(normalizedWeekStatus)
  ))

  const handleSaveDraft = async () => {
    if (!formState.name.trim()) {
      showToast("Vui lòng nhập tên thực đơn để lưu nháp", "warning")
      return
    }
    try {
      const res = await MenuService.createMenu({ formState, dishes, substituteDish, seasonings })
      showToast(res.message || "Đã lưu bản nháp thực đơn thành công (Trạng thái DRAFT)", "success")
      setTimeout(() => {
        navigate(ROUTER.SCHOOL_MENU_PLANNING)
      }, 1000)
    } catch (err) {
      showToast("Không thể lưu bản nháp: " + err.message, "warning")
    }
  }

  const handleOpenConfirmSubmit = () => {
    if (!formState.name.trim()) {
      showToast("Vui lòng nhập tên thực đơn trước khi gửi duyệt", "warning")
      return
    }
    const hasValidDish = dishes.some(d => d.name.trim().length > 0)
    if (!hasValidDish) {
      showToast("Vui lòng nhập ít nhất 1 món ăn trong thực đơn", "warning")
      return
    }
    setIsConfirmModalOpen(true)
  }

  const handleConfirmSubmit = async () => {
    setIsConfirmModalOpen(false)
    try {
      const created = await MenuService.createMenu({ formState, dishes, substituteDish, seasonings })
      if (created?.data?.id) {
        await MenuService.submitMenu(created.data.id)
      }
      showToast("Đã gửi thực đơn lên Ban Giám hiệu phê duyệt thành công!", "success")
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
        <CreateMenuHeader
          onBack={() => navigate(ROUTER.SCHOOL_MENU_PLANNING)}
          selectedDayMenu={selectedDayMenu}
          readOnly={isReadOnly}
          statusLabel={getStatusLabel(selectedDayMenu?.status)}
        />

        {/* Khối 1: Thông tin thực đơn (Khối lớp áp dụng nhập text tự do) */}
        <MenuBasicInfoCard
          formState={formState}
          onChangeField={handleChangeField}
          readOnly={isReadOnly}
        />

        {loadingSelectedDay ? (
          <div role="status" className={styles.menuStatusNotice}>Đang tải thực đơn của ngày đã chọn…</div>
        ) : selectedDayError ? (
          <Alert severity="error" className={styles.menuStatusNotice}
            action={<Button color="inherit" onClick={() => setSelectedDayAttempt(value => value + 1)}>Tải lại</Button>}>
            {selectedDayError}
          </Alert>
        ) : selectedDayMenu ? (
          <div role="status" className={styles.menuStatusNotice}>
            {selectedDayMenu.hasMeal
              ? `Ngày ${formState.date} · ${formState.mealType === "AFTERNOON" ? "Bữa xế" : "Bữa trưa"} · ${getStatusLabel(selectedDayMenu.status)}`
              : `Ngày ${formState.date} · Chưa có ${formState.mealType === "AFTERNOON" ? "bữa xế" : "bữa trưa"} · ${getStatusLabel(selectedDayMenu.status)}`}
            {isReadOnly && " · Chỉ xem"}
          </div>
        ) : null}

        {/* Khối 2: Bảng món ăn trong thực đơn (Chọn nhiều nguyên liệu, icon thay đổi, đối soát dị ứng tự động) */}
        <fieldset className={styles.editorFieldset} disabled={loadingSelectedDay || isReadOnly || Boolean(selectedDayError)}>
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
          substituteDish={substituteDish}
          onChangeSubstituteDish={handleChangeSubstituteDish}
          onOpenPickerForSubstitute={handleOpenPickerForSubstitute}
        />

        {/* Khối 4: Gia vị dùng chung (Chọn từ danh mục kho do Quản lý nguyên liệu nhập, nhập định lượng) */}
        <MenuSeasoningCard
          seasonings={seasonings}
          onUpdateSeasoning={handleUpdateSeasoning}
          onAddSeasoning={handleAddSeasoning}
          onRemoveSeasoning={handleRemoveSeasoning}
        />
        </fieldset>
      </div>

      {/* Sticky Bottom Action Bar */}
      <CreateMenuBottomBar
        onCancel={() => navigate(ROUTER.SCHOOL_MENU_PLANNING)}
        onSaveDraft={handleSaveDraft}
        onSubmitApproval={handleOpenConfirmSubmit}
        isLoading={loadingSelectedDay || Boolean(selectedDayError)}
        readOnly={isReadOnly}
        onView={() => selectedDayMenu?.weeklyMenuId && selectedDayMenu?.menuDayId && navigate(ROUTER.SCHOOL_MENU_DETAIL.replace(":id", `${selectedDayMenu.weeklyMenuId}_${selectedDayMenu.menuDayId}_${formState.mealType}`))}
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
