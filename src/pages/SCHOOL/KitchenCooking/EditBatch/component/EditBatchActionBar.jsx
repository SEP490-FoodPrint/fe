import React from "react"
import { History, X, Save } from "lucide-react"
import styles from "./EditBatchActionBar.module.scss"

export default function EditBatchActionBar({
  lastEdited = "Hôm nay 06:40",
  lastEditor = "Bếp trưởng Nguyễn Văn Vận",
  onCancel,
  onSave,
  isSubmitting = false
}) {
  return (
    <div className={styles.actionBarContainer}>
      {/* 1. Left Audit Trail */}
      <div className={styles.auditInfo}>
        <History size={17} className={styles.historyIcon} />
        <span className={styles.auditText}>
          Lần sửa đổi gần nhất: <strong>{lastEdited}</strong> bởi <strong>{lastEditor}</strong>
        </span>
      </div>

      {/* 2. Right Action Buttons */}
      <div className={styles.btnGroup}>
        <button
          type="button"
          className={styles.cancelBtn}
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <X size={17} />
          <span>Hủy thay đổi</span>
        </button>

        <button
          type="button"
          className={styles.saveBtn}
          onClick={onSave}
          disabled={isSubmitting}
        >
          <Save size={17} />
          <span>{isSubmitting ? "Đang lưu..." : "Cập nhật lô chế biến"}</span>
        </button>
      </div>
    </div>
  )
}

