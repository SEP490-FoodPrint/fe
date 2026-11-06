import React from "react"
import {
  Utensils,
  Coffee,
  Sparkles,
  Plus,
  Edit2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Settings2,
} from "lucide-react"
import styles from "./CreateMenuWeeklyGrid.module.scss"

export default function CreateMenuWeeklyGrid({
  schoolDays = [],
  weeklyMeals = {},
  totalStudents = 1250,
  onOpenDayModal,
}) {
  return (
    <div className={styles.weeklyGridWrapper}>
      <div className={styles.weeklyGrid}>
        {schoolDays.map((sd) => {
          const dayMeals = weeklyMeals[sd.dateISO] || {}
          const lunchDishes = Array.isArray(dayMeals.LUNCH) ? dayMeals.LUNCH : []
          const afternoonDishes = Array.isArray(dayMeals.AFTERNOON)
            ? dayMeals.AFTERNOON
            : []
          const seasonings = Array.isArray(dayMeals.seasonings)
            ? dayMeals.seasonings
            : []

          const hasLunch = lunchDishes.length > 0
          const hasAfternoon = afternoonDishes.length > 0
          const hasSeasonings = seasonings.length > 0

          // Tiến độ ngày
          let statusBadge = {
            label: "Chưa có món",
            styleClass: styles.badgeEmpty,
            icon: HelpCircle,
          }
          if (hasLunch && hasAfternoon) {
            statusBadge = {
              label: "Đủ 2 ca",
              styleClass: styles.badgeFull,
              icon: CheckCircle2,
            }
          } else if (hasLunch || hasAfternoon) {
            statusBadge = {
              label: hasLunch ? "Thiếu bữa xế" : "Thiếu bữa trưa",
              styleClass: styles.badgePartial,
              icon: AlertCircle,
            }
          }

          const StatusIcon = statusBadge.icon

          return (
            <div key={sd.dateISO} className={styles.dayColumn}>
              {/* CỘT HEADER */}
              <div className={styles.columnHeader}>
                <div className={styles.dayTitleRow}>
                  <div className={styles.dayNameGroup}>
                    <span className={styles.dayLabel}>{sd.dayLabel}</span>
                    <span className={styles.dayDate}>{sd.dateVN?.slice(0, 5)}</span>
                  </div>
                  <span
                    className={`${styles.statusBadge} ${statusBadge.styleClass}`}
                    title={statusBadge.label}
                  >
                    <StatusIcon size={12} />
                    <span>{statusBadge.label}</span>
                  </span>
                </div>
              </div>

              {/* THÂN CỘT: CÁC KHỐI BỮA ĂN VÀ GIA VỊ */}
              <div className={styles.columnBody}>
                {/* 1. KHỐI BỮA TRƯA */}
                <div className={styles.mealCard}>
                  <div className={`${styles.mealHeader} ${styles.lunchHeader}`}>
                    <div className={styles.mealTitleLeft}>
                      <Utensils size={13} />
                      <span className={styles.mealTitle}>BỮA TRƯA</span>
                    </div>
                    <button
                      type="button"
                      className={styles.mealActionBtn}
                      onClick={() => onOpenDayModal(sd, "LUNCH", "DISHES")}
                      title={hasLunch ? "Chỉnh sửa món trưa" : "Thêm món trưa"}
                    >
                      {hasLunch ? (
                        <>
                          <Edit2 size={11} />
                          <span>Sửa</span>
                        </>
                      ) : (
                        <>
                          <Plus size={11} />
                          <span>Thêm</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className={styles.dishesBox}>
                    {hasLunch ? (
                      <div className={styles.dishesList}>
                        {lunchDishes.map((dish, idx) => (
                          <div key={dish.id || idx} className={styles.dishRow}>
                            <span className={styles.lunchDot} />
                            <span className={styles.dishName} title={dish.name}>
                              {dish.name}
                            </span>
                            <span className={styles.dishPortion}>
                              {dish.portionQty}{dish.unit || "g"}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        className={styles.emptyMealClickBox}
                        onClick={() => onOpenDayModal(sd, "LUNCH", "DISHES")}
                      >
                        <span className={styles.emptyNoticeText}>Chưa có món trưa</span>
                        <span className={styles.addDishHint}>+ Thêm món</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. KHỐI BỮA XẾ */}
                <div className={styles.mealCard}>
                  <div className={`${styles.mealHeader} ${styles.afternoonHeader}`}>
                    <div className={styles.mealTitleLeft}>
                      <Coffee size={13} />
                      <span className={styles.mealTitle}>BỮA XẾ</span>
                    </div>
                    <button
                      type="button"
                      className={styles.mealActionBtn}
                      onClick={() => onOpenDayModal(sd, "AFTERNOON", "DISHES")}
                      title={hasAfternoon ? "Chỉnh sửa món xế" : "Thêm món xế"}
                    >
                      {hasAfternoon ? (
                        <>
                          <Edit2 size={11} />
                          <span>Sửa</span>
                        </>
                      ) : (
                        <>
                          <Plus size={11} />
                          <span>Thêm</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className={styles.dishesBox}>
                    {hasAfternoon ? (
                      <div className={styles.dishesList}>
                        {afternoonDishes.map((dish, idx) => (
                          <div key={dish.id || idx} className={styles.dishRow}>
                            <span className={styles.afternoonDot} />
                            <span className={styles.dishName} title={dish.name}>
                              {dish.name}
                            </span>
                            <span className={styles.dishPortion}>
                              {dish.portionQty}{dish.unit || "g"}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        className={styles.emptyMealClickBox}
                        onClick={() => onOpenDayModal(sd, "AFTERNOON", "DISHES")}
                      >
                        <span className={styles.emptyNoticeText}>Chưa có món xế</span>
                        <span className={styles.addDishHint}>+ Thêm món</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. KHỐI GIA VỊ DÙNG CHUNG (1,250 HỌC SINH) */}
                <div className={styles.seasoningCard}>
                  <div className={styles.seasoningHeader}>
                    <div className={styles.mealTitleLeft}>
                      <Sparkles size={13} />
                      <span className={styles.seasoningTitle}>GIA VỊ (1,250 HS)</span>
                    </div>
                    <button
                      type="button"
                      className={styles.seasoningActionBtn}
                      onClick={() => onOpenDayModal(sd, "LUNCH", "SEASONINGS")}
                      title="Chỉnh sửa gia vị dùng chung cho bữa ăn ngày này"
                    >
                      <Edit2 size={11} />
                      <span>{hasSeasonings ? "Sửa" : "Kê gia vị"}</span>
                    </button>
                  </div>

                  <div className={styles.seasoningsBox}>
                    {hasSeasonings ? (
                      <div className={styles.seasoningItemsList}>
                        {seasonings.map((s, idx) => {
                          const unitLabel = s.unit === "ml" ? "L" : "kg"
                          const total =
                            s.totalBatchQty ??
                            Number(
                              (((Number(s.portionQty) || 0) * totalStudents) / 1000).toFixed(2)
                            )
                          return (
                            <div key={s.id || idx} className={styles.seasoningRow}>
                              <span
                                className={styles.seasoningName}
                                title={`${s.name} (${s.portionQty} ${s.unit}/suất)`}
                              >
                                {s.name.replace(/\(.*?\)/g, "").trim()}
                              </span>
                              <span className={styles.seasoningBatchQty}>
                                {total} {unitLabel}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div
                        className={styles.emptySeasoningClickBox}
                        onClick={() => onOpenDayModal(sd, "LUNCH", "SEASONINGS")}
                      >
                        <span className={styles.emptyNoticeText}>Chưa kê gia vị</span>
                        <span className={styles.addDishHint}>+ Nhập gia vị</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* NÚT THAO TÁC TOÀN NGÀY */}
              <div className={styles.columnFooter}>
                <button
                  type="button"
                  className={styles.fullEditDayBtn}
                  onClick={() => onOpenDayModal(sd, "LUNCH", "DISHES")}
                  title={`Mở cửa sổ biên tập toàn diện cho ${sd.dayLabel}`}
                >
                  <Settings2 size={13} />
                  <span>Biên tập ngày {sd.dayLabel}</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

