import React from "react"
import styles from "./MenuListStatsRail.module.scss"

export default function MenuListStatsRail({ stats, onFilterByStatus }) {
  const {
    total = 18,
    needsAction = 2,
    pendingApproval = 1,
    approved = 15
  } = stats || {}

  return (
    <div className={styles.statsRail}>
      {/* Stat 1: Tổng thực đơn */}
      <div
        className={`${styles.statItem} ${styles.clickable}`}
        onClick={() => onFilterByStatus && onFilterByStatus("all")}
        title="Xem tất cả thực đơn"
      >
        <span className={styles.statLabel}>Tổng thực đơn:</span>
        <span className={`${styles.statValue} ${styles.neutral}`}>{String(total).padStart(2, "0")}</span>
        <span className={styles.statUnit}>thực đơn</span>
      </div>

      <div className={styles.divider} />

      {/* Stat 2: Cần xử lý */}
      <div
        className={`${styles.statItem} ${styles.clickable}`}
        onClick={() => onFilterByStatus && onFilterByStatus("needsAction")}
        title="Lọc các thực đơn cần xử lý (bản nháp, yêu cầu chỉnh sửa)"
      >
        <span className={styles.statLabel}>Cần xử lý:</span>
        <span className={`${styles.statValue} ${styles.danger}`}>{String(needsAction).padStart(2, "0")}</span>
        <span className={styles.statSub}>(chờ hoàn thiện / sửa đổi)</span>
      </div>

      <div className={styles.divider} />

      {/* Stat 3: Chờ BGH duyệt */}
      <div
        className={`${styles.statItem} ${styles.clickable}`}
        onClick={() => onFilterByStatus && onFilterByStatus("PENDING_APPROVAL")}
        title="Lọc các thực đơn đang chờ BGH duyệt"
      >
        <span className={styles.statLabel}>Chờ BGH duyệt:</span>
        <span className={`${styles.statValue} ${styles.info}`}>{String(pendingApproval).padStart(2, "0")}</span>
        <span className={styles.statSub}>(tuần 46)</span>
      </div>

      <div className={styles.divider} />

      {/* Stat 4: Đã phê duyệt */}
      <div
        className={`${styles.statItem} ${styles.clickable}`}
        onClick={() => onFilterByStatus && onFilterByStatus("APPROVED")}
        title="Lọc các thực đơn đã phê duyệt"
      >
        <span className={styles.statLabel}>Đã phê duyệt:</span>
        <span className={`${styles.statValue} ${styles.success}`}>{String(approved).padStart(2, "0")}</span>
        <span className={styles.statSub}>(sẵn sàng áp dụng)</span>
      </div>
    </div>
  )
}

