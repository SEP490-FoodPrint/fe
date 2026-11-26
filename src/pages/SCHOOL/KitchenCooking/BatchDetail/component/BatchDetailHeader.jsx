import React from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Calendar,
  Utensils,
  Users,
  FlaskConical,
  CheckCircle2,
  CookingPot,
} from "lucide-react"
import ROUTER from "src/router/ROUTER"
import { BATCH_STATUSES } from "src/services/KitchenService/adapter"
import styles from "./BatchDetailHeader.module.scss"
import { isVietnamWeekend, WEEKEND_LOCK_MESSAGE } from "src/utils/weekend"

export default function BatchDetailHeader({
  batchData,
  onOpenConfirmModal,
  onCompleteBatch,
  actionLoading = false,
  onOpenSampleModal,
  hasSample = false,
  allSamplesDone = false,
  sampledCount = 0,
  totalDishes = 1,
  locked = isVietnamWeekend(),
  mealBlock = "",
}) {
  const navigate = useNavigate()

  const status = batchData?.status || "UNCONFIRMED"
  const isDraft = status === "DRAFT" || status === "UNCONFIRMED"
  const isConfirmed = status === "CONFIRMED"
  const isCompleted = status === "COMPLETED"
  // Cuối tuần hoặc ngoài khung giờ của bữa: khóa Xác nhận nấu / Ghi nhận nấu xong
  const cookLocked = locked || Boolean(mealBlock)
  const cookTitle = locked ? WEEKEND_LOCK_MESSAGE : mealBlock || undefined
  const isAllSampled = allSamplesDone || (hasSample && totalDishes <= 1)
  // UC 22-1: mẻ Đợt 1 đã cắt mẫu trong mẻ, phần bù về ở Đợt 2. Ẩn khi Đợt 2 không cần
  // hoặc khi mẻ đã "Chính thức" (Đợt 2 đã nhận xong, phần bù đã vào mẻ).
  const cutAwaitingRound2 =
    batchData?.sampleStrategy === "CUT" &&
    batchData?.supplyBatchNo === 1 &&
    batchData?.round2Status !== "NOT_NEEDED" &&
    ["ROUND1_APPROVED", "PENDING_APPROVAL"].includes(batchData?.rawStatus || status)

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
          {batchData.statusLabel === BATCH_STATUSES.CONFIRMED
            ? "Đang chế biến"
            : batchData.statusLabel || "Đang chế biến"}
        </span>
      )
    }
    return (
      <span className={`${styles.statusBadge} ${styles.statusDraft}`}>
        <span className={styles.pulseDot} />
        {isDraft ? BATCH_STATUSES.UNCONFIRMED : batchData.statusLabel}
      </span>
    )
  }

  const sampleStatusText = isCompleted
    ? isAllSampled
      ? totalDishes > 1
        ? `Đã lưu mẫu ${totalDishes}/${totalDishes} món`
        : "Đã lưu mẫu (24h)"
      : sampledCount > 0
      ? `Đã lưu mẫu ${sampledCount}/${totalDishes} món`
      : "Chưa lưu mẫu"
    : null

  return (
    <div className={styles.headerContainer}>
      {/* 1. Tiêu đề chính + Mã lô + Trạng thái bên trái; Thao tác & Nút Danh sách lô bên phải cùng hàng */}
      <div className={styles.titleLine}>
        <div className={styles.leftGroup}>
          <div className={styles.headingGroup}>
            <h1 className={styles.pageTitle}>Chi tiết lô chế biến</h1>
            {batchData?.batchNumber ? (
              <span className={styles.batchNumberBadge}>
                Lô {batchData.batchNumber}
              </span>
            ) : null}
            <span className={styles.batchCode}>#{batchData?.code || "—"}</span>
          </div>
          {getStatusBadge()}
          {cutAwaitingRound2 && (
            <span className={`${styles.statusBadge} ${styles.statusDraft}`}>
              Đã cắt mẫu, sẽ bù ở Đợt 2
            </span>
          )}
        </div>

        <div className={styles.rightGroup}>
          {/* Cụm nút thao tác nghiệp vụ chính trên Desktop */}
          <div className={styles.actionsDesktop}>
            {isDraft && (
              <>
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={onOpenConfirmModal}
                  disabled={actionLoading || cookLocked}
                  title={cookTitle}
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
                disabled={actionLoading || cookLocked}
                title={cookTitle}
              >
                <CookingPot size={16} />
                <span>{actionLoading ? "Đang ghi nhận…" : "Ghi nhận nấu xong"}</span>
              </button>
            )}

            {isCompleted && !isAllSampled && (
              <button
                type="button"
                className={styles.sampleActionBtn}
                onClick={onOpenSampleModal}
                disabled={actionLoading || locked}
                title={locked ? WEEKEND_LOCK_MESSAGE : undefined}
              >
                <FlaskConical size={16} />
                <span>
                  Ghi nhận mẫu lưu 24h
                  {totalDishes > 1 ? ` (${sampledCount}/${totalDishes})` : ""}
                </span>
              </button>
            )}
          </div>

          {/* Nút danh sách lô để bên phải cùng hàng chữ Chi tiết lô chế biến */}
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => navigate(ROUTER.SCHOOL_KITCHEN_BATCHES)}
            title="Quay lại danh sách lô chế biến"
          >
            <ArrowLeft size={16} />
            <span>Danh sách lô</span>
          </button>
        </div>
      </div>

      {/* 2. Hàng Metadata tinh gọn ngay dưới Header: Ngày nấu • Bữa ăn • Tổng số suất • Trạng thái lưu mẫu */}
      <div className={styles.metaRow}>
        <div className={styles.metaItem}>
          <Calendar size={14} className={styles.metaIcon} />
          <span className={styles.metaLabel}>Ngày nấu:</span>
          <strong className={styles.metaValue}>{batchData?.menuDate || "Hôm nay"}</strong>
        </div>

        <span className={styles.metaDivider}>•</span>

        <div className={styles.metaItem}>
          <Utensils size={14} className={styles.metaIcon} />
          <span className={styles.metaLabel}>Bữa ăn:</span>
          <strong className={styles.metaValue}>
            {batchData?.mealType || "Bữa trưa"}
            {batchData?.servingTime ? ` (${batchData.servingTime})` : ""}
          </strong>
        </div>

        <span className={styles.metaDivider}>•</span>

        <div className={styles.metaItem}>
          <Users size={14} className={styles.metaIcon} />
          <span className={styles.metaLabel}>Tổng số suất chế biến:</span>
          <strong className={styles.metaValueHighlight}>
            {(batchData?.portions || 0).toLocaleString("vi-VN")} suất
          </strong>
        </div>

        {sampleStatusText && (
          <>
            <span className={styles.metaDivider}>•</span>
            <div className={styles.metaItem}>
              <FlaskConical size={14} className={styles.metaIcon} />
              <span className={styles.metaLabel}>Lưu mẫu:</span>
              <span
                className={
                  isAllSampled ? styles.sampleDoneText : styles.samplePendingText
                }
              >
                {sampleStatusText}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
