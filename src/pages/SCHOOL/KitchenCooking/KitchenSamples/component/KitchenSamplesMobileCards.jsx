import React from "react"
import PropTypes from "prop-types"
import { Eye, X, Edit3, ArrowUpRight, Clock, Check, AlertCircle } from "lucide-react"
import { get24hRetainedStatus, formatSampleDateTime } from "../retainedStatusHelper"
import styles from "./KitchenSamplesMobileCards.module.scss"

export default function KitchenSamplesMobileCards({
  samples = [],
  onViewDetail,
  onOpenDisposeModal,
  onOpenUpdateModal,
  onNavigateBatch,
}) {
  return (
    <div className={styles.mobileList}>
      {samples.map((row) => {
        const info24h = get24hRetainedStatus(row.sampledAt, row.status)
        const timeDisplay = formatSampleDateTime(row.sampledAt)

        return (
          <div
            key={row.id}
            className={`${styles.card} ${info24h.isReadyToDispose ? styles.cardWarning : ""
              }`}
            onClick={() => onViewDetail(row)}
          >
            {/* Hàng 1: Bữa ăn + Badge trạng thái */}
            <div className={styles.topRow}>
              <div>
                <span
                  className={`${styles.mealBadge} ${row.mealType === "AFTERNOON"
                      ? styles.mealAfternoon
                      : styles.mealLunch
                    }`}
                >
                  {row.mealLabel || (row.mealType === "AFTERNOON" ? "Bữa xế" : "Bữa trưa")}
                </span>
              </div>

              <div>
                {info24h.isDisposed ? (
                  <span className={styles.badgeDisposed}>
                    <Check size={11} />
                    <span>Đã hủy</span>
                  </span>
                ) : info24h.isReadyToDispose ? (
                  <span className={styles.badgeReady}>
                    <AlertCircle size={11} />
                    <span>Đủ 24h</span>
                  </span>
                ) : (
                  <span className={styles.badgeStored}>
                    <Clock size={11} />
                    <span>Đang lưu</span>
                  </span>
                )}
              </div>
            </div>

            {/* Hàng 2: Tên món ăn & Mã lô nấu phía dưới */}
            <div className={styles.dishSection}>
              <h3 className={styles.dishName}>{row.dishName}</h3>
              <button
                type="button"
                className={styles.batchLinkBtn}
                onClick={(e) => {
                  e.stopPropagation()
                  onNavigateBatch(row.cookingBatchId)
                }}
                title="Xem chi tiết mẻ nấu"
              >
                <span>{row.batchCode || row.cookingBatchId}</span>
                <ArrowUpRight size={12} />
              </button>
            </div>

            {/* Hàng 3: Cụm thông tin Khối lượng + Vị trí + Thời điểm lấy */}
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Khối lượng:</span>
                <span className={styles.infoValueBold}>
                  {row.quantity} {row.unit}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Vị trí tủ:</span>
                <span className={styles.infoValue}>{row.storageLocation}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Lấy lúc:</span>
                <span className={styles.infoValue}>{timeDisplay.full}</span>
              </div>
            </div>

            {/* Hàng 4: Đồng hồ đếm ngược 24h & Tiến trình */}
            <div className={styles.countdownBox}>
              <div className={styles.countdownHeader}>
                <div className={styles.countdownTitleRow}>
                  <span className={styles.countdownTitle}>Thời gian lưu 24h:</span>
                  <span
                    className={`${styles.countdownText} ${info24h.isReadyToDispose
                        ? styles.countdownReady
                        : info24h.isDisposed
                          ? styles.countdownDisposed
                          : styles.countdownActive
                      }`}
                  >
                    {info24h.timeText}
                  </span>
                </div>
                {!info24h.isDisposed && (
                  <span className={styles.countdownPercent}>{info24h.percent}%</span>
                )}
              </div>

              <div className={styles.progressBarBg}>
                <div
                  className={`${styles.progressBarFill} ${info24h.isReadyToDispose
                      ? styles.fillWarning
                      : info24h.isDisposed
                        ? styles.fillMuted
                        : styles.fillPrimary
                    }`}
                  style={{ width: `${info24h.percent}%` }}
                />
              </div>
            </div>

            {/* Hàng 5: Nút thao tác cảm ứng lớn (Touch target >= 44px) */}
            <div
              className={styles.actionsRow}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className={styles.actionDetailBtn}
                onClick={() => onViewDetail(row)}
                title="Xem chi tiết mẫu lưu"
              >
                <Eye size={16} />
                <span>Xem chi tiết</span>
              </button>

              {row.status === "STORED" && (
                <button
                  type="button"
                  className={styles.actionUpdateBtn}
                  onClick={() => onOpenUpdateModal(row)}
                  title="Cập nhật mẫu lưu"
                >
                  <Edit3 size={15} />
                  <span>Sửa</span>
                </button>
              )}

              {row.status === "STORED" && (
                <button
                  type="button"
                  className={`${styles.actionDisposeBtn} ${info24h.isReadyToDispose ? styles.actionDisposeBtnAlert : ""
                    }`}
                  onClick={() => onOpenDisposeModal(row)}
                  title="Tiêu hủy mẫu lưu"
                >
                  <X size={15} />
                  <span>Tiêu hủy</span>
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

KitchenSamplesMobileCards.propTypes = {
  samples: PropTypes.arrayOf(PropTypes.object).isRequired,
  onViewDetail: PropTypes.func.isRequired,
  onOpenDisposeModal: PropTypes.func.isRequired,
  onOpenUpdateModal: PropTypes.func.isRequired,
  onNavigateBatch: PropTypes.func.isRequired,
}
