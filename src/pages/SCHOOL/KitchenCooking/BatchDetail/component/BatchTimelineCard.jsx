import React from "react"
import { Activity, Check } from "lucide-react"
import styles from "./BatchTimelineCard.module.scss"

export default function BatchTimelineCard({ status = "DRAFT" }) {
  const isDraft = status === "DRAFT"
  const isConfirmed = status === "CONFIRMED"
  const isCompleted = status === "COMPLETED"

  return (
    <section className={styles.timelineCard}>
      {/* Header Thẻ */}
      <div className={styles.cardHeader}>
        <Activity size={18} className={styles.headerIcon} />
        <h2 className={styles.cardTitle}>Tiến trình chế biến</h2>
      </div>

      {/* Stepper Dọc */}
      <div className={styles.timelineList}>
        {/* Bước 1: Chưa xác nhận */}
        <div className={`${styles.timelineItem} ${isDraft ? styles.itemCurrent : styles.itemDone}`}>
          <div className={styles.nodeMarker}>
            {isDraft ? (
              <span className={styles.innerDot} />
            ) : (
              <Check size={12} className={styles.checkIcon} />
            )}
          </div>

          <div className={styles.itemContent}>
            <div className={styles.itemHeader}>
              <span className={styles.stepTitle}>1. Chưa xác nhận</span>
              {isDraft && <span className={styles.currentBadge}>Hiện tại</span>}
            </div>
            <p className={styles.stepDesc}>
              Phương án lô nấu đã lập xong, đang đợi kiểm tra định mức và lô nguyên liệu.
            </p>
          </div>
        </div>

        {/* Bước 2: Đã xác nhận phương án */}
        <div
          className={`${styles.timelineItem} ${
            isConfirmed ? styles.itemCurrent : isCompleted ? styles.itemDone : styles.itemPending
          }`}
        >
          <div className={styles.nodeMarker}>
            {isCompleted ? (
              <Check size={12} className={styles.checkIcon} />
            ) : (
              <span className={styles.innerDot} />
            )}
          </div>

          <div className={styles.itemContent}>
            <div className={styles.itemHeader}>
              <span className={styles.stepTitle}>2. Đã xác nhận phương án</span>
              {isConfirmed && <span className={styles.currentBadgeConfirmed}>Hiện tại</span>}
            </div>
            <p className={styles.stepDesc}>
              Bếp trưởng duyệt khóa định lượng và cho phép xuất kho nấu lô chế biến.
            </p>
          </div>
        </div>

        {/* Bước 3: Đã chế biến xong */}
        <div className={`${styles.timelineItem} ${isCompleted ? styles.itemDone : styles.itemPending}`}>
          <div className={styles.nodeMarker}>
            {isCompleted ? (
              <Check size={12} className={styles.checkIcon} />
            ) : (
              <span className={styles.innerDot} />
            )}
          </div>

          <div className={styles.itemContent}>
            <div className={styles.itemHeader}>
              <span className={styles.stepTitle}>3. Đã chế biến xong</span>
              {isCompleted && <span className={styles.currentBadgeCompleted}>Hoàn tất</span>}
            </div>
            <p className={styles.stepDesc}>
              Cập nhật số suất thực tế, lưu mẫu thức ăn 24h và hoàn tất quy trình.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

