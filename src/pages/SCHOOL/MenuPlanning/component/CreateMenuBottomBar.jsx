import React from "react"
import styles from "./CreateMenuBottomBar.module.scss"

export default function CreateMenuBottomBar({
  onCancel,
  onSaveDraft,
  onSubmitApproval,
  isSubmitting = false
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
          <button
            type="button"
            className={styles.draftBtn}
            onClick={onSaveDraft}
          >
            <span className={`material-symbols-outlined ${styles.btnIcon}`}>save</span>
            <span>Lưu bản nháp</span>
          </button>

          <button
            type="button"
            className={styles.submitBtn}
            onClick={onSubmitApproval}
            disabled={isSubmitting}
          >
            <span className={`material-symbols-outlined ${styles.btnIcon}`}>send</span>
            <span>Gửi BGH phê duyệt</span>
          </button>
        </div>
      </div>
    </div>
  )
}

