import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { NO_DATA_TEXT } from "src/constants/ui";
import styles from "./WeeklyDayCard.module.scss";

function WeeklyDayCard({ day, schoolCode }) {
  if (!day) return null;

  const dayOfWeek = day.dayOfWeek || NO_DATA_TEXT;
  const date = day.date || "";
  const isToday = Boolean(day.isToday);
  const statusLabel = day.statusLabel || (isToday ? "Hôm nay" : "Sắp diễn ra");
  const lunchDishes = day.lunchDishes || [];
  const snackSummary = day.snackSummary || NO_DATA_TEXT;

  const detailTarget = schoolCode
    ? `/school/${schoolCode}/daily-menu${day.dateIso ? `?date=${day.dateIso}` : ""}`
    : "#thuc-don-ngay";

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
          {lunchDishes.length > 0 ? (
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
          ) : (
            <p className={styles.snackDesc}>{NO_DATA_TEXT}</p>
          )}
        </div>

        {/* Snack */}
        <div className={styles.snackBlock}>
          <span className={styles.snackTitle}>Bữa xế chiều</span>
          <p className={styles.snackDesc}>{snackSummary}</p>
        </div>
      </div>

      {/* Bottom Link */}
      <div className={styles.bottomSection}>
        <Link to={detailTarget} className={isToday ? styles.todayActionLink : styles.viewDetailLink}>
          <span>{isToday ? "Đang phục vụ hôm nay" : "Xem chi tiết suất ăn"}</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

WeeklyDayCard.propTypes = {
  day: PropTypes.shape({
    dayOfWeek: PropTypes.string,
    date: PropTypes.string,
    dateIso: PropTypes.string,
    isToday: PropTypes.bool,
    status: PropTypes.string,
    statusLabel: PropTypes.string,
    lunchDishes: PropTypes.array,
    snackSummary: PropTypes.string,
  }),
  schoolCode: PropTypes.string,
};

WeeklyDayCard.defaultProps = {
  day: null,
  schoolCode: "",
};

export default WeeklyDayCard;
