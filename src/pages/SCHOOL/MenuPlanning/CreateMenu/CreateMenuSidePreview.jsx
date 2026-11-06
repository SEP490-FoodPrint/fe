import React from "react"
import { Eye, Utensils, Coffee, CalendarCheck } from "lucide-react"
import styles from "./CreateMenuSidePreview.module.scss"

export default function CreateMenuSidePreview({
  schoolDays = [],
  weeklyMeals = {},
  activeDate = "",
  activeMealType = "LUNCH",
  onSelectMeal,
}) {
  // Tính tiến độ tuần (bao nhiêu ca / ngày đã có món)
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
    <aside className={styles.sidePreviewStickyWrap} aria-label="Xem trước thực đơn tuần">
      {/* Header Sticky Preview */}
      <div className={styles.previewHeader}>
        <div className={styles.headerTopRow}>
          <div className={styles.titleWithIcon}>
            <div className={styles.iconCircle}>
              <Eye size={15} />
            </div>
            <h3 className={styles.previewTitle}>Thực đơn tuần này</h3>
          </div>
          <div className={styles.progressPill}>
            <CalendarCheck size={12} />
            <span>
              <strong>{completedDaysCount}/{schoolDays.length || 5}</strong> ngày đủ 2 ca
            </span>
          </div>
        </div>
        <p className={styles.previewSub}>
          Bấm vào ca ăn bất kỳ để chuyển sang soạn thảo ca đó. Món ăn vừa chọn sẽ xuất hiện ngay tại đây.
        </p>
      </div>

      {/* Danh sách 5 ngày học đường */}
      <div className={styles.daysList}>
        {schoolDays.map((sd) => {
          const dayData = weeklyMeals[sd.dateISO] || {}
          const lunchDishes = dayData.LUNCH || []
          const afternoonDishes = dayData.AFTERNOON || []

          const isCurrentDay =
            activeDate === sd.dateISO || activeDate === sd.dateVN

          const isLunchActive = isCurrentDay && activeMealType === "LUNCH"
          const isAfternoonActive = isCurrentDay && activeMealType === "AFTERNOON"

          return (
            <div
              key={sd.dateISO}
              className={`${styles.dayCard} ${isCurrentDay ? styles.activeDayCard : ""}`}
            >
              {/* Tiêu đề ngày */}
              <div className={styles.dayCardHeader}>
                <div className={styles.dayTitle}>
                  <span className={styles.dayName}>{sd.dayLabel}</span>
                  <span className={styles.dayDate}>({sd.dateVN?.slice(0, 5)})</span>
                </div>
                {isCurrentDay && (
                  <span className={styles.activeDayIndicator}>
                    <span className={styles.dot} />
                    Đang chọn
                  </span>
                )}
              </div>

              {/* 2 khối ca ăn: Trưa & Xế */}
              <div className={styles.mealsContainer}>
                {/* Ca Trưa */}
                <div
                  className={`${styles.mealBlock} ${
                    isLunchActive ? styles.activeMealBlock : ""
                  }`}
                  onClick={() => onSelectMeal && onSelectMeal(sd.dateISO, "LUNCH")}
                  role="button"
                  tabIndex={0}
                  title="Bấm để chuyển sang soạn thảo Bữa trưa"
                >
                  <div className={`${styles.mealBanner} ${styles.mealBannerLunch}`}>
                    <div className={styles.bannerTitle}>
                      <Utensils size={12} />
                      <span>Bữa trưa ({lunchDishes.length} món)</span>
                    </div>
                    {isLunchActive && (
                      <span className={styles.editingTag}>Đang soạn</span>
                    )}
                  </div>

                  <div className={styles.dishesList}>
                    {lunchDishes.length === 0 ? (
                      <div className={styles.emptyMealNotice}>
                        <span>Chưa có món</span>
                        <span className={styles.addHint}>+ Thêm món</span>
                      </div>
                    ) : (
                      lunchDishes.map((dish, idx) => (
                        <div key={dish.id || idx} className={styles.dishRow}>
                          <div className={styles.dishLeft}>
                            <span className={styles.dishBullet}>•</span>
                            <span className={styles.dishName} title={dish.name}>
                              {dish.name}
                            </span>
                          </div>
                          <span className={styles.dishPortion}>
                            {dish.portionQty}{dish.unit || "g"}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Ca Xế */}
                <div
                  className={`${styles.mealBlock} ${
                    isAfternoonActive ? styles.activeMealBlock : ""
                  }`}
                  onClick={() => onSelectMeal && onSelectMeal(sd.dateISO, "AFTERNOON")}
                  role="button"
                  tabIndex={0}
                  title="Bấm để chuyển sang soạn thảo Bữa xế"
                >
                  <div className={`${styles.mealBanner} ${styles.mealBannerAfternoon}`}>
                    <div className={styles.bannerTitle}>
                      <Coffee size={12} />
                      <span>Bữa xế ({afternoonDishes.length} món)</span>
                    </div>
                    {isAfternoonActive && (
                      <span className={styles.editingTag}>Đang soạn</span>
                    )}
                  </div>

                  <div className={styles.dishesList}>
                    {afternoonDishes.length === 0 ? (
                      <div className={styles.emptyMealNotice}>
                        <span>Chưa có món</span>
                        <span className={styles.addHint}>+ Thêm món</span>
                      </div>
                    ) : (
                      afternoonDishes.map((dish, idx) => (
                        <div key={dish.id || idx} className={styles.dishRow}>
                          <div className={styles.dishLeft}>
                            <span className={styles.dishBullet}>•</span>
                            <span className={styles.dishName} title={dish.name}>
                              {dish.name}
                            </span>
                          </div>
                          <span className={styles.dishPortion}>
                            {dish.portionQty}{dish.unit || "g"}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}

