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
  Trash2,
  Check,
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
      {/* 1. Thanh điều hướng quay lại & Thao tác chính */}
      <div className={styles.topRow}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate(ROUTER.SCHOOL_KITCHEN_BATCHES)}
          title="Quay lại danh sách lô chế biến"
        >
          <ArrowLeft size={16} />
          <span>Danh sách lô</span>
        </button>

        {/* Cụm nút thao tác nghiệp vụ chính trên Desktop */}
        <div className={styles.actionsDesktop}>
          {isDraft && (
            <>
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={onOpenDeleteModal}
                disabled={actionLoading}
                title="Xóa lô chế biến"
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

          {isCompleted && !isAllSampled && (
            <button
              type="button"
              className={styles.sampleActionBtn}
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
        </div>
      </div>

      {/* 2. Tiêu đề chính & Mã lô & Trạng thái */}
      <div className={styles.titleLine}>
        <div className={styles.headingGroup}>
          <h1 className={styles.pageTitle}>Chi tiết lô chế biến</h1>
          <span className={styles.batchCode}>#{batchData?.code || "—"}</span>
        </div>
        {getStatusBadge()}
      </div>

      {/* 3. Hàng Metadata tinh gọn ngay dưới Header: Ngày nấu • Bữa ăn • Tổng số suất • Trạng thái lưu mẫu */}
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

        {batchData?.batchGroupCode && (
          <>
            <span className={styles.metaDivider}>•</span>
            <div className={styles.metaSubGroup}>
              <Layers size={13} className={styles.subGroupIcon} />
              <span>Lô cha: {batchData.batchGroupCode}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
