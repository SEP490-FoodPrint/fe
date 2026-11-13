import React, { useState, useMemo } from "react"
import {
  X,
  Plus,
  Pencil,
  Trash2,
  Search,
  RotateCcw,
  AlertTriangle,
  Layers,
  Check,
} from "lucide-react"
import styles from "./DishCategoryModal.module.scss"

export const CATEGORY_COLORS = {
  amber: { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b", hex: "#f59e0b" },
  rose: { bg: "#ffe4e6", text: "#9f1239", dot: "#f43f5e", hex: "#f43f5e" },
  green: { bg: "#dcfce7", text: "#166534", dot: "#22c55e", hex: "#22c55e" },
  blue: { bg: "#dbeafe", text: "#1e40af", dot: "#3b82f6", hex: "#3b82f6" },
  purple: { bg: "#f3e8ff", text: "#6b21a8", dot: "#a855f7", hex: "#a855f7" },
  orange: { bg: "#ffedd5", text: "#9a3412", dot: "#f97316", hex: "#f97316" },
  slate: { bg: "#f1f5f9", text: "#334155", dot: "#64748b", hex: "#64748b" },
}

export const DEFAULT_DISH_CATEGORIES = [
  {
    key: "RICE_STARCH",
    label: "Cơm / Tinh bột",
    description: "Cung cấp năng lượng chính, glucid và tinh bột cho học sinh",
    color: "amber",
  },
  {
    key: "MAIN_DISH",
    label: "Món mặn chính",
    description: "Cung cấp chất đạm (protein), sắt, kẽm từ thịt, cá, trứng, tôm",
    color: "rose",
  },
  {
    key: "VEGETABLE",
    label: "Món rau / xào",
    description: "Cung cấp chất xơ, vitamin A, C và khoáng chất thiết yếu",
    color: "green",
  },
  {
    key: "SOUP",
    label: "Món canh",
    description: "Bổ sung nước, điện giải và vi chất dinh dưỡng dễ tiêu hóa",
    color: "blue",
  },
  {
    key: "DESSERT",
    label: "Món phụ / Tráng miệng",
    description: "Trái cây tươi, sữa chua, sữa hạt bổ sung canxi và lợi khuẩn",
    color: "purple",
  },
]

function generateSlug(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
}

export default function DishCategoryModal({
  isOpen,
  onClose,
  categories = [],
  onSaveCategories,
  dishCounts = {},
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingKey, setEditingKey] = useState(null)
  const [formValues, setFormValues] = useState({
    key: "",
    label: "",
    description: "",
    color: "green",
  })
  const [formError, setFormError] = useState("")
  const [deleteTarget, setDeleteTarget] = useState(null)

  // Lọc theo từ khóa tìm kiếm
  const filteredCategories = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return categories
    return categories.filter(
      (c) =>
        c.label.toLowerCase().includes(term) ||
        c.key.toLowerCase().includes(term) ||
        (c.description && c.description.toLowerCase().includes(term))
    )
  }, [categories, searchTerm])

  if (!isOpen) return null

  const handleOpenAdd = () => {
    setEditingKey(null)
    setFormValues({
      key: "",
      label: "",
      description: "",
      color: "green",
    })
    setFormError("")
    setIsFormOpen(true)
  }

  const handleOpenEdit = (cat) => {
    setEditingKey(cat.key)
    setFormValues({
      key: cat.key,
      label: cat.label,
      description: cat.description || "",
      color: cat.color || "slate",
    })
    setFormError("")
    setIsFormOpen(true)
  }

  const handleCancelForm = () => {
    setIsFormOpen(false)
    setEditingKey(null)
    setFormError("")
  }

  const handleSaveForm = (e) => {
    e.preventDefault()
    const trimmedLabel = formValues.label.trim()
    if (!trimmedLabel) {
      setFormError("Vui lòng nhập tên nhóm món ăn")
      return
    }

    let catKey = formValues.key.trim().toUpperCase()
    if (!catKey) {
      catKey = generateSlug(trimmedLabel)
    }
    if (!catKey) {
      setFormError("Vui lòng nhập mã nhóm hợp lệ")
      return
    }

    // Kiểm tra trùng mã
    const duplicate = categories.find(
      (c) => c.key === catKey && c.key !== editingKey
    )
    if (duplicate) {
      setFormError(`Mã nhóm "${catKey}" đã tồn tại cho nhóm "${duplicate.label}"`)
      return
    }

    let updated
    if (editingKey) {
      // Update
      updated = categories.map((c) =>
        c.key === editingKey
          ? {
              ...c,
              label: trimmedLabel,
              description: formValues.description.trim(),
              color: formValues.color,
            }
          : c
      )
    } else {
      // Create
      const newCat = {
        key: catKey,
        label: trimmedLabel,
        description: formValues.description.trim(),
        color: formValues.color,
      }
      updated = [...categories, newCat]
    }

    onSaveCategories(updated)
    setIsFormOpen(false)
    setEditingKey(null)
    setFormError("")
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    const updated = categories.filter((c) => c.key !== deleteTarget.key)
    onSaveCategories(updated, deleteTarget.key)
    setDeleteTarget(null)
  }

  const handleResetDefaults = () => {
    if (
      window.confirm(
        "Bạn có chắc muốn khôi phục danh mục 5 nhóm món ăn dinh dưỡng chuẩn ban đầu không?"
      )
    ) {
      onSaveCategories(DEFAULT_DISH_CATEGORIES)
      setIsFormOpen(false)
      setEditingKey(null)
    }
  }

  return (
    <div
      className={styles.modalOverlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.modalContent}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleBlock}>
            <h2 className={styles.modalTitle}>
              <Layers size={20} color="#0a8066" />
              <span>Danh Sách Nhóm Món Ăn</span>
            </h2>
            <p className={styles.modalSubtitle}>
              Quản lý phân loại dinh dưỡng, nhóm thực đơn cho toàn bộ món ăn bán trú
            </p>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          {/* Toolbar */}
          <div className={styles.toolbar}>
            <div className={styles.searchWrap}>
              <Search size={15} className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Tìm tên hoặc mã nhóm món..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className={styles.toolbarActions}>
              <button
                type="button"
                className={styles.resetBtn}
                onClick={handleResetDefaults}
                title="Khôi phục 5 nhóm món chuẩn"
              >
                <RotateCcw size={14} />
                <span>Mặc định</span>
              </button>
              <button
                type="button"
                className={styles.addCategoryBtn}
                onClick={handleOpenAdd}
              >
                <Plus size={15} />
                <span>Thêm nhóm món mới</span>
              </button>
            </div>
          </div>

          {/* Form thêm / chỉnh sửa */}
          {isFormOpen && (
            <form className={styles.formCard} onSubmit={handleSaveForm}>
              <div className={styles.formCardHeader}>
                <h3 className={styles.formCardTitle}>
                  {editingKey ? "Chỉnh sửa nhóm món ăn" : "Thêm nhóm món ăn mới"}
                </h3>
                <button
                  type="button"
                  className={styles.closeBtn}
                  onClick={handleCancelForm}
                >
                  <X size={16} />
                </button>
              </div>

              {formError && (
                <div style={{ color: "#dc2626", fontSize: "12px", fontWeight: 500 }}>
                  * {formError}
                </div>
              )}

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Tên nhóm món ăn <span className={styles.reqStar}>*</span>
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="VD: Cơm / Tinh bột, Món xào..."
                    value={formValues.label}
                    onChange={(e) => {
                      const val = e.target.value
                      setFormValues((prev) => ({
                        ...prev,
                        label: val,
                        key: !editingKey && !prev.key ? generateSlug(val) : prev.key,
                      }))
                    }}
                    autoFocus
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Mã định danh (Key) <span className={styles.reqStar}>*</span>
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="VD: RICE_STARCH, STIR_FRY..."
                    value={formValues.key}
                    disabled={!!editingKey}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        key: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ""),
                      }))
                    }
                  />
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.label}>Mô tả / Giá trị dinh dưỡng</label>
                  <textarea
                    className={styles.textarea}
                    placeholder="VD: Bổ sung chất đạm, tinh bột, năng lượng cho ca trưa..."
                    rows={2}
                    value={formValues.description}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.label}>Màu sắc hiển thị</label>
                  <div className={styles.colorPickerRow}>
                    {Object.entries(CATEGORY_COLORS).map(([colorKey, cObj]) => (
                      <div
                        key={colorKey}
                        className={`${styles.colorDot} ${
                          formValues.color === colorKey ? styles.activeColor : ""
                        }`}
                        style={{ backgroundColor: cObj.hex }}
                        onClick={() =>
                          setFormValues((prev) => ({ ...prev, color: colorKey }))
                        }
                        title={colorKey}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelFormBtn}
                  onClick={handleCancelForm}
                >
                  Hủy
                </button>
                <button type="submit" className={styles.saveFormBtn}>
                  {editingKey ? "Lưu thay đổi" : "Tạo nhóm món"}
                </button>
              </div>
            </form>
          )}

          {/* Bảng danh sách nhóm món */}
          <div className={styles.tableWrap}>
            <table className={styles.categoryTable}>
              <thead>
                <tr>
                  <th className={styles.colIdx}>STT</th>
                  <th className={styles.colName}>Tên nhóm món</th>
                  <th>Mã định danh</th>
                  <th>Mô tả dinh dưỡng</th>
                  <th className={styles.colCount}>Số món</th>
                  <th className={styles.colActions}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={styles.emptyRow}>
                      Không tìm thấy nhóm món ăn nào phù hợp với từ khóa.
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat, idx) => {
                    const colorStyle =
                      CATEGORY_COLORS[cat.color] ||
                      CATEGORY_COLORS.slate
                    const count = dishCounts[cat.key] || 0

                    return (
                      <tr key={cat.key}>
                        <td className={styles.colIdx}>{idx + 1}</td>
                        <td className={styles.colName}>
                          <span
                            className={styles.badge}
                            style={{
                              backgroundColor: colorStyle.bg,
                              color: colorStyle.text,
                            }}
                          >
                            <span
                              className={styles.badgeDot}
                              style={{ backgroundColor: colorStyle.dot }}
                            />
                            {cat.label}
                          </span>
                        </td>
                        <td>
                          <span className={styles.colKey}>{cat.key}</span>
                        </td>
                        <td>
                          <div className={styles.colDesc}>
                            {cat.description || "—"}
                          </div>
                        </td>
                        <td className={styles.colCount}>
                          <span
                            className={`${styles.dishCountBadge} ${
                              count > 0 ? styles.hasDishes : ""
                            }`}
                          >
                            {count} món
                          </span>
                        </td>
                        <td className={styles.colActions}>
                          <div className={styles.actionBtns}>
                            <button
                              type="button"
                              className={styles.actionBtn}
                              title="Chỉnh sửa nhóm"
                              onClick={() => handleOpenEdit(cat)}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              className={`${styles.actionBtn} ${styles.deleteBtn}`}
                              title="Xóa nhóm"
                              onClick={() =>
                                setDeleteTarget({
                                  key: cat.key,
                                  label: cat.label,
                                  count,
                                })
                              }
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteTarget && (
          <div className={styles.deleteConfirmOverlay}>
            <div className={styles.deleteConfirmCard}>
              <div className={styles.deleteHeader}>
                <div className={styles.deleteIconWrap}>
                  <AlertTriangle size={20} />
                </div>
                <h3 className={styles.deleteTitle}>Xác nhận xóa nhóm món ăn</h3>
              </div>
              <p className={styles.deleteMsg}>
                Bạn có chắc chắn muốn xóa nhóm món ăn{" "}
                <strong>"{deleteTarget.label}"</strong> ({deleteTarget.key}) không?
              </p>
              {deleteTarget.count > 0 && (
                <div className={styles.deleteWarning}>
                  ⚠️ Nhóm này hiện đang có <strong>{deleteTarget.count} món ăn</strong>.
                  Sau khi xóa, các món này sẽ tự động chuyển sang trạng thái{" "}
                  <strong>"Chưa phân nhóm"</strong>.
                </div>
              )}
              <div className={styles.deleteActions}>
                <button
                  type="button"
                  className={styles.cancelDeleteBtn}
                  onClick={() => setDeleteTarget(null)}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  className={styles.confirmDeleteBtn}
                  onClick={handleConfirmDelete}
                >
                  Xóa nhóm món
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className={styles.modalFooter}>
          <span className={styles.footerInfo}>
            Tổng cộng <strong>{categories.length}</strong> nhóm món ăn được cấu hình
          </span>
          <button
            type="button"
            className={styles.closeFooterBtn}
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
