import React from "react"
import styles from "./MenuListStatsRail.module.scss"

export default function MenuListStatsRail({ stats, year, onFilterByStatus }) {
  const {
    total = 0,
    draft = 0,
    pendingApproval = 0,
    approved = 0,
    revisionRequested = 0,
  } = stats || {}

  const displayYear = year || new Date().getFullYear()

  return (
    <div className={styles.statsRail}>
      {/* Stat 1: Tổng thực đơn của năm hiện tại */}
      <div
        className={`${styles.statItem} ${styles.clickable}`}
        onClick={() => onFilterByStatus && onFilterByStatus("all")}
        title={`Xem tất cả thực đơn năm ${displayYear}`}
      >
        <span className={styles.statLabel}>Tổng thực đơn năm {displayYear}:</span>
        <span className={`${styles.statValue} ${styles.neutral}`}>{String(total).padStart(2, "0")}</span>
        <span className={styles.statUnit}>thực đơn</span>
      </div>

      <div className={styles.divider} />

      {/* Stat 2: Bản nháp */}
      <div
        className={`${styles.statItem} ${styles.clickable}`}
        onClick={() => onFilterByStatus && onFilterByStatus("DRAFT")}
        title="Lọc các thực đơn đang là bản nháp (chưa gửi duyệt)"
      >
        <span className={styles.statLabel}>Bản nháp:</span>
        <span className={`${styles.statValue} ${styles.warning}`}>{String(draft).padStart(2, "0")}</span>
        <span className={styles.statSub}>(chưa gửi duyệt)</span>
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

      {revisionRequested > 0 && (
        <>
          <div className={styles.divider} />
          {/* Stat 5: Yêu cầu chỉnh sửa */}
          <div
            className={`${styles.statItem} ${styles.clickable}`}
            onClick={() => onFilterByStatus && onFilterByStatus("REVISION_REQUESTED")}
            title="Lọc các thực đơn có yêu cầu chỉnh sửa từ BGH"
          >
            <span className={styles.statLabel}>Yêu cầu sửa:</span>
            <span className={`${styles.statValue} ${styles.danger}`}>{String(revisionRequested).padStart(2, "0")}</span>
          </div>
        </>
      )}
    </div>
  )
}
