import React from "react"
import { Utensils, Coffee } from "lucide-react"
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

      {/* 2. Danh sách các món ăn phân chia rõ rệt 2 màu: Bữa trưa (Cam) & Bữa xế (Xanh lam) */}
      <div className={styles.dishesVerticalStack}>
        {totalFilteredDishes === 0 ? (
          <div className={styles.emptyDayNotice}>
            Không có món phù hợp bộ lọc
          </div>
        ) : (
          <>
            {/* KHỐI 1: BỮA TRƯA (Màu Cam / Hổ phách ấm áp) */}
            {lunchDishes.length > 0 && (
              <div className={styles.lunchMealGroup}>
                <div className={styles.lunchHeader}>
                  <div className={styles.mealTitleLeft}>
                    <Utensils size={13} className={styles.lunchIcon} />
                    <span className={styles.lunchTitle}>Bữa trưa (11:00)</span>
                  </div>
                  <span className={styles.lunchCountBadge}>
                    {lunchDishes.length} món
                  </span>
                </div>

                <div className={styles.lunchDishList}>
                  {lunchDishes.map((dish) => (
                    <KitchenMenuDishCard
                      key={dish.id}
                      dish={dish}
                      mealType="LUNCH"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* KHỐI 2: BỮA XẾ (Màu Xanh lam / Tím mát mẻ) */}
            {afternoonDishes.length > 0 && (
              <div className={styles.afternoonMealGroup}>
                <div className={styles.afternoonHeader}>
                  <div className={styles.mealTitleLeft}>
                    <Coffee size={13} className={styles.afternoonIcon} />
                    <span className={styles.afternoonTitle}>Bữa xế (14:30)</span>
                  </div>
                  <span className={styles.afternoonCountBadge}>
                    {afternoonDishes.length} món
                  </span>
                </div>

                <div className={styles.afternoonDishList}>
                  {afternoonDishes.map((dish) => (
                    <KitchenMenuDishCard
                      key={dish.id}
                      dish={dish}
                      mealType="AFTERNOON"
                    />
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
