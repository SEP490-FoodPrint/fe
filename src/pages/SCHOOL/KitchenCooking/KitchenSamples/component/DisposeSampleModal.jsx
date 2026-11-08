import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { X, Trash2, AlertTriangle, Check, Clock } from "lucide-react"
import { formatSampleDateTime } from "../mockSamplesData"
import styles from "./DisposeSampleModal.module.scss"

export default function DisposeSampleModal({
  open = false,
  sample = null,
  onClose,
  onConfirm,
  submitting = false,
}) {
  const [disposalNote, setDisposalNote] = useState(
    "Đã đủ 24h, cảm quan bình thường, tiêu hủy theo quy định."
  )
  const [disposedAt, setDisposedAt] = useState(() => {
    const d = new Date()
    const pad = (n) => String(n).padStart(2, "0")
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  })

  useEffect(() => {
    if (open) {
      const d = new Date()
      const pad = (n) => String(n).padStart(2, "0")
      setDisposedAt(
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
      )
    }
  }, [open])

  if (!open || !sample) return null

  const sampledDisplay = formatSampleDateTime(sample.sampledAt)

  const handleConfirm = (e) => {
    e.preventDefault()
    onConfirm({
      disposedAt: new Date(disposedAt).toISOString(),
      disposalNote: disposalNote.trim() || undefined,
    })
  }

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleWrap}>
            <div className={styles.iconCircle}>
              <Trash2 size={18} />
            </div>
            <div>
              <h3 className={styles.title}>Xác nhận tiêu hủy mẫu lưu 24h</h3>
              <p className={styles.subTitle}>
                Lập biên bản kết thúc chu kỳ lưu trữ thực phẩm an toàn
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng"
            disabled={submitting}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleConfirm} className={styles.form}>
          {/* Thông tin đối soát mẫu lưu */}
          <div className={styles.sampleContextCard}>
            <div className={styles.contextRow}>
              <span className={styles.contextLabel}>Mã lô chế biến:</span>
              <span className={styles.contextValMono}>{sample.batchCode || sample.cookingBatchId}</span>
            </div>
            <div className={styles.contextRow}>
              <span className={styles.contextLabel}>Tên món ăn:</span>
              <span className={styles.contextValBold}>{sample.dishName}</span>
            </div>
            <div className={styles.contextRow}>
              <span className={styles.contextLabel}>Thời điểm lấy mẫu:</span>
              <span className={styles.contextVal}>{sampledDisplay.full}</span>
            </div>
            <div className={styles.contextRow}>
              <span className={styles.contextLabel}>Lượng & vị trí lưu:</span>
              <span className={styles.contextVal}>
                {sample.quantity} {sample.unit} • {sample.storageLocation}
              </span>
            </div>
          </div>

          {/* Cảnh báo tiêu hủy */}
          <div className={styles.alertWarning}>
            <AlertTriangle size={15} className={styles.warningIcon} />
            <div className={styles.warningText}>
              Mẫu sau khi xác nhận sẽ chuyển sang trạng thái <strong>Đã tiêu hủy</strong> và không thể hoàn tác.
            </div>
          </div>

          {/* Form Fields: Thời điểm hủy & Ghi chú */}
          <div className={styles.formGroup}>
            <label className={styles.fieldLabel} htmlFor="disposed-datetime">
              Thời điểm thực hiện tiêu hủy
            </label>
            <input
              id="disposed-datetime"
              type="datetime-local"
              className={styles.textInput}
              value={disposedAt}
              onChange={(e) => setDisposedAt(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.fieldLabel} htmlFor="disposal-note">
              Ghi chú tiêu hủy
            </label>
            <textarea
              id="disposal-note"
              rows={2}
              className={styles.textarea}
              placeholder="Nhập ghi chú hoặc lý do tiêu hủy..."
              value={disposalNote}
              onChange={(e) => setDisposalNote(e.target.value)}
              disabled={submitting}
            />
          </div>

          {/* Footer Actions */}
          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={submitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={styles.confirmBtn}
              disabled={submitting}
            >
              <Trash2 size={15} />
              <span>{submitting ? "Đang xử lý..." : "Xác nhận tiêu hủy"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

DisposeSampleModal.propTypes = {
  open: PropTypes.bool.isRequired,
  sample: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
}
