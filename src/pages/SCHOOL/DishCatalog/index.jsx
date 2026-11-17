import InlineError from "src/components/InlineError"
import { formatSmallQuantity, smallQuantity } from "src/utils/quantity"
import React, { useState, useMemo, useCallback, useEffect } from "react"
import {
  Pencil,
  Trash2,
  Plus,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  Utensils,
} from "lucide-react"
import { loadDishCatalog, loadDishCatalogData, loadRecipeOptions, saveDishRecipe, deleteDishRecipe, dishCategoryKey, groupDishesByCategory, DISH_MEAL_TYPES, dishMealTypeLabel } from "src/services/DishService"
import IngredientPickerModal from "src/pages/SCHOOL/MenuPlanning/component/IngredientPickerModal"
import DishCategoryModal from "./component/DishCategoryModal"
import GradeRecipeFields, { sharedGradeRecipes, validRecipeLines } from "./component/GradeRecipeFields"
import MenuService from "src/services/MenuService"
import styles from "./index.module.scss"

/* ─── Helpers ────────────────────────────────────── */
const CAT_STYLE = {
  RICE_STARCH: styles.catRice,
  MAIN_DISH: styles.catMain,
  VEGETABLE: styles.catVeg,
  SOUP: styles.catSoup,
  DESSERT: styles.catDessert,
}

const getCategoryBadgeClass = (categoryLabel, categoryKey) => {
  if (categoryKey && CAT_STYLE[categoryKey]) return CAT_STYLE[categoryKey]
  if (!categoryLabel) return styles.catDefault
  const l = categoryLabel.toLowerCase()
  if (l.includes("mặn")) return styles.catMain
  if (l.includes("xào")) return styles.catStir
  if (l.includes("rau")) return styles.catVeg
  if (l.includes("canh")) return styles.catSoup
  if (l.includes("súp")) return styles.catBroth
  if (l.includes("cơm")) return styles.catRice
  if (l.includes("cháo")) return styles.catPorridge
  if (l.includes("bún") || l.includes("phở") || l.includes("mì") || l.includes("miến")) return styles.catNoodle
  if (l.includes("nui")) return styles.catPasta
  if (l.includes("bánh mì")) return styles.catBread
  if (l.includes("bánh bao") || l.includes("bánh hấp")) return styles.catBao
  if (l.includes("bánh ngọt")) return styles.catSweet
  if (l.includes("bánh mặn") || l.includes("bánh")) return styles.catPastry
  if (l.includes("sữa chua") || l.includes("chế phẩm")) return styles.catYogurt
  if (l.includes("sữa")) return styles.catMilk
  if (l.includes("trái cây") || l.includes("hoa quả")) return styles.catFruit
  if (l.includes("tráng miệng")) return styles.catDessert
  if (l.includes("đồ uống") || l.includes("nước")) return styles.catDrink
  if (l.includes("phụ")) return styles.catSide
  return styles.catDefault
}

const EMPTY_FORM = {
  name: "",
  category: "",
  mealType: "",
}

export function toSmallestUnit(quantity, unit) {
  if (quantity == null || quantity === "") return { quantity: "", unit: unit || "g" }
  const u = (unit || "g").trim().toLowerCase()
  const val = Number(quantity)
  if (isNaN(val)) return { quantity, unit: unit || "g" }
  if (u === "kg") {
    return {
      quantity: Number((val * 1000).toFixed(3)).toString(),
      unit: "g",
    }
  }
  if (u === "l" || u === "lít" || u === "lit") {
    return {
      quantity: Number((val * 1000).toFixed(3)).toString(),
      unit: "ml",
    }
  }
  return { quantity, unit: unit || "g" }
}

const PAGE_SIZE = 8

