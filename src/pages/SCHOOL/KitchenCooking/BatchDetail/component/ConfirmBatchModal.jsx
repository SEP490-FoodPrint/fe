import React from "react"
import { CheckCircle2, X, AlertCircle, ShieldCheck } from "lucide-react"
import styles from "./ConfirmBatchModal.module.scss"

export default function ConfirmBatchModal({
  isOpen,
  onClose,
  onConfirm,
  batchData
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
              <h3 className={styles.modalTitle}>Xác nhận phương án chế biến</h3>
              <p className={styles.modalSub}>Khóa định lượng và chuyển trạng thái sẵn sàng nấu</p>
            </div>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          <div className={styles.batchBriefBox}>
            <div className={styles.briefRow}>
              <span className={styles.briefLabel}>Món ăn:</span>
              <span className={styles.briefValueBold}>{batchData.dishName}</span>
            </div>
            <div className={styles.briefRow}>
              <span className={styles.briefLabel}>Mã lô:</span>
              <span className={styles.briefValueMono}>{batchData.code}</span>
            </div>
            <div className={styles.briefRow}>
              <span className={styles.briefLabel}>Số suất định lượng:</span>
              <span className={styles.briefValuePrimary}>
                {batchData.plannedPortions.toLocaleString("vi-VN")} suất
              </span>
            </div>
            <div className={styles.briefRow}>
              <span className={styles.briefLabel}>Nguyên liệu:</span>
              <span className={styles.briefValue}>4 nguyên liệu đạt chuẩn kiểm thực</span>
            </div>
          </div>

          <div className={styles.warningBox}>
            <ShieldCheck size={18} className={styles.warningIcon} />
            <p className={styles.warningText}>
              Sau khi xác nhận, định mức và danh mục lô nguyên liệu sẽ được khóa để đảm bảo an toàn truy xuất nguồn gốc FoodPrint. Bạn có chắc chắn muốn duyệt phương án này?
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button type="button" className={styles.btnCancel} onClick={onClose}>
            Xem lại
          </button>
          <button type="button" className={styles.btnConfirm} onClick={onConfirm}>
            <CheckCircle2 size={16} />
            <span>Xác nhận duyệt phương án</span>
          </button>
        </div>
      </div>
    </div>
  )
}

