import React from "react";
import PropTypes from "prop-types";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./WeekDayNavStrip.module.scss";

function WeekDayNavStrip({
  weekNav,
  weekRange,
  selectedDate,
  onSelectDate,
  onPrevWeek,
  onNextWeek,
}) {
  return (
    <section className={styles.stripSection}>
      <div className={styles.innerContainer}>
        {/* Week Switcher */}
        <div className={styles.weekSwitcher}>
          <button
            type="button"
            className={styles.navButton}
            onClick={onPrevWeek}
            aria-label="Xem tuần trước"
          >
            <ChevronLeft size={18} />
            <span>Tuần trước</span>
          </button>

          <div className={styles.weekTitleGroup}>
            <Calendar size={18} className={styles.calendarIcon} />
            <span>Tuần lễ: {weekRange}</span>
          </div>

          <button
            type="button"
            className={styles.navButton}
            onClick={onNextWeek}
            aria-label="Xem tuần sau"
          >
            <span>Tuần sau</span>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* 7-Day Navigation Grid */}
        <div className={styles.daysGrid}>
          {weekNav.map((day) => {
            const isSelected = day.status === "SELECTED" || day.date === selectedDate;
            const isDisabled = day.status === "OFF_DUTY" || day.isWeekend;

            let cardClass = styles.dayCard;
            if (isSelected) {
              cardClass += ` ${styles.dayCardSelected}`;
            } else if (isDisabled) {
              cardClass += ` ${styles.dayCardDisabled}`;
            }

            return (
              <button
                key={day.date}
                type="button"
                className={cardClass}
                disabled={isDisabled}
                onClick={() => {
                  if (!isDisabled && onSelectDate) {
                    onSelectDate(day.date);
                  }
                }}
              >
                <span className={styles.dayName}>{day.dayOfWeek}</span>
                <span className={styles.dayDate}>{day.dayOfMonth}</span>
                <span className={styles.dayStatus}>
                  {isSelected ? "Đang xem" : day.statusLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

WeekDayNavStrip.propTypes = {
  weekNav: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      dayOfWeek: PropTypes.string.isRequired,
      dayOfMonth: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      statusLabel: PropTypes.string.isRequired,
      isWeekend: PropTypes.bool,
      hasMenu: PropTypes.bool,
    }),
  ),
  weekRange: PropTypes.string,
  selectedDate: PropTypes.string,
  onSelectDate: PropTypes.func,
  onPrevWeek: PropTypes.func,
  onNextWeek: PropTypes.func,
};

WeekDayNavStrip.defaultProps = {
  weekNav: [],
  weekRange: "",
  selectedDate: "",
  onSelectDate: () => {},
  onPrevWeek: () => {},
  onNextWeek: () => {},
};

export default WeekDayNavStrip;
