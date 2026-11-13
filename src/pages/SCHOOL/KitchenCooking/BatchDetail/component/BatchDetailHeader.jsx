import React from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  CheckCircle2,
  CookingPot,
  FlaskConical,
  Trash2,
  Check,
  Clock,
  Layers,
} from "lucide-react"
import ROUTER from "src/router/ROUTER"
import styles from "./BatchDetailHeader.module.scss"

export default function BatchDetailHeader({
  batchData,
  onOpenConfirmModal,
  onOpenDeleteModal,
  onCompleteBatch,
  actionLoading = false,
  onOpenSampleModal,
  hasSample = false,
  allSamplesDone = false,
  sampledCount = 0,
  totalDishes = 1,
}) {
  const navigate = useNavigate()

  const status = batchData?.status || "UNCONFIRMED"
  const isDraft = status === "DRAFT" || status === "UNCONFIRMED"
  const isConfirmed = status === "CONFIRMED"
  const isCompleted = status === "COMPLETED"
  const isAllSampled = allSamplesDone || (hasSample && totalDishes <= 1)

  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <span className={`${styles.statusBadge} ${styles.statusCompleted}`}>
          <span className={styles.pulseDot} />
          Đã nấu xong
        </span>
      )
    }
    if (isConfirmed) {
      return (
        <span className={`${styles.statusBadge} ${styles.statusConfirmed}`}>
          <span className={styles.pulseDot} />
          Đang chế biến
        </span>
      )
    }
    return (
      <span className={`${styles.statusBadge} ${styles.statusDraft}`}>
        <span className={styles.pulseDot} />
        Chưa xác nhận nấu
      </span>
    )
  }

  return (
    <header className={styles.headerBar}>
      <div className={styles.headerMain}>
        {/* Khối bên trái: Nút Quay lại + Tiêu đề + Trạng thái */}
        <div className={styles.titleArea}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => navigate(ROUTER.SCHOOL_KITCHEN_BATCHES)}
            title="Quay lại danh sách lô chế biến"
          >
            <ArrowLeft size={16} />
            <span>Danh sách lô</span>
          </button>

          <div className={styles.titleInfo}>
            <div className={styles.titleRow}>
              <h1 className={styles.heading}>
                Lô #{batchData?.code || "—"}
              </h1>
              {getStatusBadge()}
            </div>

            {batchData?.batchGroupCode && (
              <div className={styles.subGroupTag}>
                <Layers size={13} />
                <span>Thuộc lô cha: <strong>{batchData.batchGroupCode}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Khối bên phải: Cụm thao tác nghiệp vụ chính */}
        <div className={styles.actionsArea}>
          {isDraft && (
            <>
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={onOpenDeleteModal}
                disabled={actionLoading}
                title="Xóa lô chế biến này"
              >
                <Trash2 size={15} />
                <span>Xóa lô</span>
              </button>

              <button
                type="button"
                className={styles.primaryBtn}
                onClick={onOpenConfirmModal}
                disabled={actionLoading}
              >
                <CheckCircle2 size={16} />
                <span>Xác nhận nấu</span>
              </button>
            </>
          )}

          {isConfirmed && (
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={onCompleteBatch}
              disabled={actionLoading}
            >
              <CookingPot size={16} />
              <span>{actionLoading ? "Đang ghi nhận…" : "Ghi nhận nấu xong"}</span>
            </button>
          )}

          {isCompleted && (
            <>
              {isAllSampled ? (
                <div className={styles.sampleDoneBadge}>
                  <Check size={16} />
                  <span>
                    Đã lưu mẫu {totalDishes > 1 ? `(${totalDishes} món)` : "(24h)"}
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  className={styles.sampleBtn}
                  onClick={onOpenSampleModal}
                  disabled={actionLoading}
                >
                  <FlaskConical size={16} />
                  <span>
                    Ghi nhận mẫu lưu 24h
                    {totalDishes > 1 ? ` (${sampledCount}/${totalDishes})` : ""}
                  </span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
