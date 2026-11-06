import React, { useState, useMemo, useCallback } from "react"
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  UtensilsCrossed,
  AlertCircle,
  BookOpen,
} from "lucide-react"
import {
  DISH_CATEGORIES,
  getStoredDishCatalog,
  saveDishToCatalog,
} from "src/pages/SCHOOL/MenuPlanning/dishCatalogData"
import styles from "./index.module.scss"

/* ─── Helpers ────────────────────────────────────── */
const CAT_STYLE = {
  RICE_STARCH: { cls: styles["rice"], emoji: "🍚" },
  MAIN_DISH:   { cls: styles["main"], emoji: "🍖" },
  VEGETABLE:   { cls: styles["veg"],  emoji: "🥦" },
  SOUP:        { cls: styles["soup"], emoji: "🍲" },
  AFTERNOON:   { cls: styles["after"],emoji: "🧋" },
  ALLERGY_SUBSTITUTE: { cls: styles["allergy"], emoji: "🛡️" },
}

const MEAL_LABEL = {
  LUNCH:     { label: "Bữa trưa", cls: styles["lunch"] },
  AFTERNOON: { label: "Bữa xế",  cls: styles["after"] },
  BOTH:      { label: "Cả hai",   cls: styles["both"] },
}

const EMPTY_FORM = {
  name: "",
  category: "MAIN_DISH",
  mealType: "LUNCH",
  portionQty: "",
  unit: "g",
  allergen: "",
  substituteFor: "",
  description: "",
}

