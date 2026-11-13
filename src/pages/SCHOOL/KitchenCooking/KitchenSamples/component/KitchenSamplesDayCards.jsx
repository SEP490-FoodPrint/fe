import React from "react"
import PropTypes from "prop-types"
import { Calendar, Layers, ClockAlert, ArrowRight } from "lucide-react"
import styles from "./KitchenSamplesDayCards.module.scss"

export default function KitchenSamplesDayCards({
  dayGroups = [],
  selectedKey = "ALL",
  onSelectDay,
  totalAll = 0,
  allStored = 0,
  allReady = 0,
  allDisposed = 0,
}) {
  if (dayGroups.length === 0 && totalAll === 0) {
    return null
  }

  return (
    <div className={styles.dayCardsContainer}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleRow}>
          <Calendar size={15} className={styles.sectionIcon} />
          <span className={styles.sectionTitle}>MẪU LƯU THEO NGÀY</span>
          <span className={styles.dayGroupCount}>({dayGroups.length} ngày)</span>
        </div>
        <span className={styles.sectionHint}>
          Bấm vào ngày bất kỳ để chuyển sang trang xem bảng chi tiết
        </span>
      </div>

      <div className={styles.cardsGrid}>
        {/* Card: Tất cả các ngày */}
        <div
          className={`${styles.dayCard} ${styles.allCard} ${
            selectedKey === "ALL" ? styles.cardActive : ""
          }`}
          onClick={() => onSelectDay?.("all")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onSelectDay?.("all")
            }
          }}
          title="Xem toàn bộ mẫu lưu từ tất cả các ngày trên trang riêng"
        >
          <div className={styles.cardHeader}>
            <div className={styles.dayTitleWrap}>
              <span className={styles.dayName}>Tất cả các ngày</span>
              <span className={styles.dateSub}>Toàn bộ mẫu</span>
            </div>
            <span className={styles.badgeAll}>
              <Layers size={12} />
              <span>Tất cả</span>
            </span>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.totalRow}>
              <span className={styles.totalNumber}>{totalAll}</span>
              <span className={styles.totalUnit}>mẫu lưu</span>
            </div>

            <div className={styles.statusPills}>
              <span className={styles.pillStored} title={`${allStored} mẫu đang lưu trữ`}>
                <span className={styles.dotStored} />
                {allStored} đang lưu
              </span>
              {allReady > 0 && (
                <span className={styles.pillReady} title={`${allReady} mẫu đủ 24h cần tiêu hủy`}>
                  <span className={styles.dotReady} />
                  {allReady} đủ 24h
                </span>
              )}
              {allDisposed > 0 && (
                <span className={styles.pillDisposed} title={`${allDisposed} mẫu đã tiêu hủy`}>
                  <span className={styles.dotDisposed} />
                  {allDisposed} đã hủy
                </span>
              )}
            </div>
          </div>

          <div className={styles.cardFooter}>
            <span className={styles.openTableText}>Xem bảng toàn bộ</span>
            <ArrowRight size={13} className={styles.openTableIcon} />
          </div>
        </div>

        {/* Danh sách từng cục ngày */}
        {dayGroups.map((group) => {
          const isSelected = selectedKey === group.dateKey
          const hasReady = group.readyCount > 0

          return (
            <div
              key={group.dateKey}
              className={`${styles.dayCard} ${isSelected ? styles.cardActive : ""} ${
                hasReady ? styles.cardWarning : ""
              }`}
              onClick={() => onSelectDay?.(group.dateKey)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onSelectDay?.(group.dateKey)
                }
              }}
              title={`Bấm để chuyển sang trang xem chi tiết ${group.dayLabel}, ${group.dateDisplay}`}
            >
              <div className={styles.cardHeader}>
                <div className={styles.dayTitleWrap}>
                  <span className={styles.dayName}>{group.dayLabel}</span>
                  <span className={styles.dateSub}>{group.dateDisplay}</span>
                </div>
                {group.isToday ? (
                  <span className={styles.badgeToday}>Hôm nay</span>
                ) : group.isYesterday ? (
                  <span className={styles.badgeYesterday}>Hôm qua</span>
                ) : null}
              </div>

              <div className={styles.cardBody}>
                <div className={styles.totalRow}>
                  <span className={styles.totalNumber}>{group.totalSamples}</span>
                  <span className={styles.totalUnit}>mẫu lưu</span>
                  <span className={styles.mealsText}>
                    ({group.lunchCount} trưa{group.afternoonCount > 0 ? ` · ${group.afternoonCount} xế` : ""})
                  </span>
                </div>

                <div className={styles.statusPills}>
                  {group.storedCount > 0 && (
                    <span
                      className={styles.pillStored}
                      title={`${group.storedCount} mẫu đang lưu trữ 2-8°C`}
                    >
                      <span className={styles.dotStored} />
                      {group.storedCount} đang lưu
                    </span>
                  )}
                  {group.readyCount > 0 && (
                    <span
                      className={styles.pillReady}
                      title={`${group.readyCount} mẫu đã lưu đủ 24 giờ, cần tiêu hủy`}
                    >
                      <span className={styles.dotReady} />
                      {group.readyCount} đủ 24h
                    </span>
                  )}
                  {group.disposedCount > 0 && (
                    <span
                      className={styles.pillDisposed}
                      title={`${group.disposedCount} mẫu đã được tiêu hủy`}
                    >
                      <span className={styles.dotDisposed} />
                      {group.disposedCount} đã hủy
                    </span>
                  )}
                </div>
              </div>

              {/* Dải báo động nhỏ nếu ngày này có mẫu đủ 24h cần tiêu hủy */}
              {hasReady && (
                <div className={styles.readyAlertStrip}>
                  <ClockAlert size={12} />
                  <span>Có {group.readyCount} mẫu đủ 24h chờ tiêu hủy</span>
                </div>
              )}

              <div className={styles.cardFooter}>
                <span className={styles.openTableText}>Xem bảng chi tiết</span>
                <ArrowRight size={13} className={styles.openTableIcon} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

KitchenSamplesDayCards.propTypes = {
  dayGroups: PropTypes.arrayOf(
    PropTypes.shape({
      dateKey: PropTypes.string.isRequired,
      dateDisplay: PropTypes.string.isRequired,
      dayLabel: PropTypes.string.isRequired,
      isToday: PropTypes.bool,
      isYesterday: PropTypes.bool,
      totalSamples: PropTypes.number.isRequired,
      lunchCount: PropTypes.number.isRequired,
      afternoonCount: PropTypes.number.isRequired,
      storedCount: PropTypes.number.isRequired,
      readyCount: PropTypes.number.isRequired,
      disposedCount: PropTypes.number.isRequired,
    })
  ),
  selectedKey: PropTypes.string,
  onSelectDay: PropTypes.func,
  totalAll: PropTypes.number,
  allStored: PropTypes.number,
  allReady: PropTypes.number,
  allDisposed: PropTypes.number,
}

