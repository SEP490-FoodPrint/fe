import React, { useState, useMemo, useEffect, useCallback } from "react"
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
} from "lucide-react"
import styles from "./CreateMenuDayModal.module.scss"
import { loadDishCatalog, loadRecipeOptions, previewMealRecipe } from "src/services/DishService"
import MenuService from "src/services/MenuService"

const DISH_CATEGORIES = [{ key: "ALL", label: "Tất cả món" }]

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
  const [seasoningsByMeal, setSeasoningsByMeal] = useState({ LUNCH: [], AFTERNOON: [] })
  const [recipeLoading, setRecipeLoading] = useState(false)
  const [edited, setEdited] = useState(false)
  const [recipeOptions, setRecipeOptions] = useState([])
  const [dishCatalog, setDishCatalog] = useState([])

  // Quản lý món ăn thay thế cho học sinh dị ứng theo từng ca ăn
  // Cấu trúc: { LUNCH: { [originalDishId]: substituteDishObj }, AFTERNOON: { ... } }
  const [substitutesByMeal, setSubstitutesByMeal] = useState({ LUNCH: {}, AFTERNOON: {} })

  // Modal chọn món ăn thay thế cho học sinh dị ứng
  const [substituteModal, setSubstituteModal] = useState({
    isOpen: false,
    dish: null,
    conflict: null,
    mealType: "LUNCH",
  })
  const [subSearchKeyword, setSubSearchKeyword] = useState("")

  // Kết quả kiểm tra dị ứng tự động cho từng ca ăn
  const [allergiesByMeal, setAllergiesByMeal] = useState({
    LUNCH: { hasConflict: false, conflicts: [] },
    AFTERNOON: { hasConflict: false, conflicts: [] },
  })

  const seasonings = seasoningsByMeal[selectedMealType] || []

  // Search & filter món ăn từ kho
  const [searchKeyword, setSearchKeyword] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("ALL")

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
      const existingSubs = dayMenu?.substitutesByMeal || { LUNCH: {}, AFTERNOON: {} }
      if (dayMenu?.substituteDish) {
        const targetMeal = initialMealType || "LUNCH"
        const conflictDish = (targetMeal === "AFTERNOON" ? initialAfternoon : initialLunch).find((d) =>
          d.name?.toLowerCase().includes("đậu phộng") || d.hasConflict
        )
        if (conflictDish) {
          existingSubs[targetMeal] = {
            ...existingSubs[targetMeal],
            [conflictDish.dishId || conflictDish.id]: dayMenu.substituteDish,
          }
        }
      }
      setSubstitutesByMeal(existingSubs)

      setSearchKeyword("")
      setSelectedCategory("ALL")
    }
  }, [isOpen, dayMenu, initialMealType])

  // Tải danh mục món ăn & kho gia vị
  useEffect(() => {
    if (!isOpen) return
    let active = true
    setRecipeLoading(true)
    Promise.all([loadDishCatalog(), loadRecipeOptions()])
      .then(([rows, options]) => {
        if (active) {
          setDishCatalog(rows)
          setRecipeOptions(options)
        }
      })
      .catch((e) => {
        console.warn("Không tải được danh mục công thức:", e.message)
      })
      .finally(() => {
        if (active) setRecipeLoading(false)
      })
    return () => {
      active = false
    }
  }, [isOpen])

  // Tự động kiểm tra dị ứng học đường cho cả 2 ca ăn
  useEffect(() => {
    if (!isOpen) return
    let active = true

    const getDishIngIds = (list) =>
      [
        ...new Set(
          (list || []).flatMap(
            (d) =>
              d.ingredientIds ||
              d.ingredientStandards?.map((i) => i.ingredientId) ||
              []
          )
        ),
      ].filter((id) =>
        /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id)
      )

    const lunchIngs = getDishIngIds(lunchDishes)
    const afternoonIngs = getDishIngIds(afternoonDishes)

    const checkLunch = lunchIngs.length
      ? MenuService.checkAllergies(lunchIngs)
          .then((res) => res.data)
          .catch(() => ({ hasConflict: false, conflicts: [] }))
      : Promise.resolve({ hasConflict: false, conflicts: [] })

    const checkAfternoon = afternoonIngs.length
      ? MenuService.checkAllergies(afternoonIngs)
          .then((res) => res.data)
          .catch(() => ({ hasConflict: false, conflicts: [] }))
      : Promise.resolve({ hasConflict: false, conflicts: [] })

    Promise.all([checkLunch, checkAfternoon]).then(([lunchRes, afternoonRes]) => {
      if (active) {
        setAllergiesByMeal({
          LUNCH: lunchRes || { hasConflict: false, conflicts: [] },
          AFTERNOON: afternoonRes || { hasConflict: false, conflicts: [] },
        })
      }
    })

    return () => {
      active = false
    }
  }, [isOpen, lunchDishes, afternoonDishes])

  // Tự động tính toán định lượng gia vị từ công thức món ăn (chạy nền, không block)
  useEffect(() => {
    if (!isOpen || !edited) return
    let active = true
    Promise.all([
      previewMealRecipe(lunchDishes.map((d) => d.dishId || d.id)).catch(() => ({
        dishes: [],
        seasonings: [],
      })),
      previewMealRecipe(afternoonDishes.map((d) => d.dishId || d.id)).catch(() => ({
        dishes: [],
        seasonings: [],
      })),
    ]).then(([lunch, afternoon]) => {
      if (active) {
        setSeasoningsByMeal({
          LUNCH: (lunch.seasonings || []).map((s) => ({
            ...s,
            id: s.ingredientEntryId || s.id,
            portionQty: s.quantityPerPortion,
          })),
          AFTERNOON: (afternoon.seasonings || []).map((s) => ({
            ...s,
            id: s.ingredientEntryId || s.id,
            portionQty: s.quantityPerPortion,
          })),
        })
      }
    })
    return () => {
      active = false
    }
  }, [isOpen, edited, lunchDishes, afternoonDishes])

  // Hàm phát hiện dị ứng cho một món ăn cụ thể
  const getDishAllergyConflict = useCallback(
    (dish, mealType) => {
      const conflicts = allergiesByMeal[mealType]?.conflicts || []
      const dishIngIds =
        dish.ingredientIds ||
        dish.ingredientStandards?.map((i) => i.ingredientId) ||
        []

      // 1. Đối chiếu theo mã nguyên liệu dị ứng từ DB
      let matched = conflicts.find((c) => dishIngIds.includes(c.ingredientId))

      // 2. Đối chiếu theo tên nguyên liệu dị ứng
      if (!matched) {
        matched = conflicts.find(
          (c) =>
            dish.name &&
            dish.name.toLowerCase().includes(c.ingredientName?.toLowerCase())
        )
      }

      // 3. Fallback cho các món demo có chứa từ khóa đậu phộng / hải sản
      if (!matched && dish.name?.toLowerCase().includes("đậu phộng")) {
        matched = {
          ingredientId: "demo-peanut-allergy",
          ingredientName: "Đậu phộng",
          affectedClasses: [{ className: "Khối 1", count: 12 }],
        }
      }

      return matched || null
    },
    [allergiesByMeal]
  )

  // Lọc danh sách món ăn từ Kho
  const filteredCatalog = useMemo(() => {
    return dishCatalog.filter((dish) => {
      if (selectedCategory !== "ALL" && dish.category !== selectedCategory) {
        return false
      }
      if (searchKeyword.trim()) {
        const kw = searchKeyword.trim().toLowerCase()
        const matchName = dish.name.toLowerCase().includes(kw)
        const matchMain = dish.mainIngredient?.toLowerCase().includes(kw)
        const matchSupplier = dish.supplierName?.toLowerCase().includes(kw)
        if (!matchName && !matchMain && !matchSupplier) return false
      }
      return true
    })
  }, [dishCatalog, selectedCategory, searchKeyword])

  // Lọc món thay thế an toàn cho học sinh dị ứng
  const filteredSubstituteCatalog = useMemo(() => {
    if (!substituteModal.isOpen) return []
    const conflictName = (substituteModal.conflict?.ingredientName || "").toLowerCase()
    const kw = subSearchKeyword.trim().toLowerCase()
    const currentDishes =
      substituteModal.mealType === "LUNCH" ? lunchDishes : afternoonDishes
    const currentIds = new Set(currentDishes.map((d) => d.dishId || d.id))

    return dishCatalog.filter((dish) => {
      // Loại trừ món đang có trong bữa ăn
      if (currentIds.has(dish.id)) return false

      // Loại trừ món có chứa nguyên liệu gây dị ứng
      if (conflictName) {
        if (dish.name.toLowerCase().includes(conflictName)) return false
        if (dish.mainIngredient?.toLowerCase().includes(conflictName)) return false
      }

      // Tìm kiếm theo từ khóa
      if (kw) {
        const matchName = dish.name.toLowerCase().includes(kw)
        const matchMain = dish.mainIngredient?.toLowerCase().includes(kw)
        if (!matchName && !matchMain) return false
      }
      return true
    })
  }, [dishCatalog, substituteModal, subSearchKeyword, lunchDishes, afternoonDishes])

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
          return prev.filter((d) => (d.dishId || d.id || d.name) !== dish.id)
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
            ingredientIds: dish.ingredientIds || [],
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
      setLunchDishes((prev) => prev.filter((d) => d.id !== dishId && d.dishId !== dishId))
    } else {
      setAfternoonDishes((prev) => prev.filter((d) => d.id !== dishId && d.dishId !== dishId))
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
  }, [])

  // Mở modal chọn món riêng thay thế
  const handleOpenSubstituteModal = (dish, conflict, mealType) => {
    setSubSearchKeyword("")
    setSubstituteModal({
      isOpen: true,
      dish,
      conflict,
      mealType,
    })
  }

  // Chọn món riêng thay thế cho học sinh dị ứng
  const handleSelectSubstitute = (chosenDish) => {
    const { dish, conflict, mealType } = substituteModal
    if (!dish || !chosenDish) return

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
          mainIngredient: chosenDish.mainIngredient || chosenDish.name,
          ingredientStandards: chosenDish.ingredientStandards || [],
          ingredientIds: chosenDish.ingredientIds || [],
          seasonings: chosenDish.seasonings || [],
          isSubstitute: true,
          substituteForDishId: dishKey,
          substituteForName: dish.name,
          allergenName: conflict?.ingredientName || "Dị ứng",
          avoidedIngredientEntryIds: conflict?.ingredientId ? [conflict.ingredientId] : [],
        },
      },
    }))

    setSubstituteModal({ isOpen: false, dish: null, conflict: null, mealType: "LUNCH" })
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
    const regularDishes = mealDishes.filter((d) => !subs.some((s) => s.dishId === d.dishId))
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
            d.id !== sub.substituteForDishId && d.dishId !== sub.substituteForDishId
        )
        .map((d) => d.dishId || d.id)

      if (sub.dishId || sub.id) {
        allergyDishIds.push(sub.dishId || sub.id)
      }

      const avoided =
        sub.avoidedIngredientEntryIds?.length
          ? sub.avoidedIngredientEntryIds
          : recipeOptions.find((o) =>
              o.name?.toLowerCase().includes((sub.allergenName || "đậu phộng").toLowerCase())
            )
          ? [recipeOptions.find((o) =>
              o.name?.toLowerCase().includes((sub.allergenName || "đậu phộng").toLowerCase())
            ).id]
          : []

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
        !allLunchDishes.some((d) => (d.dishId || d.id) === (sub.dishId || sub.id))
      ) {
        allLunchDishes.push(sub)
      }
    })

    const allAfternoonDishes = [...afternoonDishes]
    Object.values(substitutesByMeal.AFTERNOON || {}).forEach((sub) => {
      if (
        sub &&
        !allAfternoonDishes.some((d) => (d.dishId || d.id) === (sub.dishId || sub.id))
      ) {
        allAfternoonDishes.push(sub)
      }
    })

    const portionGroupsByMeal = {
      LUNCH: buildPortionGroupsForMeal(lunchDishes, substitutesByMeal.LUNCH),
      AFTERNOON: buildPortionGroupsForMeal(afternoonDishes, substitutesByMeal.AFTERNOON),
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
              Thực đơn ngày {dayData?.dateVN || "10/11/2026"}
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
                          ) || 12

                        return (
                          <div key={dish.id} className="flex flex-col">
                            {/* Dòng món ăn chính (vẫn giữ nguyên cho học sinh không dị ứng) */}
                            <div className={styles.previewDishItem}>
                              <div className={styles.dishInfoLeft}>
                                <span className={styles.dishBulletLunch} />
                                <span className={styles.dishName} title={dish.name}>
                                  {dish.name}
                                </span>
                                {substitute && (
                                  <span
                                    className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium"
                                    title="Món này giữ nguyên cho học sinh không dị ứng"
                                  >
                                    Suất thường
                                  </span>
                                )}
                                {dish.categoryLabel && (
                                  <span className={styles.categoryPill}>
                                    {dish.categoryLabel}
                                  </span>
                                )}
                              </div>
                              <div className={styles.dishInfoRight}>
                                <button
                                  type="button"
                                  className={styles.removeIconBtn}
                                  onClick={() =>
                                    handleRemoveDishFromPreview("LUNCH", dish.id)
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
                                    Dị ứng: {conflict.ingredientName} ({affectedCount} HS)
                                  </span>
                                </span>
                                <button
                                  type="button"
                                  className={styles.dishSubstituteActionBtn}
                                  onClick={() =>
                                    handleOpenSubstituteModal(dish, conflict, "LUNCH")
                                  }
                                  title="Chọn món ăn thay thế an toàn cho học sinh dị ứng"
                                >
                                  <ShieldCheck size={13} />
                                  <span>
                                    {substitute
                                      ? "Đổi món riêng"
                                      : "Món riêng cho người dị ứng"}
                                  </span>
                                </button>
                              </div>
                            )}

                            {/* Món ăn riêng thay thế (được bố trí an toàn cho học sinh dị ứng) */}
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
                                    (Thay cho HS dị ứng {conflict?.ingredientName || "món gốc"})
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
                        const conflict = getDishAllergyConflict(dish, "AFTERNOON")
                        const substitute = substitutesByMeal.AFTERNOON?.[dishKey]
                        const affectedCount =
                          conflict?.affectedClasses?.reduce(
                            (acc, c) => acc + c.count,
                            0
                          ) || 12

                        return (
                          <div key={dish.id} className="flex flex-col">
                            {/* Dòng món ăn chính (vẫn giữ nguyên cho học sinh không dị ứng) */}
                            <div className={styles.previewDishItem}>
                              <div className={styles.dishInfoLeft}>
                                <span className={styles.dishBulletAfternoon} />
                                <span className={styles.dishName} title={dish.name}>
                                  {dish.name}
                                </span>
                                {substitute && (
                                  <span
                                    className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium"
                                    title="Món này giữ nguyên cho học sinh không dị ứng"
                                  >
                                    Suất thường
                                  </span>
                                )}
                                {dish.categoryLabel && (
                                  <span className={styles.categoryPill}>
                                    {dish.categoryLabel}
                                  </span>
                                )}
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
                                    Dị ứng: {conflict.ingredientName} ({affectedCount} HS)
                                  </span>
                                </span>
                                <button
                                  type="button"
                                  className={styles.dishSubstituteActionBtn}
                                  onClick={() =>
                                    handleOpenSubstituteModal(
                                      dish,
                                      conflict,
                                      "AFTERNOON"
                                    )
                                  }
                                  title="Chọn món ăn thay thế an toàn cho học sinh dị ứng"
                                >
                                  <ShieldCheck size={13} />
                                  <span>
                                    {substitute
                                      ? "Đổi món riêng"
                                      : "Món riêng cho người dị ứng"}
                                  </span>
                                </button>
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
                                    (Thay cho HS dị ứng {conflict?.ingredientName || "món gốc"})
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
                            <tr key={s.id}>
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
                    selectedMealType === "LUNCH" ? styles.activeMealTabLunch : ""
                  }`}
                  onClick={() => setSelectedMealType("LUNCH")}
                >
                  <Utensils size={13} />
                  <span>Món Bữa trưa ({lunchDishes.length})</span>
                </button>
                <button
                  type="button"
                  className={`${styles.mealTabBtn} ${
                    selectedMealType === "AFTERNOON"
                      ? styles.activeMealTabAfternoon
                      : ""
                  }`}
                  onClick={() => setSelectedMealType("AFTERNOON")}
                >
                  <Coffee size={13} />
                  <span>Món Bữa xế ({afternoonDishes.length})</span>
                </button>
              </div>
            </div>

            <div className={styles.catalogAreaWrap}>
              {/* Thanh tìm kiếm & lọc thể loại */}
              <div className={styles.searchAndFiltersBar}>
                <div className={styles.searchBox}>
                  <Search size={14} className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm món ăn theo tên hoặc nguyên liệu..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                  />
                  {searchKeyword && (
                    <button
                      type="button"
                      className={styles.clearSearchBtn}
                      onClick={() => setSearchKeyword("")}
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                <div className={styles.categoryPillsList}>
                  {DISH_CATEGORIES.map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      className={`${styles.catPill} ${
                        selectedCategory === cat.key ? styles.activeCatPill : ""
                      }`}
                      onClick={() => setSelectedCategory(cat.key)}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Danh sách món ăn từ Kho */}
              <div className={styles.catalogListScroll}>
                {filteredCatalog.length === 0 ? (
                  <div className={styles.emptyCatalog}>
                    <AlertCircle size={22} />
                    <p>Không tìm thấy món ăn nào phù hợp với từ khóa.</p>
                  </div>
                ) : (
                  filteredCatalog.map((dish) => {
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
                            <h4 className={styles.dishCardTitle}>{dish.name}</h4>
                            {dish.categoryLabel && (
                              <span className={styles.cardCatBadge}>
                                {dish.categoryLabel}
                              </span>
                            )}
                          </div>
                          {dish.mainIngredient && (
                            <p className="text-[11.5px] text-slate-500 mt-0.5">
                              Nguyên liệu chính: {dish.mainIngredient}
                            </p>
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
                              <Check size={13} />
                              <span>Đã chọn</span>
                            </>
                          ) : (
                            <>
                              <Plus size={13} />
                              <span>Thêm món</span>
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
            >
              <Check size={15} />
              <span>Xác nhận &amp; Cập nhật vào ngày này</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          MODAL CON: CHỌN MÓN RIÊNG THAY THẾ CHO HỌC SINH DỊ ỨNG
          ======================================================== */}
      {substituteModal.isOpen && (
        <div
          className={styles.subModalOverlay}
          onClick={() =>
            setSubstituteModal({
              isOpen: false,
              dish: null,
              conflict: null,
              mealType: "LUNCH",
            })
          }
        >
          <div
            className={styles.subModalContainer}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.subModalHeader}>
              <div className={styles.subModalTitleWrap}>
                <ShieldCheck size={18} className="text-emerald-700" />
                <h3 className={styles.subModalTitle}>
                  Chọn món riêng cho học sinh dị ứng
                </h3>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() =>
                  setSubstituteModal({
                    isOpen: false,
                    dish: null,
                    conflict: null,
                    mealType: "LUNCH",
                  })
                }
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.subModalNotice}>
              Học sinh dị ứng{" "}
              <strong>{substituteModal.conflict?.ingredientName}</strong> sẽ được
              phục vụ món riêng này. Món{" "}
              <strong>&ldquo;{substituteModal.dish?.name}&rdquo;</strong> vẫn được
              giữ nguyên trong thực đơn cho các học sinh không bị dị ứng.
            </div>

            <div className={styles.subModalSearchWrap}>
              <div className={styles.subSearchBox}>
                <Search size={14} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm món thay thế an toàn..."
                  value={subSearchKeyword}
                  onChange={(e) => setSubSearchKeyword(e.target.value)}
                  autoFocus
                />
                {subSearchKeyword && (
                  <button
                    type="button"
                    onClick={() => setSubSearchKeyword("")}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            <div className={styles.subCatalogList}>
              {filteredSubstituteCatalog.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  Không tìm thấy món ăn nào phù hợp và an toàn với nguyên liệu này.
                </div>
              ) : (
                filteredSubstituteCatalog.map((dish) => (
                  <div key={dish.id} className={styles.subCatalogCard}>
                    <div className={styles.subCatalogCardLeft}>
                      <span className={styles.subCatalogDishName}>
                        {dish.name}
                      </span>
                      <span className={styles.subCatalogDishMeta}>
                        {dish.categoryLabel || "Món ăn"} • NL:{" "}
                        {dish.mainIngredient || "Đạt chuẩn"}
                      </span>
                    </div>
                    <button
                      type="button"
                      className={styles.btnPickSub}
                      onClick={() => handleSelectSubstitute(dish)}
                    >
                      <Plus size={13} />
                      <span>Chọn món riêng</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className={styles.subModalFooter}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() =>
                  setSubstituteModal({
                    isOpen: false,
                    dish: null,
                    conflict: null,
                    mealType: "LUNCH",
                  })
                }
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
