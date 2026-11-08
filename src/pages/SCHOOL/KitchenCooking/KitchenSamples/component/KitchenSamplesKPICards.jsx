import React from "react"
import PropTypes from "prop-types"
import { FlaskConical, ClockAlert, CheckCircle2, Thermometer } from "lucide-react"
import styles from "./KitchenSamplesKPICards.module.scss"

export default function KitchenSamplesKPICards({
  stats = { stored: 0, ready: 0, disposed: 0 },
  activeFilter = "ALL",
  onSelectFilter,
}) {
  return (
    <div className={styles.kpiGrid}>
      {/* Card 1: Đang lưu mẫu */}
      <div
        className={`${styles.kpiCard} ${
          activeFilter === "STORED" ? styles.kpiCardActive : ""
        }`}
        onClick={() => onSelectFilter?.(activeFilter === "STORED" ? "ALL" : "STORED")}
        role="button"
        tabIndex={0}
        title="Bấm để lọc danh sách mẫu đang lưu"
      >
        <div className={styles.cardTop}>
          <div className={styles.cardLabelCol}>
            <span className={styles.cardLabel}>Đang lưu mẫu</span>
            <div className={styles.countRow}>
              <span className={styles.countNumberStored}>
                {String(stats.stored).padStart(2, "0")}
              </span>
              <span className={styles.countUnit}>mẫu lưu</span>
            </div>
          </div>
          <div className={styles.iconBoxStored}>
            <FlaskConical size={20} />
          </div>
        </div>

        <div className={styles.cardFooterStored}>
          <Thermometer size={13} />
          <span>Bảo quản tủ chuyên dụng 2°C - 8°C</span>
        </div>
      </div>

      {/* Card 2: Đã đủ 24 giờ (chưa tiêu hủy) */}
      <div
        className={`${styles.kpiCard} ${
          activeFilter === "READY" ? styles.kpiCardActiveWarning : ""
        }`}
        onClick={() => onSelectFilter?.(activeFilter === "READY" ? "ALL" : "READY")}
        role="button"
        tabIndex={0}
        title="Bấm để lọc mẫu đã đủ 24 giờ cần xử lý"
      >
        <div className={styles.cardTop}>
          <div className={styles.cardLabelCol}>
            <div className={styles.readyTitleWrap}>
              <span className={styles.cardLabel}>Đã đủ 24 giờ</span>
              <span className={styles.readyPulseDot} />
            </div>
            <div className={styles.countRow}>
              <span className={styles.countNumberReady}>
                {String(stats.ready).padStart(2, "0")}
              </span>
              <span className={styles.countUnit}>chờ xử lý</span>
            </div>
          </div>
          <div className={styles.iconBoxReady}>
            <ClockAlert size={20} />
          </div>
        </div>

        <div className={styles.cardFooterReady}>
          <span>Đủ điều kiện lập biên bản tiêu hủy</span>
        </div>
      </div>

      {/* Card 3: Đã tiêu hủy */}
      <div
        className={`${styles.kpiCard} ${
          activeFilter === "DISPOSED" ? styles.kpiCardActive : ""
        }`}
        onClick={() => onSelectFilter?.(activeFilter === "DISPOSED" ? "ALL" : "DISPOSED")}
        role="button"
        tabIndex={0}
        title="Bấm để lọc mẫu đã hoàn tất tiêu hủy"
      >
        <div className={styles.cardTop}>
          <div className={styles.cardLabelCol}>
            <span className={styles.cardLabel}>Đã tiêu hủy trong ngày</span>
            <div className={styles.countRow}>
              <span className={styles.countNumberDisposed}>
                {String(stats.disposed).padStart(2, "0")}
              </span>
              <span className={styles.countUnit}>hoàn tất</span>
            </div>
          </div>
          <div className={styles.iconBoxDisposed}>
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className={styles.cardFooterDisposed}>
          <span>Đã kết thúc chu kỳ lưu 24h an toàn</span>
        </div>
      </div>
    </div>
  )
}

KitchenSamplesKPICards.propTypes = {
  stats: PropTypes.shape({
    stored: PropTypes.number,
    ready: PropTypes.number,
    disposed: PropTypes.number,
  }),
  activeFilter: PropTypes.string,
  onSelectFilter: PropTypes.func,
}
