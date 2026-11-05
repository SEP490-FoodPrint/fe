import React, { useState, useEffect } from "react"
import { Utensils, Coffee } from "lucide-react"
import KitchenMenuDayCard from "./KitchenMenuDayCard"
import styles from "./KitchenMenuWeeklyGrid.module.scss"

export default function KitchenMenuWeeklyGrid({
  schoolDays = [],
  mealTypeFilter = "ALL",
  search = "",
  todayISO = "",
}) {
  // Mobile active day tab: 'ALL' or dayOfWeek (1..5)
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
    <div className={styles.menuSheetBoard}>
      {/* 1. Thanh chú thích 2 ca ăn (Tờ thực đơn chuẩn học đường) */}
      <div className={styles.sheetTopBanner}>
        <div className={styles.sheetBannerTitle}>
          <span className={styles.sheetSub}>Thực đơn chế biến 1 tuần (Thứ Hai — Thứ Sáu)</span>
        </div>

        <div className={styles.mealLegend}>
          <div className={styles.legendLunch}>
            <span className={styles.legendDotLunch} />
            <Utensils size={13} className={styles.legendIconLunch} />
            <span className={styles.legendLabel}>Bữa trưa (11:00)</span>
          </div>

          <div className={styles.legendAfternoon}>
            <span className={styles.legendDotAfternoon} />
            <Coffee size={13} className={styles.legendIconAfternoon} />
            <span className={styles.legendLabel}>Bữa xế (14:30)</span>
          </div>
        </div>
      </div>

      {/* 2. Dải chuyển ngày Mobile-first (ẩn trên màn hình Desktop) */}
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

      {/* 3. Lưới 5 cột hiển thị thực đơn theo ngày */}
      <div className={styles.daysGridWrapper}>
        <div className={styles.daysGrid}>
          {schoolDays.map((day) => {
            const isToday = day.dateISO === todayISO
            // Trên mobile, nếu chọn một ngày cụ thể thì ẩn các ngày còn lại
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
