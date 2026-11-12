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
import {
  DISH_CATEGORIES,
  CATALOG_SUPPLIERS,
  getStoredDishCatalog,
  saveDishToCatalog,
} from "src/pages/SCHOOL/MenuPlanning/dishCatalogData"
import {
  ALL_INGREDIENTS,
  LINKED_SUPPLIERS,
  WAREHOUSE_SEASONINGS_CATALOG,
} from "src/pages/SCHOOL/MenuPlanning/mockMenuData"
import IngredientPickerModal from "src/pages/SCHOOL/MenuPlanning/component/IngredientPickerModal"
import styles from "./index.module.scss"

/* ─── Helpers ────────────────────────────────────── */
const CAT_STYLE = {
  RICE_STARCH: styles.catRice,
  MAIN_DISH: styles.catMain,
  VEGETABLE: styles.catVeg,
  SOUP: styles.catSoup,
  DESSERT: styles.catDessert,
}

const EMPTY_FORM = {
  name: "",
  category: "MAIN_DISH",
}

const PAGE_SIZE = 8

/* ─── Phân giải nguyên liệu & gia vị đầy đủ cho xem chi tiết ───── */
const getDishResolvedIngredients = (dish) => {
  if (!dish) return []
  if (Array.isArray(dish.ingredients) && dish.ingredients.length > 0) {
    return dish.ingredients.map((ing) => ({
      ...ing,
      portionQty: ing.portionQty != null ? ing.portionQty : 50,
      unit: ing.unit || "g",
    }))
  }
  if (Array.isArray(dish.ingredientIds) && dish.ingredientIds.length > 0) {
    return dish.ingredientIds
      .map((id) => {
        const found = ALL_INGREDIENTS.find((i) => i.id === id)
        if (found) {
          const sup = LINKED_SUPPLIERS.find((s) => s.id === found.supplierId)
          return {
            ...found,
            portionQty: 50,
            unit: "g",
            supplierName: sup ? sup.name : "NCC liên kết",
            supplierBadge: sup ? sup.badge : "",
          }
        }
        return null
      })
      .filter(Boolean)
  }
  const mainText =
    dish.mainIngredient || dish.ingredientNames?.[0] || dish.name || ""
  const foundByName = ALL_INGREDIENTS.find(
    (i) => i.name.toLowerCase() === mainText.toLowerCase()
  )
  if (foundByName) {
    const sup = LINKED_SUPPLIERS.find((s) => s.id === foundByName.supplierId)
    return [
      {
        ...foundByName,
        portionQty: 50,
        unit: "g",
        supplierName: sup ? sup.name : "NCC liên kết",
        supplierBadge: sup ? sup.badge : "",
      },
    ]
  }
  return [
    {
      id: `ing-syn-${dish.id}`,
      name: mainText,
      category: dish.categoryLabel || "Nguyên liệu chính",
      portionQty: 50,
      unit: "g",
      supplierId: dish.supplierId || "sup-cp",
      supplierName: dish.supplierName || "CP Foods Việt Nam",
      supplierBadge: dish.supplierBadge || "VietGAP",
    },
  ]
}

const getDishResolvedSeasonings = (dish) => {
  if (!dish) return []
  if (Array.isArray(dish.seasonings) && dish.seasonings.length > 0) {
    return dish.seasonings.map((s) => ({
      ...s,
      portionQty: s.portionQty != null ? s.portionQty : 2,
      unit: s.unit || "g",
    }))
  }
  return []
}

