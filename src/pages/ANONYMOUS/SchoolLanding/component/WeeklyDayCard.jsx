import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { NO_DATA_TEXT } from "src/constants/ui";
import styles from "./WeeklyDayCard.module.scss";

function WeeklyDayCard({ day, schoolCode, activeGroupId }) {
  if (!day) return null;

  const dayOfWeek = day.dayOfWeek || NO_DATA_TEXT;
  const date = day.date || "";
  const isToday = Boolean(day.isToday);
  const statusLabel = day.statusLabel || (isToday ? "Hôm nay" : "Sắp diễn ra");
  const lunchDishes = day.lunchDishes || [];
  const snackSummary = day.snackSummary || NO_DATA_TEXT;

  // Truyền ngày và slug khối qua URL để MealDetail mở đúng thực đơn từ thẻ tuần.
  const queryParams = new URLSearchParams();
  if (day.dateIso) queryParams.set("date", day.dateIso);
  if (activeGroupId) queryParams.set("block", activeGroupId);
  const queryString = queryParams.toString();

  const detailTarget = schoolCode
    ? `/school/${schoolCode}/daily-menu${queryString ? `?${queryString}` : ""}`
    : "#thuc-don-ngay";

  return (
    <div className={`${styles.card} ${isToday ? styles.todayCard : ""}`}>
      {/* 1. Header Ngày */}
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

      {/* 2. Bữa trưa chính (Tự co giãn chiều cao linh hoạt, không đẩy lệch bữa xế) */}
      <div className={styles.mealBlock}>
        <span className={styles.blockTitle}>Bữa trưa chính</span>
        {lunchDishes.length > 0 ? (
          <ul className={styles.dishList}>
            {lunchDishes.map((dish, i) => {
              const dishName = typeof dish === "string" ? dish : dish.name;
              const sub =
                typeof dish === "object"
                  ? dish.substituteDish ||
                    dish.alternativeDish ||
                    dish.substitute
                  : null;
              return (
                <li key={i} className={styles.dishItem}>
                  <span className={styles.bullet}>•</span>
                  <div className={styles.dishTextCol}>
                    <span className={styles.dishText}>{dishName}</span>
                    {sub && (
                      <span className={styles.substituteDishNote}>
                        ({sub.name || sub})
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className={styles.emptyLunchText}>{NO_DATA_TEXT}</p>
        )}
      </div>

      {/* 3. Bữa xế chiều (Vạch đứt phân cách như cũ, cố định vị trí ngang hàng cả 5 ngày) */}
      <div className={styles.snackBlock}>
        <span className={styles.snackTitle}>Bữa xế chiều</span>
        <p className={styles.snackDesc} title={snackSummary}>
          {snackSummary}
        </p>
      </div>

      {/* 4. Bottom Link */}
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
  activeGroupId: PropTypes.string,
};

WeeklyDayCard.defaultProps = {
  day: null,
  schoolCode: "",
  activeGroupId: "",
};

export default WeeklyDayCard;
