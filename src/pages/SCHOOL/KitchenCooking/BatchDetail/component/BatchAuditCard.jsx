import React from "react"
import { History, ChevronDown } from "lucide-react"
import styles from "./BatchAuditCard.module.scss"

export default function BatchAuditCard({ auditData = {} }) {
  return (
    <details className={styles.auditCard}>
      <summary className={styles.cardSummary}>
        <div className={styles.summaryLeft}>
          <History size={16} className={styles.headerIcon} />
          <span className={styles.cardTitle}>Lịch sử thao tác & kiểm toán</span>
        </div>
        <ChevronDown size={16} className={styles.chevronIcon} />
      </summary>

      <div className={styles.auditList}>
        {/* 1. Người tạo phương án */}
        <div className={styles.auditItem}>
          <span className={styles.auditLabel}>Người tạo</span>
          <span className={styles.auditValueBold}>{auditData.createdBy || "Nhân viên Bếp (Bếp chính)"}</span>
        </div>

        {/* 2. Thời điểm tạo */}
        <div className={styles.auditItem}>
          <span className={styles.auditLabel}>Thời điểm tạo</span>
          <span className={styles.auditValue}>{auditData.createdAt || "—"}</span>
        </div>

        {/* 3. Người xác nhận phương án */}
        <div className={styles.auditItem}>
          <span className={styles.auditLabel}>Người xác nhận</span>
          <span className={auditData.confirmedBy ? styles.auditValueBold : styles.auditValueMuted}>
            {auditData.confirmedBy || "Chưa có"}
          </span>
        </div>

        {/* 4. Thời điểm xác nhận */}
        <div className={styles.auditItem}>
          <span className={styles.auditLabel}>Thời điểm xác nhận</span>
          <span className={auditData.confirmedAt ? styles.auditValue : styles.auditValueMuted}>
            {auditData.confirmedAt || "Chưa ghi nhận"}
          </span>
        </div>

        {/* 5. Người ghi nhận hoàn thành */}
        <div className={styles.auditItem}>
          <span className={styles.auditLabel}>Người hoàn thành</span>
          <span className={auditData.completedBy ? styles.auditValueBold : styles.auditValueMuted}>
            {auditData.completedBy || "Chưa ghi nhận"}
          </span>
        </div>

        {/* 6. Thời điểm hoàn thành */}
        <div className={styles.auditItem}>
          <span className={styles.auditLabel}>Thời điểm hoàn thành</span>
          <span className={auditData.completedAt ? styles.auditValue : styles.auditValueMuted}>
            {auditData.completedAt || "Chưa ghi nhận"}
          </span>
        </div>
      </div>
    </details>
  )
}
