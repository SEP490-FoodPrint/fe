import React from "react"
import { AlertTriangle } from "lucide-react"
import styles from "./MenuRevisionNotice.module.scss"

export default function MenuRevisionNotice({ review, loading = false, error = "", onRetry, compact = false }) {
  const reviewer = review?.reviewer?.fullName
  const reviewedAt = review?.reviewedAt
    ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(review.reviewedAt))
    : null

  return (
    <section className={`${styles.notice} ${compact ? styles.compact : ""}`} aria-label="Lý do Ban Giám hiệu yêu cầu chỉnh sửa">
      <AlertTriangle size={18} aria-hidden="true" className={styles.icon} />
      <div className={styles.content}>
        <h3 className={styles.title}>Ban Giám hiệu yêu cầu chỉnh sửa thực đơn tuần</h3>
        {review?.feedback ? <p className={styles.reason}>{review.feedback}</p>
          : <p className={styles.message}>{loading ? "Đang tải lý do…" : error || "Chưa tìm thấy nội dung nhận xét. Vui lòng thử tải lại."}</p>}
        {(reviewer || reviewedAt) && <p className={styles.meta}>{[reviewer, reviewedAt].filter(Boolean).join(" · ")}</p>}
        {(!review?.feedback && !loading && onRetry) && (
          <button type="button" className={styles.retry} onClick={onRetry}>Thử tải lại lý do</button>
        )}
        {!compact && review?.feedback && <p className={styles.guidance}>Chỉnh sửa thực đơn theo nhận xét, sau đó gửi lại Ban Giám hiệu.</p>}
      </div>
    </section>
  )
}
