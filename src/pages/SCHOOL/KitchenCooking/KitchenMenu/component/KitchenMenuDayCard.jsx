import React from "react"
import { Calendar, Utensils, Coffee } from "lucide-react"
import KitchenMenuDishCard from "./KitchenMenuDishCard"
import styles from "./KitchenMenuDayCard.module.scss"

export default function KitchenMenuDayCard({
  dayData,
  isToday = false,
  mealTypeFilter = "ALL",
  search = "",
}) {
  const lunchDishes = (dayData?.meals?.LUNCH?.dishes || []).filter((dish) => {
    if (mealTypeFilter !== "ALL" && mealTypeFilter !== "LUNCH") return false
    if (search && !dish.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const afternoonDishes = (dayData?.meals?.AFTERNOON?.dishes || []).filter((dish) => {
    if (mealTypeFilter !== "ALL" && mealTypeFilter !== "AFTERNOON") return false
    if (search && !dish.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totalFilteredDishes = lunchDishes.length + afternoonDishes.length

  return (
    <div className={`${styles.dayColumn} ${isToday ? styles.todayColumn : ""}`}>
      {/* 1. Header Cột Ngày (Thứ 2, Thứ 3,...) */}
      <div className={styles.dayHeader}>
        <div className={styles.dayTitleWrap}>
          <div className={styles.dayNameRow}>
            <span className={styles.dayIndexBadge}>{dayData.dayIndexLabel}</span>
            <span className={styles.dayLabel}>{dayData.dayLabel}</span>
          </div>
          <span className={styles.dayDateText}>{dayData.dateVN}</span>
        </div>

        {isToday && (
          <span className={styles.todayBadge}>
            Hôm nay
          </span>
        )}
      </div>

      {/* 2. Danh sách các món ăn đổ dọc xuống */}
      <div className={styles.dishesVerticalStack}>
        {totalFilteredDishes === 0 ? (
          <div className={styles.emptyDayNotice}>
            Không có món phù hợp bộ lọc
          </div>
        ) : (
          <>
            {/* Nhóm Bữa Trưa */}
            {lunchDishes.length > 0 && (
              <div className={styles.mealGroup}>
                <div className={styles.mealGroupHeader}>
                  <Utensils size={13} className={styles.mealIcon} />
                  <span className={styles.mealGroupTitle}>Bữa trưa (11:00)</span>
                  <span className={styles.dishCount}>{lunchDishes.length}</span>
                </div>

                <div className={styles.dishList}>
                  {lunchDishes.map((dish) => (
                    <KitchenMenuDishCard key={dish.id} dish={dish} />
                  ))}
                </div>
              </div>
            )}

            {/* Nhóm Bữa Xế */}
            {afternoonDishes.length > 0 && (
              <div className={styles.mealGroup}>
                <div className={styles.mealGroupHeader}>
                  <Coffee size={13} className={styles.mealIcon} />
                  <span className={styles.mealGroupTitle}>Bữa xế (14:30)</span>
                  <span className={styles.dishCount}>{afternoonDishes.length}</span>
                </div>

                <div className={styles.dishList}>
                  {afternoonDishes.map((dish) => (
                    <KitchenMenuDishCard key={dish.id} dish={dish} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
