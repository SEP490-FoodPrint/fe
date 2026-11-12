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
  Truck,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import styles from "./CreateMenuDayModal.module.scss"
import {
  getStoredDishCatalog,
  DISH_CATEGORIES,
} from "../dishCatalogData"
import {
  WAREHOUSE_SEASONINGS_CATALOG,
} from "../mockMenuData"

// Gia vị mặc định tiêu chuẩn theo nhóm món ăn cho các món chưa có gia vị riêng
const CATEGORY_DEFAULT_SEASONINGS = {
  RICE_STARCH: [
    { name: "Dầu thực vật Meizan", portionQty: 0.5, unit: "ml" },
    { name: "Muối tinh sấy I-ốt", portionQty: 0.2, unit: "g" },
  ],
  MAIN_DISH: [
    { name: "Nước mắm cá cơm Nam Ngư", portionQty: 2.5, unit: "ml" },
    { name: "Dầu thực vật Meizan", portionQty: 3, unit: "ml" },
    { name: "Hạt nêm Knorr thịt thăn", portionQty: 1, unit: "g" },
    { name: "Đường kính trắng Biên Hòa", portionQty: 0.5, unit: "g" },
  ],
  VEGETABLE: [
    { name: "Dầu thực vật Meizan", portionQty: 2.5, unit: "ml" },
    { name: "Hạt nêm Knorr thịt thăn", portionQty: 1, unit: "g" },
    { name: "Muối tinh sấy I-ốt", portionQty: 0.3, unit: "g" },
  ],
  SOUP: [
    { name: "Nước mắm cá cơm Nam Ngư", portionQty: 1.5, unit: "ml" },
    { name: "Muối tinh sấy I-ốt", portionQty: 0.5, unit: "g" },
    { name: "Hạt nêm Knorr thịt thăn", portionQty: 0.8, unit: "g" },
  ],
  DESSERT: [],
}

/**
 * Tự động tính tổng gia vị dùng chung cho thực đơn ngày
 * dựa trên tất cả các món ăn ở Bữa trưa và Bữa xế
 */
