import React, { useState, useEffect, useMemo } from "react"
import {
  Calendar,
  Utensils,
  Coffee,
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
} from "lucide-react"
import { DEFAULT_WEEKLY_MENU } from "src/pages/SCHOOL/KitchenCooking/KitchenMenu/component/mockWeeklyMenuData"
import styles from "./MenuListWeeklyVerticalView.module.scss"

export default function MenuListWeeklyVerticalView({
  schoolDays = [],
  menus = [],
  mealTypeFilter = "all",
  onViewDetail,
  onEditMenu,
  onNavigateCreate,
  selectedWeekLabel = "",
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
        return "Đã duyệt BGH"
    }
  }

  // Đánh giá dữ liệu & tiến độ nhập liệu của từng ngày
  const dayEvaluations = useMemo(() => {
    const map = {}
    schoolDays.forEach((sd) => {
      const defaultDay = DEFAULT_WEEKLY_MENU[sd.dayOfWeek] || {}
      const dayMenus = menus.filter(
        (m) => m.rawDate === sd.dateISO || m.date === sd.dateVN
      )
      const lunchMenu = dayMenus.find((m) => m.mealType === "LUNCH")
      const afternoonMenu = dayMenus.find((m) => m.mealType === "AFTERNOON")

      const hasLunch = Boolean(lunchMenu)
      const hasAfternoon = Boolean(afternoonMenu)
      const isEmpty = !hasLunch && !hasAfternoon

      // Xác định tiến độ / trạng thái của ngày đó
      let progress = {
        type: "COMPLETED",
        label: "Đủ ca",
        badgeClass: styles.badgeCompleted,
        IconComponent: CheckCircle2,
      }

      if (weekStatus === "APPROVED") {
        progress = {
          type: "APPROVED",
          label: "Đã duyệt",
          badgeClass: styles.badgeApproved,
          IconComponent: CheckCircle2,
        }
      } else if (weekStatus === "PENDING_APPROVAL") {
        progress = {
          type: "PENDING",
          label: "Chờ duyệt",
          badgeClass: styles.badgePending,
          IconComponent: Clock,
        }
      } else if (weekStatus === "REVISION_REQUESTED") {
        const isRevisionDay = dayMenus.some(
          (m) => m.status === "REVISION_REQUESTED" || m.status === "REVISION_REQUIRED"
        )
        if (isRevisionDay) {
          const revNote = dayMenus.find((m) => m.feedback)?.feedback || weekFeedback
          progress = {
            type: "REVISION_REQUIRED",
            label: "Cần sửa",
            badgeClass: styles.badgeRevision,
            IconComponent: AlertTriangle,
            note: revNote,
          }
        } else {
          progress = {
            type: "REVISION_PASSED",
            label: "Đạt chuẩn",
            badgeClass: styles.badgeApproved,
            IconComponent: CheckCircle2,
          }
        }
      } else {
        // Tuần DRAFT
        if (isEmpty) {
          progress = {
            type: "EMPTY",
            label: "Chưa tạo",
            badgeClass: styles.badgeEmpty,
            IconComponent: PlusCircle,
          }
        } else if (hasLunch && hasAfternoon) {
          progress = {
            type: "COMPLETED",
            label: "Đủ ca",
            badgeClass: styles.badgeCompleted,
            IconComponent: CheckCircle2,
          }
        } else if (hasLunch && !hasAfternoon) {
          progress = {
            type: "PARTIAL_AFTERNOON",
            label: "Thiếu xế",
            badgeClass: styles.badgePartial,
            IconComponent: AlertCircle,
          }
        } else {
          progress = {
            type: "PARTIAL_LUNCH",
            label: "Thiếu trưa",
            badgeClass: styles.badgePartial,
            IconComponent: AlertCircle,
          }
        }
      }

      // Fallback thực đơn khi đã duyệt hoặc đang chờ duyệt mà không có dữ liệu riêng
      const fallbackLunch = (weekStatus === "APPROVED" || weekStatus === "PENDING_APPROVAL")
        ? {
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
        : null

      const fallbackAfternoon = (weekStatus === "APPROVED" || weekStatus === "PENDING_APPROVAL")
        ? {
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
        : null

      const resolvedLunch = lunchMenu || fallbackLunch
      const resolvedAfternoon = afternoonMenu || fallbackAfternoon

      map[sd.dayOfWeek] = {
        hasLunch: Boolean(resolvedLunch),
        hasAfternoon: Boolean(resolvedAfternoon),
        resolvedLunchMenu: resolvedLunch,
        resolvedAfternoonMenu: resolvedAfternoon,
        lunchDishes: resolvedLunch?.dishes || [],
        afternoonDishes: resolvedAfternoon?.dishes || [],
        progress,
        hasAllergy: Boolean(
          resolvedLunch?.hasAllergyMenu || resolvedAfternoon?.hasAllergyMenu
        ),
      }
    })
    return map
  }, [schoolDays, menus, weekStatus, weekFeedback])

  // Thống kê tiến độ nhập liệu của tuần
  const weekProgressStats = useMemo(() => {
    let completedDays = 0
    schoolDays.forEach((sd) => {
      const dayData = dayEvaluations[sd.dayOfWeek]
      if (dayData && dayData.hasLunch && dayData.hasAfternoon) {
        completedDays += 1
      }
    })
    const isAllCompleted = completedDays === schoolDays.length && schoolDays.length > 0
    return { completedDays, totalDays: schoolDays.length || 5, isAllCompleted }
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
            <span>Bản nháp tuần</span>
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
            <span>Đã duyệt BGH</span>
          </span>
        )
    }
  }

  return (
    <div className={styles.verticalWeeklyContainer}>
      {/* 1. Bar điều khiển tuần & Thao tác tối giản */}
      <div className={styles.topControlBar}>
        <div className={styles.weekTitleWrap}>
          <div className={styles.weekIconBox}>
            <Calendar size={16} />
          </div>
          <span className={styles.weekLabelText}>
            {selectedWeekLabel || "Thực đơn tuần học đường"}
          </span>
          {isCurrentWeek && (
            <span className={styles.currentWeekTag}>Tuần này</span>
          )}
          {/* Badge trạng thái tuần */}
          {renderWeekStatusBadge(weekStatus)}

          {/* Pill tiến độ khi DRAFT */}
          {weekStatus === "DRAFT" && (
            <div className={styles.weekProgressPill}>
              <CalendarCheck size={13} />
              <span>
                Tiến độ: <strong>{weekProgressStats.completedDays}/{weekProgressStats.totalDays} ngày</strong> đủ ca
              </span>
            </div>
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
              onClick={onResubmitWeeklyMenu}
              title="Gửi lại thực đơn đã chỉnh sửa cho Ban Giám Hiệu phê duyệt"
            >
              <Send size={13} />
              <span>Gửi lại BGH</span>
            </button>
          )}
        </div>
      </div>

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

      {/* 3. Lưới 5 CỘT THỰC ĐƠN DỌC - CLEAN & DỄ NHÌN CHO Y TẾ */}
      <div className={styles.weeklyGridWrapper}>
        <div className={styles.weeklyGrid}>
          {schoolDays.map((sd) => {
            const dayData = dayEvaluations[sd.dayOfWeek] || {}
            const {
              hasLunch,
              hasAfternoon,
              resolvedLunchMenu,
              resolvedAfternoonMenu,
              lunchDishes,
              afternoonDishes,
              progress,
              hasAllergy,
            } = dayData

            const isHiddenOnMobile =
              selectedDayOfWeek !== "ALL" && selectedDayOfWeek !== sd.dayOfWeek

            const canEditLunch = canEditWeeklyMenu && Boolean(resolvedLunchMenu)
            const canEditAfternoon = canEditWeeklyMenu && Boolean(resolvedAfternoonMenu)

            // Cột trống hoàn toàn
            const isDayCompletelyEmpty = !hasLunch && !hasAfternoon
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
                  }`}
                >
                  {/* HÀNG 1: Header Cột Ngày Clean */}
                  <div className={styles.dayHeader}>
                    <div className={styles.dayTitleRow}>
                      <div className={styles.dayTitleLeft}>
                        <span className={styles.dayLabel}>{sd.dayLabel}</span>
                        {sd.isToday && (
                          <span className={styles.todayPill}>Hôm nay</span>
                        )}
                      </div>

                      {/* Tiến độ ngày: Icon + Label ngắn gọn */}
                      {progress && (
                        <span
                          className={`${styles.dayProgressBadge} ${progress.badgeClass}`}
                          title={`Tiến độ ngày: ${progress.label}`}
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

                  {/* THÂN THỰC ĐƠN */}
                  <div className={styles.dayMealsBody}>
                    {/* TRƯỜNG HỢP 1: NGÀY CHƯA TẠO (EMPTY STATE NÉT ĐỨT SẠCH SẼ) */}
                    {isDayCompletelyEmpty ? (
                      <div className={styles.emptyDayBox}>
                        <div className={styles.emptyDayIconWrap}>
                          <PlusCircle size={24} />
                        </div>
                        <span className={styles.emptyDayTitle}>Chưa tạo thực đơn</span>
                        <span className={styles.emptyDayDesc}>
                          {sd.dayLabel} chưa có bữa trưa và xế
                        </span>
                        {canEditWeeklyMenu && (
                          <button
                            type="button"
                            className={styles.addDayMenuBtn}
                            onClick={() => onNavigateCreate(sd.dateISO, "LUNCH")}
                            title={`Tạo thực đơn mới cho ${sd.dayLabel}`}
                          >
                            <Plus size={13} />
                            <span>Tạo thực đơn</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      /* TRƯỜNG HỢP 2: ĐÃ CÓ MỘT HOẶC CẢ HAI BỮA */
                      <>
                        {/* Cảnh báo BGH nếu ngày này có yêu cầu chỉnh sửa */}
                        {progress?.type === "REVISION_REQUIRED" && progress.note && (
                          <div className={styles.dayRevisionCallout}>
                            <div className={styles.dayRevisionHeader}>
                              <AlertTriangle size={12} />
                              <span>BGH yêu cầu sửa</span>
                            </div>
                            <p className={styles.dayRevisionNote}>{progress.note}</p>
                          </div>
                        )}

                        {/* KHỐI BỮA TRƯA */}
                        {(mealTypeFilter === "all" || mealTypeFilter === "LUNCH") && (
                          <div className={styles.mealBlock}>
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
                                        ? "Sửa thực đơn theo yêu cầu BGH"
                                        : "Chỉnh sửa thực đơn trưa"
                                    }
                                    aria-label="Chỉnh sửa trưa"
                                  >
                                    <Edit2 size={12} />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Danh sách 5 món trưa */}
                            {hasLunch ? (
                              <div className={styles.dishesListLunch}>
                                {lunchDishes.map((dish) => (
                                  <div
                                    key={dish.id || dish.name}
                                    className={styles.lunchDishRow}
                                    onClick={() => onViewDetail(resolvedLunchMenu)}
                                    title={`Món: ${dish.name} (Bữa trưa) — Bấm xem chi tiết`}
                                  >
                                    <span className={styles.dishDotLunch} />
                                    <span className={styles.dishName}>
                                      {dish.name}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className={styles.emptySingleMealBox}>
                                <span className={styles.emptyMealText}>Chưa có bữa trưa</span>
                                {canEditWeeklyMenu && (
                                  <button
                                    type="button"
                                    className={styles.addSingleMealBtn}
                                    onClick={() => onNavigateCreate(sd.dateISO, "LUNCH")}
                                  >
                                    <Plus size={12} />
                                    <span>Thêm bữa trưa</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* KHỐI BỮA XẾ */}
                        {(mealTypeFilter === "all" || mealTypeFilter === "AFTERNOON") && (
                          <div className={styles.mealBlock}>
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
                                        ? "Sửa thực đơn theo yêu cầu BGH"
                                        : "Chỉnh sửa thực đơn xế"
                                    }
                                    aria-label="Chỉnh sửa xế"
                                  >
                                    <Edit2 size={12} />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Danh sách món xế */}
                            {hasAfternoon ? (
                              <div className={styles.dishesListAfternoon}>
                                {afternoonDishes.map((dish) => (
                                  <div
                                    key={dish.id || dish.name}
                                    className={styles.afternoonDishRow}
                                    onClick={() => onViewDetail(resolvedAfternoonMenu)}
                                    title={`Món: ${dish.name} (Bữa xế) — Bấm xem chi tiết`}
                                  >
                                    <span className={styles.dishDotAfternoon} />
                                    <span className={styles.dishName}>
                                      {dish.name}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className={styles.emptySingleMealBoxSm}>
                                <span className={styles.emptyMealText}>Chưa có bữa xế</span>
                                {canEditWeeklyMenu && (
                                  <button
                                    type="button"
                                    className={styles.addSingleMealBtn}
                                    onClick={() => onNavigateCreate(sd.dateISO, "AFTERNOON")}
                                  >
                                    <Plus size={12} />
                                    <span>Thêm bữa xế</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </>
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
