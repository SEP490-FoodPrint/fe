import React from "react"
import {
  ClipboardCheck,
  CheckCircle2,
  Users,
  Boxes,
  Warehouse,
  ShieldCheck,
  CheckCheck,
  LockOpen
} from "lucide-react"
import styles from "./BatchValidationAuditCard.module.scss"

export default function BatchValidationAuditCard({ portions = 60, totalLots = 4 }) {
  return (
    <section className={styles.sectionCard}>
      {/* 1. Header */}
      <div className={styles.headerRow}>
        <div className={styles.headerLeft}>
          <div className={styles.iconBox}>
            <ClipboardCheck size={22} />
          </div>
          <div>
            <h2 className={styles.sectionTitle}>Kiểm tra phương án &amp; Đối soát dữ liệu kho</h2>
            <p className={styles.sectionSubtitle}>
              Tự động kiểm tra tính toàn vẹn kho và ràng buộc quy chuẩn trước khi cập nhật.
            </p>
          </div>
        </div>

        <div className={styles.validBadge}>
          <CheckCircle2 size={16} />
          <span>Phương án chế biến hợp lệ</span>
        </div>
      </div>

      {/* 2. 4 Metrics Cards */}
      <div className={styles.metricsGrid}>
        {/* Metric 1: Số suất Lô 01 */}
        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Số suất Lô 01</span>
            <Users size={18} className={styles.metricIcon} />
          </div>

          <div className={styles.metricMid}>
            <div className={styles.metricValueWrapper}>
              <span className={styles.metricNum}>{portions}</span>
              <span className={styles.metricUnit}>suất</span>
            </div>
            <span className={styles.metricSubtext}>Phân bổ: Học sinh Khối 6, 7</span>
          </div>

          <div className={styles.progressTrack}>
            <div className={styles.progressBar} style={{ width: "60%" }} />
          </div>
        </div>

        {/* Metric 2: Lô nguyên liệu */}
        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Lô nguyên liệu</span>
            <Boxes size={18} className={styles.metricIcon} />
          </div>

          <div className={styles.metricMid}>
            <div className={styles.metricValueWrapper}>
              <span className={styles.metricNum}>0{totalLots}</span>
              <span className={styles.metricUnit}>lô hợp chuẩn</span>
            </div>
            <span className={styles.metricSubtext}>Mỗi nguyên liệu 01 lô độc lập</span>
          </div>

          <div className={styles.metricFooterStatus}>
            <CheckCheck size={14} />
            <span>Không pha trộn lô</span>
          </div>
        </div>

        {/* Metric 3: Kho khả dụng */}
        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Kho khả dụng</span>
            <Warehouse size={18} className={styles.metricIcon} />
          </div>

          <div className={styles.metricMid}>
            <div className={styles.metricValueWrapper}>
              <span className={styles.metricNum}>100%</span>
              <span className={styles.metricUnit}>Đủ tồn</span>
            </div>
            <span className={styles.metricSubtext}>Không vượt tồn kho từng lô</span>
          </div>

          <div className={styles.metricFooterStatus}>
            <LockOpen size={14} />
            <span>Sẵn sàng xuất kho</span>
          </div>
        </div>

        {/* Metric 4: Kết quả kiểm tra */}
        <div className={`${styles.metricCard} ${styles.metricCardSuccess}`}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabelSuccess}>Kết quả kiểm tra</span>
            <ShieldCheck size={18} className={styles.metricIconSuccess} />
          </div>

          <div className={styles.metricMid}>
            <div className={styles.metricValueWrapper}>
              <span className={styles.metricNumSuccess}>Hợp lệ 100%</span>
            </div>
            <span className={styles.metricSubtext}>Đáp ứng quy chuẩn Nấu riêng</span>
          </div>

          <div className={styles.metricFooterStatusSuccess}>
            <CheckCircle2 size={14} />
            <span>Cho phép phê duyệt</span>
          </div>
        </div>
      </div>
    </section>
  )
}

