import React, { useState, useMemo, useCallback } from "react"
import { Pencil, Trash2, Plus, ShoppingBag } from "lucide-react"
import {
  DISH_CATEGORIES,
  CATALOG_SUPPLIERS,
  getStoredDishCatalog,
  saveDishToCatalog,
} from "src/pages/SCHOOL/MenuPlanning/dishCatalogData"
import {
  ALL_INGREDIENTS,
  LINKED_SUPPLIERS,
} from "src/pages/SCHOOL/MenuPlanning/mockMenuData"
import IngredientPickerModal from "src/pages/SCHOOL/MenuPlanning/component/IngredientPickerModal"
import styles from "./index.module.scss"

/* ─── Helpers ────────────────────────────────────── */
const CAT_STYLE = {
  RICE_STARCH: styles.catRice,
  MAIN_DISH:   styles.catMain,
  VEGETABLE:   styles.catVeg,
  SOUP:        styles.catSoup,
  DESSERT:     styles.catDessert,
}

const EMPTY_FORM = {
  name: "",
  category: "MAIN_DISH",
  portionQty: "",
  unit: "g",
}

export default function DishCatalogPage() {
  const [catalog, setCatalog] = useState(() => getStoredDishCatalog())
  const [search, setSearch] = useState("")
  const [activeCat, setActiveCat] = useState("ALL")
  const [supplierFilter, setSupplierFilter] = useState("ALL")

  // Modal thêm / sửa
  const [modalOpen, setModalOpen] = useState(false)
  const [editingDish, setEditingDish] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  // Danh sách nguyên liệu cấu thành món ăn (dạng bảng trực quan)
  const [selectedIngredients, setSelectedIngredients] = useState([])
  const [pickerOpen, setPickerOpen] = useState(false)

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
      list = list.filter((d) => d.supplierId === supplierFilter || d.supplierName === supplierFilter)
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

  /* ─── Stats ──────────────────────────────────── */
  const stats = useMemo(() => {
    const catCount = new Set(catalog.map((d) => d.category)).size
    const supplierCount = new Set(catalog.map((d) => d.supplierName).filter(Boolean)).size
    return { total: catalog.length, catCount, supplierCount }
  }, [catalog])

  /* ─── Handlers ───────────────────────────────── */
  const openAdd = useCallback(() => {
    setEditingDish(null)
    setForm(EMPTY_FORM)
    setSelectedIngredients([])
    setModalOpen(true)
  }, [])

  const openEdit = useCallback((dish) => {
    setEditingDish(dish)
    setForm({
      name: dish.name || "",
      category: dish.category || "MAIN_DISH",
      portionQty: dish.portionQty ?? "",
      unit: dish.unit || "g",
    })

    // Nạp danh sách nguyên liệu của món ăn đang sửa
    let initialIngs = []
    if (Array.isArray(dish.ingredientIds) && dish.ingredientIds.length > 0) {
      initialIngs = dish.ingredientIds
        .map((id) => {
          const found = ALL_INGREDIENTS.find((i) => i.id === id)
          if (found) {
            const sup = LINKED_SUPPLIERS.find((s) => s.id === found.supplierId)
            return {
              ...found,
              supplierName: sup ? sup.name : "NCC liên kết",
              supplierBadge: sup ? sup.badge : "",
            }
          }
          return null
        })
        .filter(Boolean)
    }

    // Nếu chưa có mảng ID, nạp từ mainIngredient text hoặc tìm trong ALL_INGREDIENTS
    if (initialIngs.length === 0) {
      const mainText = dish.mainIngredient || dish.ingredientNames?.[0] || dish.name || ""
      const foundByName = ALL_INGREDIENTS.find(
        (i) => i.name.toLowerCase() === mainText.toLowerCase()
      )
      if (foundByName) {
        const sup = LINKED_SUPPLIERS.find((s) => s.id === foundByName.supplierId)
        initialIngs = [
          {
            ...foundByName,
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
            supplierId: dish.supplierId || "sup-cp",
            supplierName: dish.supplierName || "CP Foods Việt Nam",
            supplierBadge: dish.supplierBadge || "VietGAP",
          },
        ]
      }
    }

    setSelectedIngredients(initialIngs)
    setModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setModalOpen(false)
    setEditingDish(null)
    setSelectedIngredients([])
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
          supplierId: ing.supplierId,
          supplierName: sup ? sup.name : ing.supplierName || "NCC liên kết",
          supplierBadge: sup ? sup.badge : ing.supplierBadge || "",
        },
      ]
    })
  }, [])

  // Xóa nguyên liệu khỏi bảng trong modal
  const handleRemoveIngredient = useCallback((ingId) => {
    setSelectedIngredients((prev) => prev.filter((i) => i.id !== ingId))
  }, [])

  const handleSave = useCallback(() => {
    if (!form.name.trim() || !form.portionQty || selectedIngredients.length === 0) return

    const catInfo = DISH_CATEGORIES.find((c) => c.key === form.category)
    const primaryIng = selectedIngredients[0]
    const allNames = selectedIngredients.map((i) => i.name)
    const mainIngText = allNames.join(" & ")
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
              portionQty: Number(form.portionQty) || 50,
              unit: form.unit || "g",
              mainIngredient: mainIngText,
              supplierId: finalSupplierId,
              supplierName: finalSupplierName,
              supplierBadge: finalSupplierBadge,
              ingredientIds: ingIds,
              ingredientNames: allNames,
            }
          : d
      )
      setCatalog(updated)
      try {
        localStorage.setItem("FOODPRINT_DISH_CATALOG_V2", JSON.stringify(updated))
      } catch (e) {
        console.warn("Lỗi lưu dish catalog:", e)
      }
    } else {
      const newDish = {
        name: form.name.trim(),
        category: form.category,
        categoryLabel: catInfo?.label || "Món ăn",
        portionQty: Number(form.portionQty) || 50,
        unit: form.unit || "g",
        mainIngredient: mainIngText,
        supplierId: finalSupplierId,
        supplierName: finalSupplierName,
        supplierBadge: finalSupplierBadge,
        ingredientIds: ingIds,
        ingredientNames: allNames,
      }
      const updated = saveDishToCatalog(newDish)
      setCatalog(updated)
    }
    closeModal()
  }, [form, editingDish, selectedIngredients, catalog, closeModal])

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
      {/* Header (Không có icon) */}
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>Kho Món Ăn Bán Trú (Master Data)</h1>
          <p className={styles.subtitle}>
            Cán bộ Y tế quản lý danh mục món ăn chuẩn, định lượng theo suất và nguyên liệu từ Nhà cung cấp
          </p>
        </div>
        <button type="button" className={styles.addBtn} onClick={openAdd}>
          Thêm món ăn mới
        </button>
      </div>

      {/* Stats row (3 thẻ số liệu trọng tâm) */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statNum}>{stats.total}</div>
          <div className={styles.statLabel}>Tổng số món ăn trong kho</div>
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
              className={`${styles.catTab} ${activeCat === cat.key ? styles.active : ""}`}
              onClick={() => setActiveCat(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bảng danh sách món ăn */}
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
                <th style={{ width: 140 }}>Định lượng / suất</th>
                <th style={{ minWidth: 280 }}>Nguyên liệu chính & NCC</th>
                <th style={{ width: 100, textAlign: "center" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((dish, idx) => {
                const catClass = CAT_STYLE[dish.category] || ""
                const mainIng = dish.mainIngredient || dish.ingredientNames?.[0] || dish.name
                return (
                  <tr key={dish.id}>
                    <td style={{ textAlign: "center", color: "#6b7c74", fontSize: 12 }}>
                      {idx + 1}
                    </td>
                    <td>
                      <div className={styles.dishName}>{dish.name}</div>
                    </td>
                    <td>
                      <span className={`${styles.catBadge} ${catClass}`}>
                        {dish.categoryLabel || dish.category}
                      </span>
                    </td>
                    <td className={styles.portionCell}>
                      {dish.portionQty} {dish.unit}
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
                        <button
                          type="button"
                          className={styles.iconEditBtn}
                          onClick={() => openEdit(dish)}
                          title="Chỉnh sửa món ăn"
                          aria-label="Chỉnh sửa món ăn"
                        >
                          <Pencil size={16} />
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

      {/* Modal Thêm / Sửa món ăn (Có BẢNG CHỌN NGUYÊN LIỆU có phân loại) */}
      {modalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingDish ? "Chỉnh sửa món ăn" : "Thêm món ăn mới vào kho"}
              </h2>
              <button type="button" className={styles.closeBtn} onClick={closeModal}>
                Đóng
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                {/* Tên món */}
                <div className={styles.formFullRow}>
                  <label className={styles.formLabel}>
                    Tên món ăn <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="Ví dụ: Thịt ba chỉ rang cháy cạnh, Cơm tám Hải Hậu, Súp gà ngô non..."
                    value={form.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                  />
                </div>

                {/* Nhóm món */}
                <div>
                  <label className={styles.formLabel}>Nhóm món ăn</label>
                  <select
                    className={styles.formSelect}
                    value={form.category}
                    onChange={(e) => handleFormChange("category", e.target.value)}
                  >
                    {DISH_CATEGORIES.filter((c) => c.key !== "ALL").map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Định lượng / suất */}
                <div>
                  <label className={styles.formLabel}>
                    Định lượng chuẩn / 1 suất <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.portionRow}>
                    <input
                      type="number"
                      min="1"
                      className={`${styles.formInput} ${styles.portionInput}`}
                      placeholder="Số lượng"
                      value={form.portionQty}
                      onChange={(e) => handleFormChange("portionQty", e.target.value)}
                    />
                    <select
                      className={`${styles.formSelect} ${styles.unitSelect}`}
                      value={form.unit}
                      onChange={(e) => handleFormChange("unit", e.target.value)}
                    >
                      <option value="g">g</option>
                      <option value="ml">ml</option>
                      <option value="cái">cái</option>
                      <option value="phần">phần</option>
                    </select>
                  </div>
                </div>

                {/* KHU VỰC: BẢNG NGUYÊN LIỆU CẤU THÀNH MÓN ĂN (Có phân loại & NCC) */}
                <div className={styles.ingredientsSection}>
                  <div className={styles.sectionHeaderRow}>
                    <div>
                      <label className={styles.sectionTitle}>
                        Nguyên liệu cấu thành món ăn <span className={styles.required}>*</span>
                      </label>
                      <p className={styles.sectionSub}>
                        Chọn nguyên liệu theo Phân loại và Nhà cung cấp đã liên kết
                      </p>
                    </div>

                    <button
                      type="button"
                      className={styles.openPickerBtn}
                      onClick={() => setPickerOpen(true)}
                    >
                      <Plus size={14} />
                      <span>Chọn nguyên liệu từ NCC ({selectedIngredients.length})</span>
                    </button>
                  </div>

                  {/* Bảng nguyên liệu */}
                  {selectedIngredients.length === 0 ? (
                    <div
                      className={styles.emptyIngredientBox}
                      onClick={() => setPickerOpen(true)}
                    >
                      <div className={styles.emptyPrompt}>
                        <p className={styles.emptyPromptTitle}>Chưa chọn nguyên liệu cho món này</p>
                        <p className={styles.emptyPromptSub}>
                          Bấm vào đây để mở bảng chọn nguyên liệu có đầy đủ Phân loại & Nhà cung cấp liên kết
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
                            <th style={{ width: 140 }}>Phân loại</th>
                            <th style={{ minWidth: 180 }}>Nhà cung cấp cung ứng</th>
                            <th style={{ width: 60, textAlign: "center" }}>Xóa</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedIngredients.map((ing, iIdx) => {
                            const sup = LINKED_SUPPLIERS.find((s) => s.id === ing.supplierId)
                            return (
                              <tr key={ing.id || iIdx}>
                                <td style={{ textAlign: "center", color: "#6b7c74", fontSize: 12 }}>
                                  {iIdx + 1}
                                </td>
                                <td>
                                  <strong className={styles.ingTableNameText}>{ing.name}</strong>
                                </td>
                                <td>
                                  <span className={styles.ingTableCatBadge}>
                                    {ing.category}
                                  </span>
                                </td>
                                <td>
                                  <div className={styles.ingTableSupplierWrap}>
                                    <span className={styles.ingTableSupplierName}>
                                      {sup?.name || ing.supplierName || "NCC liên kết"}
                                    </span>
                                    {(sup?.badge || ing.supplierBadge) && (
                                      <span className={styles.ingTableSupplierBadge}>
                                        {sup?.badge || ing.supplierBadge}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td style={{ textAlign: "center" }}>
                                  <button
                                    type="button"
                                    className={styles.ingTableRemoveBtn}
                                    onClick={() => handleRemoveIngredient(ing.id)}
                                    title={`Xóa ${ing.name} khỏi món này`}
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
              </div>
            </div>

            <div className={styles.modalFooter}>
              <div className={styles.modalFooterHint}>
                {selectedIngredients.length === 0 && (
                  <span className={styles.footerWarning}>
                    * Vui lòng chọn ít nhất 1 nguyên liệu cho món ăn
                  </span>
                )}
              </div>
              <button type="button" className={styles.cancelBtn} onClick={closeModal}>
                Hủy
              </button>
              <button
                type="button"
                className={styles.saveBtn}
                onClick={handleSave}
                disabled={!form.name.trim() || !form.portionQty || selectedIngredients.length === 0}
              >
                {editingDish ? "Lưu thay đổi" : "Lưu vào Kho món ăn"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Modal Chọn nguyên liệu chuẩn theo phân loại & NCC (như bên Tạo thực đơn) */}
      <IngredientPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selectedIngredientIds={selectedIngredientIds}
        onToggleIngredient={handleToggleIngredient}
        dishContextName={form.name.trim() || (editingDish ? editingDish.name : "Món ăn mới")}
      />

      {/* Modal Xác nhận xóa */}
      {deletingDish && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmBox}>
            <h3 className={styles.confirmTitle}>Xác nhận xóa món ăn</h3>
            <p className={styles.confirmMsg}>
              Bạn có chắc chắn muốn xóa món <strong>"{deletingDish.name}"</strong> khỏi kho món ăn?
              Thao tác này sẽ không thể hoàn tác.
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
