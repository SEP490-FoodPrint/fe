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
      {/* 1. Header Cột Ngày: Chiều cao chuẩn 66px căn đều trên cả 5 cột */}
      <div className={styles.dayHeader}>
        <div className={styles.dayTitleRow}>
          <Calendar size={15} className={styles.dayCalendarIcon} />
          <span className={styles.dayLabel}>{dayData.dayLabel}</span>
          {isToday && <span className={styles.todayPill}>Hôm nay</span>}
        </div>
        <span className={styles.dayDateText}>{dayData.dateVN}</span>
      </div>

      {/* 2. Danh sách món ăn phân đoạn 2 ca: Bữa trưa & Bữa xế thẳng hàng ngang */}
      <div className={styles.dishesBody}>
        {totalFilteredDishes === 0 ? (
          <div className={styles.emptyNotice}>Không có món phù hợp</div>
        ) : (
          <>
            {/* KHỐI BỮA TRƯA: Dải cao 38px + danh sách 5 món chuẩn 270px */}
            {lunchDishes.length > 0 && (
              <div className={styles.mealSection}>
                <div className={styles.lunchBanner}>
                  <div className={styles.mealBannerLeft}>
                    <Utensils size={13} className={styles.lunchIcon} />
                    <span className={styles.lunchTitle}>BỮA TRƯA</span>
                  </div>
                  <span className={styles.lunchBadge}>{lunchDishes.length} món</span>
                </div>

                <div className={styles.dishesListLunch}>
                  {lunchDishes.map((dish) => (
                    <KitchenMenuDishCard key={dish.id} dish={dish} mealType="LUNCH" />
                  ))}
                </div>
              </div>
            )}

            {/* KHỐI BỮA XẾ: Dải cao 38px + danh sách món chuẩn 54px */}
            {afternoonDishes.length > 0 && (
              <div className={styles.mealSection}>
                <div className={styles.afternoonBanner}>
                  <div className={styles.mealBannerLeft}>
                    <Coffee size={13} className={styles.afternoonIcon} />
                    <span className={styles.afternoonTitle}>BỮA XẾ</span>
                  </div>
                  <span className={styles.afternoonBadge}>{afternoonDishes.length} món</span>
                </div>

                <div className={styles.dishesListAfternoon}>
                  {afternoonDishes.map((dish) => (
                    <KitchenMenuDishCard key={dish.id} dish={dish} mealType="AFTERNOON" />
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
