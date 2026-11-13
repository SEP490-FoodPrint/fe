import React from "react"
import styles from "./CreateMenuBottomBar.module.scss"

export default function CreateMenuBottomBar({
  onCancel,
  onSaveDraft,
  onSubmitApproval,
  isSubmitting = false,
  isLoading = false,
  readOnly = false,
  onView,
  draftText = "Lưu bản nháp",
  submitText = "Gửi BGH phê duyệt",
}) {
  return (
    <div className={styles.bottomBarContainer}>
      <div className={styles.barInner}>
        {/* Bên trái: Nút hủy */}
        <div className={styles.leftGroup}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onCancel}
          >
            Hủy bỏ
          </button>
        </div>

        {/* Bên phải: Nút hành động */}
        <div className={styles.rightGroup}>
          {readOnly ? (onView ? (
            <button type="button" className={styles.submitBtn} onClick={onView} disabled={isLoading || !onView}>
              <span className={`material-symbols-outlined ${styles.btnIcon}`}>visibility</span>
              <span>Xem thực đơn</span>
            </button>
          ) : null) : <>
          <button
            type="button"
            className={styles.draftBtn}
            onClick={onSaveDraft}
            disabled={isSubmitting || isLoading}
          >
            <span className={`material-symbols-outlined ${styles.btnIcon}`}>save</span>
            <span>{draftText}</span>
          </button>

          <button
            type="button"
            className={styles.submitBtn}
            onClick={onSubmitApproval}
            disabled={isSubmitting || isLoading}
          >
            <span className={`material-symbols-outlined ${styles.btnIcon}`}>send</span>
            <span>{submitText}</span>
          </button>
          </>}
        </div>
      </div>
    </div>
  )
}

