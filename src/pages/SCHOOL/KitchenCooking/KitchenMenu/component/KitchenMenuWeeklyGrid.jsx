import React, { useState, useEffect } from "react"
import { Calendar, Check } from "lucide-react"
import KitchenMenuDayCard from "./KitchenMenuDayCard"
import styles from "./KitchenMenuWeeklyGrid.module.scss"

export default function KitchenMenuWeeklyGrid({
  schoolDays = [],
  mealTypeFilter = "ALL",
  categoryFilter = "ALL",
  search = "",
  todayISO = "",
}) {
  // Mobile active day tab: 'ALL' or dayOfWeek (1..5)
  // Default to today's day of week if within Monday-Friday, else 1 (Monday)
  const todayDay = schoolDays.find((d) => d.dateISO === todayISO)
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState(
    todayDay ? todayDay.dayOfWeek : 1
  )

  useEffect(() => {
    if (todayDay) {
      setSelectedDayOfWeek(todayDay.dayOfWeek)
    }
  }, [todayDay])

  return (
    <div className={styles.gridContainer}>
      {/* 1. Dải chuyển ngày Mobile-first (ẩn trên màn hình Desktop) */}
      <div className={styles.mobileDayBar}>
        <div className={styles.mobileDayList}>
          {schoolDays.map((day) => {
            const isToday = day.dateISO === todayISO
            const isSelected = selectedDayOfWeek === day.dayOfWeek
            return (
              <button
                key={day.dayOfWeek}
                type="button"
                className={`${styles.mobileDayPill} ${
                  isSelected ? styles.mobileDayPillActive : ""
                } ${isToday ? styles.mobileDayPillToday : ""}`}
                onClick={() => setSelectedDayOfWeek(day.dayOfWeek)}
                aria-label={`${day.dayLabel} ${day.dateVN}`}
              >
                <span className={styles.pillIndex}>{day.dayIndexLabel}</span>
                <span className={styles.pillDate}>{day.dateVN?.slice(0, 5)}</span>
                {isToday && <span className={styles.pillDot} />}
              </button>
            )
          })}

          <button
            type="button"
            className={`${styles.mobileDayPill} ${
              selectedDayOfWeek === "ALL" ? styles.mobileDayPillActive : ""
            }`}
            onClick={() => setSelectedDayOfWeek("ALL")}
            aria-label="Xem cả tuần"
          >
            <span className={styles.pillIndex}>Cả tuần</span>
            <span className={styles.pillDate}>5 ngày</span>
          </button>
        </div>
      </div>

      {/* 2. Lưới 5 cột hiển thị thực đơn theo ngày */}
      <div className={styles.daysGridWrapper}>
        <div className={styles.daysGrid}>
          {schoolDays.map((day) => {
            const isToday = day.dateISO === todayISO
            // On mobile, if a single day is selected, hide the other days
            const isHiddenOnMobile =
              selectedDayOfWeek !== "ALL" && selectedDayOfWeek !== day.dayOfWeek

            return (
              <div
                key={day.dayOfWeek}
                className={`${styles.dayColItem} ${
                  isHiddenOnMobile ? styles.mobileHidden : ""
                }`}
              >
                <KitchenMenuDayCard
                  dayData={day}
                  isToday={isToday}
                  mealTypeFilter={mealTypeFilter}
                  categoryFilter={categoryFilter}
                  search={search}
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

