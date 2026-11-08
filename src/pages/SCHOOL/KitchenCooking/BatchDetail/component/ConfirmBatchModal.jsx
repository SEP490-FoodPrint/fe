import React from "react"
import { CheckCircle2, X, ShieldCheck } from "lucide-react"
import styles from "./ConfirmBatchModal.module.scss"

export default function ConfirmBatchModal({
  isOpen,
  onClose,
  onConfirm,
  batchData = {},
  loading = false,
}) {
  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleWrap}>
            <div className={styles.iconCircle}>
              <CheckCircle2 size={22} />
            </div>
            <div>
              <h3 className={styles.modalTitle}>Xác nhận nấu</h3>
              <p className={styles.modalSub}>Xác nhận và chuyển lô sang trạng thái chờ nấu</p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng"
            disabled={loading}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          <div className={styles.batchBriefBox}>
            <div className={styles.briefRow}>
              <span className={styles.briefLabel}>Món ăn:</span>
              <span className={styles.briefValueBold}>{batchData.dishName || "—"}</span>
            </div>
            <div className={styles.briefRow}>
              <span className={styles.briefLabel}>Mã lô:</span>
              <span className={styles.briefValueMono}>{batchData.code || "—"}</span>
            </div>
            <div className={styles.briefRow}>
              <span className={styles.briefLabel}>Số suất chế biến:</span>
              <span className={styles.briefValuePrimary}>
                {(batchData.portions || 0).toLocaleString("vi-VN")} suất
              </span>
            </div>
          </div>

          <div className={styles.warningBox}>
            <ShieldCheck size={18} className={styles.warningIcon} />
            <p className={styles.warningText}>
              Sau khi xác nhận nấu, mẻ nấu sẽ chính thức chuyển sang danh sách chờ nấu để nhân viên bếp thực hiện chế biến.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.btnCancel}
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </button>
          <button
            type="button"
            className={styles.btnConfirm}
            onClick={onConfirm}
            disabled={loading}
          >
            <CheckCircle2 size={16} />
            <span>{loading ? "Đang xác nhận…" : "Xác nhận nấu"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
