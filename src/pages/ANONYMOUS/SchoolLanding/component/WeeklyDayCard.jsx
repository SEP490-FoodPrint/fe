import React from "react";
import { dayTintStyle } from "src/utils/dayTint";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { ArrowRight, Coffee, Utensils } from "lucide-react";
import { NO_DATA_TEXT } from "src/constants/ui";
import styles from "./WeeklyDayCard.module.scss";
// Dùng chung giao diện thẻ ngày với màn Danh sách thực đơn của nhân viên dinh dưỡng
import nv from "src/pages/SCHOOL/MenuPlanning/component/MenuListWeeklyVerticalView.module.scss";

function WeeklyDayCard({ day, schoolCode, activeGroupId }) {
  if (!day) return null;

  const dayOfWeek = day.dayOfWeek || NO_DATA_TEXT;
  const date = day.date || "";
  const isToday = Boolean(day.isToday);
  const statusLabel = day.statusLabel || (isToday ? "Hôm nay" : "Sắp diễn ra");

  // Món theo bữa; món thay thế dị ứng hiển thị ngay dưới món gốc (giống màn Dinh dưỡng)
  const allDishes = Array.isArray(day.dishes) ? day.dishes : [];
  const mealDishes = (mealType) => {
    const rows = allDishes.filter((dish) => dish.mealType === mealType);
    return rows
      .filter((dish) => !dish.substituteForDishId)
      .map((dish) => ({
        ...dish,
        substitutes: rows.filter((sub) => sub.substituteForDishId === dish.id),
      }));
  };
  const lunchDishes = allDishes.length
    ? mealDishes("LUNCH")
    : (day.lunchDishes || []).map((name) => ({ name: typeof name === "string" ? name : name?.name, substitutes: [] }));
  const afternoonDishes = allDishes.length ? mealDishes("AFTERNOON") : [];
  const snackSummary = !allDishes.length && day.snackSummary ? day.snackSummary : "";

  // Truyền ngày và slug khối qua URL để MealDetail mở đúng thực đơn từ thẻ tuần.
  const queryParams = new URLSearchParams();
  if (day.dateIso) queryParams.set("date", day.dateIso);
  if (activeGroupId && activeGroupId !== "all") queryParams.set("block", activeGroupId);
  const queryString = queryParams.toString();

  const detailTarget = schoolCode
    ? `/school/${schoolCode}/daily-menu${queryString ? `?${queryString}` : ""}`
    : "#thuc-don-ngay";

  const renderDishes = (dishes, isLunch) => (
    <div className={isLunch ? nv.dishesListLunch : nv.dishesListAfternoon}>
      {dishes.map((dish, index) => (
        <div key={dish.id || index} className={`${isLunch ? nv.lunchDishRow : nv.afternoonDishRow} ${styles.staticRow}`}>
          <div className={nv.dishCol}>
            <div className={nv.dishLeftWrap}>
              <span className={isLunch ? nv.dishDotLunch : nv.dishDotAfternoon} />
              <span className={nv.dishName}>{dish.name}</span>
            </div>
            {dish.substitutes.map((sub) => (
              <div key={sub.id} className={nv.substituteDishNote}>({sub.name})</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`${styles.card} ${isToday ? styles.todayCard : ""}`} style={dayTintStyle(day.dateIso)}>
      {/* Header ngày */}
      <div className={nv.dayHeader}>
        <div className={nv.dayTitleRow}>
          <div className={nv.dayTitleLeft}>
            <span className={nv.dayLabel}>{dayOfWeek}</span>
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
        <div className={nv.dayDateRow}>
          <span className={nv.dayDateText}>{date}</span>
        </div>
      </div>

      <div className={styles.body}>
        {/* Bữa trưa */}
        <div className={nv.mealBlock}>
          <div className={nv.lunchBanner}>
            <div className={nv.bannerLeft}>
              <Utensils size={13} className={nv.lunchIcon} />
              <span className={nv.lunchTitle}>BỮA TRƯA</span>
            </div>
          </div>
          {lunchDishes.length > 0 ? renderDishes(lunchDishes, true) : (
            <div className={nv.emptySingleMealBox}>
              <span className={nv.emptyMealText}>Chưa có thực đơn trưa</span>
            </div>
          )}
        </div>

        {/* Bữa xế */}
        <div className={nv.mealBlock}>
          <div className={nv.afternoonBanner}>
            <div className={nv.bannerLeft}>
              <Coffee size={13} className={nv.afternoonIcon} />
              <span className={nv.afternoonTitle}>BỮA XẾ</span>
            </div>
          </div>
          {afternoonDishes.length > 0 ? renderDishes(afternoonDishes, false) : snackSummary ? (
            renderDishes([{ name: snackSummary, substitutes: [] }], false)
          ) : (
            <div className={nv.emptySingleMealBoxSm}>
              <span className={nv.emptyMealText}>Chưa có thực đơn xế</span>
            </div>
          )}
        </div>
      </div>

      {/* Link xem chi tiết */}
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
    dishes: PropTypes.array,
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
