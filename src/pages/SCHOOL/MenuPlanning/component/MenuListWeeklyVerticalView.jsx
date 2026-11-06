import React, { useState, useEffect } from "react"
import { Calendar, Utensils, Coffee, Eye, Edit3, AlertTriangle } from "lucide-react"
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

  // Kiểm tra quyền chỉnh sửa phù hợp với trạng thái (chỉ DRAFT hoặc REVISION_REQUESTED mới sửa được)
  const canEditMenu = (menu) => {
    if (!menu) return false
    return menu.status === "DRAFT" || menu.status === "REVISION_REQUESTED"
  }

  // Lấy dữ liệu thực đơn và món ăn chuẩn cho từng ngày trong tuần
  const getDayMealsData = (sd) => {
    const defaultDay = DEFAULT_WEEKLY_MENU[sd.dayOfWeek] || {}

    // Tìm thực đơn tương ứng từ danh sách menus
    const dayMenus = menus.filter(
      (m) => m.rawDate === sd.dateISO || m.date === sd.dateVN
    )
    const lunchMenu = dayMenus.find((m) => m.mealType === "LUNCH")
    const afternoonMenu = dayMenus.find((m) => m.mealType === "AFTERNOON")

    // Thực đơn Bữa Trưa (fallback dữ liệu mock nếu chưa có từ DB)
    const resolvedLunchMenu = lunchMenu || {
      id: `menu-${sd.dateISO}-lunch`,
      name: `Thực đơn Bữa trưa (${sd.dayLabel})`,
      code: `TD-${sd.dateISO.replace(/-/g, "")}-01`,
      date: sd.dateVN,
      rawDate: sd.dateISO,
      mealType: "LUNCH",
      mealTypeLabel: "Trưa",
      status: "APPROVED",
      statusLabel: "Đã duyệt",
      portionCount: 1250,
      dishes: defaultDay?.meals?.LUNCH?.dishes || [],
    }

    // Thực đơn Bữa Xế (fallback dữ liệu mock nếu chưa có từ DB)
    const resolvedAfternoonMenu = afternoonMenu || {
      id: `menu-${sd.dateISO}-afternoon`,
      name: `Thực đơn Bữa xế (${sd.dayLabel})`,
      code: `TD-${sd.dateISO.replace(/-/g, "")}-02`,
      date: sd.dateVN,
      rawDate: sd.dateISO,
      mealType: "AFTERNOON",
      mealTypeLabel: "Chiều",
      status: "APPROVED",
      statusLabel: "Đã duyệt",
      portionCount: 1250,
      dishes: defaultDay?.meals?.AFTERNOON?.dishes || [],
    }

    // Món Bữa Trưa
    let lunchDishes = []
    if (resolvedLunchMenu.dishes?.length > 0) {
      lunchDishes = resolvedLunchMenu.dishes.map((d, i) => ({
        id: d.id || `dish-${sd.dayOfWeek}-l-${i}`,
        name: d.name,
        qty: d.qty || "65g",
      }))
    }

    // Món Bữa Xế
    let afternoonDishes = []
    if (resolvedAfternoonMenu.dishes?.length > 0) {
      afternoonDishes = resolvedAfternoonMenu.dishes.map((d, i) => ({
        id: d.id || `dish-${sd.dayOfWeek}-a-${i}`,
        name: d.name,
        qty: d.qty || "80g",
      }))
    }

    // Lọc theo ca ăn
    if (mealTypeFilter === "LUNCH") {
      afternoonDishes = []
    } else if (mealTypeFilter === "AFTERNOON") {
      lunchDishes = []
    }

    const primaryMenu = lunchMenu || afternoonMenu || resolvedLunchMenu

    return {
      resolvedLunchMenu,
      resolvedAfternoonMenu,
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
              resolvedLunchMenu,
              resolvedAfternoonMenu,
              primaryMenu,
              lunchDishes,
              afternoonDishes,
              hasAllergy,
            } = getDayMealsData(sd)

            const isHiddenOnMobile =
              selectedDayOfWeek !== "ALL" && selectedDayOfWeek !== sd.dayOfWeek

            const canEditLunch = canEditMenu(resolvedLunchMenu)
            const canEditAfternoon = canEditMenu(resolvedAfternoonMenu)

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

                          {/* Bữa trưa: Nút Chi tiết & Sửa CHỈ ĐỂ ICON, phù hợp với trạng thái */}
                          <div className={styles.bannerActions}>
                            <button
                              type="button"
                              className={`${styles.mealIconBtn} ${styles.lunchIconBtn}`}
                              onClick={() => onViewDetail(resolvedLunchMenu)}
                              title="Xem chi tiết thực đơn bữa trưa"
                              aria-label="Xem chi tiết bữa trưa"
                            >
                              <Eye size={13} />
                            </button>
                            {canEditLunch && (
                              <button
                                type="button"
                                className={`${styles.mealIconBtn} ${styles.lunchEditBtn} ${
                                  resolvedLunchMenu.status === "REVISION_REQUESTED"
                                    ? styles.revisionEditBtn
                                    : ""
                                }`}
                                onClick={() => onEditMenu(resolvedLunchMenu)}
                                title={
                                  resolvedLunchMenu.status === "REVISION_REQUESTED"
                                    ? "Chỉnh sửa thực đơn theo yêu cầu BGH"
                                    : "Chỉnh sửa thực đơn bữa trưa"
                                }
                                aria-label="Chỉnh sửa bữa trưa"
                              >
                                <Edit3 size={13} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Danh sách 5 món trưa: Di chuột vào hover THEO MÀU BỮA TRƯA */}
                        <div className={styles.dishesListLunch}>
                          {lunchDishes.map((dish) => (
                            <div
                              key={dish.id}
                              className={styles.lunchDishRow}
                              onClick={() => onViewDetail(resolvedLunchMenu)}
                              title={`Món: ${dish.name} (Bữa trưa) — Bấm xem chi tiết`}
                            >
                              <span className={styles.dishName}>
                                {dish.name}
                              </span>
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

                          {/* Bữa xế: Nút Chi tiết & Sửa CHỈ ĐỂ ICON, phù hợp với trạng thái */}
                          <div className={styles.bannerActions}>
                            <button
                              type="button"
                              className={`${styles.mealIconBtn} ${styles.afternoonIconBtn}`}
                              onClick={() => onViewDetail(resolvedAfternoonMenu)}
                              title="Xem chi tiết thực đơn bữa xế"
                              aria-label="Xem chi tiết bữa xế"
                            >
                              <Eye size={13} />
                            </button>
                            {canEditAfternoon && (
                              <button
                                type="button"
                                className={`${styles.mealIconBtn} ${styles.afternoonEditBtn} ${
                                  resolvedAfternoonMenu.status === "REVISION_REQUESTED"
                                    ? styles.revisionEditBtn
                                    : ""
                                }`}
                                onClick={() => onEditMenu(resolvedAfternoonMenu)}
                                title={
                                  resolvedAfternoonMenu.status === "REVISION_REQUESTED"
                                    ? "Chỉnh sửa thực đơn theo yêu cầu BGH"
                                    : "Chỉnh sửa thực đơn bữa xế"
                                }
                                aria-label="Chỉnh sửa bữa xế"
                              >
                                <Edit3 size={13} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Danh sách món xế: Di chuột vào hover THEO MÀU BỮA XẾ */}
                        <div className={styles.dishesListAfternoon}>
                          {afternoonDishes.map((dish) => (
                            <div
                              key={dish.id}
                              className={styles.afternoonDishRow}
                              onClick={() => onViewDetail(resolvedAfternoonMenu)}
                              title={`Món: ${dish.name} (Bữa xế) — Bấm xem chi tiết`}
                            >
                              <span className={styles.dishName}>
                                {dish.name}
                              </span>
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

                  {/* CHÂN CỘT: Trạng thái phê duyệt & Cảnh báo dị ứng (40px) */}
                  <div className={styles.dayFooter}>
                    <div className={styles.footerLeft}>
                      {getStatusBadge(primaryMenu?.status || "APPROVED")}
                    </div>
                    <div className={styles.footerRight}>
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
