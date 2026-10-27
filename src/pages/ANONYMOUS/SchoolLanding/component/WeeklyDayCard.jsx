import React from "react"
import PropTypes from "prop-types"
import { ArrowDown, ArrowRight } from "lucide-react"
import styles from "./WeeklyDayCard.module.scss"

function WeeklyDayCard({ day }) {
  if (!day) return null

  const {
    day_of_week,
    date,
    is_today,
    status_label,
    lunch_dishes = [],
    snack_summary,
    calories,
    protein_g,
    fat_g,
  } = day

  return (
    <div className={`${styles.card} ${is_today ? styles.todayCard : ""}`}>
      <div className={styles.topSection}>
        {/* Day Header */}
        <div className={styles.dayHeader}>
          <div>
            <span className={`${styles.dayTitle} ${is_today ? styles.todayText : ""}`}>
              {day_of_week}
            </span>
            <span className={`${styles.dateText} ${is_today ? styles.todayText : ""}`}>
              {date}
            </span>
          </div>

          <span
            className={`${styles.statusBadge} ${
              is_today
                ? styles.todayBadge
                : day.status === "SERVED"
                ? styles.servedBadge
                : styles.upcomingBadge
            }`}
          >
            {status_label || (is_today ? "Hôm nay" : "Sắp diễn ra")}
          </span>
        </div>

        {/* Lunch Dishes */}
        <div className={styles.mealBlock}>
          <span className={styles.blockTitle}>Bữa trưa chính</span>
          <ul className={styles.dishList}>
            {lunch_dishes.map((dish, i) => (
              <li key={i} className={styles.dishItem}>
                <span className={styles.bullet}>•</span>
                <span className={styles.dishText}>{dish}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Snack */}
        <div className={styles.snackBlock}>
          <span className={styles.snackTitle}>Bữa xế chiều</span>
          <p className={styles.snackDesc}>{snack_summary}</p>
        </div>
      </div>

      {/* Bottom Nutrition & Link */}
      <div className={styles.bottomSection}>
        <div className={styles.nutritionRow}>
          <span className={styles.calories}>{calories} kcal</span>
          <span className={styles.macros}>
            Đạm {protein_g}g · Béo {fat_g}g
          </span>
        </div>

        {is_today ? (
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
    day_of_week: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    is_today: PropTypes.bool,
    status: PropTypes.string,
    status_label: PropTypes.string,
    lunch_dishes: PropTypes.array,
    snack_summary: PropTypes.string,
    calories: PropTypes.number,
    protein_g: PropTypes.number,
    fat_g: PropTypes.number,
  }).isRequired,
}

export default WeeklyDayCard
