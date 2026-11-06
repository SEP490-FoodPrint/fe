import React from "react"
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
  const getStatusBadge = (status) => {
    switch (status) {
      case "REVISION_REQUESTED":
        return (
          <span className={`${styles.statusPill} ${styles.revision}`}>
            <span className={styles.dot}></span>
            <span>Yêu cầu sửa</span>
          </span>
        )
      case "APPROVED":
        return (
          <span className={`${styles.statusPill} ${styles.approved}`}>
            <span className={styles.dot}></span>
            <span>Đã duyệt BGH</span>
          </span>
        )
      case "PENDING_APPROVAL":
        return (
          <span className={`${styles.statusPill} ${styles.pending}`}>
            <span className={styles.dot}></span>
            <span>Chờ duyệt</span>
          </span>
        )
      case "DRAFT":
      default:
        return (
          <span className={`${styles.statusPill} ${styles.draft}`}>
            <span className={styles.dot}></span>
            <span>Bản nháp</span>
          </span>
        )
    }
  }

  // Lọc thực đơn theo ngày
  const getDayMeals = (day) => {
    const dayMenus = menus.filter(
      (m) => m.rawDate === day.dateISO || m.date === day.dateVN
    )
    const lunchMenu = dayMenus.find((m) => m.mealType === "LUNCH")
    const afternoonMenu = dayMenus.find((m) => m.mealType === "AFTERNOON")
    return { lunchMenu, afternoonMenu, dayMenus }
  }

  return (
    <div className={styles.verticalViewContainer}>
      {/* 1. Bar tiêu đề tuần & Chuyển đổi chế độ xem */}
      <div className={styles.weekControlBar}>
        <div className={styles.weekInfoGroup}>
          <div className={styles.weekTag}>
            <span className={`material-symbols-outlined ${styles.weekIcon}`}>
              date_range
            </span>
            <span className={styles.weekHeading}>
              {selectedWeekLabel || "Thực đơn tuần học đường"}
            </span>
            {isCurrentWeek && (
              <span className={styles.currentWeekBadge}>Tuần này</span>
            )}
          </div>
        </div>

        {/* Nút chuyển đổi View Mode */}
        <div className={styles.viewModeGroup}>
          <button
            type="button"
            className={`${styles.viewModeBtn} ${
              viewMode === "vertical" ? styles.activeViewMode : ""
            }`}
            onClick={() => onChangeViewMode && onChangeViewMode("vertical")}
            title="Xem dạng dọc theo tuần (Mặc định)"
          >
            <span className="material-symbols-outlined text-[17px]">
              calendar_view_day
            </span>
            <span>Kiểu dọc theo tuần</span>
          </button>
          <button
            type="button"
            className={`${styles.viewModeBtn} ${
              viewMode === "table" ? styles.activeViewMode : ""
            }`}
            onClick={() => onChangeViewMode && onChangeViewMode("table")}
            title="Xem dạng bảng danh sách truyền thống"
          >
            <span className="material-symbols-outlined text-[17px]">
              table_rows
            </span>
            <span>Kiểu bảng</span>
          </button>
        </div>
      </div>

      {/* 2. Danh sách dọc theo từng ngày trong tuần */}
      <div className={styles.daysVerticalStack}>
        {schoolDays.map((day) => {
          const { lunchMenu, afternoonMenu, dayMenus } = getDayMeals(day)
          const totalPortions = dayMenus.reduce(
            (sum, m) => sum + (m.portionCount || 0),
            0
          )
          const totalDishes = dayMenus.reduce(
            (sum, m) => sum + (m.dishes?.length || 0),
            0
          )

          const showLunch =
            mealTypeFilter === "all" || mealTypeFilter === "LUNCH"
          const showAfternoon =
            mealTypeFilter === "all" || mealTypeFilter === "AFTERNOON"

          return (
            <div
              key={day.dateISO || day.dateVN}
              className={`${styles.dayCard} ${
                day.isToday ? styles.isTodayCard : ""
              }`}
            >
              {/* Header ngày */}
              <div className={styles.dayHeader}>
                <div className={styles.dayTitleGroup}>
                  <div className={styles.dayCalendarCircle}>
                    <span className="material-symbols-outlined text-[18px]">
                      calendar_month
                    </span>
                  </div>
                  <div className={styles.dayNameBlock}>
                    <h3 className={styles.dayName}>
                      {day.dayLabel}
                      <span className={styles.dayDate}> — {day.dateVN}</span>
                    </h3>
                  </div>
                  {day.isToday && (
                    <span className={styles.todayPill}>
                      <span className={styles.pulsingDot}></span>
                      <span>Hôm nay</span>
                    </span>
                  )}
                </div>

                <div className={styles.dayStatsInline}>
                  {totalPortions > 0 && (
                    <span className={styles.statBadgePortions}>
                      <span className="material-symbols-outlined text-[15px]">
                        group
                      </span>
                      {totalPortions.toLocaleString()} suất
                    </span>
                  )}
                  {totalDishes > 0 && (
                    <span className={styles.statBadgeDishes}>
                      <span className="material-symbols-outlined text-[15px]">
                        restaurant_menu
                      </span>
                      {totalDishes} món
                    </span>
                  )}
                </div>
              </div>

              {/* Thân ngày: Các ca ăn được xếp dọc / ngang tinh gọn */}
              <div className={styles.mealsGrid}>
                {/* Ca Trưa */}
                {showLunch && (
                  <div className={styles.mealColumn}>
                    {lunchMenu ? (
                      <div className={`${styles.mealBox} ${styles.lunchBox}`}>
                        {/* Hàng trên: Tag ca ăn + Trạng thái + Actions */}
                        <div className={styles.mealBoxTop}>
                          <div className={styles.mealBadgeGroup}>
                            <span className={styles.lunchTag}>
                              <span className="material-symbols-outlined text-[14px]">
                                light_mode
                              </span>
                              BỮA TRƯA
                            </span>
                            {getStatusBadge(lunchMenu.status)}
                          </div>
                          <div className={styles.mealActionBtns}>
                            <button
                              type="button"
                              className={styles.actionBtnIcon}
                              onClick={() => onViewDetail(lunchMenu)}
                              title="Xem chi tiết thực đơn này"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                visibility
                              </span>
                            </button>
                            {(lunchMenu.status === "DRAFT" ||
                              lunchMenu.status === "REVISION_REQUESTED") && (
                              <button
                                type="button"
                                className={`${styles.actionBtnIcon} ${styles.editIconBtn}`}
                                onClick={() => onEditMenu(lunchMenu)}
                                title="Chỉnh sửa thực đơn"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  edit
                                </span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Tiêu đề & Thông số */}
                        <div className={styles.menuTitleGroup}>
                          <h4
                            className={styles.menuName}
                            onClick={() => onViewDetail(lunchMenu)}
                          >
                            {lunchMenu.name}
                          </h4>
                          <div className={styles.menuMetaLine}>
                            <span className={styles.codeText}>
                              {lunchMenu.code}
                            </span>
                            <span className={styles.metaDot}>•</span>
                            <span>{lunchMenu.portionCount} suất</span>
                            <span className={styles.metaDot}>•</span>
                            <span className={styles.targetText}>
                              {lunchMenu.targetScope}
                            </span>
                          </div>
                        </div>

                        {/* Danh sách Món ăn (Nổi bật cho nhân viên bếp) */}
                        <div className={styles.dishesSection}>
                          <div className={styles.sectionHeading}>
                            <span className="material-symbols-outlined text-[15px]">
                              soup_kitchen
                            </span>
                            <span>
                              Món ăn ({lunchMenu.dishes?.length || 0} món):
                            </span>
                          </div>
                          <ul className={styles.dishesList}>
                            {lunchMenu.dishes?.map((dish, idx) => (
                              <li key={idx} className={styles.dishItem}>
                                <div className={styles.dishNameRow}>
                                  <span className={styles.dishBullet}>
                                    {idx + 1}.
                                  </span>
                                  <span className={styles.dishName}>
                                    {dish.name}
                                  </span>
                                  {dish.qty && (
                                    <span className={styles.dishQty}>
                                      ({dish.qty})
                                    </span>
                                  )}
                                </div>
                                {dish.ingredients &&
                                  dish.ingredients.length > 0 && (
                                    <span className={styles.dishIngredients}>
                                      {dish.ingredients.join(", ")}
                                    </span>
                                  )}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Thẻ Dị ứng & Món thay thế (nếu có) */}
                        {lunchMenu.hasAllergyMenu && (
                          <div className={styles.allergyCard}>
                            <div className={styles.allergyHeader}>
                              <span
                                className={`material-symbols-outlined ${styles.allergyShieldIcon}`}
                              >
                                health_and_safety
                              </span>
                              <span className={styles.allergyLabel}>
                                Có thực đơn thay thế dị ứng
                              </span>
                            </div>
                            <p className={styles.allergyNote}>
                              {lunchMenu.allergyNote}
                            </p>
                            {lunchMenu.substituteDish && (
                              <div className={styles.substituteDishRow}>
                                <span className={styles.substituteTag}>
                                  Món thay thế:
                                </span>
                                <span className={styles.substituteName}>
                                  {lunchMenu.substituteDish.name} (
                                  {lunchMenu.substituteDish.qty})
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={styles.emptyMealSlot}>
                        <div className={styles.emptyMealIconWrap}>
                          <span className="material-symbols-outlined text-[24px]">
                            lunch_dining
                          </span>
                        </div>
                        <p className={styles.emptyMealText}>
                          Chưa có thực đơn Bữa trưa
                        </p>
                        <button
                          type="button"
                          className={styles.addMealBtn}
                          onClick={() =>
                            onNavigateCreate &&
                            onNavigateCreate(day.dateISO, "LUNCH")
                          }
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            add
                          </span>
                          <span>Tạo thực đơn trưa</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Ca Chiều / Xế */}
                {showAfternoon && (
                  <div className={styles.mealColumn}>
                    {afternoonMenu ? (
                      <div className={`${styles.mealBox} ${styles.afternoonBox}`}>
                        {/* Hàng trên: Tag ca ăn + Trạng thái + Actions */}
                        <div className={styles.mealBoxTop}>
                          <div className={styles.mealBadgeGroup}>
                            <span className={styles.afternoonTag}>
                              <span className="material-symbols-outlined text-[14px]">
                                bedtime
                              </span>
                              BỮA XẾ
                            </span>
                            {getStatusBadge(afternoonMenu.status)}
                          </div>
                          <div className={styles.mealActionBtns}>
                            <button
                              type="button"
                              className={styles.actionBtnIcon}
                              onClick={() => onViewDetail(afternoonMenu)}
                              title="Xem chi tiết thực đơn này"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                visibility
                              </span>
                            </button>
                            {(afternoonMenu.status === "DRAFT" ||
                              afternoonMenu.status === "REVISION_REQUESTED") && (
                              <button
                                type="button"
                                className={`${styles.actionBtnIcon} ${styles.editIconBtn}`}
                                onClick={() => onEditMenu(afternoonMenu)}
                                title="Chỉnh sửa thực đơn"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  edit
                                </span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Tiêu đề & Thông số */}
                        <div className={styles.menuTitleGroup}>
                          <h4
                            className={styles.menuName}
                            onClick={() => onViewDetail(afternoonMenu)}
                          >
                            {afternoonMenu.name}
                          </h4>
                          <div className={styles.menuMetaLine}>
                            <span className={styles.codeText}>
                              {afternoonMenu.code}
                            </span>
                            <span className={styles.metaDot}>•</span>
                            <span>{afternoonMenu.portionCount} suất</span>
                            <span className={styles.metaDot}>•</span>
                            <span className={styles.targetText}>
                              {afternoonMenu.targetScope}
                            </span>
                          </div>
                        </div>

                        {/* Danh sách Món ăn Bữa xế */}
                        <div className={styles.dishesSection}>
                          <div className={styles.sectionHeading}>
                            <span className="material-symbols-outlined text-[15px]">
                              bakery_dining
                            </span>
                            <span>
                              Món ăn ({afternoonMenu.dishes?.length || 0} món):
                            </span>
                          </div>
                          <ul className={styles.dishesList}>
                            {afternoonMenu.dishes?.map((dish, idx) => (
                              <li key={idx} className={styles.dishItem}>
                                <div className={styles.dishNameRow}>
                                  <span className={styles.dishBullet}>
                                    {idx + 1}.
                                  </span>
                                  <span className={styles.dishName}>
                                    {dish.name}
                                  </span>
                                  {dish.qty && (
                                    <span className={styles.dishQty}>
                                      ({dish.qty})
                                    </span>
                                  )}
                                </div>
                                {dish.ingredients &&
                                  dish.ingredients.length > 0 && (
                                    <span className={styles.dishIngredients}>
                                      {dish.ingredients.join(", ")}
                                    </span>
                                  )}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Thẻ Dị ứng nếu có */}
                        {afternoonMenu.hasAllergyMenu && (
                          <div className={styles.allergyCard}>
                            <div className={styles.allergyHeader}>
                              <span
                                className={`material-symbols-outlined ${styles.allergyShieldIcon}`}
                              >
                                health_and_safety
                              </span>
                              <span className={styles.allergyLabel}>
                                Có thực đơn thay thế dị ứng
                              </span>
                            </div>
                            <p className={styles.allergyNote}>
                              {afternoonMenu.allergyNote}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={styles.emptyMealSlot}>
                        <div className={styles.emptyMealIconWrap}>
                          <span className="material-symbols-outlined text-[24px]">
                            cookie
                          </span>
                        </div>
                        <p className={styles.emptyMealText}>
                          Chưa có thực đơn Bữa xế
                        </p>
                        <button
                          type="button"
                          className={styles.addMealBtn}
                          onClick={() =>
                            onNavigateCreate &&
                            onNavigateCreate(day.dateISO, "AFTERNOON")
                          }
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            add
                          </span>
                          <span>Tạo thực đơn xế</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
