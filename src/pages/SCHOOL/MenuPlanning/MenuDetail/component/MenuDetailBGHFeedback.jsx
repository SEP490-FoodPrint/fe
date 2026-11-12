import React from "react"
import styles from "./MenuDetailBGHFeedback.module.scss"

export default function MenuDetailBGHFeedback({ menu, feedback, status, onEdit }) {
  const currentStatus = menu?.status || status
  const feedbackText = menu?.feedback || feedback

  if (currentStatus === "REVISION_REQUESTED" || (feedbackText && currentStatus !== "APPROVED")) {
    return (
      <div className={styles.alertRevision} role="alert">
        <div className={styles.alertHeader}>
          <div className={styles.alertTitleGroup}>
            <span className={`material-symbols-outlined ${styles.alertIconRevision}`}>report_problem</span>
            <div className={styles.alertTextWrap}>
              <h3 className={styles.alertTitle}>Ý kiến yêu cầu chỉnh sửa từ Ban Giám Hiệu</h3>
              {feedbackText && <p className={styles.alertComment}>{feedbackText}</p>}
            </div>
          </div>
          {onEdit && (
            <button type="button" className={styles.btnActionRevision} onClick={onEdit}>
              <span className="material-symbols-outlined text-[16px]">edit</span>
              <span>Chỉnh sửa ngay</span>
            </button>
          )}
        </div>
      </div>
    )
  }

  if (currentStatus === "APPROVED" && feedbackText) {
    return (
      <div className={styles.alertApproved} role="status">
        <div className={styles.alertTitleGroup}>
          <span className={`material-symbols-outlined ${styles.alertIconApproved}`}>check_circle</span>
          <div className={styles.alertTextWrap}>
            <h3 className={styles.alertTitleApproved}>Ghi chú phê duyệt</h3>
            <p className={styles.alertCommentApproved}>{feedbackText}</p>
          </div>
        </div>
      </div>
    )
  }

  return null
}
