import React, { useState, useEffect, useMemo } from "react"
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
  weekStatus: propWeekStatus,
  weekFeedback: propWeekFeedback,
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

  // Trạng thái chung của cả tuần (1 tuần 1 trạng thái đồng nhất, không trạng thái từng ngày)
  const weekStatus = useMemo(() => {
    if (propWeekStatus) return propWeekStatus
    const dayStatuses = menus.map((m) => m.status).filter(Boolean)
    if (dayStatuses.includes("REVISION_REQUESTED")) return "REVISION_REQUESTED"
    if (dayStatuses.includes("PENDING_APPROVAL")) return "PENDING_APPROVAL"
    if (dayStatuses.includes("DRAFT")) return "DRAFT"
    if (dayStatuses.length > 0) return dayStatuses[0]
    return "APPROVED"
  }, [propWeekStatus, menus])

  // Phản hồi chỉnh sửa từ BGH nếu tuần có yêu cầu sửa
  const weekFeedback = useMemo(() => {
    if (propWeekFeedback) return propWeekFeedback
    const revMenu = menus.find(
      (m) => m.feedback && m.status === "REVISION_REQUESTED"
    )
    return revMenu?.feedback || ""
  }, [propWeekFeedback, menus])

  // Quyền chỉnh sửa theo tuần: Chỉ tuần DRAFT hoặc REVISION_REQUESTED mới được sửa
  const canEditWeeklyMenu =
    weekStatus === "DRAFT" || weekStatus === "REVISION_REQUESTED"

  const getWeekStatusLabel = (status) => {
    switch (status) {
      case "REVISION_REQUESTED":
        return "Yêu cầu chỉnh sửa"
      case "PENDING_APPROVAL":
        return "Chờ BGH duyệt"
      case "DRAFT":
        return "Bản nháp"
      case "APPROVED":
      default:
        return "Đã duyệt BGH"
    }
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

    // Thực đơn Bữa Trưa (đồng bộ trạng thái theo tuần)
    const resolvedLunchMenu = lunchMenu || {
      id: `menu-${sd.dateISO}-lunch`,
      name: `Thực đơn Bữa trưa (${sd.dayLabel})`,
      code: `TD-${sd.dateISO.replace(/-/g, "")}-01`,
      date: sd.dateVN,
      rawDate: sd.dateISO,
      mealType: "LUNCH",
      mealTypeLabel: "Trưa",
      status: weekStatus,
      statusLabel: getWeekStatusLabel(weekStatus),
      portionCount: 1250,
      dishes: defaultDay?.meals?.LUNCH?.dishes || [],
    }

    // Thực đơn Bữa Xế (đồng bộ trạng thái theo tuần)
    const resolvedAfternoonMenu = afternoonMenu || {
      id: `menu-${sd.dateISO}-afternoon`,
      name: `Thực đơn Bữa xế (${sd.dayLabel})`,
      code: `TD-${sd.dateISO.replace(/-/g, "")}-02`,
      date: sd.dateVN,
      rawDate: sd.dateISO,
      mealType: "AFTERNOON",
      mealTypeLabel: "Chiều",
      status: weekStatus,
      statusLabel: getWeekStatusLabel(weekStatus),
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
      hasAllergy: Boolean(
        lunchMenu?.hasAllergyMenu || afternoonMenu?.hasAllergyMenu
      ),
    }
  }

  // Badge trạng thái của CẢ TUẦN (Hiển thị tập trung ở đầu tuần)
  const getWeekStatusBadge = (status) => {
    switch (status) {
      case "REVISION_REQUESTED":
        return (
          <span
            className={`${styles.weekStatusBadge} ${styles.statusRevision}`}
            title="Ban Giám Hiệu yêu cầu chỉnh sửa thực đơn tuần này"
          >
            <span className="material-symbols-outlined text-[15px]">
              warning
            </span>
            <span>Yêu cầu chỉnh sửa</span>
          </span>
        )
      case "PENDING_APPROVAL":
        return (
          <span
            className={`${styles.weekStatusBadge} ${styles.statusPending}`}
            title="Thực đơn tuần này đang chờ BGH phê duyệt"
          >
            <span className="material-symbols-outlined text-[15px]">
              schedule
            </span>
            <span>Chờ BGH duyệt</span>
          </span>
        )
      case "DRAFT":
        return (
          <span
            className={`${styles.weekStatusBadge} ${styles.statusDraft}`}
            title="Thực đơn tuần này đang là bản nháp chưa gửi duyệt"
          >
            <span className="material-symbols-outlined text-[15px]">
              edit_note
            </span>
            <span>Bản nháp</span>
          </span>
        )
      case "APPROVED":
      default:
        return (
          <span
            className={`${styles.weekStatusBadge} ${styles.statusApproved}`}
            title="Thực đơn tuần này đã được Ban Giám Hiệu phê duyệt chính thức"
          >
            <span className="material-symbols-outlined text-[15px]">
              check_circle
            </span>
            <span>✓ Đã duyệt BGH</span>
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
          {/* Badge trạng thái duy nhất của CẢ TUẦN */}
          {getWeekStatusBadge(weekStatus)}
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

      {/* Banner phản hồi của BGH nếu tuần có yêu cầu chỉnh sửa */}
      {weekStatus === "REVISION_REQUESTED" && weekFeedback && (
        <div className={styles.weekFeedbackBanner}>
          <AlertTriangle size={16} className={styles.feedbackIcon} />
          <div className={styles.feedbackContent}>
            <span className={styles.feedbackTitle}>
              Yêu cầu chỉnh sửa từ Ban Giám Hiệu:
            </span>
            <span className={styles.feedbackText}>{weekFeedback}</span>
          </div>
        </div>
      )}

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

      {/* 3. Lưới 5 CỘT THỰC ĐƠN DỌC CHO CẢ TUẦN (Không còn trạng thái từng ngày) */}
      <div className={styles.weeklyGridWrapper}>
        <div className={styles.weeklyGrid}>
          {schoolDays.map((sd) => {
            const {
              resolvedLunchMenu,
              resolvedAfternoonMenu,
              lunchDishes,
              afternoonDishes,
              hasAllergy,
            } = getDayMealsData(sd)

            const isHiddenOnMobile =
              selectedDayOfWeek !== "ALL" && selectedDayOfWeek !== sd.dayOfWeek

            const canEditLunch = canEditWeeklyMenu
            const canEditAfternoon = canEditWeeklyMenu

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
                    <div className={styles.dayDateRow}>
                      <span className={styles.dayDateText}>{sd.dateVN}</span>
                      {hasAllergy && (
                        <span
                          className={styles.allergyTag}
                          title="Có học sinh dị ứng cần thực đơn riêng trong ngày này"
                        >
                          <AlertTriangle size={11} />
                          Dị ứng
                        </span>
                      )}
                    </div>
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
                                  weekStatus === "REVISION_REQUESTED"
                                    ? styles.revisionEditBtn
                                    : ""
                                }`}
                                onClick={() => onEditMenu(resolvedLunchMenu)}
                                title={
                                  weekStatus === "REVISION_REQUESTED"
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
                                  weekStatus === "REVISION_REQUESTED"
                                    ? styles.revisionEditBtn
                                    : ""
                                }`}
                                onClick={() => onEditMenu(resolvedAfternoonMenu)}
                                title={
                                  weekStatus === "REVISION_REQUESTED"
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
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
