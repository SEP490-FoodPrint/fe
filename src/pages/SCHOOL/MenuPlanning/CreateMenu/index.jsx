import React, { useEffect, useState, useMemo } from "react"
import { Alert, Button } from "@mui/material"
import { useNavigate, useLocation } from "react-router-dom"
import styles from "./CreateMenu.module.scss"
import ROUTER from "src/router/ROUTER"
import { INITIAL_DISHES, INITIAL_SEASONINGS, ALL_INGREDIENTS } from "../mockMenuData"
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
import CreateMenuWeeklyLivePreview from "../component/CreateMenuWeeklyLivePreview"
import MenuBasicInfoCard from "../component/MenuBasicInfoCard"
import MenuDishesTable from "../component/MenuDishesTable"
import AllergyAlternativeMealsCard from "../component/AllergyAlternativeMealsCard"
import MenuSeasoningCard from "../component/MenuSeasoningCard"
import CreateMenuBottomBar from "../component/CreateMenuBottomBar"
import ConfirmSubmitModal from "../component/ConfirmSubmitModal"
import IngredientPickerModal from "../component/IngredientPickerModal"
import DishPickerModal from "../component/DishPickerModal"

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

  // Form State: Khởi tạo thông tin ca ăn đang chọn
  const [formState, setFormState] = useState({
    name: "",
    date: getTodayFormatted(),
    mealType: initialMealType || "LUNCH",
    targetScope: "Toàn trường (Khối 1 - 5)",
    notes: "",
  })

  // Danh sách món ăn trong thực đơn của ca ăn hiện tại
  const [dishes, setDishes] = useState([
    {
      id: "dish-1",
      name: "",
      ingredientIds: [],
      portionQty: 50,
      unit: "g",
    },
  ])

  // Món thay thế cho học sinh dị ứng
  const [substituteDish, setSubstituteDish] = useState({
    name: "",
    ingredientId: null,
    portionQty: 40,
    unit: "g",
  })

  // Gia vị bữa ăn học đường (nhập theo định lượng trên 1 bữa của 1.250 học sinh)
  const [seasonings, setSeasonings] = useState([])
  const [selectedDayMenu, setSelectedDayMenu] = useState(null)
  const [loadingSelectedDay, setLoadingSelectedDay] = useState(false)
  const [selectedDayError, setSelectedDayError] = useState("")
  const [selectedDayAttempt, setSelectedDayAttempt] = useState(0)

  // 1. Tính toán danh sách 5 ngày học của tuần đang chọn
  const weekInfo = useMemo(() => {
    return getSchoolWeekScheduleFromDate(formState.date)
  }, [formState.date])
  const schoolDays = weekInfo?.schoolDays || []

  // 2. Trạng thái Live Preview của cả tuần
  const [weeklyMeals, setWeeklyMeals] = useState({})

  // Tự động tải dữ liệu tuần nếu có từ backend hoặc mock
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

  // Cập nhật món ăn đang soạn thảo vào bảng Live Preview theo thời gian thực
  useEffect(() => {
    const currentISO = parseDateVNToISO(formState.date)
    if (!currentISO) return

    setWeeklyMeals((prev) => {
      const existingDay = prev[currentISO] || {}
      return {
        ...prev,
        [currentISO]: {
          ...existingDay,
          [formState.mealType]: dishes.filter(
            (d) => d.name && d.name.trim().length > 0
          ),
        },
      }
    })
  }, [dishes, formState.date, formState.mealType])

  // Khi click vào ca ăn bất kỳ trên bảng Live Preview tuần
  const handleSelectMealFromPreview = (dateISO, mealType) => {
    const targetDay = schoolDays.find((sd) => sd.dateISO === dateISO)
    const dateVN = targetDay ? targetDay.dateVN : formatDateVN(dateISO)
    setFormState((prev) => ({
      ...prev,
      date: dateVN,
      mealType: mealType,
    }))
  }

  // Tải dữ liệu thực đơn theo ngày và ca ăn đang chọn
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
          setFormState((current) => ({
            ...current,
            name: current.name || `Thực đơn ${formState.mealType === "AFTERNOON" ? "Bữa xế" : "Bữa trưa"} (${formState.date})`,
            notes: "",
          }))
          return
        }

        const menu = schedule.data.weeklyMenu?.menuDays?.[0]?.menuDayDishes?.[0]
          ?.Dish
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
          setFormState((current) => ({
            ...current,
            name: `Thực đơn ${formState.mealType === "AFTERNOON" ? "Bữa xế" : "Bữa trưa"} (${formState.date})`,
            notes: "",
          }))
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
          menu.dishes.map((dish, index) => ({
            id: `dish-day-${dish.dishId || dish.id || index}`,
            dishId: dish.dishId || dish.id,
            name: dish.name,
            ingredientIds: dish.ingredientIds || [],
            ingredientDetails: dish.ingredientDetails || [],
            ingredientStandards: dish.ingredientStandards || [],
            portionQty: dish.portionQty || 50,
            unit: dish.unit || "g",
          }))
        )
        setSeasonings(menu.seasonings || [])
        setSubstituteDish(
          menu.substituteDish || {
            name: "",
            ingredientId: null,
            portionQty: 40,
            unit: "g",
          }
        )
      } catch (error) {
        if (active) {
          setSelectedDayError(
            error.message || "Không tải được thực đơn của ngày đã chọn."
          )
          setSelectedDayMenu(null)
          console.warn("Không tải được dữ liệu thực đơn theo ngày:", error)
        }
      } finally {
        if (active) setLoadingSelectedDay(false)
      }
    }

    loadSelectedDay()
    return () => {
      active = false
    }
  }, [formState.date, formState.mealType, selectedDayAttempt])

  // Modal Kho món ăn Master Data
  const [isDishPickerOpen, setIsDishPickerOpen] = useState(false)
  const [targetDishIdForPicker, setTargetDishIdForPicker] = useState(null)

  const handleOpenDishPicker = (dishId = null) => {
    setTargetDishIdForPicker(dishId)
    setIsDishPickerOpen(true)
  }

  const handleSelectDishesFromPicker = (selectedDishes) => {
    if (!Array.isArray(selectedDishes) || selectedDishes.length === 0) return

    if (targetDishIdForPicker) {
      // Thay đổi món cho dòng đang chọn
      const picked = selectedDishes[0]
      setDishes((prev) =>
        prev.map((d) => {
          if (d.id === targetDishIdForPicker) {
            return {
              ...d,
              dishId: picked.id,
              name: picked.name,
              category: picked.category,
              categoryLabel: picked.categoryLabel,
              portionQty: picked.portionQty || d.portionQty || 50,
              unit: picked.unit || d.unit || "g",
              ingredientIds: picked.ingredientIds?.length
                ? picked.ingredientIds
                : d.ingredientIds || [],
              allergen: picked.allergen || null,
            }
          }
          return d
        })
      )
      showToast(`Đã đổi sang món "${picked.name}"`, "success")
    } else {
      // Thêm 1 hoặc nhiều món vào ca ăn
      const newDishes = selectedDishes.map((picked, idx) => ({
        id: `dish-${Date.now()}-${idx}`,
        dishId: picked.id,
        name: picked.name,
        category: picked.category,
        categoryLabel: picked.categoryLabel,
        portionQty: picked.portionQty || 50,
        unit: picked.unit || "g",
        ingredientIds: picked.ingredientIds || [],
        allergen: picked.allergen || null,
      }))

      setDishes((prev) => {
        const cleanPrev = prev.filter((d) => d.name && d.name.trim().length > 0)
        return [...cleanPrev, ...newDishes]
      })
      showToast(`Đã thêm ${newDishes.length} món từ Kho vào thực đơn`, "success")
    }
  }

  // Modal chọn nguyên liệu từ NCC liên kết (Phân loại -> NCC -> Nguyên liệu)
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [pickerContext, setPickerContext] = useState({
    type: "dish",
    dishId: null,
  })

  // Modal xác nhận gửi BGH duyệt
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [toast, setToast] = useState(null)

  // Cập nhật thông tin cơ bản
  const handleChangeField = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  // Cập nhật từng món ăn trong bảng (nhận payload object)
  const handleUpdateDish = (dishId, updates) => {
    setDishes((prev) =>
      prev.map((dish) => {
        if (dish.id !== dishId) return dish
        const updated = { ...dish, ...updates }
        if ("portionQty" in updates || "unit" in updates) {
          const ids = updated.ingredientIds || []
          updated.ingredientStandards = ids.map((ingredientId) => {
            const existing = dish.ingredientStandards?.find(
              (line) => line.ingredientId === ingredientId
            )
            return {
              ingredientId,
              quantityPerPortion: String(updated.portionQty || 50),
              unit: updated.unit || "g",
              ...(existing && {
                ...existing,
                quantityPerPortion: String(
                  updated.portionQty || existing.quantityPerPortion
                ),
                unit: updated.unit || existing.unit,
              }),
            }
          })
        }
        return updated
      })
    )
  }

  // Thêm dòng món ăn mới vào bảng (mở luôn modal kho món)
  const handleAddDishRow = () => {
    handleOpenDishPicker(null)
  }

  // Xóa món ăn khỏi bảng
  const handleRemoveDish = (dishId) => {
    setDishes((prev) => prev.filter((d) => d.id !== dishId))
    showToast("Đã xóa món ăn khỏi thực đơn", "info")
  }

  // Xóa một nguyên liệu khỏi món ăn
  const handleRemoveIngredientFromDish = (dishId, ingredientId) => {
    const targetDish = dishes.find((d) => d.id === dishId)
    if (!targetDish) return
    const currentIds =
      targetDish.ingredientIds ||
      (targetDish.ingredientId ? [targetDish.ingredientId] : [])
    const newIds = currentIds.filter((id) => id !== ingredientId)
    handleUpdateDish(dishId, { ingredientIds: newIds })
    showToast("Đã xóa nguyên liệu khỏi món", "info")
  }

  // Quản lý Gia vị
  const handleAddSeasoning = () => {
    const newSeasoning = {
      id: `seas-${Date.now()}`,
      catalogId: "",
      name: "",
      portionQty: 2,
      unit: "g",
    }
    setSeasonings((prev) => [...prev, newSeasoning])
    showToast("Đã thêm một dòng gia vị mới", "info")
  }

  const handleRemoveSeasoning = (seasoningId) => {
    setSeasonings((prev) => prev.filter((s) => s.id !== seasoningId))
    showToast("Đã xóa gia vị", "info")
  }

  const handleUpdateSeasoning = (seasoningId, updates) => {
    setSeasonings((prev) =>
      prev.map((s) => (s.id === seasoningId ? { ...s, ...updates } : s))
    )
  }

  // Cập nhật thông tin món thay thế dị ứng
  const handleChangeSubstituteDish = (field, value) => {
    setSubstituteDish((prev) => ({ ...prev, [field]: value }))
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
      const targetDish = dishes.find((d) => d.id === pickerContext.dishId)
      if (!targetDish) return
      const currentIds =
        targetDish.ingredientIds ||
        (targetDish.ingredientId ? [targetDish.ingredientId] : [])
      const exists = currentIds.includes(ingredient.id)
      const newIds = exists
        ? currentIds.filter((id) => id !== ingredient.id)
        : [...currentIds, ingredient.id]

      const standards = newIds.map((ingredientId) => {
        const existing = targetDish.ingredientStandards?.find(
          (line) => line.ingredientId === ingredientId
        )
        return (
          existing || {
            ingredientId,
            quantityPerPortion: String(targetDish.portionQty || 50),
            unit: targetDish.unit || "g",
          }
        )
      })

      handleUpdateDish(pickerContext.dishId, {
        ingredientIds: newIds,
        ingredientStandards: standards,
      })
    } else if (pickerContext.type === "substitute") {
      setSubstituteDish((prev) => ({
        ...prev,
        ingredientId: ingredient.id,
        name: prev.name || ingredient.name,
      }))
    }
  }

  // Thu thập danh sách nguyên liệu của món ăn đang được chọn trong popup
  const currentTargetDish = dishes.find((d) => d.id === pickerContext.dishId)
  const selectedIngredientIds =
    pickerContext.type === "dish"
      ? currentTargetDish?.ingredientIds ||
        (currentTargetDish?.ingredientId
          ? [currentTargetDish.ingredientId]
          : [])
      : substituteDish.ingredientId
      ? [substituteDish.ingredientId]
      : []

  // Tìm các món trong thực đơn đang có nguyên liệu gây dị ứng
  const conflictDishes = dishes.filter((dish) => {
    const ids =
      dish.ingredientIds || (dish.ingredientId ? [dish.ingredientId] : [])
    const hasConflictIng = ids.some((id) => {
      const ing = ALL_INGREDIENTS.find((i) => i.id === id)
      return Boolean(ing?.allergen)
    })
    return hasConflictIng || Boolean(dish.allergen)
  })

  const conflictCount = conflictDishes.length
  const isReadOnly = normalizeStatus(selectedDayMenu?.status) === "APPROVED"

  const handleSaveDraft = async () => {
    if (!formState.name.trim()) {
      showToast("Vui lòng nhập tên thực đơn trước khi lưu", "warning")
      return
    }
    try {
      const res = await MenuService.createMenu({
        formState,
        dishes,
        substituteDish,
        seasonings,
      })
      showToast(
        res.message || "Đã lưu bản nháp thực đơn thành công (Trạng thái DRAFT)",
        "success"
      )
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
    const hasValidDish = dishes.some((d) => d.name.trim().length > 0)
    if (!hasValidDish) {
      showToast("Vui lòng chọn ít nhất 1 món ăn trong thực đơn", "warning")
      return
    }
    setIsConfirmModalOpen(true)
  }

  const handleConfirmSubmit = async () => {
    setIsConfirmModalOpen(false)
    try {
      const created = await MenuService.createMenu({
        formState,
        dishes,
        substituteDish,
        seasonings,
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
      {/* Toast Notification */}
      {toast && (
        <div className={`${styles.toastNotice} ${styles[toast.type]}`}>
          <span className="material-symbols-outlined">
            {toast.type === "success"
              ? "check_circle"
              : toast.type === "warning"
              ? "warning"
              : "info"}
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

        {/* Khối Live Preview Toàn Tuần (5 ngày x 2 ca ăn) */}
        <CreateMenuWeeklyLivePreview
          schoolDays={schoolDays}
          weeklyMeals={weeklyMeals}
          activeDate={parseDateVNToISO(formState.date) || formState.date}
          activeMealType={formState.mealType}
          onSelectMeal={handleSelectMealFromPreview}
        />

        {/* Khối 1: Thông tin thực đơn */}
        <MenuBasicInfoCard
          formState={formState}
          onChangeField={handleChangeField}
          readOnly={isReadOnly}
        />

        {loadingSelectedDay ? (
          <div role="status" className={styles.menuStatusNotice}>
            Đang tải thực đơn của ngày đã chọn…
          </div>
        ) : selectedDayError ? (
          <Alert
            severity="error"
            className={styles.menuStatusNotice}
            action={
              <Button
                color="inherit"
                onClick={() => setSelectedDayAttempt((value) => value + 1)}
              >
                Tải lại
              </Button>
            }
          >
            {selectedDayError}
          </Alert>
        ) : selectedDayMenu ? (
          <div role="status" className={styles.menuStatusNotice}>
            {selectedDayMenu.hasMeal
              ? `Ngày ${formState.date} · ${
                  formState.mealType === "AFTERNOON" ? "Bữa xế" : "Bữa trưa"
                } · ${getStatusLabel(selectedDayMenu.status)}`
              : `Ngày ${formState.date} · Chưa có ${
                  formState.mealType === "AFTERNOON" ? "bữa xế" : "bữa trưa"
                } · ${getStatusLabel(selectedDayMenu.status)}`}
            {isReadOnly && " · Chỉ xem"}
          </div>
        ) : null}

        {/* Khối 2: Bảng món ăn trong thực đơn (Chọn từ Kho món ăn Master Data) */}
        <fieldset
          className={styles.editorFieldset}
          disabled={loadingSelectedDay || isReadOnly || Boolean(selectedDayError)}
        >
          <MenuDishesTable
            dishes={dishes}
            onUpdateDish={handleUpdateDish}
            onAddDishRow={handleAddDishRow}
            onRemoveDish={handleRemoveDish}
            onOpenPicker={handleOpenPickerForDish}
            onRemoveIngredientFromDish={handleRemoveIngredientFromDish}
            onOpenDishPicker={handleOpenDishPicker}
          />

          {/* Khối 3: Bố trí suất ăn riêng cho học sinh dị ứng & Tạo món thay thế */}
          <AllergyAlternativeMealsCard
            conflictDishes={conflictDishes}
            substituteDish={substituteDish}
            onChangeSubstituteDish={handleChangeSubstituteDish}
            onOpenPickerForSubstitute={handleOpenPickerForSubstitute}
          />

          {/* Khối 4: Gia vị dùng chung (Nhập định lượng trên 1 bữa của 1.250 HS) */}
          <MenuSeasoningCard
            seasonings={seasonings}
            onUpdateSeasoning={handleUpdateSeasoning}
            onAddSeasoning={handleAddSeasoning}
            onRemoveSeasoning={handleRemoveSeasoning}
            totalStudents={1250}
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

      {/* Modal: Kho món ăn học đường Master Data */}
      <DishPickerModal
        isOpen={isDishPickerOpen}
        onClose={() => setIsDishPickerOpen(false)}
        onSelectDishes={handleSelectDishesFromPicker}
        currentMealType={formState.mealType}
        singleSelect={Boolean(targetDishIdForPicker)}
      />

      {/* Popup Modal: Chọn nguyên liệu từ NCC liên kết (hỗ trợ chọn nhiều) */}
      <IngredientPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        selectedIngredientIds={selectedIngredientIds}
        onToggleIngredient={handleToggleIngredient}
        dishContextName={
          pickerContext.type === "dish"
            ? currentTargetDish?.name || "Món ăn"
            : substituteDish.name || "Món thay thế dị ứng"
        }
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
