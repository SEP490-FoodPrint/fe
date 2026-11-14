import React, { useState } from "react"
import PropTypes from "prop-types"
import { X, Layers, Pencil, Trash2, Plus, Check, Search } from "lucide-react"
import {
  createDishCategory,
  updateDishCategory,
  deleteDishCategory,
} from "src/services/DishService"
import styles from "./DishCategoryModal.module.scss"

export default function DishCategoryModal({
  isOpen,
  onClose,
  categories,
  dishCounts,
  onChanged,
}) {
  const [name, setName] = useState("")
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  if (!isOpen) return null

  const close = () => {
    if (busy) return
    setName("")
    setEditing(null)
    setSearch("")
    setError("")
    onClose()
  }

  const save = async (event) => {
    event.preventDefault()
    const value = name.trim()
    if (!value) {
      setError("Vui lòng nhập tên nhóm món.")
      return
    }
    setBusy(true)
    setError("")
    try {
      if (editing) await updateDishCategory(editing.key, value)
      else await createDishCategory(value)
      setName("")
      setEditing(null)
      await onChanged()
    } catch (err) {
      setError(err.message || "Không thể lưu nhóm món.")
    } finally {
      setBusy(false)
    }
  }

  const remove = async (category) => {
    if (!window.confirm(`Xóa nhóm “${category.label}”?`)) return
    setBusy(true)
    setError("")
    try {
      await deleteDishCategory(category.key)
      if (editing?.key === category.key) {
        setEditing(null)
        setName("")
      }
      await onChanged()
    } catch (err) {
      setError(err.message || "Không thể xóa nhóm món.")
    } finally {
      setBusy(false)
    }
  }

  const filtered = categories.filter((category) =>
    category.label
      .toLocaleLowerCase("vi")
      .includes(search.trim().toLocaleLowerCase("vi"))
  )

  return (
    <div
      className={styles.modalOverlay}
      onClick={(event) => {
        if (event.target === event.currentTarget) close()
      }}
    >
      <section
        className={styles.modalContent}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dish-category-title"
      >
        <header className={styles.modalHeader}>
          <div className={styles.headerTitleBlock}>
            <div className={styles.headerIconWrap}>
              <Layers size={18} />
            </div>
            <div>
              <h2 id="dish-category-title" className={styles.modalTitle}>
                Danh sách nhóm món ăn
              </h2>
              <p className={styles.modalSubtitle}>
                Quản lý các nhóm phân loại món ăn quy chuẩn của trường
              </p>
            </div>
          </div>
          <button
            className={styles.closeBtn}
            type="button"
            onClick={close}
            disabled={busy}
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </header>

        <div className={styles.modalBody}>
          <form className={styles.categoryForm} onSubmit={save}>
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label
                  htmlFor="dish-category-name"
                  className={styles.inputLabel}
                >
                  {editing
                    ? `Chỉnh sửa nhóm món: “${editing.label}”`
                    : "Thêm nhóm món mới"}
                </label>
                <input
                  id="dish-category-name"
                  className={styles.nameInput}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={255}
                  disabled={busy}
                  placeholder="Nhập tên nhóm món (ví dụ: Món xào, Món canh...)"
                />
              </div>
              <div className={styles.formButtons}>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={busy}
                >
                  {editing ? (
                    <>
                      <Check size={16} /> Lưu thay đổi
                    </>
                  ) : (
                    <>
                      <Plus size={16} /> Thêm nhóm
                    </>
                  )}
                </button>
                {editing && (
                  <button
                    type="button"
                    className={styles.cancelEditBtn}
                    disabled={busy}
                    onClick={() => {
                      setEditing(null)
                      setName("")
                      setError("")
                    }}
                  >
                    Hủy sửa
                  </button>
                )}
              </div>
            </div>
          </form>

          {error && (
            <p role="alert" className={styles.errorAlert}>
              {error}
            </p>
          )}

          <div className={styles.toolbar}>
            <div className={styles.searchWrap}>
              <Search size={15} className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                aria-label="Tìm nhóm món"
                placeholder="Tìm kiếm nhóm món ăn..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <span className={styles.categoryCountBadge}>
              Hiển thị: <strong>{filtered.length}</strong> / {categories.length}{" "}
              nhóm
            </span>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.categoryTable}>
              <thead>
                <tr>
                  <th className={styles.colIdx}>#</th>
                  <th>Tên nhóm món</th>
                  <th className={styles.colCount}>Số món</th>
                  <th className={styles.colActions}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length ? (
                  filtered.map((category, idx) => {
                    const isRowEditing = editing?.key === category.key
                    const count = dishCounts[category.key] || 0
                    return (
                      <tr
                        key={category.key}
                        className={isRowEditing ? styles.rowEditing : ""}
                      >
                        <td className={styles.colIdx}>{idx + 1}</td>
                        <td className={styles.colName}>
                          <span className={styles.categoryNameText}>
                            {category.label}
                          </span>
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
                          <div className={styles.rowActions}>
                            <button
                              type="button"
                              className={styles.actionBtn}
                              disabled={busy}
                              onClick={() => {
                                setEditing(category)
                                setName(category.label)
                                setError("")
                              }}
                              title="Chỉnh sửa nhóm món"
                              aria-label={`Chỉnh sửa ${category.label}`}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              className={styles.actionBtn}
                              disabled={busy}
                              onClick={() => remove(category)}
                              title="Xóa nhóm món"
                              aria-label={`Xóa ${category.label}`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className={styles.emptyRow}>
                      Không tìm thấy nhóm món ăn phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <footer className={styles.modalFooter}>
          <span className={styles.footerInfo}>
            Tổng cộng: <strong>{categories.length}</strong> nhóm món quy chuẩn
          </span>
          <button
            type="button"
            className={styles.closeFooterBtn}
            onClick={close}
            disabled={busy}
          >
            Đóng
          </button>
        </footer>
      </section>
    </div>
  )
}

DishCategoryModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onChanged: PropTypes.func.isRequired,
  categories: PropTypes.array.isRequired,
  dishCounts: PropTypes.object.isRequired,
}
