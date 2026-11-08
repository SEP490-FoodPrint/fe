import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Zap,
  CheckCircle2,
  Trash2,
  CookingPot,
  MoreVertical,
  FlaskConical,
  Check,
} from "lucide-react"
import ROUTER from "src/router/ROUTER"
import styles from "./BatchActionsCard.module.scss"

export default function BatchActionsCard({
  batchId,
  status = "UNCONFIRMED",
  batchCode = "",
  dishName = "",
  hasSample = false,
  onOpenConfirmModal,
  onOpenDeleteModal,
  onOpenCompleteModal,
  onOpenSampleModal,
}) {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isDraft = status === "DRAFT" || status === "UNCONFIRMED"
  const isConfirmed = status === "CONFIRMED"
  const isCompleted = status === "COMPLETED"

  return (
    <>
      {/* 1. Desktop Actions Card (Cột phải) */}
      <section className={styles.actionsCard}>
        <div className={styles.cardHeader}>
          <Zap size={18} className={styles.headerIcon} />
          <h2 className={styles.cardTitle}>Thao tác nghiệp vụ</h2>
        </div>

        <div className={styles.btnStack}>
          {/* Nút 1: Xác nhận phương án (chỉ khi Draft) */}
          {isDraft && (
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={onOpenConfirmModal}
            >
              <CheckCircle2 size={18} />
              <span>Xác nhận phương án</span>
            </button>
          )}

          {/* Nút 2: Ghi nhận hoàn thành chế biến (khi đã xác nhận) */}
          {isConfirmed && (
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={onOpenCompleteModal}
            >
              <CookingPot size={18} />
              <span>Ghi nhận hoàn thành chế biến</span>
            </button>
          )}

          {/* Nút 3: Mẫu lưu thực phẩm (khi đã hoàn thành chế biến) */}
          {isCompleted && (
            <div className={styles.sampleActionBlock}>
              {hasSample ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 14px",
                    borderRadius: 8,
                    backgroundColor: "#ecfdf5",
                    border: "1px solid #a7f3d0",
                    color: "#065f46",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                  }}
                >
                  <Check size={18} color="#059669" />
                  <span>Đã lưu mẫu thực phẩm (24h)</span>
                </div>
              ) : (
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={onOpenSampleModal}
                >
                  <FlaskConical size={18} />
                  <span>Ghi nhận mẫu lưu thực phẩm</span>
                </button>
              )}
            </div>
          )}

          {/* Nút xóa (chỉ khi Draft) */}
          {isDraft && (
            <button
              type="button"
              className={styles.btnDanger}
              onClick={onOpenDeleteModal}
              title="Xóa lô chế biến"
            >
              <Trash2 size={16} />
              <span>Xóa lô chế biến</span>
            </button>
          )}
        </div>
      </section>

      {/* 2. Mobile Sticky Bottom Bar (Hiện trên Mobile < 768px) */}
      <div className={styles.mobileStickyBar}>
        <div className={styles.mobileBarInner}>
          {isDraft && (
            <>
              <button
                type="button"
                className={styles.mobilePrimaryBtn}
                onClick={onOpenConfirmModal}
              >
                <CheckCircle2 size={19} />
                <span>Xác nhận phương án</span>
              </button>

              <button
                type="button"
                className={styles.mobileDangerBtn || styles.mobileMoreBtn}
                onClick={onOpenDeleteModal}
                aria-label="Xóa lô chế biến"
                title="Xóa lô chế biến"
              >
                <Trash2 size={18} color="#dc2626" />
              </button>
            </>
          )}

          {isConfirmed && (
            <button
              type="button"
              className={styles.mobilePrimaryBtn}
              onClick={onOpenCompleteModal}
            >
              <CookingPot size={19} />
              <span>Ghi nhận hoàn thành</span>
            </button>
          )}

          {isCompleted && (
            hasSample ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "10px 14px",
                  borderRadius: 8,
                  backgroundColor: "#ecfdf5",
                  color: "#065f46",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  flex: 1,
                  height: 48,
                }}
              >
                <Check size={18} color="#059669" />
                <span>Đã lưu mẫu thực phẩm</span>
              </div>
            ) : (
              <button
                type="button"
                className={styles.mobilePrimaryBtn}
                onClick={onOpenSampleModal}
              >
                <FlaskConical size={19} />
                <span>Ghi nhận mẫu lưu</span>
              </button>
            )
          )}
        </div>
      </div>
    </>
  )
}