function calculateAutoSeasonings(lunchDishes, afternoonDishes, catalogList) {
  const totals = {}

  const addDishSeasonings = (dish) => {
    // Tìm thông tin chi tiết của món trong kho master
    const catalogItem =
      catalogList.find((c) => c.id === (dish.dishId || dish.id)) || dish

    let dishSeasonings = catalogItem.seasonings
    if (!Array.isArray(dishSeasonings) || dishSeasonings.length === 0) {
      // Fallback sang gia vị chuẩn theo nhóm món
      dishSeasonings =
        CATEGORY_DEFAULT_SEASONINGS[catalogItem.category] ||
        CATEGORY_DEFAULT_SEASONINGS.MAIN_DISH
    }

    dishSeasonings.forEach((seas) => {
      if (!seas || !seas.name) return
      const key = seas.name.trim().toLowerCase()
      const qty = Number(seas.portionQty) || 0
      const unit = seas.unit || "g"

      if (!totals[key]) {
        // Tìm catalogId nếu có trong WAREHOUSE_SEASONINGS_CATALOG
        const matchedWarehouse = WAREHOUSE_SEASONINGS_CATALOG.find(
          (w) => w.name.toLowerCase() === seas.name.toLowerCase()
        )
        totals[key] = {
          id: matchedWarehouse?.id || seas.id || `seas-auto-${key}`,
          catalogId: matchedWarehouse?.id || seas.id,
          name: seas.name,
          portionQty: qty,
          unit: unit,
        }
      } else {
        totals[key].portionQty = Number(
          (totals[key].portionQty + qty).toFixed(1)
        )
      }
    })
  }

  lunchDishes.forEach(addDishSeasonings)
  afternoonDishes.forEach(addDishSeasonings)

  return Object.values(totals)
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
  const [seasonings, setSeasonings] = useState([])

  // Search & filter món ăn
  const [searchKeyword, setSearchKeyword] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("ALL")
  const [dishCatalog, setDishCatalog] = useState([])

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

      const catalog = getStoredDishCatalog()
      setDishCatalog(catalog)
      setSearchKeyword("")
      setSelectedCategory("ALL")

      // Tự động tính tổng gia vị theo các món ban đầu
      const autoSeas = calculateAutoSeasonings(
        initialLunch,
        initialAfternoon,
        catalog
      )
      setSeasonings(autoSeas)
    }
  }, [isOpen, dayMenu, initialMealType])

  // Khi danh sách món trưa hoặc xế thay đổi, TỰ ĐỘNG CẬP NHẬT GIA VỊ
  useEffect(() => {
    if (!isOpen) return
    const autoSeas = calculateAutoSeasonings(
      lunchDishes,
      afternoonDishes,
      dishCatalog
    )
    setSeasonings(autoSeas)
  }, [lunchDishes, afternoonDishes, dishCatalog, isOpen])

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

      targetSetter((prev) => {
        const exists = prev.some(
          (d) => (d.dishId || d.id || d.name) === dish.id
        )
        if (exists) {
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
            portionQty: dish.portionQty || 50,
            unit: dish.unit === "ml" ? "ml" : "g",
            mainIngredient: dish.mainIngredient || dish.name,
            supplierName: dish.supplierName || "CP Foods Việt Nam",
            supplierBadge: dish.supplierBadge || "VietGAP",
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
    if (mealType === "LUNCH") {
      setLunchDishes((prev) => prev.filter((d) => d.id !== dishId))
    } else {
      setAfternoonDishes((prev) => prev.filter((d) => d.id !== dishId))
    }
  }, [])

  // Lưu và cập nhật về ngày
  const handleSaveAndClose = () => {
    onSaveDay &&
      onSaveDay({
        dateISO: dayData?.dateISO,
        LUNCH: lunchDishes,
        AFTERNOON: afternoonDishes,
        seasonings: seasonings,
      })
    onClose()
  }

  if (!isOpen) return null

  const totalDishesCount = lunchDishes.length + afternoonDishes.length

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
              CỘT TRÁI (50%): TỔNG QUÁT HÔM ĐÓ (CÓ THỂ SỔ LÊN / SỔ XUỐNG)
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
              {/* KHỐI 1: BỮA TRƯA - SỔ LÊN / SỔ XUỐNG */}
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
                      lunchDishes.map((dish) => (
                        <div key={dish.id} className={styles.previewDishItem}>
                          <div className={styles.dishInfoLeft}>
                            <span className={styles.dishBulletLunch} />
                            <span className={styles.dishName} title={dish.name}>
                              {dish.name}
                            </span>
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
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* KHỐI 2: BỮA XẾ - SỔ LÊN / SỔ XUỐNG */}
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
                      afternoonDishes.map((dish) => (
                        <div key={dish.id} className={styles.previewDishItem}>
                          <div className={styles.dishInfoLeft}>
                            <span className={styles.dishBulletAfternoon} />
                            <span className={styles.dishName} title={dish.name}>
                              {dish.name}
                            </span>
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
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* KHỐI 3: GIA VỊ - TỰ ĐỘNG TÍNH TỪ MÓN ĂN - SỔ LÊN / SỔ XUỐNG */}
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
                                <strong>{s.portionQty}</strong> {s.unit || "g"}
                                /suất
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
              CỘT PHẢI (50%): CHỌN MÓN TỪ DANH SÁCH MÓN ĂN
              (Đã bỏ form chọn gia vị thủ công)
              ======================================================== */}
          <div className={styles.inputColumn}>
            <div className={styles.inputColumnHeader}>
              <h3 className={styles.inputColumnTitle}>
                <Utensils size={15} />
                <span>Chọn món từ Danh mục món ăn</span>
              </h3>
            </div>

            <div className={styles.tabContentPane}>
              {/* Thanh chọn Ca ăn muốn thêm món */}
              <div className={styles.mealTargetSelector}>
                <span className={styles.selectorLabel}>Đang thêm món cho:</span>
                <div className={styles.mealPillGroup}>
                  <button
                    type="button"
                    className={`${styles.targetMealPill} ${
                      selectedMealType === "LUNCH"
                        ? styles.activeLunchPill
                        : ""
                    }`}
                    onClick={() => setSelectedMealType("LUNCH")}
                  >
                    <Utensils size={13} />
                    <span>Bữa trưa ({lunchDishes.length} món)</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.targetMealPill} ${
                      selectedMealType === "AFTERNOON"
                        ? styles.activeAfternoonPill
                        : ""
                    }`}
                    onClick={() => setSelectedMealType("AFTERNOON")}
                  >
                    <Coffee size={13} />
                    <span>Bữa xế ({afternoonDishes.length} món)</span>
                  </button>
                </div>
              </div>

              {/* Search & Filter pills */}
              <div className={styles.searchAndFilter}>
                <div className={styles.searchBox}>
                  <Search size={14} className={styles.searchIcon} />
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Tìm kiếm theo tên món, nguyên liệu, nhà cung cấp..."
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
    </div>
  )
}
