import React, { useMemo } from "react"
import PropTypes from "prop-types"
import dayjs from "dayjs"
import styles from "./RecentDays.module.scss"

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]
const MEALS = [
  { type: "LUNCH", label: "Trưa" },
  { type: "AFTERNOON", label: "Xế" },
]

/** Earlier days at a glance, newest first. Read only: a day can only be declared on that day. */
export default function RecentDays({ items, today, limit = 10 }) {
  const days = useMemo(() => {
    const map = new Map()
    for (const item of items) {
      const date = dayjs(item.mealDate).format("YYYY-MM-DD")
      if (date >= today) continue
      if (!map.has(date)) map.set(date, {})
      map.get(date)[item.mealType] = item
    }
    return [...map.entries()].sort(([a], [b]) => b.localeCompare(a)).slice(0, limit)
  }, [items, today, limit])

  return (
    <section className={styles.section} aria-labelledby="recent-days-title">
      <h2 id="recent-days-title" className={styles.title}>Các ngày trước</h2>
      {!days.length && <p className={styles.empty}>Chưa có ngày nào được báo suất ăn.</p>}
      {days.length > 0 && (
        <ul className={styles.list}>
          {days.map(([date, meals]) => (
            <li key={date} className={styles.row}>
              <span className={styles.date}>
                <strong>{WEEKDAYS[dayjs(date).day()]}</strong> {dayjs(date).format("DD/MM")}
              </span>
              {MEALS.map(meal => {
                const item = meals[meal.type]
                const tone = !item ? "none" : item.status === "FINALIZED" ? "done" : "draft"
                return (
                  <span key={meal.type} className={`${styles.meal} ${styles[tone]}`}
                    title={!item ? "Không báo" : item.status === "FINALIZED" ? "Đã gửi bếp" : "Chưa gửi bếp (bản nháp)"}>
                    {meal.label} <b>{item ? item.totalPortions : "–"}</b>
                  </span>
                )
              })}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

RecentDays.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  today: PropTypes.string.isRequired,
  limit: PropTypes.number,
}
