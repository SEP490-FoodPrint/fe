import React, { useState } from "react"
import {
  Utensils,
  Coffee,
  Sparkles,
  Plus,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react"
import styles from "./CreateMenuWeeklyGrid.module.scss"

export default function CreateMenuWeeklyGrid({
  schoolDays = [],
  weeklyMeals = {},
  onOpenDayModal,
  readOnly = false,
}) {
  // Quản lý trạng thái đóng/mở của từng bữa ăn theo key: `${dateISO}_${mealType}`
  // Mặc định false (mở đầy đủ)
  const [collapsedMap, setCollapsedMap] = useState({})

  const toggleCollapse = (dateISO, mealType) => {
    const key = `${dateISO}_${mealType}`
    setCollapsedMap((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  return (
    <div className={styles.weeklyGridWrapper}>
      <div className={styles.weeklyGrid}>
        {schoolDays.map((sd) => {
          const dayMeals = weeklyMeals[sd.dateISO] || {}
          const canEdit = !readOnly && !sd.isHoliday && dayMeals.canEdit !== false && dayMeals.approvalStatus !== "APPROVED" && dayMeals.weeklyStatus !== "APPROVED"
          const openDay = mealType => { if (canEdit) onOpenDayModal(sd, mealType, "DISHES") }
          const lunchDishes = Array.isArray(dayMeals.LUNCH) ? dayMeals.LUNCH : []
          const afternoonDishes = Array.isArray(dayMeals.AFTERNOON)
            ? dayMeals.AFTERNOON
            : []
          const seasonings = dayMeals.seasoningsByMeal
            ? ["LUNCH", "AFTERNOON"].flatMap(mealType =>
                (dayMeals.seasoningsByMeal[mealType] || []).map(s => ({
                  ...s,
                  id: `${mealType}-${s.ingredientEntryId || s.id}`,
                  name: `${mealType === "LUNCH" ? "Bữa trưa" : "Bữa xế"} · ${s.name}`,
                })))
            : Array.isArray(dayMeals.seasonings) ? dayMeals.seasonings : []

          const hasLunch = lunchDishes.length > 0
          const hasAfternoon = afternoonDishes.length > 0
          const hasSeasonings = seasonings.length > 0

          // Tiến độ ngày: Chuẩn hóa theo đúng yêu cầu
          // "Thiếu bữa xế", "Thiếu bữa trưa", "Đủ ca", "Chưa tạo"
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
          } else if (hasLunch && !hasAfternoon) {
            progress = {
              label: "Thiếu bữa xế",
              badgeClass: styles.badgePartial,
              IconComponent: AlertCircle,
            }
          } else if (!hasLunch && hasAfternoon) {
            progress = {
              label: "Thiếu bữa trưa",
              badgeClass: styles.badgePartial,
              IconComponent: AlertCircle,
            }
          }

          const ProgressIcon = progress.IconComponent

          const isLunchCollapsed = !!collapsedMap[`${sd.dateISO}_LUNCH`]
          const isAfternoonCollapsed = !!collapsedMap[`${sd.dateISO}_AFTERNOON`]
          const isSeasoningCollapsed = !!collapsedMap[`${sd.dateISO}_SEASONINGS`]

          return (
            <div key={sd.dateISO} className={styles.dayColItem}>
              <div
                className={`${styles.dayCard} ${
                  sd.isToday ? styles.todayDayCard : ""
                } ${sd.isHoliday ? styles.holidayDayCard : ""}`}
              >
                {/* HÀNG 1: HEADER CỘT NGÀY - CÓ 1 DẤU "+" DUY NHẤT ĐỂ THÊM/SỬA MENU CHO THỨ NÀY */}
                <div className={styles.dayHeader}>
                  <div className={styles.dayTitleRow}>
                    <div className={styles.dayTitleLeft}>
                      <span className={styles.dayLabel}>{sd.dayLabel}</span>
                    </div>

                    {/* Nút + duy nhất để mở menu cho mỗi thứ */}
                    {canEdit && <button
                      type="button"
                      className={styles.dayAddBtn}
                      onClick={() => openDay("LUNCH")}
                      title={`Thêm / chỉnh sửa thực đơn ${sd.dayLabel}`}
                      aria-label="Thêm thực đơn ngày"
                    >
                      <Plus size={14} />
                    </button>}
                  </div>

                  <div className={styles.dayDateRow}>
                    <span className={styles.dayDateText}>{sd.dateVN}</span>

                    {/* Tiến độ ngày: "Đủ ca", "Thiếu bữa xế", "Thiếu bữa trưa", "Chưa tạo" */}
                    <span
                      className={`${styles.dayProgressBadge} ${progress.badgeClass}`}
                      title={`Tiến độ ngày: ${progress.label}`}
                    >
                      <ProgressIcon size={11} />
                      <span>{progress.label}</span>
                    </span>
                  </div>
                </div>

                {/* THÂN THỰC ĐƠN: BỮA TRƯA + BỮA XẾ + GIA VỊ */}
                <div className={styles.dayMealsBody}>
                  {sd.isHoliday && <p role="note" className={styles.holidayReason}>Ngày nghỉ: {sd.holidayReason || "Ngày nghỉ toàn trường"}</p>}
                  {/* ========================================================
                      KHỐI BỮA TRƯA: BANNER CÓ MŨI TÊN SỔ LÊN / SỔ XUỐNG
                      ======================================================== */}
                  <div className={styles.mealBlock}>
                    <div
                      className={styles.lunchBanner}
                      onClick={() => toggleCollapse(sd.dateISO, "LUNCH")}
                      title="Bấm để sổ lên / sổ xuống bữa trưa"
                    >
                      <div className={styles.bannerLeft}>
                        <Utensils size={13} className={styles.lunchIcon} />
                        <span className={styles.lunchTitle}>BỮA TRƯA</span>
                        {hasLunch && (
                          <span className={styles.mealCountBadge}>
                            ({lunchDishes.length})
                          </span>
                        )}
                      </div>

                      <div className={styles.bannerActions}>
                        <button
                          type="button"
                          className={styles.collapseToggleBtn}
                          aria-label={
                            isLunchCollapsed ? "Mở rộng bữa trưa" : "Thu gọn bữa trưa"
                          }
                        >
                          {isLunchCollapsed ? (
                            <ChevronDown size={14} />
                          ) : (
                            <ChevronUp size={14} />
                          )}
                        </button>
                      </div>
                    </div>

                    {!isLunchCollapsed && (
                      <div className={styles.collapsibleContent}>
                        {hasLunch ? (
                          <div className={styles.dishesListLunch}>
                            {lunchDishes.map((dish, idx) => {
                              const dishKey = dish.dishId || dish.id
                              const sub =
                                dish.substituteDish ||
                                dayMeals.substitutesByMeal?.LUNCH?.[dishKey] ||
                                (dayMeals.substituteDish?.substituteForDishId === dishKey
                                  ? dayMeals.substituteDish
                                  : null)

                              return (
                                <div
                                  key={dishKey || idx}
                                  className={styles.lunchDishRow}
                                  onClick={() =>
                                    openDay("LUNCH")
                                  }
                                  title={`Món: ${dish.name} — Bấm để chỉnh sửa`}
                                >
                                  <div className={styles.dishCol}>
                                    <div className={styles.dishLeftWrap}>
                                      <span className={styles.dishDotLunch} />
                                      <span className={styles.dishName}>
                                        {dish.name}
                                      </span>
                                    </div>
                                    {sub && (
                                      <div className={styles.substituteDishNote}>
                                        ({sub.name})
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <div
                            className={styles.emptySingleMealBox}
                            onClick={() =>
                              openDay("LUNCH")
                            }
                            title="Bấm để thêm món trưa"
                          >
                            <span className={styles.emptyMealText}>
                              Chưa có món trưa
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ========================================================
                      KHỐI BỮA XẾ: BANNER CÓ MŨI TÊN SỔ LÊN / SỔ XUỐNG
                      ======================================================== */}
                  <div className={styles.mealBlock}>
                    <div
                      className={styles.afternoonBanner}
                      onClick={() => toggleCollapse(sd.dateISO, "AFTERNOON")}
                      title="Bấm để sổ lên / sổ xuống bữa xế"
                    >
                      <div className={styles.bannerLeft}>
                        <Coffee size={13} className={styles.afternoonIcon} />
                        <span className={styles.afternoonTitle}>BỮA XẾ</span>
                        {hasAfternoon && (
                          <span className={styles.mealCountBadge}>
                            ({afternoonDishes.length})
                          </span>
                        )}
                      </div>

                      <div className={styles.bannerActions}>
                        <button
                          type="button"
                          className={styles.collapseToggleBtn}
                          aria-label={
                            isAfternoonCollapsed
                              ? "Mở rộng bữa xế"
                              : "Thu gọn bữa xế"
                          }
                        >
                          {isAfternoonCollapsed ? (
                            <ChevronDown size={14} />
                          ) : (
                            <ChevronUp size={14} />
                          )}
                        </button>
                      </div>
                    </div>

                    {!isAfternoonCollapsed && (
                      <div className={styles.collapsibleContent}>
                        {hasAfternoon ? (
                          <div className={styles.dishesListAfternoon}>
                            {afternoonDishes.map((dish, idx) => {
                              const dishKey = dish.dishId || dish.id
                              const sub =
                                dish.substituteDish ||
                                dayMeals.substitutesByMeal?.AFTERNOON?.[dishKey] ||
                                (dayMeals.substituteDish?.substituteForDishId === dishKey
                                  ? dayMeals.substituteDish
                                  : null)

                              return (
                                <div
                                  key={dishKey || idx}
                                  className={styles.afternoonDishRow}
                                  onClick={() =>
                                    openDay("AFTERNOON")
                                  }
                                  title={`Món: ${dish.name} — Bấm để chỉnh sửa`}
                                >
                                  <div className={styles.dishCol}>
                                    <div className={styles.dishLeftWrap}>
                                      <span className={styles.dishDotAfternoon} />
                                      <span className={styles.dishName}>
                                        {dish.name}
                                      </span>
                                    </div>
                                    {sub && (
                                      <div className={styles.substituteDishNote}>
                                        ({sub.name})
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <div
                            className={styles.emptySingleMealBoxSm}
                            onClick={() =>
                              openDay("AFTERNOON")
                            }
                            title="Bấm để thêm món xế"
                          >
                            <span className={styles.emptyMealText}>
                              Chưa có món xế
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ========================================================
                      KHỐI GIA VỊ: BANNER CÓ MŨI TÊN SỔ LÊN / SỔ XUỐNG
                      ======================================================== */}
                  <div className={styles.mealBlock}>
                    <div
                      className={styles.seasoningBanner}
                      onClick={() => toggleCollapse(sd.dateISO, "SEASONINGS")}
                      title="Bấm để sổ lên / sổ xuống gia vị"
                    >
                      <div className={styles.bannerLeft}>
                        <Sparkles size={13} className={styles.seasoningIcon} />
                        <span className={styles.seasoningTitle}>GIA VỊ</span>
                        {hasSeasonings && (
                          <span className={styles.mealCountBadge}>
                            ({seasonings.length})
                          </span>
                        )}
                      </div>

                      <div className={styles.bannerActions}>
                        <button
                          type="button"
                          className={styles.collapseToggleBtn}
                          aria-label={
                            isSeasoningCollapsed
                              ? "Mở rộng gia vị"
                              : "Thu gọn gia vị"
                          }
                        >
                          {isSeasoningCollapsed ? (
                            <ChevronDown size={14} />
                          ) : (
                            <ChevronUp size={14} />
                          )}
                        </button>
                      </div>
                    </div>

                    {!isSeasoningCollapsed && (
                      <div className={styles.collapsibleContent}>
                        {hasSeasonings ? (
                          <div className={styles.dishesListSeasoning}>
                            {seasonings.map((s, idx) => (
                              <div
                                key={s.id || idx}
                                className={styles.seasoningDishRow}
                                onClick={() =>
                                  openDay("LUNCH")
                                }
                                title={`Gia vị: ${s.name}`}
                              >
                                <div className={styles.dishLeftWrap}>
                                  <span className={styles.dishDotSeasoning} />
                                  <span className={styles.seasoningNameText}>
                                    {s.name.replace(/\(.*?\)/g, "").trim()}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div
                            className={styles.emptySingleMealBoxSm}
                            onClick={() =>
                              openDay("LUNCH")
                            }
                            title="Tự động tính từ các món ăn"
                          >
                            <span className={styles.emptyMealText}>
                              Tự động tính theo món ăn
                            </span>
                          </div>
                        )}
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
