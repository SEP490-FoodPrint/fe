import React, { useState } from "react"
import PropTypes from "prop-types"
import { X, Layers } from "lucide-react"
import { createDishCategory, updateDishCategory, deleteDishCategory } from "src/services/DishService"
import styles from "./DishCategoryModal.module.scss"

export default function DishCategoryModal({ isOpen, onClose, categories, dishCounts, onChanged }) {
  const [name, setName] = useState("")
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  if (!isOpen) return null

  const close = () => {
    if (busy) return
    setName(""); setEditing(null); setSearch(""); setError(""); onClose()
  }
  const save = async event => {
    event.preventDefault()
    const value = name.trim()
    if (!value) { setError("Vui lòng nhập tên nhóm món."); return }
    setBusy(true); setError("")
    try {
      if (editing) await updateDishCategory(editing.key, value)
      else await createDishCategory(value)
      setName(""); setEditing(null)
      await onChanged()
    } catch (err) { setError(err.message || "Không thể lưu nhóm món.") }
    finally { setBusy(false) }
  }
  const remove = async category => {
    if (!window.confirm(`Xóa nhóm “${category.label}”?`)) return
    setBusy(true); setError("")
    try {
      await deleteDishCategory(category.key)
      if (editing?.key === category.key) { setEditing(null); setName("") }
      await onChanged()
    } catch (err) { setError(err.message || "Không thể xóa nhóm món.") }
    finally { setBusy(false) }
  }
  const filtered = categories.filter(category => category.label.toLocaleLowerCase("vi").includes(search.trim().toLocaleLowerCase("vi")))
  return <div className={styles.modalOverlay} onClick={event => { if (event.target === event.currentTarget) close() }}>
    <section className={styles.modalContent} role="dialog" aria-modal="true" aria-labelledby="dish-category-title">
      <header className={styles.modalHeader}>
        <div className={styles.headerTitleBlock}>
          <h2 id="dish-category-title" className={styles.modalTitle}><Layers size={20} /> Danh sách nhóm món ăn</h2>
          <p className={styles.modalSubtitle}>Quản lý nhóm món của trường</p>
        </div>
        <button className={styles.closeBtn} type="button" onClick={close} disabled={busy} aria-label="Đóng"><X size={20}/></button>
      </header>
      <div className={styles.modalBody}>
        <form className={styles.categoryForm} onSubmit={save}>
          <label htmlFor="dish-category-name">Tên nhóm món</label>
          <input id="dish-category-name" value={name} onChange={event => setName(event.target.value)} maxLength={255} disabled={busy} placeholder="Nhập tên nhóm món" />
          <button type="submit" disabled={busy}>{editing ? "Lưu thay đổi" : "Thêm nhóm"}</button>
          {editing && <button type="button" disabled={busy} onClick={() => { setEditing(null); setName(""); setError("") }}>Hủy sửa</button>}
        </form>
        {error && <p role="alert" className={styles.error}>{error}</p>}
        <input className={styles.listSearch} aria-label="Tìm nhóm món" placeholder="Tìm tên nhóm món" value={search} onChange={event => setSearch(event.target.value)} />
        <div className={styles.tableWrap}><table className={styles.categoryTable}>
          <thead><tr><th>Tên nhóm món</th><th>Số món</th><th>Thao tác</th></tr></thead>
          <tbody>{filtered.length ? filtered.map(category => <tr key={category.key}>
            <td>{category.label}</td><td>{dishCounts[category.key] || 0}</td>
            <td><div className={styles.rowActions}>
              <button type="button" disabled={busy} onClick={() => { setEditing(category); setName(category.label); setError("") }}>Sửa</button>
              <button type="button" disabled={busy} onClick={() => remove(category)}>Xóa</button>
            </div></td>
          </tr>) : <tr><td colSpan={3} className={styles.emptyRow}>Không có nhóm món phù hợp.</td></tr>}</tbody>
        </table></div>
      </div>
      <footer className={styles.modalFooter}><span className={styles.footerInfo}>{categories.length} nhóm món</span><button type="button" className={styles.closeFooterBtn} onClick={close} disabled={busy}>Đóng</button></footer>
    </section>
  </div>
}
DishCategoryModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onChanged: PropTypes.func.isRequired,
  categories: PropTypes.array.isRequired,
  dishCounts: PropTypes.object.isRequired,
}
