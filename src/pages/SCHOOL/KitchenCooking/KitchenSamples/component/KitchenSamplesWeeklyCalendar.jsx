import React from "react"
import PropTypes from "prop-types"
import { Calendar, Table, ArrowRight, ClockAlert, ChevronDown, ChevronUp } from "lucide-react"
import styles from "./KitchenSamplesWeeklyCalendar.module.scss"

export default function KitchenSamplesWeeklyCalendar({
  weeks = [],
  onSelectDay,
  onViewAll,
  totalAll = 0,
  onToggleShowAllYear,
  isShowingAllYear = false,
  totalYearWeeks = 0,
}) {
  return (
    <div className={styles.calendarContainer}>
      {/* Header thanh sổ lưu mẫu */}
      <div className={styles.calendarHeader}>
        <div className={styles.calendarTitleWrap}>
          <Calendar size={18} className={styles.calendarIcon} />
          <h2 className={styles.calendarTitle}>SỔ LƯU MẪU THỨC ĂN 24 GIỜ</h2>
          <span className={styles.totalBadge}>{totalAll} mẫu lưu</span>
        </div>

        <button
          type="button"
          className={styles.viewAllTableBtn}
          onClick={onViewAll}
          title="Xem toàn bộ mẫu lưu dạng bảng chi tiết tổng hợp"
        >
          <Table size={14} />
          <span>Xem bảng toàn bộ</span>
        </button>
      </div>

      {/* Danh sách các tuần nối tiếp nhau */}
      <div className={styles.weeksList}>
        {weeks.map((week) => (
          <div
            key={week.weekKey}
            className={`${styles.weekBlock} ${
              week.isCurrentWeek ? styles.weekCurrent : ""
            }`}
          >
            {/* Thanh tuần trên cùng */}
            <div className={styles.weekHeader}>
              <div className={styles.weekTitleRow}>
                <span className={styles.weekLabel}>{week.weekLabel}</span>
                {week.isCurrentWeek && (
                  <span className={styles.currentWeekBadge}>Tuần này</span>
                )}
              </div>

              <div className={styles.weekSummary}>
                <span className={styles.weekTotalText}>
                  {week.totalSamples > 0
                    ? `${week.totalSamples} mẫu lưu:`
                    : "Chưa có mẫu"}
                </span>
                {week.storedCount > 0 && (
                  <span className={styles.weekStoredText}>
                    <span className={styles.dotStored} />
                    {week.storedCount} đang lưu
                  </span>
                )}
                {week.readyCount > 0 && (
                  <span className={styles.weekReadyText}>
                    <span className={styles.dotReady} />
                    <strong>{week.readyCount}</strong> đủ 24h
                  </span>
                )}
                {week.disposedCount > 0 && (
                  <span className={styles.weekDisposedText}>
                    <span className={styles.dotDisposed} />
                    {week.disposedCount} đã hủy
                  </span>
                )}
              </div>
            </div>

            {/* Các ô vuông thứ, ngày nối liền sát nhau */}
            <div className={styles.weekDaysGrid}>
              {week.days.map((day) => {
                const hasReady = day.readyCount > 0
                const hasSamples = day.totalSamples > 0

                return (
                  <div
                    key={day.dateKey}
                    className={`${styles.daySquare} ${
                      day.isToday ? styles.squareToday : ""
                    } ${hasReady ? styles.squareWarning : ""} ${
                      !hasSamples ? styles.squareEmpty : ""
                    } ${day.isWeekend ? styles.squareWeekend : ""}`}
                    onClick={() => onSelectDay?.(day.dateKey)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        onSelectDay?.(day.dateKey)
                      }
                    }}
                    title={`Bấm xem chi tiết bảng mẫu lưu ${day.dayFullLabel}, ${day.dateVN}`}
                  >
                    {/* Header ô: Thứ & Ngày */}
                    <div className={styles.squareHeader}>
                      <div className={styles.dayDateLeft}>
                        <span className={styles.dayShortName}>
                          {day.dayShortLabel}
                        </span>
                        <span className={styles.dateNumber}>{day.dateVN}</span>
                      </div>
                      {day.isToday && (
                        <span className={styles.todayPill}>Hôm nay</span>
                      )}
                    </div>

                    {/* Body ô: Số lượng mẫu lưu & Trạng thái */}
                    <div className={styles.squareBody}>
                      {hasSamples ? (
                        <>
                          <div className={styles.samplesMainRow}>
                            <span className={styles.samplesCount}>
                              {day.totalSamples}
                            </span>
                            <span className={styles.samplesUnit}>mẫu</span>
                          </div>

                          <div className={styles.statusBreakdown}>
                            {day.storedCount > 0 && (
                              <div
                                className={styles.statusItemStored}
                                title={`${day.storedCount} mẫu đang lưu trữ 2-8°C`}
                              >
                                <span className={styles.dotStored} />
                                <span>{day.storedCount} đang lưu</span>
                              </div>
                            )}
                            {day.readyCount > 0 && (
                              <div
                                className={styles.statusItemReady}
                                title={`${day.readyCount} mẫu đã đủ 24 giờ cần tiêu hủy`}
                              >
                                <span className={styles.dotReady} />
                                <span>
                                  <strong>{day.readyCount}</strong> đủ 24h
                                </span>
                              </div>
                            )}
                            {day.disposedCount > 0 && day.readyCount === 0 && (
                              <div
                                className={styles.statusItemDisposed}
                                title={`${day.disposedCount} mẫu đã tiêu hủy`}
                              >
                                <span className={styles.dotDisposed} />
                                <span>{day.disposedCount} đã hủy</span>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className={styles.emptyDayWrap}>
                          <span className={styles.emptyText}>
                            {day.isWeekend ? "Nghỉ cuối tuần" : "Không có mẫu"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Footer ô: Liên kết xem bảng chi tiết */}
                    <div className={styles.squareFooter}>
                      {hasSamples ? (
                        <span className={styles.viewLink}>
                          <span>Xem bảng</span>
                          <ArrowRight size={11} className={styles.arrowIcon} />
                        </span>
                      ) : (
                        <span className={styles.noDataDash}>—</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {onToggleShowAllYear && totalYearWeeks > weeks.length && !isShowingAllYear && (
          <div className={styles.showAllWeeksWrap}>
            <button
              type="button"
              className={styles.showAllWeeksBtn}
              onClick={onToggleShowAllYear}
              title={`Bấm xem toàn bộ ${totalYearWeeks} tuần trong năm học 2026-2027`}
            >
              <span>Xem toàn bộ {totalYearWeeks} tuần trong năm học</span>
              <ChevronDown size={14} />
            </button>
          </div>
        )}

        {onToggleShowAllYear && isShowingAllYear && (
          <div className={styles.showAllWeeksWrap}>
            <button
              type="button"
              className={styles.showAllWeeksBtn}
              onClick={onToggleShowAllYear}
              title="Thu gọn về danh sách các tuần đã qua"
            >
              <span>Thu gọn về các tuần đã qua</span>
              <ChevronUp size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

KitchenSamplesWeeklyCalendar.propTypes = {
  weeks: PropTypes.arrayOf(
    PropTypes.shape({
      weekKey: PropTypes.string.isRequired,
      weekLabel: PropTypes.string.isRequired,
      isCurrentWeek: PropTypes.bool,
      totalSamples: PropTypes.number.isRequired,
      storedCount: PropTypes.number.isRequired,
      readyCount: PropTypes.number.isRequired,
      disposedCount: PropTypes.number.isRequired,
      days: PropTypes.arrayOf(
        PropTypes.shape({
          dateKey: PropTypes.string.isRequired,
          dateVN: PropTypes.string.isRequired,
          dayShortLabel: PropTypes.string.isRequired,
          dayFullLabel: PropTypes.string.isRequired,
          isToday: PropTypes.bool,
          isWeekend: PropTypes.bool,
          totalSamples: PropTypes.number.isRequired,
          storedCount: PropTypes.number.isRequired,
          readyCount: PropTypes.number.isRequired,
          disposedCount: PropTypes.number.isRequired,
        })
      ).isRequired,
    })
  ).isRequired,
  onSelectDay: PropTypes.func.isRequired,
  onViewAll: PropTypes.func.isRequired,
  totalAll: PropTypes.number,
}
