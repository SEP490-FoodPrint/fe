import React from "react"
import styles from "./MenuDetailBGHFeedback.module.scss"
import MenuRevisionNotice from "../../component/MenuRevisionNotice"

export default function MenuDetailBGHFeedback({ menu, feedback, status, revisionRequested, review, loading, error, onRetry }) {
  const currentStatus = menu?.status || status
  const feedbackText = menu?.feedback || feedback

  if (revisionRequested || currentStatus === "REVISION_REQUESTED" || currentStatus === "REVISION_REQUIRED") {
    return <MenuRevisionNotice review={review} loading={loading} error={error} onRetry={onRetry} />
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
