import InlineError from "src/components/InlineError"
import { formatSmallQuantity } from "src/utils/quantity"
import React, { useEffect, useState } from "react"
import KitchenService from "src/services/KitchenService"
import PropTypes from "prop-types"
import {
  X,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Trash2,
  ArrowUpRight,
  ZoomIn,
} from "lucide-react"
import { get24hRetainedStatus, formatSampleDateTime } from "../retainedStatusHelper"
import styles from "./SampleDetailModal.module.scss"

export default function SampleDetailModal({
  open = false,
  sample = null,
  onClose,
  onOpenUpdateModal,
  onOpenDisposeModal,
  onNavigateBatch,
}) {
  const [photoUrl, setPhotoUrl] = useState(sample?.photoUrl || "")
  const [photoError, setPhotoError] = useState("")
  const [isZoomOpen, setIsZoomOpen] = useState(false)
  useEffect(() => {
    if (!open || !sample?.id) return undefined
    let active = true
    if (sample.photoUrl) {
      setPhotoUrl(sample.photoUrl)
    } else if (sample.cookingBatchId) {
      setPhotoUrl("")
      setPhotoError("")
      KitchenService.getBatchSample(sample.cookingBatchId).then(rows => {
        if (active) setPhotoUrl(rows?.find(row => row.id === sample.id)?.photoUrl || "")
      }).catch(() => { if (active) setPhotoError("Không tải được ảnh mẫu lưu.") })
    }
    return () => { active = false }
  }, [open, sample?.id, sample?.cookingBatchId, sample?.photoUrl])
  if (!open || !sample) return null

  const info24h = get24hRetainedStatus(sample.sampledAt, sample.status)
  const sampledDisplay = formatSampleDateTime(sample.sampledAt)
  const disposedDisplay = sample.disposedAt ? formatSampleDateTime(sample.disposedAt) : null

  // Mốc kết thúc 24h
  const expiresAt = new Date(new Date(sample.sampledAt).getTime() + 24 * 60 * 60 * 1000)
  const expiresDisplay = formatSampleDateTime(expiresAt.toISOString())

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Header tối giản */}
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <h2 className={styles.title}>Chi tiết mẫu lưu 24h</h2>
            {info24h.isDisposed ? (
              <span className={styles.badgeDisposed}>
                <CheckCircle2 size={12} />
                <span>Đã tiêu hủy</span>
              </span>
            ) : info24h.isReadyToDispose ? (
              <span className={styles.badgeReady}>
                <AlertTriangle size={12} />
                <span>Đã đủ 24 giờ</span>
              </span>
            ) : (
              <span className={styles.badgeStored}>
                <Clock size={12} />
                <span>Đang lưu mẫu</span>
              </span>
            )}
          </div>

          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng chi tiết"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className={styles.body}>
          <InlineError messages={photoError} />
          {photoUrl && (
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                Ảnh mẫu lưu (Bấm để xem phóng to)
              </div>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setIsZoomOpen(true)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setIsZoomOpen(true) }}
                style={{
                  position: "relative",
                  display: "inline-block",
                  borderRadius: "8px",
                  overflow: "hidden",
                  cursor: "pointer",
                  border: "1px solid var(--border-default)",
                  maxHeight: "220px",
                }}
              >
                <img
                  src={photoUrl}
                  alt="Ảnh mẫu lưu"
                  style={{ maxWidth: "100%", maxHeight: "220px", objectFit: "contain", display: "block" }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "8px",
                    right: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    backgroundColor: "rgba(0, 0, 0, 0.65)",
                    color: "#fff",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  <ZoomIn size={14} />
                  <span>Phóng to</span>
                </div>
              </div>
            </div>
          )}
          {/* Dải tiến trình lưu 24h tinh gọn */}
          <div
            className={`${styles.trackingStrip} ${
              info24h.isDisposed
                ? styles.stripDisposed
                : info24h.isReadyToDispose
                ? styles.stripReady
                : styles.stripStored
            }`}
          >
            {info24h.isDisposed ? (
              <div className={styles.stripContent}>
                <div className={styles.stripTextRow}>
                  <span className={styles.stripTitle}>Đã tiêu hủy mẫu lưu</span>
                  <span className={styles.stripMuted}>
                    Lúc {disposedDisplay?.time} · {disposedDisplay?.date}
                  </span>
                </div>
                {sample.disposalNote && (
                  <div className={styles.disposalNoteText}>
                    <strong>Ghi chú:</strong> {sample.disposalNote}
                  </div>
                )}
              </div>
            ) : info24h.isReadyToDispose ? (
              <div className={styles.stripContent}>
                <div className={styles.stripTextRow}>
                  <div className={styles.readyTextGroup}>
                    <span className={styles.stripTitleWarning}>Đã đạt thời gian lưu 24 giờ</span>
                    <span className={styles.stripMuted}>Mốc 24h: {expiresDisplay.time} · {expiresDisplay.date}</span>
                  </div>
                  <button
                    type="button"
                    className={styles.quickDisposeBtn}
                    onClick={() => {
                      onClose()
                      onOpenDisposeModal(sample)
                    }}
                  >
                    <Trash2 size={13} />
                    <span>Tiêu hủy</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.stripContent}>
                <div className={styles.stripTextRow}>
                  <div className={styles.countdownGroup}>
                    <span className={styles.stripLabel}>Thời gian lưu còn lại:</span>
                    <span className={styles.countdownVal}>{info24h.timeText}</span>
                  </div>
                  <span className={styles.stripMuted}>
                    Mốc đủ 24h: {expiresDisplay.time} · {expiresDisplay.date}
                  </span>
                </div>
                <div className={styles.progressBarBg}>
                  <div
                    className={styles.progressBarFill}
                    style={{ width: `${info24h.percent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Lưới thông tin cốt lõi (2 cột, phẳng, gọn gàng) */}
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Tên món ăn</span>
              <span className={styles.infoValueBold}>{sample.dishName}</span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Mã lô chế biến</span>
              <div className={styles.batchLinkWrap}>
                <span className={styles.batchCode}>{sample.batchCode || sample.cookingBatchId}</span>
                <button
                  type="button"
                  className={styles.viewBatchBtn}
                  onClick={() => onNavigateBatch(sample.cookingBatchId)}
                  title="Xem chi tiết lô nấu"
                >
                  <span>Xem mẻ</span>
                  <ArrowUpRight size={12} />
                </button>
              </div>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Bữa ăn</span>
              <span className={styles.infoValue}>
                {sample.mealLabel || (sample.mealType === "AFTERNOON" ? "Bữa xế" : "Bữa trưa")}
              </span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Thời điểm lấy mẫu</span>
              <span className={styles.infoValue}>{sampledDisplay.time} · {sampledDisplay.date}</span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Lượng mẫu lưu</span>
              <span className={styles.infoValueBold}>
                {formatSmallQuantity(sample.quantity, sample.unit || "g")}
              </span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Vị trí tủ lưu</span>
              <span className={styles.infoValue}>{sample.storageLocation || "Tủ lưu mẫu"}</span>
            </div>

            <div className={`${styles.infoItem} ${styles.fullWidthItem}`}>
              <span className={styles.infoLabel}>Người ghi nhận</span>
              <span className={styles.infoValue}>
                {sample.recordedByName || "Nguyễn Văn Vận (Bếp trưởng)"}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={styles.footer}>
          <button type="button" className={styles.closeBtnSecondary} onClick={onClose}>
            Đóng
          </button>

          {sample.status === "STORED" && (
            <div className={styles.footerRightActions}>
              <button
                type="button"
                className={styles.editBtn}
                onClick={() => {
                  onClose()
                  onOpenUpdateModal(sample)
                }}
              >
                <Edit3 size={14} />
                <span>Cập nhật</span>
              </button>

              <button
                type="button"
                className={`${styles.disposeBtn} ${
                  info24h.isReadyToDispose ? styles.disposeBtnAlert : ""
                }`}
                onClick={() => {
                  onClose()
                  onOpenDisposeModal(sample)
                }}
              >
                <Trash2 size={14} />
                <span>Ghi nhận tiêu hủy</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {isZoomOpen && photoUrl && (
        <div
          onClick={() => setIsZoomOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(4px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "90vw",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              backgroundColor: "var(--bg-surface, #fff)",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderBottom: "1px solid var(--border-default, #e2e8f0)",
              }}
            >
              <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700 }}>
                Ảnh chụp mẫu lưu – {sample.dishName}
              </h4>
              <button
                type="button"
                onClick={() => setIsZoomOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-secondary, #64748b)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4px",
                }}
                aria-label="Đóng ảnh"
              >
                <X size={20} />
              </button>
            </div>
            <div
              style={{
                padding: "16px",
                backgroundColor: "#0f172a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={photoUrl}
                alt={`Ảnh mẫu lưu ${sample.dishName}`}
                style={{
                  maxWidth: "100%",
                  maxHeight: "70vh",
                  objectFit: "contain",
                  borderRadius: "4px",
                }}
              />
            </div>
            <div
              style={{
                padding: "10px 16px",
                fontSize: "12px",
                color: "var(--text-secondary, #64748b)",
                backgroundColor: "var(--bg-surface, #fff)",
                borderTop: "1px solid var(--border-default, #e2e8f0)",
              }}
            >
              <span>Thời điểm lưu: {sampledDisplay.time} · {sampledDisplay.date}</span>
              {sample.storageLocation && <span> · Vị trí: {sample.storageLocation}</span>}
              {sample.quantity && <span> · Lượng mẫu: {sample.quantity} {sample.unit || "g"}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

SampleDetailModal.propTypes = {
  open: PropTypes.bool.isRequired,
  sample: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onOpenUpdateModal: PropTypes.func.isRequired,
  onOpenDisposeModal: PropTypes.func.isRequired,
  onNavigateBatch: PropTypes.func.isRequired,
}
