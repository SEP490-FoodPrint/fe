import React, { useEffect, useMemo, useRef, useState } from "react"
import PropTypes from "prop-types"
import { ChevronDown } from "lucide-react"
import styles from "./IngredientCascadeSelect.module.scss"

export const UNCATEGORIZED = "__uncategorized"
export const ingredientCategoryKey = ing => (ing?.categoryId ? String(ing.categoryId) : UNCATEGORIZED)

/** Nhóm nguyên liệu (cấp 1): nguyên liệu chưa có nhóm gom vào "Khác", xếp cuối. */
export function groupIngredientsByCategory(options = []) {
  const groups = new Map()
  for (const ing of options) {
    const id = ingredientCategoryKey(ing)
    if (!groups.has(id)) groups.set(id, { id, name: ing.categoryName || "Khác", items: [] })
    groups.get(id).items.push(ing)
  }
  return [...groups.values()].sort((a, b) =>
    a.id === UNCATEGORIZED ? 1 : b.id === UNCATEGORIZED ? -1 : a.name.localeCompare(b.name, "vi"),
  )
}

const optionLabel = ing => (ing.defaultUnit ? `${ing.name} (${ing.defaultUnit})` : ing.name)

/**
 * Ô chọn nguyên liệu lọc 2 cấp trong cùng một ô: bấm mở bảng gồm cột nhóm nguyên liệu (cấp 1)
 * và cột nguyên liệu của nhóm đang chọn (cấp 2). Bảng nổi theo vị trí ô (position: fixed)
 * để không bị khung danh sách cắt mất.
 */
export default function IngredientCascadeSelect({
  value = "",
  options = [],
  onChange,
  getDisabledReason,
  invalid = false,
  ariaLabel = "Nguyên liệu",
}) {
  const triggerRef = useRef(null)
  const panelRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState(null)
  const groups = useMemo(() => groupIngredientsByCategory(options), [options])
  const selected = options.find(ing => ing.id === value)
  const [activeGroup, setActiveGroup] = useState("")

  const openPanel = () => {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return
    const width = Math.min(520, window.innerWidth - 16)
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8))
    const spaceBelow = window.innerHeight - rect.bottom
    const height = Math.min(320, Math.max(spaceBelow, rect.top) - 12)
    const top = spaceBelow >= Math.min(height, 260) ? rect.bottom + 4 : rect.top - height - 4
    setPosition({ top, left, width, height })
    setActiveGroup(selected ? ingredientCategoryKey(selected) : groups[0]?.id || "")
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return undefined
    const close = event => {
      if (event.type === "keydown" && event.key !== "Escape") return
      if (event.type === "mousedown" && (panelRef.current?.contains(event.target) || triggerRef.current?.contains(event.target))) return
      setOpen(false)
      if (event.type === "keydown") triggerRef.current?.focus()
    }
    const closeOnMove = event => {
      if (panelRef.current?.contains(event.target)) return
      setOpen(false)
    }
    document.addEventListener("mousedown", close)
    document.addEventListener("keydown", close)
    window.addEventListener("resize", closeOnMove)
    window.addEventListener("scroll", closeOnMove, true)
    return () => {
      document.removeEventListener("mousedown", close)
      document.removeEventListener("keydown", close)
      window.removeEventListener("resize", closeOnMove)
      window.removeEventListener("scroll", closeOnMove, true)
    }
  }, [open])

  const items = groups.find(group => group.id === activeGroup)?.items || []

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.trigger} ${invalid ? styles.invalid : ""} ${selected ? "" : styles.placeholder}`}
        onClick={() => (open ? setOpen(false) : openPanel())}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        aria-invalid={invalid}
      >
        <span className={styles.triggerText}>{selected ? optionLabel(selected) : "-- Chọn nguyên liệu * --"}</span>
        <ChevronDown size={18} className={styles.chevron} aria-hidden="true" />
      </button>

      {open && position && (
        <div
          ref={panelRef}
          className={styles.panel}
          style={{ top: position.top, left: position.left, width: position.width, height: position.height }}
          role="dialog"
          aria-label={`${ariaLabel}: chọn nhóm rồi chọn nguyên liệu`}
        >
          <div className={styles.column} role="listbox" aria-label="Nhóm nguyên liệu">
            <div className={styles.columnTitle}>Nhóm nguyên liệu</div>
            {groups.length === 0 && <div className={styles.empty}>Chưa có nguyên liệu</div>}
            {groups.map(group => (
              <button
                key={group.id}
                type="button"
                role="option"
                aria-selected={group.id === activeGroup}
                className={`${styles.groupItem} ${group.id === activeGroup ? styles.groupActive : ""}`}
                onClick={() => setActiveGroup(group.id)}
              >
                <span>{group.name}</span>
                <span className={styles.count}>{group.items.length}</span>
              </button>
            ))}
          </div>
          <div className={styles.column} role="listbox" aria-label="Nguyên liệu">
            <div className={styles.columnTitle}>Nguyên liệu</div>
            {items.length === 0 && <div className={styles.empty}>Chọn nhóm bên trái</div>}
            {items.map(ing => {
              const reason = getDisabledReason?.(ing) || ""
              return (
                <button
                  key={ing.id}
                  type="button"
                  role="option"
                  aria-selected={ing.id === value}
                  disabled={Boolean(reason)}
                  className={`${styles.option} ${ing.id === value ? styles.optionSelected : ""}`}
                  onClick={() => {
                    onChange?.(ing.id)
                    setOpen(false)
                    triggerRef.current?.focus()
                  }}
                >
                  <span>{optionLabel(ing)}</span>
                  {reason && <span className={styles.reason}>{reason}</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}

IngredientCascadeSelect.propTypes = {
  value: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.object),
  onChange: PropTypes.func,
  getDisabledReason: PropTypes.func,
  invalid: PropTypes.bool,
  ariaLabel: PropTypes.string,
}
