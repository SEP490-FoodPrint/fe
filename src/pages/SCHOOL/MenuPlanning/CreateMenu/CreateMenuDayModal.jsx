import React, { useState, useMemo, useEffect, useCallback, useRef } from "react"
import {
  X,
  Search,
  Plus,
  Check,
  Utensils,
  Coffee,
  Sparkles,
  Trash2,
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Filter,
} from "lucide-react"
import styles from "./CreateMenuDayModal.module.scss"
import {
  loadDishCatalogData,
  loadRecipeOptions,
  dishIngredientIds,
  dishCategoryKey,
} from "src/services/DishService"
import { inspectMenuMealSelection } from "src/services/MenuService"

export const renderCategoryBadge = (dish) => {
  const cat = dishCategoryKey(dish)
  const badgeStyles = {
    MAIN_DISH: styles.badgeMain,
    SOUP: styles.badgeSoup,
    VEGETABLE: styles.badgeVeg,
    RICE_STARCH: styles.badgeRice,
    DESSERT: styles.badgeAfternoon,
  }
  return (
    <span className={badgeStyles[cat] || styles.badgeMain}>
      {dish.categoryLabel || "Chưa phân nhóm"}
    </span>
  )
}

export default function CreateMenuDayModal({
  isOpen,
  onClose,
  dayData,
  dayMenu,
  initialMealType = "LUNCH",
  onSaveDay,
}) {
  const [selectedMealType, setSelectedMealType] = useState(
    initialMealType === "AFTERNOON" ? "AFTERNOON" : "LUNCH"
  )

  // Local state món ăn của ngày đang chỉnh sửa
  const [lunchDishes, setLunchDishes] = useState([])
  const [afternoonDishes, setAfternoonDishes] = useState([])
  const [seasoningsByMeal, setSeasoningsByMeal] = useState({
    LUNCH: [],
    AFTERNOON: [],
  })
  const [recipeLoading, setRecipeLoading] = useState(false)
  const [allergyLoading, setAllergyLoading] = useState(false)
  const [allergyIssuesByMeal, setAllergyIssuesByMeal] = useState({ LUNCH: [], AFTERNOON: [] })
  const [edited, setEdited] = useState(false)
  const [recipeOptions, setRecipeOptions] = useState([])
  const [dishCatalog, setDishCatalog] = useState([])
  const [categoryOptions, setCategoryOptions] = useState([])
  const DISH_CATEGORIES = useMemo(() => [
    { key: "ALL", label: "Tất cả món" },
    ...categoryOptions,
    { key: "UNCLASSIFIED", label: "Chưa phân nhóm" },
  ], [categoryOptions])

  // Quản lý món ăn thay thế cho học sinh dị ứng theo từng ca ăn
  const [substitutesByMeal, setSubstitutesByMeal] = useState({
    LUNCH: {},
    AFTERNOON: {},
  })

  // Chế độ chọn món riêng thay thế cho học sinh dị ứng ở cột bên phải
  const [selectingSubstituteFor, setSelectingSubstituteFor] = useState(null)

  // Kết quả kiểm tra dị ứng tự động cho từng ca ăn
  const [allergiesByMeal, setAllergiesByMeal] = useState({
    LUNCH: { hasConflict: false, conflicts: [] },
    AFTERNOON: { hasConflict: false, conflicts: [] },
  })

  const seasonings = seasoningsByMeal[selectedMealType] || []

  // Search & filter món ăn từ kho
  const [searchKeyword, setSearchKeyword] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("ALL")
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false)
  const catDropdownRef = useRef(null)

  const selectedCategoryObj = useMemo(() => {
    return (
      DISH_CATEGORIES.find((c) => c.key === selectedCategory) ||
      DISH_CATEGORIES[0]
    )
  }, [selectedCategory, DISH_CATEGORIES])

  // Đóng dropdown phân loại khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        catDropdownRef.current &&
        !catDropdownRef.current.contains(e.target)
      ) {
        setIsCatDropdownOpen(false)
      }
    }
    if (isCatDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isCatDropdownOpen])

  // Trạng thái thu gọn (collapsible) ở cột preview bên trái
  const [isLunchCollapsed, setIsLunchCollapsed] = useState(false)
  const [isAfternoonCollapsed, setIsAfternoonCollapsed] = useState(false)
  const [isSeasoningCollapsed, setIsSeasoningCollapsed] = useState(false)

  // Đồng bộ dữ liệu khi modal mở ra
  useEffect(() => {
    if (isOpen) {
      setSelectedMealType(
        initialMealType === "AFTERNOON" ? "AFTERNOON" : "LUNCH"
      )
      const initialLunch = Array.isArray(dayMenu?.LUNCH) ? [...dayMenu.LUNCH] : []
      const initialAfternoon = Array.isArray(dayMenu?.AFTERNOON)
        ? [...dayMenu.AFTERNOON]
        : []

      setLunchDishes(initialLunch)
      setAfternoonDishes(initialAfternoon)
      setEdited(false)
      setSeasoningsByMeal(
        dayMenu?.seasoningsByMeal || {
          LUNCH: dayMenu?.seasonings || [],
          AFTERNOON: [],
        }
      )

      // Khởi tạo món thay thế nếu có sẵn trong dayMenu
      const existingSubs = dayMenu?.substitutesByMeal || {
        LUNCH: {},
        AFTERNOON: {},
      }
      if (dayMenu?.substituteDish) {
        const targetMeal = initialMealType || "LUNCH"
        const conflictDish = (
          targetMeal === "AFTERNOON" ? initialAfternoon : initialLunch
        ).find(
          (d) => (d.dishId || d.id) === dayMenu.substituteDish.substituteForDishId
        )
        if (conflictDish) {
          existingSubs[targetMeal] = {
            ...existingSubs[targetMeal],
            [conflictDish.dishId || conflictDish.id]: dayMenu.substituteDish,
          }
        }
      }
      setSubstitutesByMeal(existingSubs)
      setSelectingSubstituteFor(null)

      setSearchKeyword("")
      setSelectedCategory("ALL")
      setIsCatDropdownOpen(false)
    }
  }, [isOpen, dayMenu, initialMealType])

  // Tải danh mục món ăn & kho gia vị
  useEffect(() => {
    if (!isOpen) return
    let active = true
    setRecipeLoading(true)
    Promise.all([loadDishCatalogData(), loadRecipeOptions()])
      .then(([data, options]) => {
        if (active) {
          setDishCatalog(data.items)
          setCategoryOptions(data.categories)
          setRecipeOptions(options || [])
        }
      })
      .catch((e) => {
        console.warn("Không tải được kho món ăn:", e)
      })
      .finally(() => {
        if (active) setRecipeLoading(false)
      })
    return () => {
      active = false
    }
  }, [isOpen])

  // Kiểm tra dị ứng độc lập với việc tổng hợp định lượng công thức.
  useEffect(() => {
    if (!isOpen) return
    let active = true
    setAllergyLoading(true)

    const inspect = (type, list) => inspectMenuMealSelection({
      dishes: [
        ...list,
        ...Object.values(substitutesByMeal[type] || {}),
      ],
      seasonings: seasoningsByMeal[type] || [],
      refreshRecipe: edited,
    })

    Promise.all([
      inspect("LUNCH", lunchDishes),
      inspect("AFTERNOON", afternoonDishes),
    ])
      .then(([lunch, afternoon]) => {
        if (active) {
          setAllergiesByMeal({
            LUNCH: lunch.allergies,
            AFTERNOON: afternoon.allergies,
          })
          setAllergyIssuesByMeal({ LUNCH: lunch.issues, AFTERNOON: afternoon.issues })
          setSeasoningsByMeal({
            LUNCH: lunch.seasonings,
            AFTERNOON: afternoon.seasonings,
          })
        }
      })
      .catch((error) => {
        if (active) setAllergyIssuesByMeal({
          LUNCH: [`Chưa kiểm tra được dị ứng: ${error.message || "Vui lòng thử lại."}`],
          AFTERNOON: [],
        })
      })
      .finally(() => {
        if (active) setAllergyLoading(false)
      })

    return () => {
      active = false
    }
  }, [isOpen, edited, lunchDishes, afternoonDishes, substitutesByMeal])

  const getDishAllergyConflict = useCallback(
    (dish, mealType) => {
      const ids = dishIngredientIds(dish)
      return (
        (allergiesByMeal[mealType]?.conflicts || []).find((conflict) =>
          ids.includes(conflict.ingredientId)
        ) || null
      )
    },
    [allergiesByMeal]
  )

  // Đếm số lượng món theo từng phân loại
  const categoryCounts = useMemo(() => {
    const counts = Object.fromEntries(DISH_CATEGORIES.map(option => [option.key, 0]))
    counts.ALL = dishCatalog.length
    dishCatalog.forEach((dish) => {
      const cat = dishCategoryKey(dish)
      if (counts[cat] !== undefined) {
        counts[cat]++
      } else {
        counts.UNCLASSIFIED++
      }
    })
    return counts
  }, [dishCatalog, DISH_CATEGORIES])

  // Lọc danh mục món ăn theo từ khóa, phân loại và chế độ chọn món thay thế dị ứng
  const filteredCatalog = useMemo(() => {
    return dishCatalog.filter((dish) => {
      // Khi đang chọn món riêng thay thế cho học sinh dị ứng:
      // Hiển thị tất cả món, nhưng loại trừ chính món đang bị dị ứng cần thay thế
      if (selectingSubstituteFor?.dish) {
        const conflictedDishId =
          selectingSubstituteFor.dish.dishId || selectingSubstituteFor.dish.id
        if (dish.id === conflictedDishId) {
          return false
        }
      }

      if (selectedCategory !== "ALL") {
        const cat = dishCategoryKey(dish)
        if (cat !== selectedCategory) return false
      }
      if (searchKeyword.trim()) {
        const kw = searchKeyword.trim().toLowerCase()
        const matchName = (dish.name || "").toLowerCase().includes(kw)
        const matchMain = (dish.mainIngredient || "")
          .toLowerCase()
          .includes(kw)
        const matchSupplier = (dish.supplierName || "")
          .toLowerCase()
          .includes(kw)
        if (!matchName && !matchMain && !matchSupplier) return false
      }
      return true
    })
  }, [dishCatalog, selectedCategory, searchKeyword, selectingSubstituteFor])

  // Set các món đã chọn trong ca hiện tại
  const currentMealDishes =
    selectedMealType === "LUNCH" ? lunchDishes : afternoonDishes
  const selectedDishIds = useMemo(() => {
    return new Set(currentMealDishes.map((d) => d.dishId || d.id || d.name))
  }, [currentMealDishes])

  // Thao tác thêm/bỏ món vào ca ăn
  const handleToggleDish = useCallback(
    (dish) => {
      const isLunch = selectedMealType === "LUNCH"
      const targetSetter = isLunch ? setLunchDishes : setAfternoonDishes

      setEdited(true)
      targetSetter((prev) => {
        const exists = prev.some(
          (d) => (d.dishId || d.id || d.name) === dish.id
        )
        if (exists) {
          // Bỏ chọn món: nếu món này có món riêng thay thế thì dọn dẹp luôn
          setSubstitutesByMeal((prevSubs) => {
            const copy = { ...prevSubs }
            if (copy[selectedMealType]?.[dish.id]) {
              const mealSubs = { ...copy[selectedMealType] }
              delete mealSubs[dish.id]
              copy[selectedMealType] = mealSubs
            }
            return copy
          })
          return prev.filter(
            (d) => (d.dishId || d.id || d.name) !== dish.id
          )
        } else {
          const newDish = {
            id: `dish-picked-${Date.now()}-${Math.random()
              .toString(36)
              .slice(2, 6)}`,
            dishId: dish.id,
            name: dish.name,
            category: dish.category,
            categoryLabel: dish.categoryLabel,
            mainIngredient: dish.mainIngredient || dish.name,
            supplierName: dish.supplierName || "",
            supplierBadge: dish.supplierBadge || "",
            ingredientStandards: dish.ingredientStandards || [],
            ingredientIds: dishIngredientIds(dish),
            lines: dish.lines || [],
            seasonings: dish.seasonings || [],
          }
          return [...prev, newDish]
        }
      })
    },
    [selectedMealType]
  )

  // Xóa món trực tiếp từ cột Preview
  const handleRemoveDishFromPreview = useCallback((mealType, dishId) => {
    setEdited(true)
    if (mealType === "LUNCH") {
      setLunchDishes((prev) =>
        prev.filter((d) => d.id !== dishId && d.dishId !== dishId)
      )
    } else {
      setAfternoonDishes((prev) =>
        prev.filter((d) => d.id !== dishId && d.dishId !== dishId)
      )
    }
    // Dọn dẹp món thay thế nếu có
    setSubstitutesByMeal((prev) => {
      const copy = { ...prev }
      if (copy[mealType]?.[dishId]) {
        const mealSubs = { ...copy[mealType] }
        delete mealSubs[dishId]
        copy[mealType] = mealSubs
      }
      return copy
    })
    // Hủy chế độ chọn món thay thế nếu đang chọn cho chính món bị xóa
    setSelectingSubstituteFor((curr) => {
      if (curr && (curr.dish?.id === dishId || curr.dish?.dishId === dishId)) {
        return null
      }
      return curr
    })
  }, [])

  // Bắt đầu chọn món riêng thay thế ở cột bên phải
  const handleStartSelectSubstitute = (dish, conflict, mealType) => {
    setSelectedMealType(mealType)
    setSelectingSubstituteFor({
      dish,
      conflict,
      mealType,
    })
  }

  // Hủy chế độ chọn món riêng thay thế
  const handleCancelSelectSubstitute = () => {
    setSelectingSubstituteFor(null)
  }

  // Chọn món riêng thay thế từ danh sách món ở cột bên phải
  const handleSelectSubstituteFromRightColumn = (chosenDish) => {
    if (!selectingSubstituteFor || !chosenDish) return
    const { dish, conflict, mealType } = selectingSubstituteFor

    setEdited(true)
    const dishKey = dish.dishId || dish.id

    setSubstitutesByMeal((prev) => ({
      ...prev,
      [mealType]: {
        ...prev[mealType],
        [dishKey]: {
          id: `sub-${chosenDish.id}-${Date.now()}`,
          dishId: chosenDish.id,
          name: chosenDish.name,
          categoryLabel: chosenDish.categoryLabel,
          category: chosenDish.category,
          mainIngredient: chosenDish.mainIngredient || chosenDish.name,
          ingredientStandards: chosenDish.ingredientStandards || [],
          ingredientIds: dishIngredientIds(chosenDish),
          lines: chosenDish.lines || [],
          seasonings: chosenDish.seasonings || [],
          isSubstitute: true,
          substituteForDishId: dishKey,
          substituteForName: dish.name,
          allergenName: conflict?.ingredientName || "Dị ứng",
          avoidedIngredientEntryIds: (
            allergiesByMeal[mealType]?.conflicts || []
          )
            .filter((c) => dishIngredientIds(dish).includes(c.ingredientId))
            .map(
              (c) =>
                recipeOptions.find((o) => o.ingredientId === c.ingredientId)?.id
            )
            .filter(Boolean),
        },
      },
    }))

    // Hoàn tất chọn món riêng: quay lại màn hình chọn món thường
    setSelectingSubstituteFor(null)
  }

  // Bỏ món riêng thay thế
  const handleRemoveSubstitute = (mealType, dishId) => {
    setEdited(true)
    setSubstitutesByMeal((prev) => {
      const copy = { ...prev }
      if (copy[mealType]?.[dishId]) {
        const mealSubs = { ...copy[mealType] }
        delete mealSubs[dishId]
        copy[mealType] = mealSubs
      }
      return copy
    })
  }

  // Xây dựng danh sách nhóm suất ăn (Portion Groups) tự động theo chuẩn Backend
  const buildPortionGroupsForMeal = (mealDishes, mealSubsMap) => {
    const subs = Object.values(mealSubsMap || {})
    const regularDishes = mealDishes.filter(
      (d) => !subs.some((s) => s.dishId === d.dishId)
    )
    const regularDishIds = regularDishes.map((d) => d.dishId || d.id)

    if (subs.length === 0) {
      return [
        {
          name: "Suất ăn thường tiêu chuẩn",
          isDefault: true,
          dishIds: regularDishIds,
          avoidedIngredientEntryIds: [],
        },
      ]
    }

    const groups = [
      {
        name: "Suất ăn thường tiêu chuẩn",
        isDefault: true,
        dishIds: regularDishIds,
        avoidedIngredientEntryIds: [],
      },
    ]

    subs.forEach((sub, idx) => {
      const allergyDishIds = regularDishes
        .filter(
          (d) =>
            d.id !== sub.substituteForDishId &&
            d.dishId !== sub.substituteForDishId
        )
        .map((d) => d.dishId || d.id)

      if (sub.dishId || sub.id) {
        allergyDishIds.push(sub.dishId || sub.id)
      }

      const avoided = sub.avoidedIngredientEntryIds || []

      groups.push({
        name: `Suất riêng (Dị ứng ${sub.allergenName || `nhóm ${idx + 1}`})`,
        isDefault: false,
        dishIds: allergyDishIds,
        avoidedIngredientEntryIds: avoided,
      })
    })

    return groups
  }

  // Lưu và cập nhật về ngày
  const handleSaveAndClose = () => {
    // Tổng hợp món ăn: bao gồm món thường và các món riêng thay thế
    const allLunchDishes = [...lunchDishes]
    Object.values(substitutesByMeal.LUNCH || {}).forEach((sub) => {
      if (
        sub &&
        !allLunchDishes.some(
          (d) => (d.dishId || d.id) === (sub.dishId || sub.id)
        )
      ) {
        allLunchDishes.push(sub)
      }
    })

    const allAfternoonDishes = [...afternoonDishes]
    Object.values(substitutesByMeal.AFTERNOON || {}).forEach((sub) => {
      if (
        sub &&
        !allAfternoonDishes.some(
          (d) => (d.dishId || d.id) === (sub.dishId || sub.id)
        )
      ) {
        allAfternoonDishes.push(sub)
      }
    })

    const portionGroupsByMeal = {
      LUNCH: buildPortionGroupsForMeal(lunchDishes, substitutesByMeal.LUNCH),
      AFTERNOON: buildPortionGroupsForMeal(
        afternoonDishes,
        substitutesByMeal.AFTERNOON
      ),
    }

    const firstSubstitute =
      Object.values(substitutesByMeal.LUNCH || {})[0] ||
      Object.values(substitutesByMeal.AFTERNOON || {})[0] ||
      null

    onSaveDay &&
      onSaveDay({
        dateISO: dayData?.dateISO,
        LUNCH: allLunchDishes,
        AFTERNOON: allAfternoonDishes,
        seasonings: seasoningsByMeal.LUNCH,
        seasoningsByMeal,
        useDishRecipes: edited,
        portionGroupsByMeal,
        substituteDish: firstSubstitute,
        substitutesByMeal,
      })
    onClose()
  }

  // Đánh giá trạng thái dị ứng tổng quát cho ngày
  const hasAnyAllergyConflict = useMemo(() => {
    const lunchHas = (allergiesByMeal.LUNCH?.conflicts || []).length > 0
    const afternoonHas = (allergiesByMeal.AFTERNOON?.conflicts || []).length > 0
    return lunchHas || afternoonHas
  }, [allergiesByMeal])

  const allergyIssues = [
    ...allergyIssuesByMeal.LUNCH.map(message => `Bữa trưa: ${message}`),
    ...allergyIssuesByMeal.AFTERNOON.map(message => `Bữa xế: ${message}`),
  ]
  const hasSelectedDishes = lunchDishes.length > 0 || afternoonDishes.length > 0

  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.modalContainer}>
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleWrap}>
            <div className={styles.dayBadge}>
              {dayData?.dayLabel || "Thứ Hai"}
            </div>
            <h2 className={styles.headerTitle}>
              Thực đơn ngày {dayData?.dateVN || "Chưa chọn ngày"}
            </h2>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng cửa sổ"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body: 50/50 Split View */}
        <div className={styles.modalBody}>
          {/* ========================================================
              CỘT TRÁI (50%): TỔNG QUÁT HÔM ĐÓ
              ======================================================== */}
          <div className={styles.previewColumn}>
            {/* Thanh tóm tắt nhanh */}
            <div className={styles.columnStickyHeader}>
              <div className={styles.summaryBar}>
                <span className={styles.summaryItem}>
                  Trưa: <strong>{lunchDishes.length}</strong> món
                </span>
                <span className={styles.summaryDivider}>•</span>
                <span className={styles.summaryItem}>
                  Xế: <strong>{afternoonDishes.length}</strong> món
                </span>
                <span className={styles.summaryDivider}>•</span>
                <span className={styles.summaryItem}>
                  Gia vị: <strong>{seasonings.length}</strong> loại
                </span>
              </div>
            </div>

            <div className={styles.previewScrollArea}>
              {/* KHỐI 1: BỮA TRƯA */}
              <div className={styles.previewMealCard}>
                <div
                  className={`${styles.mealBanner} ${styles.lunchBanner}`}
                  onClick={() => setIsLunchCollapsed((prev) => !prev)}
                  title="Bấm để sổ lên / sổ xuống bữa trưa"
                >
                  <div className={styles.bannerLeft}>
                    <Utensils size={13} className={styles.lunchBannerIcon} />
                    <span className={styles.bannerText}>BỮA TRƯA</span>
                  </div>
                  <div className={styles.bannerRight}>
                    <span className={styles.dishesCountBadge}>
                      {lunchDishes.length} món
                    </span>
                    <button
                      type="button"
                      className={styles.bannerCollapseBtn}
                      aria-label={isLunchCollapsed ? "Mở rộng" : "Thu gọn"}
                    >
                      {isLunchCollapsed ? (
                        <ChevronDown size={14} />
                      ) : (
                        <ChevronUp size={14} />
                      )}
                    </button>
                  </div>
                </div>

                {!isLunchCollapsed && (
                  <div className={styles.previewDishesList}>
                    {lunchDishes.length === 0 ? (
                      <div className={styles.emptyNotice}>
                        <span>
                          Chưa có món trưa. Chọn món từ danh sách bên phải để
                          thêm.
                        </span>
                      </div>
                    ) : (
                      lunchDishes.map((dish) => {
                        const dishKey = dish.dishId || dish.id
                        const conflict = getDishAllergyConflict(dish, "LUNCH")
                        const substitute = substitutesByMeal.LUNCH?.[dishKey]
                        const affectedCount =
                          conflict?.affectedClasses?.reduce(
                            (acc, c) => acc + c.count,
                            0
                          ) || 0

                        return (
                          <div key={dish.id} className="flex flex-col">
                            {/* Dòng món ăn chính */}
                            <div className={styles.previewDishItem}>
                              <div className={styles.dishInfoLeft}>
                                <span className={styles.dishBulletLunch} />
                                <span
                                  className={styles.dishName}
                                  title={dish.name}
                                >
                                  {dish.name}
                                </span>
                                {substitute && (
                                  <span
                                    className={styles.regularBadge}
                                    title="Món này giữ nguyên cho học sinh không dị ứng"
                                  >
                                    Suất thường
                                  </span>
                                )}
                                {renderCategoryBadge(dish)}
                              </div>
                              <div className={styles.dishInfoRight}>
                                <button
                                  type="button"
                                  className={styles.removeIconBtn}
                                  onClick={() =>
                                    handleRemoveDishFromPreview(
                                      "LUNCH",
                                      dish.id
                                    )
                                  }
                                  title={`Xóa ${dish.name} khỏi bữa trưa`}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>

                            {/* Cảnh báo dị ứng tự động & Nút đổi món riêng */}
                            {conflict && (
                              <div className={styles.dishAllergyRow}>
                                <span className={styles.dishAllergyBadge}>
                                  <AlertTriangle size={12} />
                                  <span>
                                    Dị ứng: {conflict.ingredientName} (
                                    {affectedCount} HS)
                                  </span>
                                </span>
                                {(() => {
                                  const isCurrentTarget =
                                    selectingSubstituteFor &&
                                    selectingSubstituteFor.mealType === "LUNCH" &&
                                    (selectingSubstituteFor.dish?.dishId === dishKey ||
                                      selectingSubstituteFor.dish?.id === dishKey)

                                  return (
                                    <button
                                      type="button"
                                      className={`${styles.dishSubstituteActionBtn} ${
                                        isCurrentTarget
                                          ? styles.dishSubstituteActionBtnActive
                                          : ""
                                      }`}
                                      onClick={() => {
                                        if (isCurrentTarget) {
                                          handleCancelSelectSubstitute()
                                        } else {
                                          handleStartSelectSubstitute(
                                            dish,
                                            conflict,
                                            "LUNCH"
                                          )
                                        }
                                      }}
                                      title={
                                        isCurrentTarget
                                          ? "Bấm để hủy chọn món riêng"
                                          : "Chọn món thay thế an toàn ở cột bên phải"
                                      }
                                    >
                                      <ShieldCheck size={13} />
                                      <span>
                                        {isCurrentTarget
                                          ? "Đang chọn ở cột phải..."
                                          : substitute
                                            ? "Đổi món riêng"
                                            : "Món riêng cho người dị ứng"}
                                      </span>
                                    </button>
                                  )
                                })()}
                              </div>
                            )}

                            {/* Món ăn riêng thay thế */}
                            {substitute && (
                              <div className={styles.substituteDishCard}>
                                <div className={styles.subLeft}>
                                  <span className={styles.subArrow}>↳</span>
                                  <span className={styles.subBadge}>
                                    Món riêng dị ứng:
                                  </span>
                                  <strong className={styles.subDishName}>
                                    {substitute.name}
                                  </strong>
                                  <span className={styles.subSafeNote}>
                                    (Thay cho HS dị ứng{" "}
                                    {conflict?.ingredientName || "món gốc"})
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  className={styles.subRemoveBtn}
                                  onClick={() =>
                                    handleRemoveSubstitute("LUNCH", dishKey)
                                  }
                                  title="Bỏ món riêng này"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                )}
              </div>

              {/* KHỐI 2: BỮA XẾ */}
              <div className={styles.previewMealCard}>
                <div
                  className={`${styles.mealBanner} ${styles.afternoonBanner}`}
                  onClick={() => setIsAfternoonCollapsed((prev) => !prev)}
                  title="Bấm để sổ lên / sổ xuống bữa xế"
                >
                  <div className={styles.bannerLeft}>
                    <Coffee size={13} className={styles.afternoonBannerIcon} />
                    <span className={styles.bannerText}>BỮA XẾ</span>
                  </div>
                  <div className={styles.bannerRight}>
                    <span className={styles.dishesCountBadge}>
                      {afternoonDishes.length} món
                    </span>
                    <button
                      type="button"
                      className={styles.bannerCollapseBtn}
                      aria-label={isAfternoonCollapsed ? "Mở rộng" : "Thu gọn"}
                    >
                      {isAfternoonCollapsed ? (
                        <ChevronDown size={14} />
                      ) : (
                        <ChevronUp size={14} />
                      )}
                    </button>
                  </div>
                </div>

                {!isAfternoonCollapsed && (
                  <div className={styles.previewDishesList}>
                    {afternoonDishes.length === 0 ? (
                      <div className={styles.emptyNotice}>
                        <span>
                          Chưa có món xế. Chọn ca Bữa xế bên phải để thêm.
                        </span>
                      </div>
                    ) : (
                      afternoonDishes.map((dish) => {
                        const dishKey = dish.dishId || dish.id
                        const conflict = getDishAllergyConflict(
                          dish,
                          "AFTERNOON"
                        )
                        const substitute =
                          substitutesByMeal.AFTERNOON?.[dishKey]
                        const affectedCount =
                          conflict?.affectedClasses?.reduce(
                            (acc, c) => acc + c.count,
                            0
                          ) || 0

                        return (
                          <div key={dish.id} className="flex flex-col">
                            {/* Dòng món ăn chính */}
                            <div className={styles.previewDishItem}>
                              <div className={styles.dishInfoLeft}>
                                <span className={styles.dishBulletAfternoon} />
                                <span
                                  className={styles.dishName}
                                  title={dish.name}
                                >
                                  {dish.name}
                                </span>
                                {substitute && (
                                  <span
                                    className={styles.regularBadge}
                                    title="Món này giữ nguyên cho học sinh không dị ứng"
                                  >
                                    Suất thường
                                  </span>
                                )}
                                {renderCategoryBadge(dish)}
                              </div>
                              <div className={styles.dishInfoRight}>
                                <button
                                  type="button"
                                  className={styles.removeIconBtn}
                                  onClick={() =>
                                    handleRemoveDishFromPreview(
                                      "AFTERNOON",
                                      dish.id
                                    )
                                  }
                                  title={`Xóa ${dish.name} khỏi bữa xế`}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>

                            {/* Cảnh báo dị ứng tự động & Nút đổi món riêng */}
                            {conflict && (
                              <div className={styles.dishAllergyRow}>
                                <span className={styles.dishAllergyBadge}>
                                  <AlertTriangle size={12} />
                                  <span>
                                    Dị ứng: {conflict.ingredientName} (
                                    {affectedCount} HS)
                                  </span>
                                </span>
                                {(() => {
                                  const isCurrentTarget =
                                    selectingSubstituteFor &&
                                    selectingSubstituteFor.mealType === "AFTERNOON" &&
                                    (selectingSubstituteFor.dish?.dishId === dishKey ||
                                      selectingSubstituteFor.dish?.id === dishKey)

                                  return (
                                    <button
                                      type="button"
                                      className={`${styles.dishSubstituteActionBtn} ${
                                        isCurrentTarget
                                          ? styles.dishSubstituteActionBtnActive
                                          : ""
                                      }`}
                                      onClick={() => {
                                        if (isCurrentTarget) {
                                          handleCancelSelectSubstitute()
                                        } else {
                                          handleStartSelectSubstitute(
                                            dish,
                                            conflict,
                                            "AFTERNOON"
                                          )
                                        }
                                      }}
                                      title={
                                        isCurrentTarget
                                          ? "Bấm để hủy chọn món riêng"
                                          : "Chọn món thay thế an toàn ở cột bên phải"
                                      }
                                    >
                                      <ShieldCheck size={13} />
                                      <span>
                                        {isCurrentTarget
                                          ? "Đang chọn ở cột phải..."
                                          : substitute
                                            ? "Đổi món riêng"
                                            : "Món riêng cho người dị ứng"}
                                      </span>
                                    </button>
                                  )
                                })()}
                              </div>
                            )}

                            {/* Món ăn riêng thay thế */}
                            {substitute && (
                              <div className={styles.substituteDishCard}>
                                <div className={styles.subLeft}>
                                  <span className={styles.subArrow}>↳</span>
                                  <span className={styles.subBadge}>
                                    Món riêng dị ứng:
                                  </span>
                                  <strong className={styles.subDishName}>
                                    {substitute.name}
                                  </strong>
                                  <span className={styles.subSafeNote}>
                                    (Thay cho HS dị ứng{" "}
                                    {conflict?.ingredientName || "món gốc"})
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  className={styles.subRemoveBtn}
                                  onClick={() =>
                                    handleRemoveSubstitute("AFTERNOON", dishKey)
                                  }
                                  title="Bỏ món riêng này"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                )}
              </div>

              {/* KHỐI 3: GIA VỊ THEO SUẤT */}
              <div className={styles.previewSeasoningCard}>
                <div
                  className={styles.seasoningBanner}
                  onClick={() => setIsSeasoningCollapsed((prev) => !prev)}
                  title="Bấm để sổ lên / sổ xuống gia vị"
                >
                  <div className={styles.bannerLeft}>
                    <Sparkles size={13} className={styles.seasoningBannerIcon} />
                    <span className={styles.bannerText}>
                      GIA VỊ (THEO SUẤT)
                    </span>
                  </div>
                  <div className={styles.bannerRight}>
                    <span className={styles.seasoningCountBadge}>
                      {seasonings.length} loại
                    </span>
                    <button
                      type="button"
                      className={styles.bannerCollapseBtn}
                      aria-label={isSeasoningCollapsed ? "Mở rộng" : "Thu gọn"}
                    >
                      {isSeasoningCollapsed ? (
                        <ChevronDown size={14} />
                      ) : (
                        <ChevronUp size={14} />
                      )}
                    </button>
                  </div>
                </div>

                {!isSeasoningCollapsed && (
                  <div className={styles.previewSeasoningsList}>
                    {seasonings.length === 0 ? (
                      <div className={styles.emptyNotice}>
                        <span>
                          Chưa có gia vị. Gia vị sẽ tự động tính khi bạn chọn món
                          ăn ở danh sách bên phải.
                        </span>
                      </div>
                    ) : (
                      <table className={styles.miniSeasoningTable}>
                        <thead>
                          <tr>
                            <th>Tên gia vị</th>
                            <th className={styles.alignRight}>
                              Định lượng / suất
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {seasonings.map((s) => (
                            <tr key={s.id || s.name}>
                              <td className={styles.seasoningNameCell}>
                                <span className={styles.seasoningDot} />
                                <span>
                                  {s.name.replace(/\(.*?\)/g, "").trim()}
                                </span>
                              </td>
                              <td
                                className={`${styles.seasoningPortionCell} ${styles.alignRight}`}
                              >
                                {s.portionQty || 5} {s.unit || "g"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================
              CỘT PHẢI (50%): CHỌN MÓN TỪ KHO BÁN TRÚ
              ======================================================== */}
          <div className={styles.pickerColumn}>
            {/* Header Tabs: Chọn Ca Bữa trưa / Bữa xế */}
            <div className={styles.columnStickyHeaderRight}>
              <div className={styles.mealTypeSwitchTabs}>
                <button
                  type="button"
                  className={`${styles.mealTabBtn} ${
                    selectedMealType === "LUNCH"
                      ? styles.activeMealTabLunch
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedMealType("LUNCH")
                    if (
                      selectingSubstituteFor &&
                      selectingSubstituteFor.mealType !== "LUNCH"
                    ) {
                      setSelectingSubstituteFor(null)
                    }
                  }}
                >
                  <Utensils size={14} />
                  <span>Món Bữa trưa</span>
                  <span className={styles.mealTabCountBadge}>
                    {lunchDishes.length}
                  </span>
                </button>
                <button
                  type="button"
                  className={`${styles.mealTabBtn} ${
                    selectedMealType === "AFTERNOON"
                      ? styles.activeMealTabAfternoon
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedMealType("AFTERNOON")
                    if (
                      selectingSubstituteFor &&
                      selectingSubstituteFor.mealType !== "AFTERNOON"
                    ) {
                      setSelectingSubstituteFor(null)
                    }
                  }}
                >
                  <Coffee size={14} />
                  <span>Món Bữa xế</span>
                  <span className={styles.mealTabCountBadge}>
                    {afternoonDishes.length}
                  </span>
                </button>
              </div>
            </div>

            <div className={styles.catalogAreaWrap}>
              {/* Banner hiển thị khi đang chọn món riêng thay thế cho học sinh dị ứng */}
              {selectingSubstituteFor && (
                <div className={styles.substituteModeBanner}>
                  <div className={styles.subBannerLeft}>
                    <div className={styles.subBannerIconWrap}>
                      <ShieldCheck size={18} />
                    </div>
                    <div className={styles.subBannerTextWrap}>
                      <div className={styles.subBannerTitle}>
                        Đang chọn món riêng thay cho: <strong>&ldquo;{selectingSubstituteFor.dish?.name}&rdquo;</strong>
                      </div>
                      <div className={styles.subBannerDesc}>
                        Học sinh dị ứng <strong>{selectingSubstituteFor.conflict?.ingredientName}</strong> ({selectingSubstituteFor.conflict?.affectedClasses?.reduce((acc, c) => acc + c.count, 0) || 0} HS) sẽ dùng món riêng này. Món chính vẫn giữ nguyên cho học sinh ăn bình thường.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={styles.subBannerCancelBtn}
                    onClick={handleCancelSelectSubstitute}
                    title="Hủy chọn món riêng và quay lại chọn món thường"
                  >
                    <X size={14} />
                    <span>Hủy chọn</span>
                  </button>
                </div>
              )}

              {/* Thanh tìm kiếm & bộ lọc phân loại món */}
              <div className={styles.searchAndFiltersBar}>
                <div className={styles.searchBox}>
                  <Search size={15} className={styles.searchIcon} />
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Tìm kiếm món ăn theo tên hoặc nguyên liệu..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                  />
                  {searchKeyword && (
                    <button
                      type="button"
                      className={styles.clearSearchBtn}
                      onClick={() => setSearchKeyword("")}
                      title="Xóa tìm kiếm"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Dropdown Bộ lọc phân loại món ăn */}
                <div
                  className={styles.filterDropdownContainer}
                  ref={catDropdownRef}
                >
                  <button
                    type="button"
                    className={`${styles.filterDropdownTrigger} ${
                      isCatDropdownOpen ? styles.triggerOpen : ""
                    } ${
                      selectedCategory !== "ALL"
                        ? styles.triggerActiveFilter
                        : ""
                    }`}
                    onClick={() => setIsCatDropdownOpen((prev) => !prev)}
                    aria-haspopup="listbox"
                    aria-expanded={isCatDropdownOpen}
                    title="Lọc món ăn theo phân loại"
                  >
                    <div className={styles.triggerLeft}>
                      <Filter size={14} className={styles.filterIcon} />
                      <span className={styles.triggerText}>
                        {selectedCategoryObj.label}
                      </span>
                      <span className={styles.triggerCountBadge}>
                        {categoryCounts[selectedCategory] || 0}
                      </span>
                    </div>
                    <ChevronDown
                      size={14}
                      className={`${styles.chevronIcon} ${
                        isCatDropdownOpen ? styles.chevronRotated : ""
                      }`}
                    />
                  </button>

                  {isCatDropdownOpen && (
                    <div className={styles.dropdownMenu} role="listbox">
                      {DISH_CATEGORIES.map((cat) => {
                        const isSelected = selectedCategory === cat.key
                        const count = categoryCounts[cat.key] || 0
                        return (
                          <button
                            key={cat.key}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            className={`${styles.dropdownItem} ${
                              isSelected ? styles.dropdownItemSelected : ""
                            }`}
                            onClick={() => {
                              setSelectedCategory(cat.key)
                              setIsCatDropdownOpen(false)
                            }}
                          >
                            <div className={styles.dropdownItemLeft}>
                              <span className={styles.dropdownItemText}>
                                {cat.label}
                              </span>
                              <span className={styles.dropdownItemCount}>
                                ({count})
                              </span>
                            </div>
                            {isSelected && (
                              <Check
                                size={14}
                                className={styles.dropdownItemCheck}
                              />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Danh sách món ăn từ Kho (Có thể cuộn lên/xuống mượt mà) */}
              <div className={styles.catalogListScroll}>
                {recipeLoading ? (
                  <div className={styles.loadingCatalog}>
                    <div className={styles.statusSpinner} />
                    <span>Đang tải kho món ăn bán trú...</span>
                  </div>
                ) : filteredCatalog.length === 0 ? (
                  <div className={styles.emptyCatalog}>
                    <AlertCircle size={24} />
                    <p>Không tìm thấy món ăn nào phù hợp với bộ lọc hiện tại.</p>
                  </div>
                ) : (
                  filteredCatalog.map((dish) => {
                    // Khi đang ở chế độ chọn món riêng thay thế cho học sinh dị ứng
                    if (selectingSubstituteFor) {
                      const dishKey =
                        selectingSubstituteFor.dish?.dishId ||
                        selectingSubstituteFor.dish?.id
                      const currentSub =
                        substitutesByMeal[selectingSubstituteFor.mealType]?.[
                          dishKey
                        ]
                      const isThisSub =
                        (currentSub?.dishId || currentSub?.id) === dish.id
                      const containsAllergen =
                        Boolean(
                          selectingSubstituteFor.conflict?.ingredientId &&
                          dishIngredientIds(dish).includes(
                            selectingSubstituteFor.conflict.ingredientId
                          )
                        )

                      return (
                        <div
                          key={dish.id}
                          className={`${styles.catalogCard} ${
                            isThisSub ? styles.cardPickedSub : ""
                          }`}
                        >
                          <div className={styles.cardMain}>
                            <div className={styles.cardHeaderRow}>
                              <h4 className={styles.dishCardTitle}>
                                {dish.name}
                              </h4>
                              {renderCategoryBadge(dish)}
                              {containsAllergen && (
                                <span className={styles.subAllergyWarnBadge}>
                                  <AlertTriangle size={11} />
                                  <span>
                                    Chứa {selectingSubstituteFor.conflict?.ingredientName}
                                  </span>
                                </span>
                              )}
                            </div>
                            {dish.mainIngredient && (
                              <p className={styles.dishMainIngredient}>
                                Nguyên liệu chính: {dish.mainIngredient}
                              </p>
                            )}
                            {dish.supplierName && (
                              <span className={styles.dishSupplierBadge}>
                                NCC: {dish.supplierName}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            className={`${styles.pickActionBtn} ${
                              isThisSub ? styles.btnPickedSub : styles.btnAddSub
                            }`}
                            onClick={() =>
                              handleSelectSubstituteFromRightColumn(dish)
                            }
                          >
                            {isThisSub ? (
                              <>
                                <Check size={12} />
                                <span>Đang chọn làm món riêng</span>
                              </>
                            ) : (
                              <>
                                <Plus size={12} />
                                <span>Chọn làm món riêng</span>
                              </>
                            )}
                          </button>
                        </div>
                      )
                    }

                    // Chế độ chọn món thường
                    const isPicked = selectedDishIds.has(dish.id)
                    return (
                      <div
                        key={dish.id}
                        className={`${styles.catalogCard} ${
                          isPicked ? styles.cardPicked : ""
                        }`}
                      >
                        <div className={styles.cardMain}>
                          <div className={styles.cardHeaderRow}>
                            <h4 className={styles.dishCardTitle}>
                              {dish.name}
                            </h4>
                            {renderCategoryBadge(dish)}
                          </div>
                          {dish.mainIngredient && (
                            <p className={styles.dishMainIngredient}>
                              Nguyên liệu chính: {dish.mainIngredient}
                            </p>
                          )}
                          {dish.supplierName && (
                            <span className={styles.dishSupplierBadge}>
                              NCC: {dish.supplierName}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          className={`${styles.pickActionBtn} ${
                            isPicked ? styles.btnRemovePick : styles.btnAddPick
                          }`}
                          onClick={() => handleToggleDish(dish)}
                        >
                          {isPicked ? (
                            <>
                              <Check size={12} />
                              <span>Đã chọn</span>
                            </>
                          ) : (
                            <>
                              <Plus size={12} />
                              <span>Thêm</span>
                            </>
                          )}
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className={styles.modalFooter}>
          <div className={styles.footerStatusWrap} aria-live="polite">
            {allergyLoading ? (
              <div className={styles.footerStatusLoading}>
                <div className={styles.statusSpinner} />
                <span>Đang kiểm tra an toàn dinh dưỡng &amp; dị ứng học sinh...</span>
              </div>
            ) : hasAnyAllergyConflict ? (
              <div className={styles.footerStatusWarn}>
                <AlertTriangle size={15} />
                <span>
                  Phát hiện món chứa nguyên liệu dị ứng của học sinh. Bạn có thể chọn món riêng thay thế ở cột bên trái.
                </span>
              </div>
            ) : allergyIssues.length === 0 && hasSelectedDishes ? (
              <div className={styles.footerStatusSafe}>
                <ShieldCheck size={16} />
                <span>
                  Chưa phát hiện xung đột với hồ sơ dị ứng đã lưu của trường.
                </span>
              </div>
            ) : null}
            {!allergyLoading && allergyIssues.map(message => (
              <div key={message} className={styles.footerStatusWarn} role="alert">
                <AlertTriangle size={15} />
                <span>{message}</span>
              </div>
            ))}
          </div>

          <div className={styles.footerBtns}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              className={styles.confirmSaveBtn}
              onClick={handleSaveAndClose}
              disabled={allergyLoading || recipeLoading}
            >
              <Check size={16} />
              <span>Xác nhận &amp; Cập nhật vào ngày này</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
