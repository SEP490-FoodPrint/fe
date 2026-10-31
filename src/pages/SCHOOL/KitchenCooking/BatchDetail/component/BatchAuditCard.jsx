import React from "react"
import { History, ShieldCheck } from "lucide-react"
import styles from "./BatchAuditCard.module.scss"

export default function BatchAuditCard({ auditData = {} }) {
  return (
    <section className={styles.auditCard}>
      {/* Header Thẻ */}
      <div className={styles.cardHeader}>
        <History size={18} className={styles.headerIcon} />
        <h2 className={styles.cardTitle}>Theo dõi kiểm toán</h2>
      </div>

      <div className={styles.auditList}>
        {/* 1. Người tạo phương án */}
        <div className={styles.auditItem}>
          <span className={styles.auditLabel}>Người tạo phương án</span>
          <span className={styles.auditValueBold}>{auditData.createdBy || "Nguyễn Văn Vận (Bếp chính)"}</span>
        </div>

        {/* 2. Thời điểm tạo */}
        <div className={styles.auditItem}>
          <span className={styles.auditLabel}>Thời điểm tạo</span>
          <span className={styles.auditValue}>{auditData.createdAt || "10/11/2024 07:15"}</span>
        </div>

        {/* 3. Người xác nhận phương án */}
        <div className={styles.auditItem}>
          <span className={styles.auditLabel}>Người xác nhận phương án</span>
          <span className={auditData.confirmedBy ? styles.auditValueBold : styles.auditValueMuted}>
            {auditData.confirmedBy || "Chưa có (Chờ bếp trưởng duyệt)"}
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
          <span className={styles.auditLabel}>Người ghi nhận hoàn thành</span>
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
    </section>
  )
}

