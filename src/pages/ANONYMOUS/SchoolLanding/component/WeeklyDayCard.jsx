import React from "react"
import PropTypes from "prop-types"
import { ArrowDown, ArrowRight } from "lucide-react"
import styles from "./WeeklyDayCard.module.scss"

function WeeklyDayCard({ day }) {
  if (!day) return null

  const dayOfWeek = day.dayOfWeek || day.day_of_week || ""
  const date = day.date || ""
  const isToday = day.isToday !== undefined ? day.isToday : Boolean(day.is_today)
  const statusLabel = day.statusLabel || day.status_label || (isToday ? "Hôm nay" : "Sắp diễn ra")
  const lunchDishes = day.lunchDishes || day.lunch_dishes || []
  const snackSummary = day.snackSummary || day.snack_summary || "Bữa phụ dinh dưỡng học đường"
  const calories = day.calories || 680
  const proteinG = day.proteinG !== undefined ? day.proteinG : day.protein_g || 24
  const fatG = day.fatG !== undefined ? day.fatG : day.fat_g || 18

  return (
    <div className={`${styles.card} ${isToday ? styles.todayCard : ""}`}>
      <div className={styles.topSection}>
        {/* Day Header */}
        <div className={styles.dayHeader}>
          <div>
            <span className={`${styles.dayTitle} ${isToday ? styles.todayText : ""}`}>
              {dayOfWeek}
            </span>
            <span className={`${styles.dateText} ${isToday ? styles.todayText : ""}`}>
              {date}
            </span>
          </div>

          <span
            className={`${styles.statusBadge} ${
              isToday
                ? styles.todayBadge
                : day.status === "SERVED"
                ? styles.servedBadge
                : styles.upcomingBadge
            }`}
          >
            {statusLabel}
          </span>
        </div>

        {/* Lunch Dishes */}
        <div className={styles.mealBlock}>
          <span className={styles.blockTitle}>Bữa trưa chính</span>
          <ul className={styles.dishList}>
            {lunchDishes.map((dish, i) => (
              <li key={i} className={styles.dishItem}>
                <span className={styles.bullet}>•</span>
                <span className={styles.dishText}>
                  {typeof dish === "string" ? dish : dish.name}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Snack */}
        <div className={styles.snackBlock}>
          <span className={styles.snackTitle}>Bữa xế chiều</span>
          <p className={styles.snackDesc}>{snackSummary}</p>
        </div>
      </div>

      {/* Bottom Nutrition & Link */}
      <div className={styles.bottomSection}>
        <div className={styles.nutritionRow}>
          <span className={styles.calories}>{calories} kcal</span>
          <span className={styles.macros}>
            Đạm {proteinG}g · Béo {fatG}g
          </span>
        </div>

        {isToday ? (
          <a href="#thuc-don-ngay" className={styles.todayActionLink}>
            <span>Đang phục vụ hôm nay</span>
            <ArrowDown size={14} />
          </a>
        ) : (
          <a href="#thuc-don-ngay" className={styles.viewDetailLink}>
            <span>Xem chi tiết suất ăn</span>
            <ArrowRight size={14} />
          </a>
        )}
      </div>
    </div>
  )
}

WeeklyDayCard.propTypes = {
  day: PropTypes.shape({
    dayOfWeek: PropTypes.string,
    day_of_week: PropTypes.string,
    date: PropTypes.string,
    isToday: PropTypes.bool,
    is_today: PropTypes.bool,
    status: PropTypes.string,
    statusLabel: PropTypes.string,
    status_label: PropTypes.string,
    lunchDishes: PropTypes.array,
    lunch_dishes: PropTypes.array,
    snackSummary: PropTypes.string,
    snack_summary: PropTypes.string,
    calories: PropTypes.number,
    proteinG: PropTypes.number,
    protein_g: PropTypes.number,
    fatG: PropTypes.number,
    fat_g: PropTypes.number,
  }),
}

export default WeeklyDayCard
