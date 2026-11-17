import React from "react"
import PropTypes from "prop-types"
import { CircularProgress, TextField } from "@mui/material"
import { ChevronRight, Utensils } from "lucide-react"
import styles from "./MealPicker.module.scss"

/** Day picker plus the grade meals of that day, as tappable rows. */
export default function MealPicker({ date, meals, loading, error, selectedId, onDateChange, onSelect }) {
  const showSchool = new Set(meals.map(meal => meal.schoolName)).size > 1

  return (
    <aside className={styles.picker} aria-label="Chọn bữa ăn cần truy xuất">
      <TextField
        type="date"
        size="small"
        label="Ngày ăn"
        value={date}
        onChange={event => event.target.value && onDateChange(event.target.value)}
        slotProps={{ inputLabel: { shrink: true } }}
        fullWidth
      />

      <div className={styles.listHeader}>
        <span>Bữa ăn trong ngày</span>
        {!loading && !error && <span className={styles.count}>{meals.length}</span>}
      </div>

      {loading && (
        <div className={styles.state}><CircularProgress size={20} /></div>
      )}
      {!loading && error && <p className={`${styles.state} ${styles.error}`} role="alert">{error}</p>}
      {!loading && !error && !meals.length && (
        <p className={styles.state}>Ngày này chưa có khối nào được phân bổ suất ăn.</p>
      )}

      {!loading && !error && meals.length > 0 && (
        <ul className={styles.list}>
          {meals.map(meal => (
            <li key={`${meal.schoolName}-${meal.key}`}>
              <button
                type="button"
                className={`${styles.item} ${meal.key === selectedId ? styles.active : ""}`}
                aria-pressed={meal.key === selectedId}
                onClick={() => onSelect(meal.key)}
              >
                <span className={styles.itemIcon}><Utensils size={16} aria-hidden /></span>
                <span className={styles.itemBody}>
                  <span className={styles.itemTitle}>{meal.gradeLabel}</span>
                  <span className={styles.itemMeta}>
                    {[meal.mealLabel, meal.classCount && `${meal.classCount} lớp`, meal.portions !== null && `${meal.portions} suất`, showSchool && meal.schoolName]
                      .filter(Boolean).join(" · ")}
                  </span>
                </span>
                <span className={`${styles.status} ${styles[`status${meal.status}`] || ""}`}>{meal.statusLabel}</span>
                <ChevronRight size={16} className={styles.chevron} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}

MealPicker.propTypes = {
  date: PropTypes.string.isRequired,
  meals: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
  selectedId: PropTypes.string,
  onDateChange: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
}