/* ─── Main page ──────────────────────────────────── */
export default function DishCatalogPage() {
  const [catalog, setCatalog] = useState(() => getStoredDishCatalog())
  const [search, setSearch] = useState("")
  const [activeCat, setActiveCat] = useState("ALL")

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingDish, setEditingDish] = useState(null) // null = add new
  const [form, setForm] = useState(EMPTY_FORM)

  // Delete confirm state
  const [deletingDish, setDeletingDish] = useState(null)

  /* ─── Filtered list ─────────────────────────── */
  const filtered = useMemo(() => {
    let list = catalog
    if (activeCat !== "ALL") list = list.filter((d) => d.category === activeCat)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          (d.description || "").toLowerCase().includes(q) ||
          (d.allergen || "").toLowerCase().includes(q)
      )
    }
    return list
  }, [catalog, activeCat, search])

  /* ─── Stats ──────────────────────────────────── */
  const stats = useMemo(() => {
    const allergyCount = catalog.filter((d) => d.allergen).length
    const catCount = new Set(catalog.map((d) => d.category)).size
    return { total: catalog.length, allergyCount, catCount }
  }, [catalog])

  /* ─── Handlers ───────────────────────────────── */
  const openAdd = useCallback(() => {
    setEditingDish(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }, [])

  const openEdit = useCallback((dish) => {
    setEditingDish(dish)
    setForm({
      name: dish.name || "",
      category: dish.category || "MAIN_DISH",
      mealType: dish.mealType || "LUNCH",
      portionQty: dish.portionQty ?? "",
      unit: dish.unit || "g",
      allergen: dish.allergen || "",
      substituteFor: dish.substituteFor || "",
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
    setForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleSave = useCallback(() => {
    if (!form.name.trim()) return
    const catInfo = DISH_CATEGORIES.find((c) => c.key === form.category)
    if (editingDish) {
      // Update existing
      const updated = catalog.map((d) =>
        d.id === editingDish.id
          ? {
              ...d,
              ...form,
              portionQty: Number(form.portionQty) || 50,
              categoryLabel: catInfo?.label || "",
              allergen: form.allergen.trim() || null,
              substituteFor: form.substituteFor.trim() || undefined,
            }
          : d
      )
      setCatalog(updated)
      try {
        localStorage.setItem("FOODPRINT_DISH_CATALOG", JSON.stringify(updated))
      } catch {}
    } else {
      // Add new via helper
      const newDish = {
        ...form,
        portionQty: Number(form.portionQty) || 50,
        categoryLabel: catInfo?.label || "",
        allergen: form.allergen.trim() || null,
        substituteFor: form.substituteFor.trim() || undefined,
        ingredientIds: [],
        ingredientNames: [],
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
      localStorage.setItem("FOODPRINT_DISH_CATALOG", JSON.stringify(updated))
    } catch {}
    setDeletingDish(null)
  }, [deletingDish, catalog])

  /* ─── Render ─────────────────────────────────── */
  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <div className={styles.titleIcon}>
            <BookOpen size={20} />
          </div>
          <div>
            <h1 className={styles.title}>Kho Món Ăn</h1>
            <p className={styles.subtitle}>Quản lý danh mục món ăn chuẩn cho thực đơn học đường</p>
          </div>
        </div>
        <button className={styles.addBtn} onClick={openAdd}>
          <Plus size={15} />
          Thêm món ăn
        </button>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>🍽️</span>
          <div>
            <div className={styles.statNum}>{stats.total}</div>
            <div className={styles.statLabel}>Tổng món ăn</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>🗂️</span>
          <div>
            <div className={styles.statNum}>{stats.catCount}</div>
            <div className={styles.statLabel}>Nhóm món</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>⚠️</span>
          <div>
            <div className={styles.statNum}>{stats.allergyCount}</div>
            <div className={styles.statLabel}>Có cảnh báo dị ứng</div>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <Search size={14} />
          <input
            className={styles.searchInput}
            placeholder="Tìm theo tên món, dị ứng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.catTabs}>
          {DISH_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              className={`${styles.catTab} ${activeCat === cat.key ? styles.active : ""}`}
              onClick={() => setActiveCat(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🍽️</div>
            <p>Không tìm thấy món ăn nào.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: 36 }}>#</th>
                <th>Tên món ăn</th>
                <th>Nhóm</th>
                <th>Bữa</th>
                <th>Định lượng / suất</th>
                <th>Dị ứng</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((dish, idx) => {
                const catStyle = CAT_STYLE[dish.category] || {}
                const mealStyle = MEAL_LABEL[dish.mealType] || MEAL_LABEL.LUNCH
                return (
                  <tr key={dish.id}>
                    <td style={{ color: "#bbb", fontSize: 12 }}>{idx + 1}</td>
                    <td>
                      <div className={styles.dishName}>{dish.name}</div>
                      {dish.description && (
                        <div className={styles.dishDesc}>
                          {dish.description.length > 70
                            ? dish.description.slice(0, 70) + "…"
                            : dish.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`${styles.catBadge} ${catStyle.cls || ""}`}>
                        {catStyle.emoji} {dish.categoryLabel || dish.category}
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
                    <td>
                      {dish.allergen ? (
                        <span className={styles.allergenBadge}>
                          <AlertCircle size={11} />
                          {dish.allergen}
                        </span>
                      ) : (
                        <span className={styles.noAllergen}>—</span>
                      )}
                    </td>
                    <td>
                      <div className={styles.actionBtns}>
                        <button
                          className={styles.editBtn}
                          title="Chỉnh sửa"
                          onClick={() => openEdit(dish)}
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          className={styles.deleteBtn}
                          title="Xóa"
                          onClick={() => setDeletingDish(dish)}
                        >
                          <Trash2 size={13} />
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

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingDish ? "Chỉnh sửa món ăn" : "Thêm món ăn mới"}
              </h2>
              <button className={styles.closeBtn} onClick={closeModal}>
                <X size={16} />
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
                    className={styles.formInput}
                    placeholder="Vd: Thịt ba chỉ rang cháy cạnh"
                    value={form.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                  />
                </div>

                {/* Nhóm */}
                <div>
                  <label className={styles.formLabel}>Nhóm món ăn</label>
                  <select
                    className={styles.formSelect}
                    value={form.category}
                    onChange={(e) => handleFormChange("category", e.target.value)}
                  >
                    {DISH_CATEGORIES.filter((c) => c.key !== "ALL").map((c) => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                </div>

                {/* Loại bữa */}
                <div>
                  <label className={styles.formLabel}>Loại bữa</label>
                  <select
                    className={styles.formSelect}
                    value={form.mealType}
                    onChange={(e) => handleFormChange("mealType", e.target.value)}
                  >
                    <option value="LUNCH">🌞 Bữa trưa</option>
                    <option value="AFTERNOON">🌙 Bữa xế</option>
                    <option value="BOTH">🌟 Cả hai bữa</option>
                  </select>
                </div>

                {/* Định lượng */}
                <div>
                  <label className={styles.formLabel}>
                    Định lượng / 1 suất <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.portionRow}>
                    <input
                      type="number"
                      min="1"
                      className={`${styles.formInput} ${styles.portionInput}`}
                      placeholder="Vd: 120"
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

                {/* Dị ứng */}
                <div>
                  <label className={styles.formLabel}>Cảnh báo dị ứng</label>
                  <input
                    className={styles.formInput}
                    placeholder="Để trống nếu không có"
                    value={form.allergen}
                    onChange={(e) => handleFormChange("allergen", e.target.value)}
                  />
                </div>

                {/* Thay thế cho */}
                {form.category === "ALLERGY_SUBSTITUTE" && (
                  <div className={styles.formFullRow}>
                    <label className={styles.formLabel}>Thay thế cho dị ứng</label>
                    <input
                      className={styles.formInput}
                      placeholder="Vd: Hải sản (Tôm, Cua, Mực)"
                      value={form.substituteFor}
                      onChange={(e) => handleFormChange("substituteFor", e.target.value)}
                    />
                  </div>
                )}

                {/* Mô tả */}
                <div className={styles.formFullRow}>
                  <label className={styles.formLabel}>Mô tả ngắn</label>
                  <textarea
                    className={styles.formTextarea}
                    placeholder="Thông tin dinh dưỡng, lưu ý chế biến..."
                    value={form.description}
                    onChange={(e) => handleFormChange("description", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={closeModal}>Hủy</button>
              <button
                className={styles.saveBtn}
                onClick={handleSave}
                disabled={!form.name.trim() || !form.portionQty}
              >
                {editingDish ? "Lưu thay đổi" : "Thêm vào kho"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {deletingDish && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmBox}>
            <div className={styles.confirmIcon}>🗑️</div>
            <h3 className={styles.confirmTitle}>Xóa món ăn?</h3>
            <p className={styles.confirmMsg}>
              Bạn có chắc muốn xóa <strong>"{deletingDish.name}"</strong> khỏi kho món ăn?
              <br />
              Thao tác này không thể hoàn tác.
            </p>
            <div className={styles.confirmActions}>
              <button className={styles.confirmCancel} onClick={() => setDeletingDish(null)}>
                Hủy
              </button>
              <button className={styles.confirmDelete} onClick={handleDeleteConfirm}>
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

