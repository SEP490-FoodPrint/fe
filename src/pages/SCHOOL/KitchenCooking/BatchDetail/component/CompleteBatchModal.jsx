import React, { useState } from "react"
import { CookingPot, X, CheckCircle2, Info } from "lucide-react"
import styles from "./CompleteBatchModal.module.scss"

export default function CompleteBatchModal({
  isOpen,
  onClose,
  onConfirm,
  batchData = {},
  loading = false,
}) {
  const [note, setNote] = useState("")

  if (!isOpen) return null

  const now = new Date()
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`

  const handleSubmit = () => {
    onConfirm({ note: note.trim() || undefined })
  }

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleWrap}>
            <div className={styles.iconCircle}>
              <CookingPot size={22} />
            </div>
            <div>
              <h3 className={styles.modalTitle}>Hoàn thành chế biến</h3>
              <p className={styles.modalSub}>Xác nhận mẻ nấu đã hoàn tất ra khay phục vụ</p>
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
            <div className={styles.briefRow}>
              <span className={styles.briefLabel}>Thời điểm ra khay:</span>
              <span className={styles.briefValue}>{currentTime} (Hiện tại)</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label
              htmlFor="batch-complete-note"
              style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#374151" }}
            >
              Ghi chú hoàn thành (tùy chọn)
            </label>
            <input
              id="batch-complete-note"
              type="text"
              maxLength={2000}
              placeholder="Ví dụ: Món ăn nấu đúng định lượng, đạt yêu cầu cảm quan"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={loading}
              style={{
                height: 40,
                border: "1px solid #d1d5db",
                borderRadius: 8,
                padding: "0 12px",
                fontSize: "0.875rem",
              }}
            />
          </div>

          <div className={styles.infoBox}>
            <Info size={18} className={styles.infoIcon} />
            <p className={styles.infoText}>
              Sau khi xác nhận, mẻ nấu sẽ được ghi nhận hoàn thành và mở khóa để tiến hành lưu mẫu thực phẩm và phân chia suất ăn về các lớp học.
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
            Xem lại
          </button>
          <button
            type="button"
            className={styles.btnConfirm}
            onClick={handleSubmit}
            disabled={loading}
          >
            <CheckCircle2 size={16} />
            <span>{loading ? "Đang ghi nhận…" : "Xác nhận hoàn thành"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
