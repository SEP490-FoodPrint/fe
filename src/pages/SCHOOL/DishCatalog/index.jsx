import React, { useState, useMemo, useCallback } from "react"
import {
  DISH_CATEGORIES,
  CATALOG_SUPPLIERS,
  getStoredDishCatalog,
  saveDishToCatalog,
} from "src/pages/SCHOOL/MenuPlanning/dishCatalogData"
import styles from "./index.module.scss"

/* ─── Helpers ────────────────────────────────────── */
const CAT_STYLE = {
  RICE_STARCH: styles.catRice,
  MAIN_DISH:   styles.catMain,
  VEGETABLE:   styles.catVeg,
  SOUP:        styles.catSoup,
  DESSERT:     styles.catDessert,
}

const MEAL_LABEL = {
  LUNCH:     { label: "Bữa trưa", cls: styles.mealLunch },
  AFTERNOON: { label: "Bữa xế",  cls: styles.mealAfter },
  BOTH:      { label: "Cả hai ca", cls: styles.mealBoth },
}

const EMPTY_FORM = {
  name: "",
  category: "MAIN_DISH",
  mealType: "LUNCH",
  portionQty: "",
  unit: "g",
  mainIngredient: "",
  supplierId: "sup-cp",
  supplierName: "CP Foods Việt Nam",
  customSupplierName: "",
  allergen: "",
  description: "",
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
          (d.supplierName || "").toLowerCase().includes(q) ||
          (d.description || "").toLowerCase().includes(q) ||
          (d.allergen || "").toLowerCase().includes(q)
      )
    }
    return list
  }, [catalog, activeCat, supplierFilter, search])

  /* ─── Stats ──────────────────────────────────── */
  const stats = useMemo(() => {
    const allergyCount = catalog.filter((d) => d.allergen).length
    const catCount = new Set(catalog.map((d) => d.category)).size
    const supplierCount = new Set(catalog.map((d) => d.supplierName).filter(Boolean)).size
    return { total: catalog.length, allergyCount, catCount, supplierCount }
  }, [catalog])

  /* ─── Handlers ───────────────────────────────── */
  const openAdd = useCallback(() => {
    setEditingDish(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }, [])

  const openEdit = useCallback((dish) => {
    const knownSupplier = CATALOG_SUPPLIERS.find(
      (s) => s.id === dish.supplierId || s.name === dish.supplierName
    )
    setEditingDish(dish)
    setForm({
      name: dish.name || "",
      category: dish.category || "MAIN_DISH",
      mealType: dish.mealType || "LUNCH",
      portionQty: dish.portionQty ?? "",
      unit: dish.unit || "g",
      mainIngredient: dish.mainIngredient || dish.ingredientNames?.[0] || dish.name || "",
      supplierId: knownSupplier ? knownSupplier.id : "CUSTOM",
      supplierName: dish.supplierName || (knownSupplier ? knownSupplier.name : "CP Foods Việt Nam"),
      customSupplierName: knownSupplier ? "" : (dish.supplierName || ""),
      allergen: dish.allergen || "",
      description: dish.description || "",
    })
    setModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setModalOpen(false)
    setEditingDish(null)
    setForm(EMPTY_FORM)
  }, [])

  const handleFormChange = useCallback((field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === "supplierId") {
        if (value !== "CUSTOM") {
          const sup = CATALOG_SUPPLIERS.find((s) => s.id === value)
          next.supplierName = sup ? sup.name : ""
        } else {
          next.supplierName = next.customSupplierName || ""
        }
      }
      return next
    })
  }, [])

  const handleSave = useCallback(() => {
    if (!form.name.trim() || !form.portionQty) return

    const catInfo = DISH_CATEGORIES.find((c) => c.key === form.category)
    let finalSupplierId = form.supplierId
    let finalSupplierName = form.supplierName
    let finalSupplierBadge = ""

    if (form.supplierId === "CUSTOM") {
      finalSupplierName = form.customSupplierName.trim() || "Nhà cung cấp đối tác"
      finalSupplierId = `custom-sup-${Date.now()}`
      finalSupplierBadge = "Đối tác liên kết"
    } else {
      const sup = CATALOG_SUPPLIERS.find((s) => s.id === form.supplierId)
      if (sup) {
        finalSupplierName = sup.name
        finalSupplierBadge = sup.badge
      }
    }

    const mainIng = form.mainIngredient.trim() || form.name.trim()

    if (editingDish) {
      const updated = catalog.map((d) =>
        d.id === editingDish.id
          ? {
              ...d,
              ...form,
              portionQty: Number(form.portionQty) || 50,
              categoryLabel: catInfo?.label || "Món ăn",
              mainIngredient: mainIng,
              supplierId: finalSupplierId,
              supplierName: finalSupplierName,
              supplierBadge: finalSupplierBadge,
              allergen: form.allergen.trim() || null,
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
        ...form,
        portionQty: Number(form.portionQty) || 50,
        categoryLabel: catInfo?.label || "Món ăn",
        mainIngredient: mainIng,
        supplierId: finalSupplierId,
        supplierName: finalSupplierName,
        supplierBadge: finalSupplierBadge,
        allergen: form.allergen.trim() || null,
        ingredientIds: [],
        ingredientNames: [mainIng],
      }
      const updated = saveDishToCatalog(newDish)
      setCatalog(updated)
    }
    closeModal()
  }, [form, editingDish, catalog, closeModal])

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

      {/* Stats row (Không có icon / emoji) */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statNum}>{stats.total}</div>
          <div className={styles.statLabel}>Tổng số món ăn</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNum}>{stats.catCount}</div>
          <div className={styles.statLabel}>Nhóm món ăn</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNum}>{stats.supplierCount}</div>
          <div className={styles.statLabel}>Nhà cung cấp liên kết</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNum}>{stats.allergyCount}</div>
          <div className={styles.statLabel}>Món có dị nguyên</div>
        </div>
      </div>

      {/* Filter bar (Không có icon) */}
      <div className={styles.filterBar}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Tìm theo tên món, nguyên liệu, NCC, dị ứng..."
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
                <th style={{ width: 40, textAlign: "center" }}>#</th>
                <th style={{ minWidth: 170 }}>Tên món ăn</th>
                <th style={{ width: 130 }}>Nhóm món</th>
                <th style={{ width: 95 }}>Ca ăn</th>
                <th style={{ width: 110 }}>Định lượng / suất</th>
                <th style={{ minWidth: 220 }}>Nguyên liệu chính</th>
                <th style={{ width: 140 }}>Cảnh báo dị ứng</th>
                <th style={{ width: 100, textAlign: "center" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((dish, idx) => {
                const catClass = CAT_STYLE[dish.category] || ""
                const mealStyle = MEAL_LABEL[dish.mealType] || MEAL_LABEL.LUNCH
                const mainIng = dish.mainIngredient || dish.ingredientNames?.[0] || dish.name
                return (
                  <tr key={dish.id}>
                    <td style={{ textAlign: "center", color: "#6b7c74", fontSize: 12 }}>
                      {idx + 1}
                    </td>
                    <td>
                      <div className={styles.dishName}>{dish.name}</div>
                      {dish.description && (
                        <div className={styles.dishDesc} title={dish.description}>
                          {dish.description.length > 70
                            ? dish.description.slice(0, 70) + "…"
                            : dish.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`${styles.catBadge} ${catClass}`}>
                        {dish.categoryLabel || dish.category}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.mealBadge} ${mealStyle.cls}`}>
                        {mealStyle.label}
                      </span>
                    </td>
                    <td className={styles.portionCell}>
                      {dish.portionQty} {dish.unit}
                    </td>
                    {/* Cột Nguyên liệu chính (kèm NCC) */}
                    <td>
                      <div className={styles.mainIngredientName}>{mainIng}</div>
                      <div className={styles.supplierText}>
                        NCC: {dish.supplierName || "Chưa gắn"}{" "}
                        {dish.supplierBadge ? `• ${dish.supplierBadge}` : ""}
                      </div>
                    </td>
                    <td>
                      {dish.allergen ? (
                        <span className={styles.allergenBadge}>{dish.allergen}</span>
                      ) : (
                        <span className={styles.noAllergen}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div className={styles.actionBtns}>
                        <button
                          type="button"
                          className={styles.textEditBtn}
                          onClick={() => openEdit(dish)}
                        >
                          Sửa
                        </button>
                        <span className={styles.actionDivider}>|</span>
                        <button
                          type="button"
                          className={styles.textDeleteBtn}
                          onClick={() => setDeletingDish(dish)}
                        >
                          Xóa
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

      {/* Modal Thêm / Sửa món ăn (Không dùng icon) */}
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

                {/* Loại ca ăn */}
                <div>
                  <label className={styles.formLabel}>Loại ca ăn</label>
                  <select
                    className={styles.formSelect}
                    value={form.mealType}
                    onChange={(e) => handleFormChange("mealType", e.target.value)}
                  >
                    <option value="LUNCH">Bữa trưa</option>
                    <option value="AFTERNOON">Bữa xế</option>
                    <option value="BOTH">Cả hai ca</option>
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
                      placeholder="Số lượng (g, ml)"
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

                {/* Nguyên liệu chính */}
                <div>
                  <label className={styles.formLabel}>
                    Nguyên liệu chính <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="Ví dụ: Thịt ba chỉ heo sạch CP, Gạo tám thơm..."
                    value={form.mainIngredient}
                    onChange={(e) => handleFormChange("mainIngredient", e.target.value)}
                  />
                </div>

                {/* Nhà cung cấp liên kết (NCC) */}
                <div className={styles.formFullRow}>
                  <label className={styles.formLabel}>
                    Nhà cung cấp (NCC) cung ứng <span className={styles.required}>*</span>
                  </label>
                  <select
                    className={styles.formSelect}
                    value={form.supplierId}
                    onChange={(e) => handleFormChange("supplierId", e.target.value)}
                  >
                    {CATALOG_SUPPLIERS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.badge})
                      </option>
                    ))}
                    <option value="CUSTOM">Nhà cung cấp khác (Tự nhập tên)...</option>
                  </select>
                </div>

                {/* Nếu chọn NCC tự nhập */}
                {form.supplierId === "CUSTOM" && (
                  <div className={styles.formFullRow}>
                    <label className={styles.formLabel}>
                      Tên Nhà cung cấp mới <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="Nhập tên đơn vị cung ứng thực phẩm..."
                      value={form.customSupplierName}
                      onChange={(e) => handleFormChange("customSupplierName", e.target.value)}
                    />
                  </div>
                )}

                {/* Cảnh báo dị ứng */}
                <div className={styles.formFullRow}>
                  <label className={styles.formLabel}>Cảnh báo dị nguyên (nếu có)</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="Để trống nếu an toàn, hoặc ghi: Hải sản, Trứng, Sữa bò..."
                    value={form.allergen}
                    onChange={(e) => handleFormChange("allergen", e.target.value)}
                  />
                </div>

                {/* Mô tả */}
                <div className={styles.formFullRow}>
                  <label className={styles.formLabel}>Mô tả dinh dưỡng / ghi chú chế biến</label>
                  <textarea
                    className={styles.formTextarea}
                    placeholder="Thông tin dinh dưỡng, xuất xứ, khuyến nghị khẩu phần..."
                    value={form.description}
                    onChange={(e) => handleFormChange("description", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button type="button" className={styles.cancelBtn} onClick={closeModal}>
                Hủy
              </button>
              <button
                type="button"
                className={styles.saveBtn}
                onClick={handleSave}
                disabled={!form.name.trim() || !form.portionQty}
              >
                {editingDish ? "Lưu thay đổi" : "Lưu vào Kho món ăn"}
              </button>
            </div>
          </div>
        </div>
      )}

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
