import React from "react"
import { Eye, Utensils, Coffee, AlertTriangle, CalendarCheck } from "lucide-react"
import styles from "./CreateMenuWeeklyLivePreview.module.scss"

export default function CreateMenuWeeklyLivePreview({
  schoolDays = [],
  weeklyMeals = {},
  activeDate = "",
  activeMealType = "LUNCH",
  onSelectMeal,
}) {
  // Tính tiến độ của tuần (bao nhiêu ca / ngày đã có món)
  let completedDaysCount = 0
  schoolDays.forEach((sd) => {
    const dayData = weeklyMeals[sd.dateISO] || {}
    const hasLunch = Array.isArray(dayData.LUNCH) && dayData.LUNCH.length > 0
    const hasAfternoon =
      Array.isArray(dayData.AFTERNOON) && dayData.AFTERNOON.length > 0
    if (hasLunch && hasAfternoon) {
      completedDaysCount += 1
    }
  })

  return (
    <div className={styles.livePreviewContainer}>
      {/* Header Live Preview */}
      <div className={styles.previewHeader}>
        <div className={styles.headerTitleGroup}>
          <div className={styles.previewIconBox}>
            <Eye size={16} />
          </div>
          <div>
            <h3 className={styles.previewTitle}>
              Xem trước thực đơn tuần (Live Preview)
            </h3>
            <p className={styles.previewHint}>
              Click vào ca ăn bất kỳ để chuyển sang soạn thảo ca đó. Món ăn bạn thêm vào sẽ hiển thị ngay tại đây.
            </p>
          </div>
        </div>

        <div className={styles.progressPill}>
          <CalendarCheck size={13} />
          <span>
            Tiến độ tuần: <strong>{completedDaysCount}/{schoolDays.length || 5} ngày</strong> đủ 2 ca
          </span>
        </div>
      </div>

      {/* Lưới 5 ngày từ Thứ Hai đến Thứ Sáu */}
      <div className={styles.weekGrid}>
        {schoolDays.map((sd) => {
          const dayData = weeklyMeals[sd.dateISO] || {}
          const lunchDishes = dayData.LUNCH || []
          const afternoonDishes = dayData.AFTERNOON || []

          const isLunchActive =
            (activeDate === sd.dateISO || activeDate === sd.dateVN) &&
            activeMealType === "LUNCH"

          const isAfternoonActive =
            (activeDate === sd.dateISO || activeDate === sd.dateVN) &&
            activeMealType === "AFTERNOON"

          return (
            <div key={sd.dateISO} className={styles.dayColumn}>
              {/* Header ngày */}
              <div className={styles.dayHeader}>
                <span className={styles.dayLabel}>{sd.dayLabel}</span>
                <span className={styles.dayDate}>{sd.dateVN?.slice(0, 5)}</span>
              </div>

              {/* Ca 1: Bữa Trưa */}
              <div
                className={`${styles.mealBlock} ${
                  isLunchActive ? styles.mealBlockActive : ""
                }`}
                onClick={() => onSelectMeal && onSelectMeal(sd.dateISO, "LUNCH")}
                title="Bấm để chọn và soạn thảo Bữa trưa ngày này"
              >
                <div className={`${styles.mealBanner} ${styles.mealBannerLunch}`}>
                  <div className={styles.bannerTitle}>
                    <Utensils size={12} />
                    <span>Bữa trưa</span>
                  </div>
                  {isLunchActive && (
                    <span className={styles.editingBadge}>Đang soạn</span>
                  )}
                </div>

                <div className={styles.dishesList}>
                  {lunchDishes.length === 0 ? (
                    <div className={styles.emptyMealNotice}>
                      <span>Chưa có món</span>
                      <span>(Click để thêm)</span>
                    </div>
                  ) : (
                    lunchDishes.map((dish, idx) => (
                      <div key={dish.id || idx} className={styles.dishItem}>
                        <span className={styles.dishNameText} title={dish.name}>
                          {dish.name}
                        </span>
                        <span className={styles.dishQtyText}>
                          {dish.portionQty}{dish.unit || "g"}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Ca 2: Bữa Xế */}
              <div
                className={`${styles.mealBlock} ${
                  isAfternoonActive ? styles.mealBlockActive : ""
                }`}
                onClick={() =>
                  onSelectMeal && onSelectMeal(sd.dateISO, "AFTERNOON")
                }
                title="Bấm để chọn và soạn thảo Bữa xế ngày này"
              >
                <div
                  className={`${styles.mealBanner} ${styles.mealBannerAfternoon}`}
                >
                  <div className={styles.bannerTitle}>
                    <Coffee size={12} />
                    <span>Bữa xế</span>
                  </div>
                  {isAfternoonActive && (
                    <span className={styles.editingBadge}>Đang soạn</span>
                  )}
                </div>

                <div className={styles.dishesList}>
                  {afternoonDishes.length === 0 ? (
                    <div className={styles.emptyMealNotice}>
                      <span>Chưa có món</span>
                      <span>(Click để thêm)</span>
                    </div>
                  ) : (
                    afternoonDishes.map((dish, idx) => (
                      <div key={dish.id || idx} className={styles.dishItem}>
                        <span className={styles.dishNameText} title={dish.name}>
                          {dish.name}
                        </span>
                        <span className={styles.dishQtyText}>
                          {dish.portionQty}{dish.unit || "g"}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
