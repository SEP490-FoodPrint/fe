import React from "react"
import { Utensils, Coffee, CalendarOff, CheckCircle2, AlertCircle } from "lucide-react"
import KitchenMenuDishCard from "./KitchenMenuDishCard"
// Dùng chung giao diện thẻ ngày với màn Danh sách thực đơn của nhân viên dinh dưỡng
import nv from "src/pages/SCHOOL/MenuPlanning/component/MenuListWeeklyVerticalView.module.scss"
import { dayTintStyle } from "src/utils/dayTint"

export default function KitchenMenuDayCard({
  dayData,
  isToday = false,
  mealTypeFilter = "ALL",
}) {
  const isHoliday = Boolean(dayData?.isHoliday)
  const holidayReason = dayData?.holidayReason || "Ngày nghỉ toàn trường"
  const showLunch = mealTypeFilter === "ALL" || mealTypeFilter === "LUNCH"
  const showAfternoon = mealTypeFilter === "ALL" || mealTypeFilter === "AFTERNOON"
  const lunchDishes = showLunch ? dayData?.meals?.LUNCH?.dishes || [] : []
  const afternoonDishes = showAfternoon ? dayData?.meals?.AFTERNOON?.dishes || [] : []

  // Mỗi thứ chỉ báo đủ/thiếu bữa (trạng thái duyệt là của cả tuần, hiện ở đầu trang)
  const hasLunch = (dayData?.meals?.LUNCH?.dishes || []).length > 0
  const hasAfternoon = (dayData?.meals?.AFTERNOON?.dishes || []).length > 0
  const mealProgress = isHoliday
    ? null
    : !hasLunch && !hasAfternoon
      ? null // chưa có món thì không hiện nhãn
      : !hasLunch
        ? { label: "Thiếu bữa trưa", className: nv.badgePartial, Icon: AlertCircle }
        : !hasAfternoon
          ? { label: "Thiếu bữa xế", className: nv.badgePartial, Icon: AlertCircle }
          : { label: "Đủ bữa", className: nv.badgeCompleted, Icon: CheckCircle2 }

  return (
    <div
      className={`${nv.dayCard} ${isToday ? nv.todayDayCard : ""} ${isHoliday ? nv.holidayDayCard : ""}`}
      style={dayTintStyle(dayData?.dateISO ?? dayData?.dayOfWeek, { holiday: isHoliday })}
    >
      {/* HÀNG 1: Header ngày */}
      <div className={nv.dayHeader}>
        <div className={nv.dayTitleRow}>
          <div className={nv.dayTitleLeft}>
            <span className={nv.dayLabel}>{dayData?.dayLabel}</span>
          </div>
          {mealProgress && (
            <span className={`${nv.dayProgressBadge} ${mealProgress.className}`}>
              <mealProgress.Icon size={12} />
              <span>{mealProgress.label}</span>
            </span>
          )}
        </div>
        <div className={nv.dayDateRow}>
          <span className={nv.dayDateText}>{dayData?.dateVN}</span>
        </div>
      </div>

      {isHoliday ? (
        <div className={nv.holidayCardBody}>
          <div className={nv.holidayIconWrap}>
            <CalendarOff size={24} className={nv.holidayIcon} />
          </div>
          <div className={nv.holidayReasonBox} title={holidayReason}>
            <span className={nv.holidayReasonText}>{holidayReason}</span>
          </div>
          <span className={nv.holidaySubText}>Không phục vụ ăn bán trú</span>
        </div>
      ) : (
        <div className={nv.dayMealsBody}>
          {showLunch && (
            <div className={nv.mealBlock}>
              <div className={nv.lunchBanner}>
                <div className={nv.bannerLeft}>
                  <Utensils size={13} className={nv.lunchIcon} />
                  <span className={nv.lunchTitle}>BỮA TRƯA</span>
                </div>
              </div>
              {lunchDishes.length > 0 ? (
                <div className={nv.dishesListLunch}>
                  {lunchDishes.map((dish) => (
                    <KitchenMenuDishCard key={dish.id || dish.name} dish={dish} mealType="LUNCH" />
                  ))}
                </div>
              ) : (
                <div className={nv.emptySingleMealBox}>
                  <span className={nv.emptyMealText}>Chưa có thực đơn trưa</span>
                </div>
              )}
            </div>
          )}

          {showAfternoon && (
            <div className={nv.mealBlock}>
              <div className={nv.afternoonBanner}>
                <div className={nv.bannerLeft}>
                  <Coffee size={13} className={nv.afternoonIcon} />
                  <span className={nv.afternoonTitle}>BỮA XẾ</span>
                </div>
              </div>
              {afternoonDishes.length > 0 ? (
                <div className={nv.dishesListAfternoon}>
                  {afternoonDishes.map((dish) => (
                    <KitchenMenuDishCard key={dish.id || dish.name} dish={dish} mealType="AFTERNOON" />
                  ))}
                </div>
              ) : (
                <div className={nv.emptySingleMealBoxSm}>
                  <span className={nv.emptyMealText}>Chưa có thực đơn xế</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
