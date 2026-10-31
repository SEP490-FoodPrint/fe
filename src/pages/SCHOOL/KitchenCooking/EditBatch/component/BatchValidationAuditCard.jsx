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
    <section className={styles.auditCard}>
      {/* 1. Header Thẻ */}
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.iconBox}>
            <ClipboardCheck size={18} />
          </div>
          <h2 className={styles.cardTitle}>Kiểm tra phương án &amp; Đối soát dữ liệu kho</h2>
        </div>

        <div className={styles.validBadge}>
          <CheckCircle2 size={14} />
          <span>Phương án hợp lệ 100%</span>
        </div>
      </div>

      {/* 2. 4 Thẻ Chỉ Số Vận Hành (Đồng bộ phong cách Màn 5) */}
      <div className={styles.kpiGrid}>
        {/* Box 1: Số suất Lô 01 */}
        <div className={styles.kpiBox}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Số suất Lô 01</span>
            <Users size={16} className={styles.kpiIcon} />
          </div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiNum}>{portions}</span>
            <span className={styles.kpiUnit}>suất</span>
          </div>
          <span className={styles.kpiSub}>Phân bổ: Học sinh Khối 6, 7</span>
        </div>

        {/* Box 2: Lô nguyên liệu */}
        <div className={styles.kpiBox}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Lô nguyên liệu</span>
            <Boxes size={16} className={styles.kpiIcon} />
          </div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiNum}>0{totalLots}</span>
            <span className={styles.kpiUnit}>lô hợp chuẩn</span>
          </div>
          <div className={styles.kpiStatusGreen}>
            <CheckCheck size={13} />
            <span>Không pha trộn lô</span>
          </div>
        </div>

        {/* Box 3: Kho khả dụng */}
        <div className={styles.kpiBox}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Kho khả dụng</span>
            <Warehouse size={16} className={styles.kpiIcon} />
          </div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiNum}>100%</span>
            <span className={styles.kpiUnit}>Đủ tồn</span>
          </div>
          <div className={styles.kpiStatusGreen}>
            <LockOpen size={13} />
            <span>Sẵn sàng xuất kho</span>
          </div>
        </div>

        {/* Box 4: Kết quả kiểm tra */}
        <div className={`${styles.kpiBox} ${styles.kpiBoxSuccess}`}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabelSuccess}>Kết quả kiểm tra</span>
            <ShieldCheck size={16} className={styles.kpiIconSuccess} />
          </div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiNumSuccess}>Hợp lệ 100%</span>
          </div>
          <div className={styles.kpiStatusSuccess}>
            <CheckCircle2 size={13} />
            <span>Cho phép phê duyệt</span>
          </div>
        </div>
      </div>
    </section>
  )
}
