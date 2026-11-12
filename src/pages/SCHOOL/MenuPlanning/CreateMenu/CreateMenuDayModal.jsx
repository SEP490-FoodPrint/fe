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
import { loadDishCatalog, loadRecipeOptions, previewMealRecipe } from "src/services/DishService"
import MenuService from "src/services/MenuService"
const DISH_CATEGORIES = [{key:"ALL",label:"Tất cả món"}]
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
  const [seasoningsByMeal, setSeasoningsByMeal] = useState({LUNCH: [], AFTERNOON: []})
  const [recipeError, setRecipeError] = useState("")
  const [recipeLoading, setRecipeLoading] = useState(false)
  const [allergiesByMeal, setAllergiesByMeal] = useState({LUNCH: null, AFTERNOON: null})
  const [edited, setEdited] = useState(false)
  const [portionGroupsByMeal, setPortionGroupsByMeal] = useState({})
  const [recipeOptions, setRecipeOptions] = useState([])
  const seasonings = seasoningsByMeal[selectedMealType] || []

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

      setEdited(false)
      setPortionGroupsByMeal(dayMenu?.portionGroupsByMeal || {})
      setRecipeError("")
      setAllergiesByMeal({LUNCH: null, AFTERNOON: null})
      setSeasoningsByMeal(dayMenu?.seasoningsByMeal || {LUNCH: dayMenu?.seasonings || [], AFTERNOON: []})
      setSearchKeyword("")
      setSelectedCategory("ALL")
    }
  }, [isOpen, dayMenu, initialMealType])

  useEffect(() => {
    if (!isOpen) return
    let active = true
    setRecipeLoading(true)
    Promise.all([loadDishCatalog(), loadRecipeOptions()]).then(([rows, options]) => {
      if(active) { setDishCatalog(rows); setRecipeOptions(options) }
    }).catch(e => {if(active) setRecipeError(e.message)}).finally(()=>{if(active) setRecipeLoading(false)})
    return () => {active = false}
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || !edited) return
    let active = true
    setRecipeLoading(true)
    setRecipeError("")
    Promise.all([previewMealRecipe(lunchDishes.map(d=>d.dishId||d.id)), previewMealRecipe(afternoonDishes.map(d=>d.dishId||d.id))]).then(async ([lunch, afternoon]) => {
      const [lunchAllergies, afternoonAllergies] = await Promise.all([
        MenuService.checkAllergies(lunch.ingredientIds || []),
        MenuService.checkAllergies(afternoon.ingredientIds || []),
      ])
      if(active) {
        setAllergiesByMeal({LUNCH: lunchAllergies.data, AFTERNOON: afternoonAllergies.data})
        setSeasoningsByMeal({LUNCH: lunch.seasonings.map(s=>({...s,id:s.ingredientEntryId,portionQty:s.quantityPerPortion})), AFTERNOON: afternoon.seasonings.map(s=>({...s,id:s.ingredientEntryId,portionQty:s.quantityPerPortion}))})
      }
    }).catch(e=>{if(active) setRecipeError(e.message)}).finally(()=>{if(active) setRecipeLoading(false)})
    return ()=>{active=false}
  }, [isOpen, edited, lunchDishes, afternoonDishes])

  useEffect(() => {
    const ids = {LUNCH: new Set(lunchDishes.map(d=>d.dishId||d.id)), AFTERNOON: new Set(afternoonDishes.map(d=>d.dishId||d.id))}
    setPortionGroupsByMeal(prev => Object.fromEntries(Object.entries(prev).map(([meal, groups]) => [meal, groups.map(g=>({...g,dishIds:g.dishIds.filter(id=>ids[meal].has(id))}))])))
  }, [lunchDishes, afternoonDishes])

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

      setEdited(true)
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
        seasonings: seasoningsByMeal.LUNCH,
        seasoningsByMeal,
        useDishRecipes: edited,
        portionGroupsByMeal,
      })
    onClose()
  }

  if (!isOpen) return null

  const totalDishesCount = lunchDishes.length + afternoonDishes.length

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.modalContainer}>
        {recipeError && <p role="alert">{recipeError}</p>}
        {recipeLoading && <p role="status">Đang tải công thức…</p>}
        {!recipeLoading && !recipeError && <div role="status">
          {!allergiesByMeal[selectedMealType] ? <p>Chọn món để đối chiếu hồ sơ dị ứng của các lớp.</p>
            : allergiesByMeal[selectedMealType].conflicts.length === 0 ? <p>Chưa ghi nhận xung đột với hồ sơ dị ứng đã khai báo.</p>
            : <div><strong>Có nguyên liệu cần xử lý dị ứng:</strong><ul>{allergiesByMeal[selectedMealType].conflicts.map(c => <li key={c.ingredientId}>{c.ingredientName} — {c.affectedClasses.map(group => `${group.className}: ${group.count}`).join(", ")}</li>)}</ul><p>Nhân viên dinh dưỡng cần chọn phương án suất riêng phù hợp trước khi gửi duyệt.</p></div>}
        </div>}
        <fieldset disabled={recipeLoading} style={{padding: 12, margin: 12}}>
          <legend>Suất ăn riêng — {selectedMealType === "LUNCH" ? "Bữa trưa" : "Bữa xế"}</legend>
          <p>Chọn cả món thường và món thay thế ở danh sách món, sau đó phân món vào từng nhóm. Gia vị dùng chung cho bữa phải an toàn cho tất cả nhóm.</p>
          <button type="button" onClick={() => {
            setEdited(true)
            setPortionGroupsByMeal(prev => ({...prev, [selectedMealType]: [
              ...(prev[selectedMealType] || [{name:"Suất thường", isDefault:true, dishIds:currentMealDishes.map(d=>d.dishId||d.id), avoidedIngredientEntryIds:[]}]),
              {name:`Suất riêng ${(prev[selectedMealType]?.length || 1)}`, isDefault:false, dishIds:[], avoidedIngredientEntryIds:[]},
            ]}))
          }}>Thêm nhóm suất riêng / món thay thế</button>
          {(portionGroupsByMeal[selectedMealType] || []).map((group, index) => {
            const change = fields => { setEdited(true); setPortionGroupsByMeal(prev => ({...prev, [selectedMealType]: prev[selectedMealType].map((g,i)=>i===index?{...g,...fields}:g)})) }
            return <fieldset key={group.id || index} style={{marginTop: 10}}><legend>{group.isDefault ? "Suất thường" : "Suất riêng"}</legend>
              <label>Tên nhóm <input required value={group.name} maxLength={120} onChange={e=>change({name:e.target.value})}/></label>
              <p>Món dành cho nhóm:</p>
              {currentMealDishes.map(d=>{ const id=d.dishId||d.id; return <label key={id} style={{display:"block"}}><input type="checkbox" checked={group.dishIds.includes(id)} onChange={e=>change({dishIds:e.target.checked?[...group.dishIds,id]:group.dishIds.filter(v=>v!==id)})}/>{d.name}</label> })}
              {!group.isDefault && <><p>Nguyên liệu cần tránh:</p>{recipeOptions.map(o=><label key={o.id} style={{display:"inline-block",marginRight:12}}><input type="checkbox" checked={group.avoidedIngredientEntryIds.includes(o.id)} onChange={e=>change({avoidedIngredientEntryIds:e.target.checked?[...group.avoidedIngredientEntryIds,o.id]:group.avoidedIngredientEntryIds.filter(v=>v!==o.id)})}/>{o.name}</label>)}
                <button type="button" onClick={()=>{setEdited(true);setPortionGroupsByMeal(prev=>({...prev,[selectedMealType]:prev[selectedMealType].filter((_,i)=>i!==index)}))}}>Bỏ nhóm riêng</button></>}
            </fieldset>
          })}
        </fieldset>
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
              disabled={recipeLoading || !!recipeError}
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
