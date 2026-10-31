import React from "react"
import { AlertTriangle, X, Trash2 } from "lucide-react"
import styles from "./DeleteBatchModal.module.scss"

export default function DeleteBatchModal({
  isOpen,
  onClose,
  onConfirm,
  batchCode
}) {
  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleWrap}>
            <div className={styles.iconCircle}>
              <AlertTriangle size={22} />
            </div>
            <div>
              <h3 className={styles.modalTitle}>Xác nhận xóa lô chế biến</h3>
              <p className={styles.modalSub}>Hành động này không thể hoàn tác</p>
            </div>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          <p className={styles.confirmMsg}>
            Bạn có chắc chắn muốn xóa lô chế biến <strong className={styles.codeText}>{batchCode}</strong> khỏi kế hoạch ngày hôm nay không?
          </p>
          <div className={styles.alertNote}>
            <span>Tất cả thông tin định mức nguyên liệu liên kết với lô này sẽ bị hủy bỏ.</span>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button type="button" className={styles.btnCancel} onClick={onClose}>
            Hủy bỏ
          </button>
          <button type="button" className={styles.btnDelete} onClick={onConfirm}>
            <Trash2 size={16} />
            <span>Xóa lô chế biến</span>
          </button>
        </div>
      </div>
    </div>
  )
}

