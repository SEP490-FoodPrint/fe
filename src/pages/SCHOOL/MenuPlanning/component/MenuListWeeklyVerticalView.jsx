import React, { useState, useEffect } from "react"
import { Calendar, Utensils, Coffee, Eye, CheckCircle2, AlertTriangle, Edit3 } from "lucide-react"
import { DEFAULT_WEEKLY_MENU } from "src/pages/SCHOOL/KitchenCooking/KitchenMenu/component/mockWeeklyMenuData"
import styles from "./MenuListWeeklyVerticalView.module.scss"

export default function MenuListWeeklyVerticalView({
  schoolDays = [],
  menus = [],
  mealTypeFilter = "all",
  onViewDetail,
  onEditMenu,
  onNavigateCreate,
  viewMode = "vertical",
  onChangeViewMode,
  selectedWeekLabel = "",
  isCurrentWeek = false,
}) {
  // Mobile day switcher: 'ALL' hoặc dayOfWeek (1..5)
  const todayDay = schoolDays.find((d) => d.isToday)
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState(
    todayDay ? todayDay.dayOfWeek : 1
  )

  useEffect(() => {
    if (todayDay) {
      setSelectedDayOfWeek(todayDay.dayOfWeek)
    }
  }, [todayDay])

  // Lấy dữ liệu món ăn phân bổ cho từng ngày trong tuần
  const getDayMealsData = (sd) => {
    const defaultDay = DEFAULT_WEEKLY_MENU[sd.dayOfWeek] || {}

    // Tìm thực đơn tương ứng từ danh sách menus
    const dayMenus = menus.filter(
      (m) => m.rawDate === sd.dateISO || m.date === sd.dateVN
    )
    const lunchMenu = dayMenus.find((m) => m.mealType === "LUNCH")
    const afternoonMenu = dayMenus.find((m) => m.mealType === "AFTERNOON")

    // Món Bữa Trưa
    let lunchDishes = []
    if (lunchMenu?.dishes?.length > 0) {
      lunchDishes = lunchMenu.dishes.map((d, i) => ({
        id: d.id || `dish-${sd.dayOfWeek}-l-${i}`,
        name: d.name,
        qty: d.qty || "65g",
        ingredients: d.ingredients || [],
        menu: lunchMenu,
      }))
    } else if (defaultDay?.meals?.LUNCH?.dishes) {
      lunchDishes = defaultDay.meals.LUNCH.dishes.map((d) => ({
        ...d,
        qty: d.qty || "65g",
        menu: lunchMenu,
      }))
    }

    // Món Bữa Xế
    let afternoonDishes = []
    if (afternoonMenu?.dishes?.length > 0) {
      afternoonDishes = afternoonMenu.dishes.map((d, i) => ({
        id: d.id || `dish-${sd.dayOfWeek}-a-${i}`,
        name: d.name,
        qty: d.qty || "80g",
        ingredients: d.ingredients || [],
        menu: afternoonMenu,
      }))
    } else if (defaultDay?.meals?.AFTERNOON?.dishes) {
      afternoonDishes = defaultDay.meals.AFTERNOON.dishes.map((d) => ({
        ...d,
        qty: d.qty || "80g",
        menu: afternoonMenu,
      }))
    }

    // Lọc theo ca ăn
    if (mealTypeFilter === "LUNCH") {
      afternoonDishes = []
    } else if (mealTypeFilter === "AFTERNOON") {
      lunchDishes = []
    }

    const primaryMenu = lunchMenu || afternoonMenu

    return {
      lunchMenu,
      afternoonMenu,
      primaryMenu,
      lunchDishes,
      afternoonDishes,
      hasAllergy: Boolean(lunchMenu?.hasAllergyMenu || afternoonMenu?.hasAllergyMenu),
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "REVISION_REQUESTED":
        return (
          <span className={`${styles.statusPill} ${styles.revision}`}>
            Yêu cầu sửa
          </span>
        )
      case "APPROVED":
        return (
          <span className={`${styles.statusPill} ${styles.approved}`}>
            ✓ Đã duyệt BGH
          </span>
        )
      case "PENDING_APPROVAL":
        return (
          <span className={`${styles.statusPill} ${styles.pending}`}>
            Chờ duyệt
          </span>
        )
      case "DRAFT":
      default:
        return (
          <span className={`${styles.statusPill} ${styles.draft}`}>
            Bản nháp
          </span>
        )
    }
  }

  return (
    <div className={styles.verticalWeeklyContainer}>
      {/* 1. Bar điều khiển tuần & Chuyển đổi View Mode */}
      <div className={styles.topControlBar}>
        <div className={styles.weekTitleWrap}>
          <Calendar size={18} className={styles.weekCalendarIcon} />
          <span className={styles.weekLabelText}>
            {selectedWeekLabel || "Thực đơn tuần học đường"}
          </span>
          {isCurrentWeek && (
            <span className={styles.currentWeekTag}>Tuần này</span>
          )}
        </div>

        {/* Chuyển đổi chế độ xem */}
        <div className={styles.viewModeSwitcher}>
          <button
            type="button"
            className={`${styles.viewBtn} ${
              viewMode === "vertical" ? styles.viewBtnActive : ""
            }`}
            onClick={() => onChangeViewMode && onChangeViewMode("vertical")}
            title="Xem toàn bộ tuần dạng cột dọc (Mặc định)"
          >
            <span className="material-symbols-outlined text-[16px]">
              calendar_view_day
            </span>
            <span>Kiểu tuần dọc</span>
          </button>
          <button
            type="button"
            className={`${styles.viewBtn} ${
              viewMode === "table" ? styles.viewBtnActive : ""
            }`}
            onClick={() => onChangeViewMode && onChangeViewMode("table")}
            title="Xem bảng danh sách thực đơn"
          >
            <span className="material-symbols-outlined text-[16px]">
              table_rows
            </span>
            <span>Kiểu bảng</span>
          </button>
        </div>
      </div>

      {/* 2. Dải chọn ngày trên điện thoại (Mobile-first) */}
      <div className={styles.mobileDayBar}>
        <div className={styles.mobileDayList}>
          {schoolDays.map((day) => {
            const isSelected = selectedDayOfWeek === day.dayOfWeek
            return (
              <button
                key={day.dayOfWeek}
                type="button"
                className={`${styles.mobileDayPill} ${
                  isSelected ? styles.mobileDayPillActive : ""
                } ${day.isToday ? styles.mobileDayPillToday : ""}`}
                onClick={() => setSelectedDayOfWeek(day.dayOfWeek)}
              >
                <span className={styles.pillIndex}>{day.dayLabel?.slice(0, 7)}</span>
                <span className={styles.pillDate}>{day.dateVN?.slice(0, 5)}</span>
                {day.isToday && <span className={styles.pillDot} />}
              </button>
            )
          })}
          <button
            type="button"
            className={`${styles.mobileDayPill} ${
              selectedDayOfWeek === "ALL" ? styles.mobileDayPillActive : ""
            }`}
            onClick={() => setSelectedDayOfWeek("ALL")}
          >
            <span className={styles.pillIndex}>Cả tuần</span>
            <span className={styles.pillDate}>5 ngày</span>
          </button>
        </div>
      </div>

      {/* 3. Lưới 5 CỘT THỰC ĐƠN DỌC CHO CẢ TUẦN — CĂN BẰNG NHAU TUYỆT ĐỐI */}
      <div className={styles.weeklyGridWrapper}>
        <div className={styles.weeklyGrid}>
          {schoolDays.map((sd) => {
            const {
              lunchMenu,
              afternoonMenu,
              primaryMenu,
              lunchDishes,
              afternoonDishes,
              hasAllergy,
            } = getDayMealsData(sd)

            const isHiddenOnMobile =
              selectedDayOfWeek !== "ALL" && selectedDayOfWeek !== sd.dayOfWeek

            return (
              <div
                key={sd.dayOfWeek}
                className={`${styles.dayColItem} ${
                  isHiddenOnMobile ? styles.mobileHidden : ""
                }`}
              >
                <div
                  className={`${styles.dayCard} ${
                    sd.isToday ? styles.todayDayCard : ""
                  }`}
                >
                  {/* HÀNG 1: Header Cột Ngày (66px) */}
                  <div className={styles.dayHeader}>
                    <div className={styles.dayTitleRow}>
                      <Calendar size={15} className={styles.dayCalIcon} />
                      <span className={styles.dayLabel}>{sd.dayLabel}</span>
                      {sd.isToday && (
                        <span className={styles.todayPill}>Hôm nay</span>
                      )}
                    </div>
                    <span className={styles.dayDateText}>{sd.dateVN}</span>
                  </div>

                  {/* THÂN THỰC ĐƠN: XẾP DỌC BỮA TRƯA & BỮA XẾ */}
                  <div className={styles.dayMealsBody}>
                    {/* KHỐI BỮA TRƯA: Banner 38px + Danh sách món 270px */}
                    {(mealTypeFilter === "all" || mealTypeFilter === "LUNCH") && (
                      <div className={styles.mealBlock}>
                        <div className={styles.lunchBanner}>
                          <div className={styles.bannerLeft}>
                            <Utensils size={13} className={styles.lunchIcon} />
                            <span className={styles.lunchTitle}>BỮA TRƯA</span>
                          </div>
                          <span className={styles.lunchBadge}>
                            {lunchDishes.length} món
                          </span>
                        </div>

                        <div className={styles.dishesListLunch}>
                          {lunchDishes.map((dish) => (
                            <div
                              key={dish.id}
                              className={styles.dishRow}
                              onClick={() => {
                                if (dish.menu) onViewDetail(dish.menu)
                              }}
                              title={`Món: ${dish.name} — Bấm xem chi tiết`}
                            >
                              <span className={styles.dishName}>
                                {dish.name}
                              </span>
                              <div className={styles.dishRightWrap}>
                                <button
                                  type="button"
                                  className={styles.viewDishBtn}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (dish.menu) onViewDetail(dish.menu)
                                  }}
                                  title="Xem chi tiết"
                                >
                                  <Eye size={12} className={styles.eyeIcon} />
                                </button>
                              </div>
                            </div>
                          ))}
                          {lunchDishes.length === 0 && (
                            <div className={styles.emptyMealNotice}>
                              Chưa có món trưa
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* KHỐI BỮA XẾ: Banner 38px + Danh sách món 54px */}
                    {(mealTypeFilter === "all" ||
                      mealTypeFilter === "AFTERNOON") && (
                      <div className={styles.mealBlock}>
                        <div className={styles.afternoonBanner}>
                          <div className={styles.bannerLeft}>
                            <Coffee
                              size={13}
                              className={styles.afternoonIcon}
                            />
                            <span className={styles.afternoonTitle}>
                              BỮA XẾ
                            </span>
                          </div>
                          <span className={styles.afternoonBadge}>
                            {afternoonDishes.length} món
                          </span>
                        </div>

                        <div className={styles.dishesListAfternoon}>
                          {afternoonDishes.map((dish) => (
                            <div
                              key={dish.id}
                              className={styles.dishRow}
                              onClick={() => {
                                if (dish.menu) onViewDetail(dish.menu)
                              }}
                              title={`Món: ${dish.name} — Bấm xem chi tiết`}
                            >
                              <span className={styles.dishName}>
                                {dish.name}
                              </span>
                              <div className={styles.dishRightWrap}>
                                <button
                                  type="button"
                                  className={styles.viewDishBtn}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (dish.menu) onViewDetail(dish.menu)
                                  }}
                                  title="Xem chi tiết"
                                >
                                  <Eye size={12} className={styles.eyeIcon} />
                                </button>
                              </div>
                            </div>
                          ))}
                          {afternoonDishes.length === 0 && (
                            <div className={styles.emptyMealNoticeSm}>
                              Chưa có món xế
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CHÂN CỘT: Trạng thái & Nút thao tác nhanh (44px) */}
                  <div className={styles.dayFooter}>
                    <div className={styles.footerLeft}>
                      {getStatusBadge(primaryMenu?.status || "APPROVED")}
                      {hasAllergy && (
                        <span
                          className={styles.allergyWarningTag}
                          title="Có học sinh dị ứng cần thực đơn riêng"
                        >
                          <AlertTriangle size={11} />
                          Dị ứng
                        </span>
                      )}
                    </div>
                    <div className={styles.footerActions}>
                      {primaryMenu && (
                        <button
                          type="button"
                          className={styles.actionBtnSmall}
                          onClick={() => onViewDetail(primaryMenu)}
                          title="Xem chi tiết thực đơn"
                        >
                          <Eye size={14} />
                        </button>
                      )}
                      {(primaryMenu?.status === "DRAFT" ||
                        primaryMenu?.status === "REVISION_REQUESTED") && (
                        <button
                          type="button"
                          className={`${styles.actionBtnSmall} ${styles.editBtn}`}
                          onClick={() => onEditMenu(primaryMenu)}
                          title="Chỉnh sửa thực đơn"
                        >
                          <Edit3 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
