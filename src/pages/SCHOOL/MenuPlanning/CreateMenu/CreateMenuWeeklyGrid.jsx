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

          // Tiến độ ngày (Đồng bộ nhãn & màu với màn danh sách thực đơn)
          let progress = {
            label: "Chưa tạo",
            badgeClass: styles.badgeEmpty,
            IconComponent: HelpCircle,
          }
          if (hasLunch && hasAfternoon) {
            progress = {
              label: "Đủ ca",
              badgeClass: styles.badgeCompleted,
              IconComponent: CheckCircle2,
            }
          } else if (hasLunch || hasAfternoon) {
            progress = {
              label: hasLunch ? "Thiếu ca xế" : "Thiếu ca trưa",
              badgeClass: styles.badgePartial,
              IconComponent: AlertCircle,
            }
          }

          const ProgressIcon = progress.IconComponent

          return (
            <div key={sd.dateISO} className={styles.dayColItem}>
              <div
                className={`${styles.dayCard} ${
                  sd.isToday ? styles.todayDayCard : ""
                }`}
              >
                {/* HÀNG 1: HEADER CỘT NGÀY - CHIỀU CAO CỐ ĐỊNH 64px */}
                <div className={styles.dayHeader}>
                  <div className={styles.dayTitleRow}>
                    <div className={styles.dayTitleLeft}>
                      <span className={styles.dayLabel}>{sd.dayLabel}</span>
                      {sd.isToday && (
                        <span className={styles.todayPill}>Hôm nay</span>
                      )}
                    </div>

                    {/* Tiến độ ngày */}
                    <span
                      className={`${styles.dayProgressBadge} ${progress.badgeClass}`}
                      title={`Tiến độ ngày: ${progress.label}`}
                    >
                      <ProgressIcon size={11} />
                      <span>{progress.label}</span>
                    </span>
                  </div>

                  <div className={styles.dayDateRow}>
                    <span className={styles.dayDateText}>{sd.dateVN}</span>
                  </div>
                </div>

                {/* THÂN THỰC ĐƠN: BỮA TRƯA + BỮA XẾ + GIA VỊ */}
                <div className={styles.dayMealsBody}>
                  {/* ========================================================
                      KHỐI BỮA TRƯA: BANNER (36px) + DANH SÁCH MÓN
                      ======================================================== */}
                  <div className={styles.mealBlock}>
                    <div className={styles.lunchBanner}>
                      <div className={styles.bannerLeft}>
                        <Utensils size={13} className={styles.lunchIcon} />
                        <span className={styles.lunchTitle}>BỮA TRƯA</span>
                      </div>

                      <div className={styles.bannerActions}>
                        <button
                          type="button"
                          className={`${styles.mealIconBtn} ${styles.lunchIconBtn}`}
                          onClick={() => onOpenDayModal(sd, "LUNCH", "DISHES")}
                          title={hasLunch ? "Sửa thực đơn trưa" : "Thêm thực đơn trưa"}
                          aria-label="Thao tác bữa trưa"
                        >
                          {hasLunch ? <Edit2 size={12} /> : <Plus size={12} />}
                        </button>
                      </div>
                    </div>

                    {hasLunch ? (
                      <div className={styles.dishesListLunch}>
                        {lunchDishes.map((dish, idx) => (
                          <div
                            key={dish.id || idx}
                            className={styles.lunchDishRow}
                            onClick={() => onOpenDayModal(sd, "LUNCH", "DISHES")}
                            title={`Món: ${dish.name} — Bấm để sửa`}
                          >
                            <div className={styles.dishLeftWrap}>
                              <span className={styles.dishDotLunch} />
                              <span className={styles.dishName}>{dish.name}</span>
                            </div>
                            <span className={styles.dishPortionTag}>
                              {dish.portionQty}{dish.unit || "g"}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.emptySingleMealBox}>
                        <span className={styles.emptyMealText}>
                          Chưa có thực đơn trưa
                        </span>
                        <button
                          type="button"
                          className={styles.addSingleMealBtn}
                          onClick={() => onOpenDayModal(sd, "LUNCH", "DISHES")}
                          title={`Thêm thực đơn bữa trưa cho ${sd.dayLabel}`}
                        >
                          <Plus size={12} />
                          <span>Thêm bữa trưa</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* ========================================================
                      KHỐI BỮA XẾ: BANNER (36px) + DANH SÁCH MÓN
                      ======================================================== */}
                  <div className={styles.mealBlock}>
                    <div className={styles.afternoonBanner}>
                      <div className={styles.bannerLeft}>
                        <Coffee size={13} className={styles.afternoonIcon} />
                        <span className={styles.afternoonTitle}>BỮA XẾ</span>
                      </div>

                      <div className={styles.bannerActions}>
                        <button
                          type="button"
                          className={`${styles.mealIconBtn} ${styles.afternoonIconBtn}`}
                          onClick={() => onOpenDayModal(sd, "AFTERNOON", "DISHES")}
                          title={hasAfternoon ? "Sửa thực đơn xế" : "Thêm thực đơn xế"}
                          aria-label="Thao tác bữa xế"
                        >
                          {hasAfternoon ? <Edit2 size={12} /> : <Plus size={12} />}
                        </button>
                      </div>
                    </div>

                    {hasAfternoon ? (
                      <div className={styles.dishesListAfternoon}>
                        {afternoonDishes.map((dish, idx) => (
                          <div
                            key={dish.id || idx}
                            className={styles.afternoonDishRow}
                            onClick={() => onOpenDayModal(sd, "AFTERNOON", "DISHES")}
                            title={`Món: ${dish.name} — Bấm để sửa`}
                          >
                            <div className={styles.dishLeftWrap}>
                              <span className={styles.dishDotAfternoon} />
                              <span className={styles.dishName}>{dish.name}</span>
                            </div>
                            <span className={styles.dishPortionTag}>
                              {dish.portionQty}{dish.unit || "g"}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.emptySingleMealBoxSm}>
                        <span className={styles.emptyMealText}>
                          Chưa có thực đơn xế
                        </span>
                        <button
                          type="button"
                          className={styles.addSingleMealBtn}
                          onClick={() => onOpenDayModal(sd, "AFTERNOON", "DISHES")}
                          title={`Thêm thực đơn bữa xế cho ${sd.dayLabel}`}
                        >
                          <Plus size={12} />
                          <span>Thêm bữa xế</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* ========================================================
                      KHỐI GIA VỊ: BANNER (36px) + DANH SÁCH GIA VỊ
                      ======================================================== */}
                  <div className={styles.mealBlock}>
                    <div className={styles.seasoningBanner}>
                      <div className={styles.bannerLeft}>
                        <Sparkles size={13} className={styles.seasoningIcon} />
                        <span className={styles.seasoningTitle}>GIA VỊ KHO</span>
                      </div>

                      <div className={styles.bannerActions}>
                        <button
                          type="button"
                          className={`${styles.mealIconBtn} ${styles.seasoningIconBtn}`}
                          onClick={() => onOpenDayModal(sd, "LUNCH", "SEASONINGS")}
                          title={hasSeasonings ? "Sửa gia vị kho" : "Thêm gia vị kho"}
                          aria-label="Thao tác gia vị kho"
                        >
                          {hasSeasonings ? <Edit2 size={12} /> : <Plus size={12} />}
                        </button>
                      </div>
                    </div>

                    {hasSeasonings ? (
                      <div className={styles.dishesListSeasoning}>
                        {seasonings.map((s, idx) => {
                          const unitLabel = s.unit === "ml" ? "L" : "kg"
                          const total =
                            s.totalBatchQty ??
                            Number(
                              (((Number(s.portionQty) || 0) * totalStudents) / 1000).toFixed(2)
                            )
                          return (
                            <div
                              key={s.id || idx}
                              className={styles.seasoningDishRow}
                              onClick={() => onOpenDayModal(sd, "LUNCH", "SEASONINGS")}
                              title={`${s.name} (${s.portionQty} ${s.unit}/suất) — Bấm để sửa`}
                            >
                              <div className={styles.dishLeftWrap}>
                                <span className={styles.dishDotSeasoning} />
                                <span className={styles.seasoningNameText}>
                                  {s.name.replace(/\(.*?\)/g, "").trim()}
                                </span>
                              </div>
                              <span className={styles.seasoningQtyText}>
                                {total} {unitLabel}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className={styles.emptySingleMealBoxSm}>
                        <span className={styles.emptyMealText}>
                          Chưa kê gia vị
                        </span>
                        <button
                          type="button"
                          className={styles.addSingleMealBtn}
                          onClick={() => onOpenDayModal(sd, "LUNCH", "SEASONINGS")}
                          title={`Khai báo gia vị kho cho ${sd.dayLabel}`}
                        >
                          <Plus size={12} />
                          <span>+ Thêm gia vị</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
