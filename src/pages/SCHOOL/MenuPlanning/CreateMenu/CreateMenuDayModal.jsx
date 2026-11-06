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
  RotateCcw,
} from "lucide-react"
import styles from "./CreateMenuDayModal.module.scss"
import {
  getStoredDishCatalog,
  DISH_CATEGORIES,
} from "../dishCatalogData"
import {
  WAREHOUSE_SEASONINGS_CATALOG,
  INITIAL_SEASONINGS,
} from "../mockMenuData"

export default function CreateMenuDayModal({
  isOpen,
  onClose,
  dayData,
  dayMenu,
  initialMealType = "LUNCH",
  initialTab = "DISHES",
  onSaveDay,
}) {
  // Tabs: "DISHES" (Chọn món ăn từ Kho) hoặc "SEASONINGS" (Nhập gia vị kho)
  const [activeTab, setActiveTab] = useState(initialTab)
  const [selectedMealType, setSelectedMealType] = useState(
    initialMealType === "AFTERNOON" ? "AFTERNOON" : "LUNCH"
  )

  // Local state món ăn & gia vị của ngày đang chỉnh sửa
  const [lunchDishes, setLunchDishes] = useState([])
  const [afternoonDishes, setAfternoonDishes] = useState([])
  const [seasonings, setSeasonings] = useState([])

  // Search & filter món ăn
  const [searchKeyword, setSearchKeyword] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("ALL")
  const [dishCatalog, setDishCatalog] = useState([])

  // Đồng bộ dữ liệu khi modal mở ra
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || "DISHES")
      setSelectedMealType(
        initialMealType === "AFTERNOON" ? "AFTERNOON" : "LUNCH"
      )
      setLunchDishes(Array.isArray(dayMenu?.LUNCH) ? [...dayMenu.LUNCH] : [])
      setAfternoonDishes(
        Array.isArray(dayMenu?.AFTERNOON) ? [...dayMenu.AFTERNOON] : []
      )

      // Khởi tạo gia vị theo suất
      if (Array.isArray(dayMenu?.seasonings) && dayMenu.seasonings.length > 0) {
        setSeasonings(dayMenu.seasonings.map((s) => ({ ...s })))
      } else {
        setSeasonings(INITIAL_SEASONINGS.map((s) => ({ ...s })))
      }

      setDishCatalog(getStoredDishCatalog())
      setSearchKeyword("")
      setSelectedCategory("ALL")
    }
  }, [isOpen, dayMenu, initialMealType, initialTab])

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
  const currentMealDishes = selectedMealType === "LUNCH" ? lunchDishes : afternoonDishes
  const selectedDishIds = useMemo(() => {
    return new Set(currentMealDishes.map((d) => d.dishId || d.id || d.name))
  }, [currentMealDishes])

  // Thao tác thêm/bỏ món vào ca ăn
  const handleToggleDish = useCallback((dish) => {
    const isLunch = selectedMealType === "LUNCH"
    const targetSetter = isLunch ? setLunchDishes : setAfternoonDishes

    targetSetter((prev) => {
      const exists = prev.some((d) => (d.dishId || d.id || d.name) === dish.id)
      if (exists) {
        return prev.filter((d) => (d.dishId || d.id || d.name) !== dish.id)
      } else {
        const newDish = {
          id: `dish-picked-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
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
        }
        return [...prev, newDish]
      }
    })
  }, [selectedMealType])

  // Xóa món trực tiếp từ cột Preview
  const handleRemoveDishFromPreview = useCallback((mealType, dishId) => {
    if (mealType === "LUNCH") {
      setLunchDishes((prev) => prev.filter((d) => d.id !== dishId))
    } else {
      setAfternoonDishes((prev) => prev.filter((d) => d.id !== dishId))
    }
  }, [])

  // Thao tác Gia vị (Seasonings) - Hoàn toàn theo suất
  const handleAddSeasoningRow = () => {
    const defaultItem = WAREHOUSE_SEASONINGS_CATALOG[0]
    const newSeas = {
      id: `seas-new-${Date.now()}`,
      catalogId: defaultItem.id,
      name: defaultItem.name,
      portionQty: 2,
      unit: defaultItem.defaultUnit || "g",
    }
    setSeasonings((prev) => [...prev, newSeas])
  }

  const handleUpdateSeasoningCatalog = (seasId, newCatalogId) => {
    const item = WAREHOUSE_SEASONINGS_CATALOG.find((w) => w.id === newCatalogId)
    if (!item) return
    setSeasonings((prev) =>
      prev.map((s) => {
        if (s.id !== seasId) return s
        const unit = item.defaultUnit || "g"
        return {
          ...s,
          catalogId: item.id,
          name: item.name,
          unit,
        }
      })
    )
  }

  const handleUpdatePortionQty = (seasId, rawValue) => {
    setSeasonings((prev) =>
      prev.map((s) => {
        if (s.id !== seasId) return s
        return {
          ...s,
          portionQty: rawValue,
        }
      })
    )
  }

  const handleRemoveSeasoning = (seasId) => {
    setSeasonings((prev) => prev.filter((s) => s.id !== seasId))
  }

  const handleResetDefaultSeasonings = () => {
    setSeasonings(INITIAL_SEASONINGS.map((s) => ({ ...s })))
  }

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

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.modalContainer}>
        {/* Modal Header: Tinh gọn, không chữ thừa */}
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
              CỘT TRÁI (50%): TỔNG QUÁT HÔM ĐÓ - KHÔNG CẦN CUỘN
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
                <div className={`${styles.mealBanner} ${styles.lunchBanner}`}>
                  <div className={styles.bannerLeft}>
                    <Utensils size={13} className={styles.lunchBannerIcon} />
                    <span className={styles.bannerText}>BỮA TRƯA</span>
                  </div>
                  <span className={styles.dishesCountBadge}>
                    {lunchDishes.length} món
                  </span>
                </div>

                <div className={styles.previewDishesList}>
                  {lunchDishes.length === 0 ? (
                    <div className={styles.emptyNotice}>
                      <span>Chưa có món trưa. Chọn món từ kho bên phải để thêm.</span>
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
                          <span className={styles.portionBadge}>
                            {dish.portionQty} {dish.unit || "g"}
                          </span>
                          <button
                            type="button"
                            className={styles.removeIconBtn}
                            onClick={() => handleRemoveDishFromPreview("LUNCH", dish.id)}
                            title={`Xóa ${dish.name} khỏi bữa trưa`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* KHỐI 2: BỮA XẾ */}
              <div className={styles.previewMealCard}>
                <div className={`${styles.mealBanner} ${styles.afternoonBanner}`}>
                  <div className={styles.bannerLeft}>
                    <Coffee size={13} className={styles.afternoonBannerIcon} />
                    <span className={styles.bannerText}>BỮA XẾ</span>
                  </div>
                  <span className={styles.dishesCountBadge}>
                    {afternoonDishes.length} món
                  </span>
                </div>

                <div className={styles.previewDishesList}>
                  {afternoonDishes.length === 0 ? (
                    <div className={styles.emptyNotice}>
                      <span>Chưa có món xế. Chọn ca Bữa xế bên phải để thêm.</span>
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
                          <span className={styles.portionBadge}>
                            {dish.portionQty} {dish.unit || "g"}
                          </span>
                          <button
                            type="button"
                            className={styles.removeIconBtn}
                            onClick={() => handleRemoveDishFromPreview("AFTERNOON", dish.id)}
                            title={`Xóa ${dish.name} khỏi bữa xế`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* KHỐI 3: GIA VỊ KHO DÙNG CHUNG (THEO SUẤT) */}
              <div className={styles.previewSeasoningCard}>
                <div className={styles.seasoningBanner}>
                  <div className={styles.bannerLeft}>
                    <Sparkles size={13} className={styles.seasoningBannerIcon} />
                    <span className={styles.bannerText}>GIA VỊ KHO (THEO SUẤT)</span>
                  </div>
                  <span className={styles.seasoningCountBadge}>
                    {seasonings.length} loại
                  </span>
                </div>

                <div className={styles.previewSeasoningsList}>
                  {seasonings.length === 0 ? (
                    <div className={styles.emptyNotice}>
                      <span>Chưa có gia vị. Chuyển sang tab “Gia vị dùng chung” bên phải để khai báo.</span>
                    </div>
                  ) : (
                    <table className={styles.miniSeasoningTable}>
                      <thead>
                        <tr>
                          <th>Gia vị kho</th>
                          <th className={styles.alignRight}>Định lượng theo suất</th>
                          <th style={{ width: "24px" }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {seasonings.map((s) => (
                          <tr key={s.id}>
                            <td className={styles.seasoningNameCell}>
                              <span className={styles.seasoningDot} />
                              <span>{s.name.replace(/\(.*?\)/g, "").trim()}</span>
                            </td>
                            <td className={`${styles.seasoningPortionCell} ${styles.alignRight}`}>
                              <strong>{s.portionQty}</strong> {s.unit || "g"}/suất
                            </td>
                            <td className={styles.actionCell}>
                              <button
                                type="button"
                                className={styles.removeIconBtn}
                                onClick={() => handleRemoveSeasoning(s.id)}
                                title={`Xóa gia vị ${s.name}`}
                              >
                                <Trash2 size={12} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              CỘT PHẢI (50%): CHỌN MÓN TỪ KHO & NHẬP GIA VỊ
              ======================================================== */}
          <div className={styles.inputColumn}>
            {/* Top Switcher Tabs */}
            <div className={styles.tabBar}>
              <button
                type="button"
                className={`${styles.tabBtn} ${
                  activeTab === "DISHES" ? styles.activeTabBtn : ""
                }`}
                onClick={() => setActiveTab("DISHES")}
              >
                <Utensils size={14} />
                <span>Chọn món từ Kho món ăn</span>
                <span className={styles.tabBadge}>
                  {currentMealDishes.length}
                </span>
              </button>

              <button
                type="button"
                className={`${styles.tabBtn} ${
                  activeTab === "SEASONINGS" ? styles.activeTabBtn : ""
                }`}
                onClick={() => setActiveTab("SEASONINGS")}
              >
                <Sparkles size={14} />
                <span>Gia vị dùng chung (theo suất)</span>
                <span className={styles.tabBadge}>
                  {seasonings.length}
                </span>
              </button>
            </div>

            {/* TAB 1: CHỌN MÓN TỪ KHO */}
            {activeTab === "DISHES" && (
              <div className={styles.tabContentPane}>
                {/* Thanh chọn Ca ăn muốn thêm món */}
                <div className={styles.mealTargetSelector}>
                  <span className={styles.selectorLabel}>Thêm món cho:</span>
                  <div className={styles.mealPillGroup}>
                    <button
                      type="button"
                      className={`${styles.targetMealPill} ${
                        selectedMealType === "LUNCH" ? styles.activeLunchPill : ""
                      }`}
                      onClick={() => setSelectedMealType("LUNCH")}
                    >
                      <Utensils size={13} />
                      <span>Bữa trưa ({lunchDishes.length} món)</span>
                    </button>
                    <button
                      type="button"
                      className={`${styles.targetMealPill} ${
                        selectedMealType === "AFTERNOON" ? styles.activeAfternoonPill : ""
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

                            <div className={styles.cardMetaRow}>
                              <span className={styles.metaItem}>
                                Định lượng: <strong>{dish.portionQty} {dish.unit || "g"}</strong>
                              </span>
                              <span className={styles.metaDivider}>•</span>
                              <span className={styles.metaSupplier}>
                                <Truck size={11} />
                                <span>{dish.supplierName}</span>
                              </span>
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
            )}

            {/* TAB 2: GIA VỊ DÙNG CHUNG (THEO SUẤT) */}
            {activeTab === "SEASONINGS" && (
              <div className={styles.tabContentPane}>
                {/* Bảng nhập gia vị hoàn toàn theo suất */}
                <div className={styles.seasoningsEditorTableWrap}>
                  <table className={styles.seasoningsEditorTable}>
                    <thead>
                      <tr>
                        <th style={{ width: "55%" }}>Gia vị từ kho trường</th>
                        <th style={{ width: "35%" }}>Định lượng theo suất</th>
                        <th style={{ width: "10%" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {seasonings.map((s) => (
                        <tr key={s.id}>
                          {/* Chọn gia vị từ kho */}
                          <td>
                            <select
                              className={styles.tableSelect}
                              value={s.catalogId}
                              onChange={(e) =>
                                handleUpdateSeasoningCatalog(s.id, e.target.value)
                              }
                            >
                              {WAREHOUSE_SEASONINGS_CATALOG.map((w) => (
                                <option key={w.id} value={w.id}>
                                  {w.name}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Định lượng theo suất */}
                          <td>
                            <div className={styles.inputWithUnit}>
                              <input
                                type="number"
                                min="0"
                                step="0.5"
                                className={styles.tableNumberInput}
                                value={s.portionQty}
                                onChange={(e) =>
                                  handleUpdatePortionQty(s.id, e.target.value)
                                }
                              />
                              <span className={styles.unitAddon}>{s.unit}/suất</span>
                            </div>
                          </td>

                          {/* Xóa dòng */}
                          <td className={styles.alignCenter}>
                            <button
                              type="button"
                              className={styles.removeIconBtn}
                              onClick={() => handleRemoveSeasoning(s.id)}
                              title="Xóa gia vị này"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Các nút hành động cho gia vị */}
                <div className={styles.seasoningActionsBar}>
                  <button
                    type="button"
                    className={styles.addSeasoningRowBtn}
                    onClick={handleAddSeasoningRow}
                  >
                    <Plus size={13} />
                    <span>+ Thêm gia vị từ kho</span>
                  </button>

                  <button
                    type="button"
                    className={styles.resetSeasoningBtn}
                    onClick={handleResetDefaultSeasonings}
                    title="Đặt lại 4 gia vị chuẩn: Dầu ăn, Nước mắm, Muối, Đường"
                  >
                    <RotateCcw size={12} />
                    <span>Nạp gia vị mặc định</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className={styles.modalFooter}>
          <div className={styles.footerInfo}>
            <span>
              {dayData?.dayLabel} ({dayData?.dateVN})
            </span>
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