export default function DishCatalogPage() {
  const [catalog, setCatalog] = useState([])
  const [categoryOptions, setCategoryOptions] = useState([])
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const DISH_CATEGORIES = useMemo(() => [{ key: "ALL", label: "Tất cả nhóm món" }, ...categoryOptions], [categoryOptions])
  const [recipeOptions, setRecipeOptions] = useState([])
  const [grades, setGrades] = useState([])
  const [gradeError, setGradeError] = useState("")
  const [gradeProfiles, setGradeProfiles] = useState([])
  const [detailGradeId, setDetailGradeId] = useState("")
  useEffect(() => {
    let active = true
    MenuService.getContext().then(context => { if (active) { if (!Array.isArray(context.grades)) throw new Error("Không tải được danh sách khối."); setGrades(context.grades) } }).catch(error => { if (active) setGradeError(error.message) })
    return () => { active = false }
  }, [])
  const [catalogError, setCatalogError] = useState("")
  const [catalogLoadError, setCatalogLoadError] = useState("")
  const [recipeOptionsError, setRecipeOptionsError] = useState("")
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [unclassifiedLines, setUnclassifiedLines] = useState([])
  const providedIngredients = useMemo(() => recipeOptions.filter(o=>o.mainAllowed).map(o=>({...o,id:o.ingredientId,ingredientEntryId:o.id})), [recipeOptions])
  const linkedSuppliers = useMemo(() => [...new Map(recipeOptions.filter(o=>o.mainAllowed).map(o=>[o.supplierId,{id:o.supplierId,name:o.supplierName}])).values()], [recipeOptions])
  const CATALOG_SUPPLIERS = linkedSuppliers
  const WAREHOUSE_SEASONINGS_CATALOG = useMemo(() => recipeOptions.filter(o=>o.seasoningAllowed), [recipeOptions])

  useEffect(() => {
    let active = true
    Promise.allSettled([loadDishCatalogData(), loadRecipeOptions()]).then(([catalogResult, optionsResult]) => {
      if (!active) return
      if (catalogResult.status === "fulfilled") {
        setCatalog(catalogResult.value.items)
        setCategoryOptions(catalogResult.value.categories)
      } else setCatalogLoadError(catalogResult.reason?.message || "Không tải được danh sách món ăn.")
      if (optionsResult.status === "fulfilled") setRecipeOptions(optionsResult.value)
      else setRecipeOptionsError(optionsResult.reason?.message || "Không tải được nguyên liệu để tạo món.")
    }).finally(() => {
      if (active) setCatalogLoading(false)
    })
    return () => { active = false }
  }, [])

  const dishCounts = useMemo(() => {
    const counts = {}
    for (const dish of catalog) {
      const catKey = dish.category || "UNCLASSIFIED"
      counts[catKey] = (counts[catKey] || 0) + 1
    }
    return counts
  }, [catalog])
  const [search, setSearch] = useState("")
  const [activeCat, setActiveCat] = useState("ALL")
  const [mealFilter, setMealFilter] = useState("ALL")
  const [supplierFilter, setSupplierFilter] = useState("ALL")
  const [currentPage, setCurrentPage] = useState(1)

  // Modal Xem chi tiết
  const [viewingDish, setViewingDish] = useState(null)

  // Modal thêm / sửa
  const [modalOpen, setModalOpen] = useState(false)
  const [editingDish, setEditingDish] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  // Danh sách nguyên liệu cấu thành món ăn (kèm định lượng từng nguyên liệu)
  const [selectedIngredients, setSelectedIngredients] = useState([])
  const [pickerOpen, setPickerOpen] = useState(false)

  // Danh sách gia vị kho dùng cho món này (kèm định lượng từng gia vị)
  const [selectedSeasonings, setSelectedSeasonings] = useState([])

  // Danh sách ID nguyên liệu để đồng bộ với IngredientPickerModal
  const selectedIngredientIds = useMemo(
    () => selectedIngredients.map((i) => i.id),
    [selectedIngredients]
  )

  // Modal xác nhận xóa
  const [deletingDish, setDeletingDish] = useState(null)

  /* ─── Filtered list ─────────────────────────── */
  const filtered = useMemo(() => {
    let list = catalog
    if (activeCat !== "ALL") {
      list = list.filter((d) => dishCategoryKey(d) === activeCat)
    }
    if (mealFilter !== "ALL") {
      list = list.filter((d) => d.mealType === mealFilter)
    }
    if (supplierFilter !== "ALL") {
      list = list.filter(
        (d) =>
          d.supplierId === supplierFilter ||
          d.supplierName === supplierFilter ||
          (d.supplierIds && d.supplierIds.includes(supplierFilter))
      )
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          (d.mainIngredient || "").toLowerCase().includes(q) ||
          (d.supplierName || "").toLowerCase().includes(q)
      )
    }
    return groupDishesByCategory(list)
  }, [catalog, activeCat, mealFilter, supplierFilter, search])

  /* ─── Pagination ─────────────────────────────── */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  // Giữ nguyên trang khi lọc; nếu trang hiện tại vượt quá tổng số trang mới thì điều chỉnh về totalPages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages))
    }
  }, [currentPage, totalPages])
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, currentPage])

  const PAGE_CHUNK = 3
  const visiblePages = useMemo(() => {
    const chunkIndex = Math.floor((currentPage - 1) / PAGE_CHUNK)
    const startPage = chunkIndex * PAGE_CHUNK + 1
    const endPage = Math.min(totalPages, startPage + PAGE_CHUNK - 1)
    const pages = []
    for (let p = startPage; p <= endPage; p++) {
      pages.push(p)
    }
    return pages
  }, [currentPage, totalPages])

  /* ─── Stats ──────────────────────────────────── */
  const stats = useMemo(() => {
    const catCount = new Set(catalog.map((d) => d.category).filter(Boolean)).size
    const supplierCount = linkedSuppliers.length
    return { total: catalog.length, catCount, supplierCount }
  }, [catalog, linkedSuppliers])

  /* ─── Handlers ───────────────────────────────── */
  const openAdd = useCallback(() => {
    setCatalogError("")
    setUnclassifiedLines([])
    setEditingDish(null)
    setForm(EMPTY_FORM)
    setSelectedIngredients([])
    setSelectedSeasonings([])
    setGradeProfiles([])
    setModalOpen(true)
  }, [])

  const openEdit = useCallback((dish) => {
    setEditingDish(dish)
    const firstProfile = (dish.gradeRecipes || [])[0]
    setGradeProfiles(firstProfile ? [{ gradeId: firstProfile.gradeId, lines: [] }] : [])
    setForm({ name: dish.name || "", category: dish.category || "", mealType: dish.mealType || "" })

    // Mỗi lần sửa áp dụng cho khối được chọn; các khối khác được giữ nguyên.
    const sourceLines = firstProfile?.lines || dish.lines || []
    const asIngredient = (l) => {
      const converted = toSmallestUnit(
        firstProfile ? l.requiredQuantity : l.portionQty,
        l.unit || "g"
      )
      return {
        ...l,
        id: l.ingredientId || l.ingredientEntryId,
        ingredientEntryId: l.ingredientEntryId || l.id,
        name: l.name,
        category: l.category || "-",
        portionQty: firstProfile ? String(converted.quantity ?? "") : "",
        unit: converted.unit || "g",
        supplierName: l.supplierName || "",
      }
    }

    const initialIngredients = [
      ...sourceLines.filter((line) => line.ingredientRole !== "SEASONING").map(asIngredient),
    ]

    const uniqueIngredients = [
      ...new Map(
        initialIngredients.map((i) => [
          i.id || i.ingredientEntryId || i.name,
          i,
        ])
      ).values(),
    ]

    setSelectedIngredients(uniqueIngredients)
    setSelectedSeasonings(sourceLines.filter((line) => line.ingredientRole === "SEASONING").map((line) => ({ ...asIngredient(line), id: line.ingredientEntryId })))
    setUnclassifiedLines([])
    setCatalogError("")
    setModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setUnclassifiedLines([])
    setModalOpen(false)
    setEditingDish(null)
    setSelectedIngredients([])
    setSelectedSeasonings([])
    setForm(EMPTY_FORM)
  }, [])

  const handleFormChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setCatalogError("")
  }, [])

  // Toggle chọn nguyên liệu từ IngredientPickerModal
  const handleToggleIngredient = useCallback(ing => {
    setSelectedIngredients(prev => {
      if (prev.some(i => i.id === ing.id)) return prev.filter(i => i.id !== ing.id)
      const converted = toSmallestUnit("", ing.defaultUnit || "g")
      return [...prev, { ...ing, portionQty: "", unit: converted.unit || "g" }]
    })
  }, [])

  // Cập nhật định lượng / đơn vị cho từng nguyên liệu
  const handleUpdateIngredientPortion = useCallback(
    (ingId, field, val) => {
      setSelectedIngredients((prev) =>
        prev.map((i) => (i.id === ingId ? { ...i, portionQty: smallQuantity(i.portionQty, i.unit || "g").quantity, unit: smallQuantity(null, i.unit || "g").unit, [field]: val } : i))
      )
    },
    []
  )

  // Xóa nguyên liệu khỏi bảng trong modal
  const handleRemoveIngredient = useCallback((ingId) => {
    setSelectedIngredients((prev) => prev.filter((i) => i.id !== ingId))
  }, [])

  // Thêm gia vị từ kho
  const handleAddSeasoning = useCallback((seasItem) => {
    setSelectedSeasonings((prev) => {
      if (prev.some((s) => s.id === seasItem.id)) return prev
      const converted = toSmallestUnit("", seasItem.defaultUnit || "g")
      return [
        ...prev,
        {
          id: seasItem.id,
          name: seasItem.name.replace(/\(.*?\)/g, "").trim(),
          portionQty: "",
          unit: converted.unit || "g",
        },
      ]
    })
  }, [])

  // Cập nhật định lượng gia vị
  const handleUpdateSeasoning = useCallback((seasId, field, val) => {
    setSelectedSeasonings((prev) =>
      prev.map((s) => (s.id === seasId ? { ...s, portionQty: smallQuantity(s.portionQty, s.unit || "g").quantity, unit: smallQuantity(null, s.unit || "g").unit, [field]: val } : s))
    )
  }, [])

  // Xóa gia vị khỏi danh sách
  const handleRemoveSeasoning = useCallback((seasId) => {
    setSelectedSeasonings((prev) => prev.filter((s) => s.id !== seasId))
  }, [])

  // Lưu món ăn
  const recipeLines = [
    ...selectedIngredients.map(i => {
      const c = toSmallestUnit(i.portionQty, i.unit || "g")
      return { ingredientEntryId: i.ingredientEntryId || i.id, ingredientRole: "MAIN", requiredQuantity: String(c.quantity || ""), unit: c.unit || "g" }
    }),
    ...selectedSeasonings.map(i => {
      const c = toSmallestUnit(i.portionQty, i.unit || "g")
      return { ingredientEntryId: i.ingredientEntryId || i.id, ingredientRole: "SEASONING", requiredQuantity: String(c.quantity || ""), unit: c.unit || "g" }
    }),
  ]
  const handleSave = async () => {
    setCatalogError("")
    if (!categoryOptions.some(option => option.key === form.category)) { setCatalogError("Vui lòng chọn nhóm món ăn."); return }
    if (!DISH_MEAL_TYPES.some(option => option.key === form.mealType)) { setCatalogError("Vui lòng chọn bữa ăn áp dụng cho món."); return }
    if (!gradeProfiles.length) { setCatalogError("Vui lòng chọn ít nhất một khối áp dụng."); return }
    if (!validRecipeLines(recipeLines)) { setCatalogError("Cần nguyên liệu chính không trùng, định lượng dương tối đa 3 chữ số thập phân và đơn vị hợp lệ."); return }
    setSaving(true)
    try {
      const response = await saveDishRecipe(editingDish?.id, {
        name: form.name.trim(),
        category: form.category,
        mealType: form.mealType,
        description: editingDish?.description || null,
        gradeRecipes: sharedGradeRecipes(gradeProfiles, recipeLines),
        lines: recipeLines,
      })
      setEditingDish(response.data)
      const rows = await loadDishCatalog()
      setCatalog(rows)
      if (!editingDish) {
        setSearch("")
        setActiveCat("ALL")
        setSupplierFilter("ALL")
        setCurrentPage(1)
      }
      closeModal()
    } catch (error) {
      setCatalogError(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingDish) return
    setSaving(true)
    setCatalogError("")
    try { await deleteDishRecipe(deletingDish.id);setCatalog(await loadDishCatalog());setDeletingDish(null) }
    catch(error) {setCatalogError(error.message)} finally {setSaving(false)}
  }

  return (
    <div className={styles.page}>
      <InlineError messages={[catalogError, catalogLoadError, recipeOptionsError]} />
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>Danh Sách Món Ăn Bán Trú</h1>
          <p className={styles.subtitle}>
            Nhân viên dinh dưỡng quản lý danh mục món ăn chuẩn, định lượng theo
            suất và nguyên liệu từ Nhà cung cấp
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.categoryBtn}
            onClick={() => setIsCategoryModalOpen(true)}
            title="Xem danh sách nhóm món ăn quy chuẩn từ Database"
          >
            <Layers size={16} />
            <span>Danh sách nhóm món ăn</span>
          </button>
          <button
            type="button"
            className={styles.addBtn}
            disabled={catalogLoading || !!catalogError || !!catalogLoadError || !!recipeOptionsError}
            onClick={openAdd}
          >
            <Plus size={16} />
            <span>Thêm món ăn mới</span>
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statNum}>{stats.total}</div>
          <div className={styles.statLabel}>Tổng số món ăn</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNum}>{stats.catCount}</div>
          <div className={styles.statLabel}>Nhóm món ăn dinh dưỡng</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNum}>{stats.supplierCount}</div>
          <div className={styles.statLabel}>Nhà cung cấp liên kết</div>
        </div>
      </div>

      {/* Filter bar */}
      <div className={styles.filterBar}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Tìm theo tên món, nguyên liệu, nhà cung cấp..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className={styles.filterSelect}
          value={activeCat}
          onChange={(e) => setActiveCat(e.target.value)}
          aria-label="Lọc theo nhóm món ăn"
        >
          {DISH_CATEGORIES.map((cat) => (
            <option key={cat.key} value={cat.key}>
              {cat.label}
            </option>
          ))}
        </select>

        <select
          className={styles.filterSelect}
          value={mealFilter}
          onChange={(e) => setMealFilter(e.target.value)}
          aria-label="Lọc theo bữa ăn"
        >
          <option value="ALL">Tất cả bữa ăn</option>
          {DISH_MEAL_TYPES.map((m) => (
            <option key={m.key} value={m.key}>
              {m.label}
            </option>
          ))}
        </select>

        <select
          className={styles.supplierFilter}
          value={supplierFilter}
          onChange={(e) => setSupplierFilter(e.target.value)}
          aria-label="Lọc theo nhà cung cấp"
        >
          <option value="ALL">Tất cả Nhà cung cấp (NCC)</option>
          {CATALOG_SUPPLIERS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Bảng danh sách món ăn (Đã xóa cột Định lượng / suất) */}
      <div className={styles.tableWrap}>
        {catalogLoading ? (
          <div className={styles.empty} role="status"><p>Đang tải danh sách món ăn…</p></div>
        ) : catalogLoadError ? (
          <div className={styles.empty}><p>Không thể hiển thị danh sách món ăn. Vui lòng kiểm tra kết nối và thử tải lại trang.</p></div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            <p>Không tìm thấy món ăn nào phù hợp với bộ lọc.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: 45, textAlign: "center" }}>#</th>
                <th style={{ minWidth: 220 }}>Tên món ăn</th>
                <th style={{ width: 150 }}>Nhóm món</th>
                <th style={{ width: 145 }}>Bữa ăn</th>
                <th style={{ minWidth: 280 }}>Nguyên liệu chính & NCC</th>
                <th style={{ width: 120, textAlign: "center" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedList.map((dish, idx) => {
                const globalIdx = (currentPage - 1) * PAGE_SIZE + idx + 1
                const catClass = getCategoryBadgeClass(dish.categoryLabel, dish.category)
                const mainIng =
                  dish.mainIngredient ||
                  dish.ingredientNames?.[0] ||
                  dish.name
                return (
                  <tr key={dish.id}>
                    <td
                      style={{
                        textAlign: "center",
                        color: "#6b7c74",
                        fontSize: 12,
                      }}
                    >
                      {globalIdx}
                    </td>
                    <td>
                      <div className={styles.dishName}>{dish.name}</div>
                    </td>
                    <td>
                      <span className={`${styles.catBadge} ${catClass}`}>
                        {dish.categoryLabel || "Chưa phân nhóm"}
                      </span>
                    </td>
                    {/* Cột Nguyên liệu chính (kèm NCC) */}
                    <td>
                      <span className={`${styles.mealBadge} ${dish.mealType === "LUNCH" ? styles.mealLunch : dish.mealType === "AFTERNOON" ? styles.mealAfter : styles.mealBoth}`}>
                        {dishMealTypeLabel(dish.mealType)}
                      </span>
                    </td>
                    <td>
                      <div className={styles.mainIngredientWrap}>
                        {Array.isArray(dish.ingredients) && dish.ingredients.length > 0 ? (
                          <div className={styles.mainIngredientName}>
                            {dish.ingredients.map((ing) => ing.name).join(", ")}
                          </div>
                        ) : (
                          <div className={styles.mainIngredientName}>{mainIng}</div>
                        )}
                      </div>
                      <div className={styles.supplierText}>
                        <span>NCC: {dish.supplierName || "Chưa gắn"}</span>
                        {dish.supplierBadge && (
                          <span className={styles.supplierBadgePill}>
                            {dish.supplierBadge}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div className={styles.actionBtns}>
                        {/* Nút Xem chi tiết (icon mắt) */}
                        <button
                          type="button"
                          className={styles.iconViewBtn}
                          onClick={() => { setDetailGradeId(""); setViewingDish(dish) }}
                          title="Xem chi tiết nguyên liệu & gia vị"
                          aria-label="Xem chi tiết món ăn"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          className={styles.iconDeleteBtn}
                          onClick={() => setDeletingDish(dish)}
                          title="Xóa món ăn"
                          aria-label="Xóa món ăn"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Phân trang (Pagination) */}
      {filtered.length > PAGE_SIZE && (
        <div className={styles.paginationWrap}>
          <div className={styles.pageInfo}>
            Hiển thị{" "}
            <strong>
              {(currentPage - 1) * PAGE_SIZE + 1} -{" "}
              {Math.min(currentPage * PAGE_SIZE, filtered.length)}
            </strong>{" "}
            trên <strong>{filtered.length}</strong> món ăn
          </div>
          <div className={styles.pageControls}>
            <button
              type="button"
              className={styles.pageArrowBtn}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Trang trước"
            >
              <ChevronLeft size={16} />
            </button>
            {visiblePages.map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                className={`${styles.pageBtn} ${
                  currentPage === pageNum ? styles.activePageBtn : ""
                }`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            ))}
            <button
              type="button"
              className={styles.pageArrowBtn}
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
              aria-label="Trang sau"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modal Thêm / Sửa món ăn */}
      {modalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderTitleBlock}>
                <h2 className={styles.modalTitle}>
                  {editingDish ? "Chỉnh sửa món ăn" : "Thêm món ăn mới"}
                </h2>
                <p className={styles.modalSubtitle}>
                  {editingDish
                    ? "Cập nhật công thức và định lượng nguyên liệu trên một suất ăn"
                    : "Thiết lập món ăn chuẩn, nguyên liệu chính và định lượng gia vị"}
                </p>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={closeModal}
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <InlineError messages={[catalogError, gradeError]} />
              <div className={styles.formGrid}>
                {gradeError ? (
                  null
                ) : (
                  <GradeRecipeFields
                    grades={grades}
                    profiles={gradeProfiles}
                    onChange={setGradeProfiles}
                    savedGradeIds={(editingDish?.gradeRecipes || []).map(
                      (profile) => profile.gradeId
                    )}
                    disabled={saving}
                  />
                )}

                {/* Tên món, nhóm món và bữa ăn dùng cùng một hàng trên desktop. */}
                <div className={styles.formDishInfoRow}>
                  <div>
                    <label className={styles.formLabel}>
                      Tên món ăn <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="Ví dụ: Thịt ba chỉ rang cháy cạnh, Cơm tám thơm, Súp gà ngô..."
                      value={form.name}
                      onChange={(e) => handleFormChange("name", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className={styles.formLabel}>Nhóm món ăn</label>
                    <select className={styles.formSelect} value={form.category} disabled={saving} onChange={event => handleFormChange("category", event.target.value)} aria-label="Nhóm món ăn" required>
                      <option value="">Chọn nhóm món ăn</option>
                      {categoryOptions.map(option => <option key={option.key} value={option.key}>{option.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={styles.formLabel} htmlFor="dish-meal-type">
                      Bữa ăn <span className={styles.required}>*</span>
                    </label>
                    <select id="dish-meal-type" className={styles.formSelect} value={form.mealType} disabled={saving} onChange={event => handleFormChange("mealType", event.target.value)} required>
                      <option value="">Chọn bữa ăn</option>
                      {DISH_MEAL_TYPES.map(option => <option key={option.key} value={option.key}>{option.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* KHU VỰC 1: BẢNG NGUYÊN LIỆU CẤU THÀNH (CÓ NHẬP ĐỊNH LƯỢNG / SUẤT CHO TỪNG NGUYÊN LIỆU) */}
                <div className={styles.ingredientsSection}>
                  <div className={styles.sectionHeaderRow}>
                    <div className={styles.sectionTitleBlock}>
                      <label className={styles.sectionTitle}>
                        Nguyên liệu chính cấu thành món ăn <span className={styles.required}>*</span>
                      </label>
                      <span className={styles.sectionHint}>
                        Chọn nguyên liệu từ NCC và cài đặt định lượng / suất ăn
                      </span>
                    </div>

                    {selectedIngredients.length > 0 && (
                      <button
                        type="button"
                        className={styles.openPickerBtn}
                        onClick={() => setPickerOpen(true)}
                      >
                        <Plus size={14} />
                        <span>
                          Thêm nguyên liệu ({selectedIngredients.length})
                        </span>
                      </button>
                    )}
                  </div>

                  {selectedIngredients.length === 0 ? (
                    <div
                      className={styles.emptyIngredientBox}
                      onClick={() => setPickerOpen(true)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className={styles.emptyIconCircle}>
                        <Plus size={18} />
                      </div>
                      <div className={styles.emptyPrompt}>
                        <p className={styles.emptyPromptTitle}>
                          Chọn nguyên liệu từ Nhà cung cấp
                        </p>
                        <p className={styles.emptyPromptSub}>
                          Bấm vào đây để mở bảng chọn nguyên liệu từ NCC liên kết
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.ingTableWrap}>
                      <table className={styles.ingTable}>
                        <thead>
                          <tr>
                            <th style={{ width: 40, textAlign: "center" }}>#</th>
                            <th style={{ minWidth: 160 }}>Tên nguyên liệu</th>
                            <th style={{ width: 130 }}>Phân loại</th>
                            <th style={{ minWidth: 160 }}>Nhà cung cấp</th>
                            <th style={{ width: 160, textAlign: "center" }}>
                              Định lượng / suất <span className={styles.required}>*</span>
                            </th>
                            <th style={{ width: 50, textAlign: "center" }}>Xóa</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedIngredients.map((ing, iIdx) => {
                            const sup = linkedSuppliers.find(
                              (s) => s.id === ing.supplierId
                            )
                            return (
                              <tr key={ing.id || iIdx}>
                                <td
                                  style={{
                                    textAlign: "center",
                                    color: "#6b7c74",
                                    fontSize: 12,
                                  }}
                                >
                                  {iIdx + 1}
                                </td>
                                <td>
                                  <strong className={styles.ingTableNameText}>
                                    {ing.name}
                                  </strong>
                                </td>
                                <td>
                                  <span className={styles.ingTableCatBadge}>
                                    {ing.category}
                                  </span>
                                </td>
                                <td>
                                  <div className={styles.ingTableSupplierWrap}>
                                    <span className={styles.ingTableSupplierName}>
                                      {sup?.name ||
                                        ing.supplierName ||
                                        "NCC liên kết"}
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  <div className={styles.portionInputGroup}>
                                    <input
                                      type="number"
                                      min="0.001"
                                      step="0.001"
                                      className={styles.portionQtyInput}
                                      value={smallQuantity(ing.portionQty, ing.unit || "g").quantity ?? ""}
                                      onChange={(e) =>
                                        handleUpdateIngredientPortion(
                                          ing.id,
                                          "portionQty",
                                          e.target.value
                                        )
                                      }
                                      placeholder="..."
                                    />
                                    <select
                                      className={styles.portionUnitSelect}
                                      value={smallQuantity(null, ing.unit || "g").unit}
                                      onChange={(e) =>
                                        handleUpdateIngredientPortion(
                                          ing.id,
                                          "unit",
                                          e.target.value
                                        )
                                      }
                                    >
                                      <option value="g">g</option>
                                      <option value="ml">ml</option>
                                      <option value="quả">quả</option>
                                      <option value="hộp">hộp</option>
                                      <option value="cái">cái</option>
                                      <option value="miếng">miếng</option>
                                      <option value="gói">gói</option>
                                    </select>
                                  </div>
                                </td>
                                <td style={{ textAlign: "center" }}>
                                  <button
                                    type="button"
                                    className={styles.ingTableRemoveBtn}
                                    onClick={() =>
                                      handleRemoveIngredient(ing.id)
                                    }
                                    title={`Xóa ${ing.name}`}
                                    aria-label="Xóa nguyên liệu"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* KHU VỰC 2: CHỌN GIA VỊ CHO MÓN & NHẬP ĐỊNH LƯỢNG / SUẤT */}
                <div className={styles.seasoningsSection}>
                  <div className={styles.sectionHeaderRow}>
                    <div className={styles.sectionTitleBlock}>
                      <label className={styles.sectionTitle}>
                        Gia vị định lượng của món ăn
                      </label>
                      <span className={styles.sectionHint}>
                        Gia vị từ kho trường (tùy chọn)
                      </span>
                    </div>

                    {/* Selector chọn gia vị để thêm nhanh */}
                    <div className={styles.seasoningAddPickerWrap}>
                      <select
                        className={styles.seasoningSelectPicker}
                        defaultValue=""
                        onChange={(e) => {
                          const found = WAREHOUSE_SEASONINGS_CATALOG.find(
                            (s) => s.id === e.target.value
                          )
                          if (found) {
                            handleAddSeasoning(found)
                            e.target.value = ""
                          }
                        }}
                      >
                        <option value="" disabled>
                          + Thêm gia vị từ kho...
                        </option>
                        {WAREHOUSE_SEASONINGS_CATALOG.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {selectedSeasonings.length === 0 ? (
                    <div className={styles.emptySeasoningBox}>
                      <Sparkles size={15} className={styles.emptySeasoningIcon} />
                      <p className={styles.emptySeasoningText}>
                        Chưa chọn gia vị cho món này (chọn từ danh sách phía trên nếu cần)
                      </p>
                    </div>
                  ) : (
                    <div className={styles.ingTableWrap}>
                      <table className={styles.ingTable}>
                        <thead>
                          <tr>
                            <th style={{ width: 40, textAlign: "center" }}>#</th>
                            <th style={{ minWidth: 200 }}>Tên gia vị</th>
                            <th style={{ width: 160, textAlign: "center" }}>
                              Định lượng / suất
                            </th>
                            <th style={{ width: 50, textAlign: "center" }}>Xóa</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedSeasonings.map((seas, sIdx) => (
                            <tr key={seas.id || sIdx}>
                              <td
                                style={{
                                  textAlign: "center",
                                  color: "#6b7c74",
                                  fontSize: 12,
                                }}
                              >
                                {sIdx + 1}
                              </td>
                              <td>
                                <strong className={styles.ingTableNameText}>
                                  {seas.name}
                                </strong>
                              </td>
                              <td>
                                <div className={styles.portionInputGroup}>
                                  <input
                                    type="number"
                                    min="0.001"
                                    step="0.001"
                                    className={styles.portionQtyInput}
                                    value={smallQuantity(seas.portionQty, seas.unit || "g").quantity ?? ""}
                                    onChange={(e) =>
                                      handleUpdateSeasoning(
                                        seas.id,
                                        "portionQty",
                                        e.target.value
                                      )
                                    }
                                    placeholder="..."
                                  />
                                  <select
                                    className={styles.portionUnitSelect}
                                    value={smallQuantity(null, seas.unit || "g").unit}
                                    onChange={(e) =>
                                      handleUpdateSeasoning(
                                        seas.id,
                                        "unit",
                                        e.target.value
                                      )
                                    }
                                  >
                                    <option value="g">g</option>
                                    <option value="ml">ml</option>
                                  </select>
                                </div>
                              </td>
                              <td style={{ textAlign: "center" }}>
                                <button
                                  type="button"
                                  className={styles.ingTableRemoveBtn}
                                  onClick={() =>
                                    handleRemoveSeasoning(seas.id)
                                  }
                                  title={`Xóa ${seas.name}`}
                                  aria-label="Xóa gia vị"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <div className={styles.modalFooterHint}>
                {selectedIngredients.length === 0 ? (
                  <span className={styles.footerWarning}>
                    * Vui lòng chọn ít nhất 1 nguyên liệu chính cho món ăn
                  </span>
                ) : (
                  <span className={styles.footerSuccess}>
                    Đã chọn {selectedIngredients.length} nguyên liệu chính
                    {selectedSeasonings.length > 0 && ` • ${selectedSeasonings.length} loại gia vị`}
                  </span>
                )}
              </div>
              <div className={styles.modalFooterActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={closeModal}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className={styles.saveBtn}
                  onClick={handleSave}
                  disabled={
                    saving || !form.name.trim() || selectedIngredients.length === 0
                  }
                >
                  {editingDish ? "Lưu thay đổi" : "Lưu món ăn"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xem chi tiết món ăn (Icon Mắt) */}
      {viewingDish && (() => {
        const selectedGradeId = detailGradeId || grades[0]?.id || ""
        const profile = viewingDish.gradeRecipes?.find(item => item.gradeId === selectedGradeId)
        const selectedLines = profile?.lines?.length ? profile.lines : (viewingDish.lines || [])
        const resolvedIngs = selectedLines.filter(line => line.ingredientRole === "MAIN").map(line => {
          const c = toSmallestUnit(line.requiredQuantity, line.unit)
          return { ...line, id: line.ingredientEntryId, portionQty: c.quantity, unit: c.unit }
        })
        const resolvedSeas = selectedLines.filter(line => line.ingredientRole === "SEASONING").map(line => {
          const c = toSmallestUnit(line.requiredQuantity, line.unit)
          return { ...line, id: line.ingredientEntryId, portionQty: c.quantity, unit: c.unit }
        })

        return (
          <div
            className={styles.modalOverlay}
            onClick={(e) => e.target === e.currentTarget && setViewingDish(null)}
          >
            <div className={styles.detailModal}>
              {/* Header chi tiết */}
              <div className={styles.detailModalHeader}>
                <div className={styles.detailHeaderTitleWrap}>
                  <div className={styles.detailModalIconWrap}>
                    <Utensils size={18} className={styles.detailHeaderIcon} />
                  </div>
                  <div className={styles.detailTitleInfo}>
                    <div className={styles.detailTitleRow}>
                      <h2 className={styles.detailModalTitle}>{viewingDish.name}</h2>
                      <span className={`${styles.mealBadge} ${viewingDish.mealType === "LUNCH" ? styles.mealLunch : viewingDish.mealType === "AFTERNOON" ? styles.mealAfter : styles.mealBoth}`}>
                        {dishMealTypeLabel(viewingDish.mealType)}
                      </span>
                      <span
                        className={`${styles.catBadge} ${
                          getCategoryBadgeClass(viewingDish.categoryLabel, viewingDish.category)
                        }`}
                      >
                        {viewingDish.categoryLabel || "Chưa phân nhóm"}
                      </span>
                    </div>
                    <span className={styles.detailSubText}>
                      Danh mục món ăn chuẩn học đường • Quản lý dinh dưỡng bán trú
                    </span>
                  </div>
                </div>

                <div className={styles.detailHeaderActions}>
                  <button
                    type="button"
                    className={styles.closeBtn}
                    onClick={() => setViewingDish(null)}
                    title="Đóng cửa sổ"
                    aria-label="Đóng"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Body chi tiết */}
              <div className={styles.detailModalBody}>
                <label className={styles.formLabel}>Định lượng áp dụng <select className={styles.formSelect} value={selectedGradeId} onChange={event => setDetailGradeId(event.target.value)} disabled={!grades.length}><option value="" disabled>Chưa có khối lớp</option>{grades.map(grade => <option key={grade.id} value={grade.id}>{grade.name}</option>)}</select></label>
                <InlineError messages={gradeError} />
                {selectedGradeId && !profile && (
                  <p role="status">
                    {viewingDish.lines?.length
                      ? "Khối này đang sử dụng định lượng chung của món ăn (chưa thiết lập định lượng riêng cho khối)."
                      : "Khối này chưa có định lượng cho món ăn."}
                  </p>
                )}
                {/* Bảng Nguyên liệu chính */}
                <div className={styles.detailSectionBox}>
                  <div className={styles.detailSectionHeader}>
                    <div className={styles.detailSectionTitleLeft}>
                      <Layers size={15} style={{ color: "#0a8066" }} />
                      <span>Nguyên liệu chính cấu thành món ăn</span>
                    </div>
                    <span className={styles.detailCountBadge}>
                      {resolvedIngs.length} nguyên liệu
                    </span>
                  </div>

                  {resolvedIngs.length > 0 ? (
                    <div className={styles.detailTableWrap}>
                      <table className={styles.detailTable}>
                        <thead>
                          <tr>
                            <th style={{ width: 45, textAlign: "center" }}>#</th>
                            <th>Tên nguyên liệu</th>
                            <th>Phân loại</th>
                            <th>Nhà cung cấp</th>
                            <th style={{ textAlign: "right" }}>Định lượng / 1 suất</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resolvedIngs.map((ing, idx) => (
                            <tr key={ing.id || idx}>
                              <td style={{ textAlign: "center", color: "#64748b" }}>
                                {idx + 1}
                              </td>
                              <td>
                                <strong style={{ color: "#0f172a" }}>{ing.name}</strong>
                              </td>
                              <td>
                                <span className={styles.ingTableCatBadge}>
                                  {ing.category || "Chưa phân loại"}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                                  <span>{ing.supplierName || "NCC liên kết"}</span>
                                  {ing.supplierBadge && (
                                    <span className={styles.supplierBadgePill}>
                                      {ing.supplierBadge}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td style={{ textAlign: "right" }}>
                                <span className={styles.detailPortionBadge}>
                                  {formatSmallQuantity(ing.portionQty, ing.unit || "g")}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className={styles.detailEmptyText}>
                      Chưa có dữ liệu nguyên liệu cấu thành cho món ăn này.
                    </div>
                  )}
                </div>

                {/* Bảng Gia vị món ăn */}
                <div className={styles.detailSectionBox}>
                  <div className={styles.detailSectionHeader}>
                    <div className={styles.detailSectionTitleLeft}>
                      <Sparkles size={15} style={{ color: "#75635c" }} />
                      <span>Gia vị định lượng của món ăn</span>
                    </div>
                    <span className={styles.detailCountBadge}>
                      {resolvedSeas.length} gia vị kho
                    </span>
                  </div>

                  {resolvedSeas.length > 0 ? (
                    <div className={styles.detailTableWrap}>
                      <table className={styles.detailTable}>
                        <thead>
                          <tr>
                            <th style={{ width: 45, textAlign: "center" }}>#</th>
                            <th>Tên gia vị từ kho trường</th>
                            <th style={{ textAlign: "right" }}>Định lượng / 1 suất</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resolvedSeas.map((s, idx) => (
                            <tr key={s.id || idx}>
                              <td style={{ textAlign: "center", color: "#64748b" }}>
                                {idx + 1}
                              </td>
                              <td>
                                <strong style={{ color: "#0f172a" }}>{s.name}</strong>
                              </td>
                              <td style={{ textAlign: "right" }}>
                                <span className={styles.detailPortionBadgeBrown}>
                                  {formatSmallQuantity(s.portionQty, s.unit || "g")}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className={styles.detailEmptyText}>
                      Món ăn chưa cài đặt gia vị kho đi kèm. Có thể bấm "Chỉnh sửa" để thêm gia vị từ kho.
                    </div>
                  )}
                </div>
              </div>

              {/* Footer chi tiết */}
              <div className={styles.detailModalFooter}>
                <span className={styles.footerNote}>
                  * Định lượng được tính cho 1 suất ăn học sinh bán trú chuẩn.
                </span>
                <button
                  type="button"
                  className={styles.detailFooterEditBtn}
                  onClick={() => {
                    const target = viewingDish
                    setViewingDish(null)
                    openEdit(target)
                  }}
                >
                  <Pencil size={15} />
                  <span>Chỉnh sửa món ăn</span>
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Popup Modal Chọn nguyên liệu chuẩn theo phân loại & NCC */}
      <IngredientPickerModal
        providedIngredients={providedIngredients}
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selectedIngredientIds={selectedIngredientIds}
        onToggleIngredient={handleToggleIngredient}
        dishContextName={
          form.name.trim() ||
          (editingDish ? editingDish.name : "Món ăn mới")
        }
      />

      {/* Modal Xác nhận xóa */}
      {deletingDish && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmBox}>
            <h3 className={styles.confirmTitle}>Xác nhận xóa món ăn</h3>
            <p className={styles.confirmMsg}>
              Bạn có chắc chắn muốn xóa món{" "}
              <strong>"{deletingDish.name}"</strong> khỏi danh sách món ăn? Thao
              tác này sẽ không thể hoàn tác.
            </p>
            <div className={styles.confirmActions}>
              <InlineError messages={catalogError} />
              <button
                type="button"
                className={styles.confirmCancel}
                onClick={() => setDeletingDish(null)}
              >
                Hủy
              </button>
              <button
                type="button"
                className={styles.confirmDelete}
                disabled={saving}
                onClick={handleDeleteConfirm}
              >
                Xóa món
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xem danh sách nhóm món ăn quy chuẩn từ Database */}
      <DishCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categoryOptions}
        dishCounts={dishCounts}
        onChanged={async () => {
          const data = await loadDishCatalogData()
          setCategoryOptions(data.categories)
          setCatalog(data.items)
          setActiveCat(current => data.categories.some(option => option.key === current) || current === "ALL" || current === "UNCLASSIFIED" ? current : "ALL")
        }}
      />
    </div>
  )
}