export default function DishCatalogPage() {
  const [catalog, setCatalog] = useState(() => getStoredDishCatalog())
  const [search, setSearch] = useState("")
  const [activeCat, setActiveCat] = useState("ALL")
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
      list = list.filter((d) => d.category === activeCat)
    }
    if (supplierFilter !== "ALL") {
      list = list.filter(
        (d) =>
          d.supplierId === supplierFilter || d.supplierName === supplierFilter
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
    return list
  }, [catalog, activeCat, supplierFilter, search])

  // Reset về trang 1 khi lọc
  useEffect(() => {
    setCurrentPage(1)
  }, [search, activeCat, supplierFilter])

  /* ─── Pagination ─────────────────────────────── */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, currentPage])

  /* ─── Stats ──────────────────────────────────── */
  const stats = useMemo(() => {
    const catCount = new Set(catalog.map((d) => d.category)).size
    const supplierCount = new Set(
      catalog.map((d) => d.supplierName).filter(Boolean)
    ).size
    return { total: catalog.length, catCount, supplierCount }
  }, [catalog])

  /* ─── Handlers ───────────────────────────────── */
  const openAdd = useCallback(() => {
    setEditingDish(null)
    setForm(EMPTY_FORM)
    setSelectedIngredients([])
    setSelectedSeasonings([])
    setModalOpen(true)
  }, [])

  const openEdit = useCallback((dish) => {
    setEditingDish(dish)
    setForm({
      name: dish.name || "",
      category: dish.category || "MAIN_DISH",
    })

    // Nạp danh sách nguyên liệu của món ăn đang sửa (kèm định lượng)
    let initialIngs = []
    if (Array.isArray(dish.ingredients) && dish.ingredients.length > 0) {
      initialIngs = dish.ingredients.map((ing) => ({
        ...ing,
        portionQty: ing.portionQty != null ? ing.portionQty : 50,
        unit: ing.unit || "g",
      }))
    } else if (
      Array.isArray(dish.ingredientIds) &&
      dish.ingredientIds.length > 0
    ) {
      initialIngs = dish.ingredientIds
        .map((id) => {
          const found = ALL_INGREDIENTS.find((i) => i.id === id)
          if (found) {
            const sup = LINKED_SUPPLIERS.find((s) => s.id === found.supplierId)
            return {
              ...found,
              portionQty: 50,
              unit: "g",
              supplierName: sup ? sup.name : "NCC liên kết",
              supplierBadge: sup ? sup.badge : "",
            }
          }
          return null
        })
        .filter(Boolean)
    }

    if (initialIngs.length === 0) {
      const mainText =
        dish.mainIngredient || dish.ingredientNames?.[0] || dish.name || ""
      const foundByName = ALL_INGREDIENTS.find(
        (i) => i.name.toLowerCase() === mainText.toLowerCase()
      )
      if (foundByName) {
        const sup = LINKED_SUPPLIERS.find(
          (s) => s.id === foundByName.supplierId
        )
        initialIngs = [
          {
            ...foundByName,
            portionQty: 50,
            unit: "g",
            supplierName: sup ? sup.name : "NCC liên kết",
            supplierBadge: sup ? sup.badge : "",
          },
        ]
      } else {
        initialIngs = [
          {
            id: `ing-syn-${dish.id}`,
            name: mainText,
            category: dish.categoryLabel || "Nguyên liệu chính",
            portionQty: 50,
            unit: "g",
            supplierId: dish.supplierId || "sup-cp",
            supplierName: dish.supplierName || "CP Foods Việt Nam",
            supplierBadge: dish.supplierBadge || "VietGAP",
          },
        ]
      }
    }

    setSelectedIngredients(initialIngs)

    // Nạp danh sách gia vị kho
    if (Array.isArray(dish.seasonings) && dish.seasonings.length > 0) {
      setSelectedSeasonings(dish.seasonings.map((s) => ({ ...s })))
    } else {
      setSelectedSeasonings([])
    }

    setModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setModalOpen(false)
    setEditingDish(null)
    setSelectedIngredients([])
    setSelectedSeasonings([])
    setForm(EMPTY_FORM)
  }, [])

  const handleFormChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  // Toggle chọn nguyên liệu từ IngredientPickerModal
  const handleToggleIngredient = useCallback((ing) => {
    setSelectedIngredients((prev) => {
      const exists = prev.some((i) => i.id === ing.id)
      if (exists) {
        return prev.filter((i) => i.id !== ing.id)
      }
      const sup = LINKED_SUPPLIERS.find((s) => s.id === ing.supplierId)
      return [
        ...prev,
        {
          id: ing.id,
          name: ing.name,
          category: ing.category,
          portionQty: 50,
          unit: "g",
          supplierId: ing.supplierId,
          supplierName: sup ? sup.name : ing.supplierName || "NCC liên kết",
          supplierBadge: sup ? sup.badge : ing.supplierBadge || "",
        },
      ]
    })
  }, [])

  // Cập nhật định lượng / đơn vị cho từng nguyên liệu
  const handleUpdateIngredientPortion = useCallback(
    (ingId, field, val) => {
      setSelectedIngredients((prev) =>
        prev.map((i) => (i.id === ingId ? { ...i, [field]: val } : i))
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
      return [
        ...prev,
        {
          id: seasItem.id,
          name: seasItem.name.replace(/\(.*?\)/g, "").trim(),
          portionQty: 2,
          unit: seasItem.defaultUnit || "g",
        },
      ]
    })
  }, [])

  // Cập nhật định lượng gia vị
  const handleUpdateSeasoning = useCallback((seasId, field, val) => {
    setSelectedSeasonings((prev) =>
      prev.map((s) => (s.id === seasId ? { ...s, [field]: val } : s))
    )
  }, [])

  // Xóa gia vị khỏi danh sách
  const handleRemoveSeasoning = useCallback((seasId) => {
    setSelectedSeasonings((prev) => prev.filter((s) => s.id !== seasId))
  }, [])

  // Lưu món ăn
  const handleSave = useCallback(() => {
    if (!form.name.trim() || selectedIngredients.length === 0) return

    const catInfo = DISH_CATEGORIES.find((c) => c.key === form.category)
    const primaryIng = selectedIngredients[0]
    const allNames = selectedIngredients.map((i) => i.name)
    const mainIngText = selectedIngredients
      .map((i) => `${i.name} (${i.portionQty}${i.unit})`)
      .join(" & ")
    const ingIds = selectedIngredients.map((i) => i.id)

    const finalSupplierId = primaryIng?.supplierId || "sup-cp"
    const finalSupplierName = primaryIng?.supplierName || "CP Foods Việt Nam"
    const finalSupplierBadge = primaryIng?.supplierBadge || "VietGAP"

    if (editingDish) {
      const updated = catalog.map((d) =>
        d.id === editingDish.id
          ? {
              ...d,
              name: form.name.trim(),
              category: form.category,
              categoryLabel: catInfo?.label || "Món ăn",
              mainIngredient: mainIngText,
              supplierId: finalSupplierId,
              supplierName: finalSupplierName,
              supplierBadge: finalSupplierBadge,
              ingredientIds: ingIds,
              ingredientNames: allNames,
              ingredients: selectedIngredients,
              seasonings: selectedSeasonings,
            }
          : d
      )
      setCatalog(updated)
      try {
        localStorage.setItem(
          "FOODPRINT_DISH_CATALOG_V2",
          JSON.stringify(updated)
        )
      } catch (e) {
        console.warn("Lỗi lưu dish catalog:", e)
      }
    } else {
      const newDish = {
        name: form.name.trim(),
        category: form.category,
        categoryLabel: catInfo?.label || "Món ăn",
        mainIngredient: mainIngText,
        supplierId: finalSupplierId,
        supplierName: finalSupplierName,
        supplierBadge: finalSupplierBadge,
        ingredientIds: ingIds,
        ingredientNames: allNames,
        ingredients: selectedIngredients,
        seasonings: selectedSeasonings,
      }
      const updated = saveDishToCatalog(newDish)
      setCatalog(updated)
    }
    closeModal()
  }, [
    form,
    editingDish,
    selectedIngredients,
    selectedSeasonings,
    catalog,
    closeModal,
  ])

  const handleDeleteConfirm = useCallback(() => {
    if (!deletingDish) return
    const updated = catalog.filter((d) => d.id !== deletingDish.id)
    setCatalog(updated)
    try {
      localStorage.setItem("FOODPRINT_DISH_CATALOG_V2", JSON.stringify(updated))
    } catch (e) {
      console.warn("Lỗi xóa món:", e)
    }
    setDeletingDish(null)
  }, [deletingDish, catalog])

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>Danh Sách Món Ăn Bán Trú</h1>
          <p className={styles.subtitle}>
            Nhân viên dinh dưỡng quản lý danh mục món ăn chuẩn, định lượng theo
            suất và nguyên liệu từ Nhà cung cấp
          </p>
        </div>
        <button type="button" className={styles.addBtn} onClick={openAdd}>
          <Plus size={16} />
          <span>Thêm món ăn mới</span>
        </button>
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
          className={styles.supplierFilter}
          value={supplierFilter}
          onChange={(e) => setSupplierFilter(e.target.value)}
        >
          <option value="ALL">Tất cả Nhà cung cấp (NCC)</option>
          {CATALOG_SUPPLIERS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.badge})
            </option>
          ))}
        </select>

        <div className={styles.catTabs}>
          {DISH_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              className={`${styles.catTab} ${
                activeCat === cat.key ? styles.active : ""
              }`}
              onClick={() => setActiveCat(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bảng danh sách món ăn (Đã xóa cột Định lượng / suất) */}
      <div className={styles.tableWrap}>
        {filtered.length === 0 ? (
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
                <th style={{ minWidth: 280 }}>Nguyên liệu chính & NCC</th>
                <th style={{ width: 120, textAlign: "center" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedList.map((dish, idx) => {
                const globalIdx = (currentPage - 1) * PAGE_SIZE + idx + 1
                const catClass = CAT_STYLE[dish.category] || ""
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
                        {dish.categoryLabel || dish.category}
                      </span>
                    </td>
                    {/* Cột Nguyên liệu chính (kèm NCC) */}
                    <td>
                      <div className={styles.mainIngredientName}>{mainIng}</div>
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
                          onClick={() => setViewingDish(dish)}
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
            {Array.from({ length: totalPages }).map((_, pIdx) => {
              const pageNum = pIdx + 1
              return (
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
              )
            })}
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
              <h2 className={styles.modalTitle}>
                {editingDish ? "Chỉnh sửa món ăn" : "Thêm món ăn mới"}
              </h2>
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
              <div className={styles.formGrid}>
                {/* Hàng 1: Tên món (60%) + Nhóm món (40%) cùng 1 dòng gọn gàng */}
                <div className={styles.formTwoColsRow}>
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
                    <select
                      className={styles.formSelect}
                      value={form.category}
                      onChange={(e) =>
                        handleFormChange("category", e.target.value)
                      }
                    >
                      {DISH_CATEGORIES.filter((c) => c.key !== "ALL").map((c) => (
                        <option key={c.key} value={c.key}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* KHU VỰC 1: BẢNG NGUYÊN LIỆU CẤU THÀNH (CÓ NHẬP ĐỊNH LƯỢNG / SUẤT CHO TỪNG NGUYÊN LIỆU) */}
                <div className={styles.ingredientsSection}>
                  <div className={styles.sectionHeaderRow}>
                    <div>
                      <label className={styles.sectionTitle}>
                        Nguyên liệu chính <span className={styles.required}>*</span>
                      </label>
                      <p className={styles.sectionSub}>
                        Chọn nguyên liệu từ Nhà cung cấp và nhập định lượng chuẩn
                        trên 1 suất ăn
                      </p>
                    </div>

                    <button
                      type="button"
                      className={styles.openPickerBtn}
                      onClick={() => setPickerOpen(true)}
                    >
                      <Plus size={14} />
                      <span>
                        Chọn nguyên liệu từ NCC ({selectedIngredients.length})
                      </span>
                    </button>
                  </div>

                  {selectedIngredients.length === 0 ? (
                    <div
                      className={styles.emptyIngredientBox}
                      onClick={() => setPickerOpen(true)}
                    >
                      <div className={styles.emptyPrompt}>
                        <p className={styles.emptyPromptTitle}>
                          Chưa chọn nguyên liệu cho món này
                        </p>
                        <p className={styles.emptyPromptSub}>
                          Bấm vào đây để mở bảng chọn nguyên liệu từ Nhà cung cấp
                          liên kết
                        </p>
                      </div>
                      <button type="button" className={styles.emptyAddBtn}>
                        + Mở bảng chọn nguyên liệu
                      </button>
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
                            const sup = LINKED_SUPPLIERS.find(
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
                                      min="1"
                                      step="0.5"
                                      className={styles.portionQtyInput}
                                      value={ing.portionQty || ""}
                                      onChange={(e) =>
                                        handleUpdateIngredientPortion(
                                          ing.id,
                                          "portionQty",
                                          Number(e.target.value) || 0
                                        )
                                      }
                                      placeholder="Số lượng"
                                    />
                                    <select
                                      className={styles.portionUnitSelect}
                                      value={ing.unit || "g"}
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
                                      <option value="kg">kg</option>
                                      <option value="quả">quả</option>
                                      <option value="hộp">hộp</option>
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
                    <div>
                      <label className={styles.sectionTitle}>
                        Gia vị dùng cho món
                      </label>
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
                          + Chọn gia vị...
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
                      <p className={styles.emptySeasoningText}>
                        Chưa chọn gia vị. Chọn gia vị ở góc phải trên để thêm vào
                        món ăn.
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
                                    min="0.1"
                                    step="0.5"
                                    className={styles.portionQtyInput}
                                    value={seas.portionQty || ""}
                                    onChange={(e) =>
                                      handleUpdateSeasoning(
                                        seas.id,
                                        "portionQty",
                                        Number(e.target.value) || 0
                                      )
                                    }
                                    placeholder="Định lượng"
                                  />
                                  <select
                                    className={styles.portionUnitSelect}
                                    value={seas.unit || "g"}
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
                {selectedIngredients.length === 0 && (
                  <span className={styles.footerWarning}>
                    * Vui lòng chọn ít nhất 1 nguyên liệu chính cho món ăn
                  </span>
                )}
              </div>
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
                  !form.name.trim() || selectedIngredients.length === 0
                }
              >
                {editingDish ? "Lưu thay đổi" : "Lưu món ăn"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xem chi tiết món ăn (Icon Mắt) */}
      {viewingDish && (() => {
        const resolvedIngs = getDishResolvedIngredients(viewingDish)
        const resolvedSeas = getDishResolvedSeasonings(viewingDish)

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
                      <span
                        className={`${styles.catBadge} ${
                          CAT_STYLE[viewingDish.category] || ""
                        }`}
                      >
                        {viewingDish.categoryLabel || viewingDish.category}
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
                    className={styles.detailEditHeaderBtn}
                    onClick={() => {
                      const target = viewingDish
                      setViewingDish(null)
                      openEdit(target)
                    }}
                    title="Chỉnh sửa thông tin món ăn"
                  >
                    <Pencil size={14} />
                    <span>Chỉnh sửa</span>
                  </button>

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
                {/* Lưới thông số tổng quan */}
                <div className={styles.detailOverviewGrid}>
                  <div className={styles.overviewItem}>
                    <span className={styles.overviewItemLabel}>Nhà cung cấp chính</span>
                    <div className={styles.overviewItemVal}>
                      <span>{viewingDish.supplierName || "CP Foods Việt Nam"}</span>
                      {viewingDish.supplierBadge && (
                        <span className={styles.supplierBadgePill}>
                          {viewingDish.supplierBadge}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={styles.overviewItem}>
                    <span className={styles.overviewItemLabel}>Nguyên liệu cấu thành</span>
                    <div className={styles.overviewItemVal}>
                      <strong>{resolvedIngs.length}</strong> nguyên liệu chính
                    </div>
                  </div>

                  <div className={styles.overviewItem}>
                    <span className={styles.overviewItemLabel}>Gia vị định lượng</span>
                    <div className={styles.overviewItemVal}>
                      <strong>{resolvedSeas.length}</strong> loại gia vị kho
                    </div>
                  </div>
                </div>

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
                                {ing.category || "Nguyên liệu chính"}
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
                                {ing.portionQty || 50} {ing.unit || "g"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
                                {s.portionQty} {s.unit || "g"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
                onClick={handleDeleteConfirm}
              >
                Xóa món
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
