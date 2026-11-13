import React from "react"
import { Calendar, Utensils, Coffee, CalendarOff } from "lucide-react"
import KitchenMenuDishCard from "./KitchenMenuDishCard"
import styles from "./KitchenMenuDayCard.module.scss"

export default function KitchenMenuDayCard({
  dayData,
  isToday = false,
  mealTypeFilter = "ALL",
}) {
  const isHoliday = Boolean(dayData?.isHoliday)
  const holidayReason = dayData?.holidayReason || "Ngày nghỉ toàn trường"

  const lunchDishes = (dayData?.meals?.LUNCH?.dishes || []).filter((dish) => {
    if (mealTypeFilter !== "ALL" && mealTypeFilter !== "LUNCH") return false
    return true
  })

  const afternoonDishes = (dayData?.meals?.AFTERNOON?.dishes || []).filter((dish) => {
    if (mealTypeFilter !== "ALL" && mealTypeFilter !== "AFTERNOON") return false
    return true
  })

  const totalFilteredDishes = lunchDishes.length + afternoonDishes.length

  return (
    <div
      className={`${styles.dayColumn} ${isToday ? styles.todayColumn : ""} ${
        isHoliday ? styles.holidayColumn : ""
      }`}
    >
      {/* 1. Header Cột Ngày: Chiều cao chuẩn 64px căn đều trên cả 5 cột */}
      <div className={styles.dayHeader}>
        <div className={styles.dayTitleRow}>
          <div className={styles.dayTitleLeft}>
            <span className={styles.dayLabel}>{dayData.dayLabel}</span>
          </div>
          {isHoliday && (
            <span className={styles.badgeHoliday}>Nghỉ</span>
          )}
        </div>
        <div className={styles.dayDateRow}>
          <span className={styles.dayDateText}>{dayData.dateVN}</span>
        </div>
      </div>

      {/* 2. Thân card: Nếu là ngày nghỉ hiển thị thẻ ngày nghỉ viền đỏ, ngược lại hiển thị danh sách ca ăn */}
      {isHoliday ? (
        <div className={styles.holidayCardBody}>
          <div className={styles.holidayIconWrap}>
            <CalendarOff size={24} className={styles.holidayIcon} />
          </div>
          <div className={styles.holidayReasonBox}>
            <span className={styles.holidayReasonText}>{holidayReason}</span>
          </div>
          <span className={styles.holidaySubText}>Không phục vụ ăn bán trú</span>
        </div>
      ) : (
        <div className={styles.dishesBody}>
          {totalFilteredDishes === 0 ? (
            <div className={styles.emptyNotice}>Chưa có thực đơn cho ngày này</div>
          ) : (
            <>
              {/* KHỐI BỮA TRƯA: Dải cao 36px + danh sách món */}
              {(mealTypeFilter === "ALL" || mealTypeFilter === "LUNCH") && (
                <div className={styles.mealSection}>
                  <div className={styles.lunchBanner}>
                    <div className={styles.mealBannerLeft}>
                      <Utensils size={13} className={styles.lunchIcon} />
                      <span className={styles.lunchTitle}>BỮA TRƯA</span>
                    </div>
                    {lunchDishes.length > 0 && (
                      <span className={styles.lunchBadge}>{lunchDishes.length} món</span>
                    )}
                  </div>

                  {lunchDishes.length > 0 ? (
                    <div className={styles.dishesListLunch}>
                      {lunchDishes.map((dish) => (
                        <KitchenMenuDishCard
                          key={dish.id || dish.name}
                          dish={dish}
                          mealType="LUNCH"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className={styles.emptyMealBoxLunch}>
                      <span className={styles.emptyMealText}>Chưa có thực đơn trưa</span>
                    </div>
                  )}
                </div>
              )}

              {/* KHỐI BỮA XẾ: Dải cao 36px + danh sách món */}
              {(mealTypeFilter === "ALL" || mealTypeFilter === "AFTERNOON") && (
                <div className={styles.mealSection}>
                  <div className={styles.afternoonBanner}>
                    <div className={styles.mealBannerLeft}>
                      <Coffee size={13} className={styles.afternoonIcon} />
                      <span className={styles.afternoonTitle}>BỮA XẾ</span>
                    </div>
                    {afternoonDishes.length > 0 && (
                      <span className={styles.afternoonBadge}>{afternoonDishes.length} món</span>
                    )}
                  </div>

                  {afternoonDishes.length > 0 ? (
                    <div className={styles.dishesListAfternoon}>
                      {afternoonDishes.map((dish) => (
                        <KitchenMenuDishCard
                          key={dish.id || dish.name}
                          dish={dish}
                          mealType="AFTERNOON"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className={styles.emptyMealBoxAfternoon}>
                      <span className={styles.emptyMealText}>Chưa có thực đơn xế</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
