import React, { useState, useEffect, useMemo } from "react"
import {
  Calendar,
  Utensils,
  Coffee,
  Sparkles,
  Eye,
  Edit2,
  AlertTriangle,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  FileEdit,
  PlusCircle,
  AlertCircle,
  CalendarCheck,
  CalendarOff,
} from "lucide-react"
import styles from "./MenuListWeeklyVerticalView.module.scss"

export default function MenuListWeeklyVerticalView({
  schoolDays = [],
  menus = [],
  allMenus = menus,
  mealTypeFilter = "all",
  onViewDetail,
  onEditMenu,
  onNavigateCreate,
  selectedWeekLabel = "",
  weeklyMenuTitle = "",
  targetScope = "",
  isCurrentWeek = false,
  weekStatus: propWeekStatus,
  weekFeedback: propWeekFeedback,
  onSubmitWeeklyMenu,
  onResubmitWeeklyMenu,
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

  // Trạng thái chung của cả tuần
  const weekStatus = useMemo(() => {
    if (propWeekStatus) return propWeekStatus
    const savedStatus = allMenus[0]?.weeklyStatus
    if (savedStatus) return savedStatus
    const dayStatuses = allMenus.map((m) => m.status).filter(Boolean)
    if (dayStatuses.includes("REVISION_REQUESTED")) return "REVISION_REQUESTED"
    if (dayStatuses.includes("PENDING_APPROVAL")) return "PENDING_APPROVAL"
    if (dayStatuses.includes("DRAFT")) return "DRAFT"
    if (dayStatuses.length > 0) return dayStatuses[0]
    return "DRAFT"
  }, [propWeekStatus, allMenus])

  // Phản hồi chỉnh sửa từ BGH nếu tuần có yêu cầu sửa
  const weekFeedback = useMemo(() => {
    if (propWeekFeedback) return propWeekFeedback
    const revMenu = menus.find(
      (m) => m.feedback && (m.status === "REVISION_REQUESTED" || m.status === "REVISION_REQUIRED")
    )
    return revMenu?.feedback || ""
  }, [propWeekFeedback, menus])

  // Quyền chỉnh sửa: Chỉ tuần DRAFT hoặc REVISION_REQUESTED mới được sửa/thêm
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
        return "Đã duyệt"
    }
  }

  // Đánh giá dữ liệu & tiến độ nhập liệu của từng ngày
  const dayEvaluations = useMemo(() => {
    const map = {}
    schoolDays.forEach((sd) => {
      // 1. Ngày nghỉ theo setup BGH: Không bắt buộc có ca ăn
      if (sd.isHoliday) {
        map[sd.dayOfWeek] = {
          isHoliday: true,
          holidayReason: sd.holidayReason,
          hasLunch: false,
          hasAfternoon: false,
          resolvedLunchMenu: null,
          resolvedAfternoonMenu: null,
          lunchDishes: [],
          afternoonDishes: [],
          progress: {
            type: "HOLIDAY",
            label: "Nghỉ",
            badgeClass: styles.badgeHoliday,
            IconComponent: CalendarOff,
            note: sd.holidayReason,
          },
          hasAllergy: false,
        }
        return
      }

      const dayMenus = menus.filter(
        (m) => m.rawDate === sd.dateISO || m.date === sd.dateVN
      )
      const lunchMenu = dayMenus.find((m) => m.mealType === "LUNCH")
      const afternoonMenu = dayMenus.find((m) => m.mealType === "AFTERNOON")

      const savedDayMenus = allMenus.filter(m => m.rawDate === sd.dateISO || m.date === sd.dateVN)
      const hasLunch = savedDayMenus.some(m => m.mealType === "LUNCH" && m.dishes?.length)
      const hasAfternoon = savedDayMenus.some(m => m.mealType === "AFTERNOON" && m.dishes?.length)
      const isEmpty = !hasLunch && !hasAfternoon

      const statuses = savedDayMenus.map(menu => menu.status)
      let progress
      if (isEmpty) {
        progress = { type: "EMPTY", label: "Chưa tạo", badgeClass: styles.badgeEmpty, IconComponent: PlusCircle }
      } else if (!hasLunch || !hasAfternoon) {
        progress = { type: hasLunch ? "PARTIAL_AFTERNOON" : "PARTIAL_LUNCH", label: hasLunch ? "Thiếu xế" : "Thiếu trưa", badgeClass: styles.badgePartial, IconComponent: AlertCircle }
      } else if (statuses.some(status => ["REVISION_REQUESTED", "REVISION_REQUIRED"].includes(status))) {
        progress = { type: "REVISION_REQUIRED", label: "Cần sửa", badgeClass: styles.badgeRevision, IconComponent: AlertTriangle, note: savedDayMenus.find(menu => menu.feedback)?.feedback || weekFeedback }
      } else if (statuses.includes("PENDING_APPROVAL")) {
        progress = { type: "PENDING", label: "Chờ duyệt", badgeClass: styles.badgePending, IconComponent: Clock }
      } else if (statuses.length && statuses.every(status => status === "APPROVED")) {
        progress = { type: "APPROVED", label: "Đã duyệt", badgeClass: styles.badgeApproved, IconComponent: CheckCircle2 }
      } else {
        progress = { type: "COMPLETED", label: "Đủ bữa", badgeClass: styles.badgeCompleted, IconComponent: CheckCircle2 }
      }

      const resolvedLunch = lunchMenu || null
      const resolvedAfternoon = afternoonMenu || null

      map[sd.dayOfWeek] = {
        hasLunch,
        hasAfternoon,
        resolvedLunchMenu: resolvedLunch,
        resolvedAfternoonMenu: resolvedAfternoon,
        lunchDishes: resolvedLunch?.dishes || [],
        afternoonDishes: resolvedAfternoon?.dishes || [],
        seasonings: [...new Set(dayMenus.flatMap(menu => menu.seasonings || [])
          .map(item => typeof item === "string" ? item : item.name).filter(Boolean))],
        progress,
        hasAllergy: Boolean(
          resolvedLunch?.hasAllergyMenu || resolvedAfternoon?.hasAllergyMenu
        ),
      }
    })
    return map
  }, [schoolDays, menus, allMenus, weekFeedback])

  // Thống kê tiến độ nhập liệu của tuần (bỏ qua ngày nghỉ BGH)
  const weekProgressStats = useMemo(() => {
    let completedDays = 0
    let totalSchoolDays = 0
    schoolDays.forEach((sd) => {
      if (sd.isHoliday) return
      totalSchoolDays += 1
      const dayData = dayEvaluations[sd.dayOfWeek]
      if (dayData && dayData.hasLunch && dayData.hasAfternoon) {
        completedDays += 1
      }
    })
    const isAllCompleted = completedDays === totalSchoolDays && totalSchoolDays > 0
    return { completedDays, totalDays: totalSchoolDays, isAllCompleted }
  }, [schoolDays, dayEvaluations])

  // Badge trạng thái của CẢ TUẦN
  const renderWeekStatusBadge = (status) => {
    switch (status) {
      case "REVISION_REQUESTED":
        return (
          <span
            className={`${styles.weekStatusBadge} ${styles.statusRevision}`}
            title="Ban Giám Hiệu yêu cầu chỉnh sửa thực đơn tuần này"
          >
            <AlertTriangle size={13} />
            <span>Yêu cầu sửa</span>
          </span>
        )
      case "PENDING_APPROVAL":
        return (
          <span
            className={`${styles.weekStatusBadge} ${styles.statusPending}`}
            title="Thực đơn tuần này đang chờ BGH phê duyệt"
          >
            <Clock size={13} />
            <span>Chờ BGH duyệt</span>
          </span>
        )
      case "DRAFT":
        return (
          <span
            className={`${styles.weekStatusBadge} ${styles.statusDraft}`}
            title="Thực đơn tuần này đang là bản nháp soạn thảo của Y tế"
          >
            <FileEdit size={13} />
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
            <CheckCircle2 size={13} />
            <span>Đã duyệt</span>
          </span>
        )
    }
  }

  return (
    <div className={styles.verticalWeeklyContainer}>
      {/* 1. Bar điều khiển tuần: Gọn gàng trên 1 dòng duy nhất */}
      <div className={styles.topControlBar}>
        <div className={styles.menuMetaGroup}>
          <div className={styles.menuIconBadge}>
            <Utensils size={15} />
          </div>

          <h2 className={styles.weeklyMenuTitle}>
            {weeklyMenuTitle || "Thực đơn tuần"}
          </h2>

          <div className={styles.metaDivider} />

          {/* Badge trạng thái tuần */}
          {renderWeekStatusBadge(weekStatus)}

          {/* Đối tượng áp dụng (dạng text tinh gọn) */}
          {targetScope && (
            <span className={styles.targetScopeText}>
              • {targetScope}
            </span>
          )}

          {/* Tiến độ khi DRAFT (dạng text tinh gọn) */}
          {weekStatus === "DRAFT" && (
            <span className={styles.weekProgressText}>
              • Tiến độ: <strong>{weekProgressStats.completedDays}/{weekProgressStats.totalDays} ngày</strong>
            </span>
          )}
        </div>

        {/* Cụm nút thao tác bên phải */}
        <div className={styles.topActionsGroup}>
          {/* Nút Gửi BGH duyệt khi DRAFT */}
          {weekStatus === "DRAFT" && (
            <button
              type="button"
              className={`${styles.submitWeekBtn} ${
                weekProgressStats.isAllCompleted ? styles.submitActive : styles.submitDisabled
              }`}
              disabled={!weekProgressStats.isAllCompleted}
              onClick={onSubmitWeeklyMenu}
              title={
                weekProgressStats.isAllCompleted
                  ? "Gửi thực đơn cả tuần cho Ban Giám Hiệu phê duyệt"
                  : `Chưa thể gửi: Còn ${weekProgressStats.totalDays - weekProgressStats.completedDays} ngày chưa hoàn tất`
              }
            >
              <Send size={13} />
              <span>Gửi BGH duyệt</span>
            </button>
          )}

          {/* Nút Gửi lại BGH duyệt khi REVISION_REQUESTED */}
          {weekStatus === "REVISION_REQUESTED" && (
            <button
              type="button"
              className={styles.resubmitWeekBtn}
              disabled={!weekProgressStats.isAllCompleted}
              onClick={onResubmitWeeklyMenu}
              title="Gửi lại thực đơn đã chỉnh sửa cho Ban Giám Hiệu phê duyệt"
            >
              <Send size={13} />
              <span>Gửi lại BGH</span>
            </button>
          )}
        </div>
      </div>

      {weekStatus === "APPROVED" && !weekProgressStats.isAllCompleted && (
        <div className={styles.weekFeedbackBanner} role="status">
          <AlertTriangle size={16} className={styles.feedbackIcon} />
          <p className={styles.feedbackText}>Thực đơn đang được ghi nhận đã duyệt nhưng chưa đủ ngày/bữa ăn. Chỉ {weekProgressStats.completedDays}/{weekProgressStats.totalDays} ngày đủ hai bữa; các ngày trống chưa có thực đơn.</p>
        </div>
      )}

      {/* Banner phản hồi BGH nếu tuần có yêu cầu chỉnh sửa */}
      {weekStatus === "REVISION_REQUESTED" && weekFeedback && (
        <div className={styles.weekFeedbackBanner}>
          <AlertTriangle size={16} className={styles.feedbackIcon} />
          <div className={styles.feedbackContent}>
            <div className={styles.feedbackTitleRow}>
              <span className={styles.feedbackTitle}>Yêu cầu chỉnh sửa từ Ban Giám Hiệu:</span>
              <span className={styles.feedbackSub}>Vui lòng hoàn thiện các ngày đánh dấu đỏ rồi gửi lại</span>
            </div>
            <p className={styles.feedbackText}>{weekFeedback}</p>
          </div>
        </div>
      )}

      {/* 2. Dải chọn ngày trên điện thoại */}
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
                } ${day.isToday ? styles.mobileDayPillToday : ""} ${
                  day.isHoliday ? styles.mobileDayPillHoliday : ""
                }`}
                onClick={() => setSelectedDayOfWeek(day.dayOfWeek)}
              >
                <span className={styles.pillIndex}>
                  {day.dayLabel?.slice(0, 7)}
                  {day.isHoliday ? " (Nghỉ)" : ""}
                </span>
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

      {/* 3. LƯỚI 5 CỘT THỰC ĐƠN DỌC - CÁC BỮA THẲNG HÀNG NHAU 100% */}
      <div className={styles.weeklyGridWrapper}>
        <div className={`${styles.weeklyGrid} ${mealTypeFilter !== "all" ? styles.singleMealGrid : ""}`}>
          {schoolDays.map((sd) => {
            const dayData = dayEvaluations[sd.dayOfWeek] || {}
            const {
              hasLunch,
              hasAfternoon,
              resolvedLunchMenu,
              resolvedAfternoonMenu,
              lunchDishes,
              afternoonDishes,
              seasonings = [],
              progress,
              hasAllergy,
            } = dayData

            const isHiddenOnMobile =
              selectedDayOfWeek !== "ALL" && selectedDayOfWeek !== sd.dayOfWeek

            const canEditLunch = canEditWeeklyMenu && Boolean(resolvedLunchMenu) && resolvedLunchMenu.status !== "APPROVED"
            const canEditAfternoon = canEditWeeklyMenu && Boolean(resolvedAfternoonMenu) && resolvedAfternoonMenu.status !== "APPROVED"
            const ProgressIcon = progress?.IconComponent || CheckCircle2

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
                  } ${sd.isHoliday ? styles.holidayDayCard : ""}`}
                >
                  {/* HÀNG 1: Header Cột Ngày - CHIỀU CAO CỐ ĐỊNH 64px ĐỒNG BỘ CẢ 5 NGÀY */}
                  <div className={styles.dayHeader}>
                    <div className={styles.dayTitleRow}>
                      <div className={styles.dayTitleLeft}>
                        <span className={styles.dayLabel}>{sd.dayLabel}</span>
                      </div>

                      {progress && (
                        <span
                          className={`${styles.dayProgressBadge} ${progress.badgeClass}`}
                          title={
                            progress.note
                              ? `BGH: ${progress.note}`
                              : `Tiến độ ngày: ${progress.label}`
                          }
                        >
                          <ProgressIcon size={12} />
                          <span>{progress.label}</span>
                        </span>
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
                          <span>Dị ứng</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* THÂN THỰC ĐƠN HOẶC THẺ NGÀY NGHỈ */}
                  {sd.isHoliday ? (
                    <div className={styles.holidayCardBody}>
                      <div className={styles.holidayIconWrap}>
                        <CalendarOff size={24} className={styles.holidayIcon} />
                      </div>
                      <div className={styles.holidayReasonBox} title={sd.holidayReason || "Ngày nghỉ toàn trường"}>
                        <span className={styles.holidayReasonText}>
                          {sd.holidayReason || "Ngày nghỉ toàn trường"}
                        </span>
                      </div>
                      <span className={styles.holidaySubText}>Không phục vụ ăn bán trú</span>
                    </div>
                  ) : (
                    <div className={styles.dayMealsBody}>
                      {/* ========================================================
                          BỮA TRƯA: CHIỀU CAO THEO NỘI DUNG DÀI NHẤT TRONG TUẦN
                          ======================================================== */}
                      {(mealTypeFilter === "all" || mealTypeFilter === "LUNCH") && (
                        <div className={styles.mealBlock}>
                          {/* Dải Banner Bữa Trưa (36px) */}
                          <div className={styles.lunchBanner}>
                            <div className={styles.bannerLeft}>
                              <Utensils size={13} className={styles.lunchIcon} />
                              <span className={styles.lunchTitle}>BỮA TRƯA</span>
                            </div>

                            {/* Nút Xem & Sửa: Icon-only tinh tế */}
                            <div className={styles.bannerActions}>
                              {hasLunch && (
                                <button
                                  type="button"
                                  className={`${styles.mealIconBtn} ${styles.lunchIconBtn}`}
                                  onClick={() => onViewDetail(resolvedLunchMenu)}
                                  title="Xem chi tiết thực đơn trưa"
                                  aria-label="Xem chi tiết trưa"
                                >
                                  <Eye size={12} />
                                </button>
                              )}
                              {canEditLunch && (
                                <button
                                  type="button"
                                  className={`${styles.mealIconBtn} ${styles.lunchEditBtn} ${
                                    progress?.type === "REVISION_REQUIRED"
                                      ? styles.revisionEditBtn
                                      : ""
                                  }`}
                                  onClick={() => onEditMenu(resolvedLunchMenu)}
                                  title={
                                    progress?.type === "REVISION_REQUIRED"
                                      ? `Sửa thực đơn theo BGH: ${progress.note || "Yêu cầu chỉnh sửa"}`
                                      : "Chỉnh sửa thực đơn trưa"
                                  }
                                  aria-label="Chỉnh sửa trưa"
                                >
                                  <Edit2 size={12} />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Danh sách món trưa, không giới hạn số dòng */}
                          {hasLunch ? (
                            <div className={styles.dishesListLunch}>
                              {lunchDishes.map((dish) => {
                                const dishKey = dish.id || dish.dishId
                                const sub =
                                  dish.substituteDish ||
                                  (resolvedLunchMenu?.substituteDish?.substituteForDishId === dishKey
                                    ? resolvedLunchMenu.substituteDish
                                    : null)

                                return (
                                  <div
                                    key={dishKey || dish.name}
                                    className={styles.lunchDishRow}
                                    onClick={() => onViewDetail(resolvedLunchMenu)}
                                    title={`Món: ${dish.name} (Bữa trưa) — Bấm xem chi tiết`}
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
                            <div className={styles.emptySingleMealBox}>
                              <span className={styles.emptyMealText}>Chưa có thực đơn trưa</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ========================================================
                          BỮA XẾ: DÙNG CHUNG HÀNG VỚI CÁC NGÀY KHÁC
                          ======================================================== */}
                      {(mealTypeFilter === "all" || mealTypeFilter === "AFTERNOON") && (
                        <div className={styles.mealBlock}>
                          {/* Dải Banner Bữa Xế (36px) */}
                          <div className={styles.afternoonBanner}>
                            <div className={styles.bannerLeft}>
                              <Coffee size={13} className={styles.afternoonIcon} />
                              <span className={styles.afternoonTitle}>BỮA XẾ</span>
                            </div>

                            {/* Nút Xem & Sửa: Icon-only tinh tế */}
                            <div className={styles.bannerActions}>
                              {hasAfternoon && (
                                <button
                                  type="button"
                                  className={`${styles.mealIconBtn} ${styles.afternoonIconBtn}`}
                                  onClick={() => onViewDetail(resolvedAfternoonMenu)}
                                  title="Xem chi tiết thực đơn xế"
                                  aria-label="Xem chi tiết xế"
                                >
                                  <Eye size={12} />
                                </button>
                              )}
                              {canEditAfternoon && (
                                <button
                                  type="button"
                                  className={`${styles.mealIconBtn} ${styles.afternoonEditBtn} ${
                                    progress?.type === "REVISION_REQUIRED"
                                      ? styles.revisionEditBtn
                                      : ""
                                  }`}
                                  onClick={() => onEditMenu(resolvedAfternoonMenu)}
                                  title={
                                    progress?.type === "REVISION_REQUIRED"
                                      ? `Sửa thực đơn theo BGH: ${progress.note || "Yêu cầu chỉnh sửa"}`
                                      : "Chỉnh sửa thực đơn xế"
                                  }
                                  aria-label="Chỉnh sửa xế"
                                >
                                  <Edit2 size={12} />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Danh sách món xế, không giới hạn số dòng */}
                          {hasAfternoon ? (
                            <div className={styles.dishesListAfternoon}>
                              {afternoonDishes.map((dish) => {
                                const dishKey = dish.id || dish.dishId
                                const sub =
                                  dish.substituteDish ||
                                  (resolvedAfternoonMenu?.substituteDish?.substituteForDishId === dishKey
                                    ? resolvedAfternoonMenu.substituteDish
                                    : null)

                                return (
                                  <div
                                    key={dishKey || dish.name}
                                    className={styles.afternoonDishRow}
                                    onClick={() => onViewDetail(resolvedAfternoonMenu)}
                                    title={`Món: ${dish.name} (Bữa xế) — Bấm xem chi tiết`}
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
                            <div className={styles.emptySingleMealBoxSm}>
                              <span className={styles.emptyMealText}>Chưa có thực đơn xế</span>
                            </div>
                          )}
                        </div>
                      )}
                      <div className={styles.mealBlock}>
                        <div className={styles.seasoningBanner}>
                          <div className={styles.bannerLeft}>
                            <Sparkles size={13} className={styles.seasoningIcon} />
                            <span className={styles.seasoningTitle}>GIA VỊ</span>
                          </div>
                        </div>
                        {seasonings.length ? (
                          <div className={styles.seasoningsList}>
                            {seasonings.map(name => (
                              <div key={name} className={styles.seasoningRow}>
                                <span className={styles.dishName} title={name}>{name}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className={styles.emptySeasoningsBox}>
                            <span className={styles.emptyMealText}>Không có gia vị</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
