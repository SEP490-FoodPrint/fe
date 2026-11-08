import React from "react"
import PropTypes from "prop-types"
import {
  X,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Trash2,
  Thermometer,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  User,
} from "lucide-react"
import { get24hRetainedStatus, formatSampleDateTime } from "../mockSamplesData"
import styles from "./SampleDetailModal.module.scss"

export default function SampleDetailModal({
  open = false,
  sample = null,
  onClose,
  onOpenUpdateModal,
  onOpenDisposeModal,
  onNavigateBatch,
}) {
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
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitleCol}>
            <div className={styles.breadcrumb}>
              <span>Sổ lưu mẫu 24 giờ</span>
              <span>/</span>
              <span className={styles.breadcrumbActive}>Chi tiết mẫu lưu</span>
            </div>
            <div className={styles.titleRow}>
              <h2 className={styles.title}>
                Chi tiết mẫu lưu SMP-{sample.id?.slice(0, 8).toUpperCase() || sample.id}
              </h2>

              {info24h.isDisposed ? (
                <span className={styles.badgeDisposed}>
                  <CheckCircle2 size={12} />
                  <span>Đã tiêu hủy (DISPOSED)</span>
                </span>
              ) : info24h.isReadyToDispose ? (
                <span className={styles.badgeReady}>
                  <AlertTriangle size={12} />
                  <span>Đã đủ 24 giờ (Chờ hủy)</span>
                </span>
              ) : (
                <span className={styles.badgeStored}>
                  <Clock size={12} />
                  <span>Đang lưu mẫu (STORED)</span>
                </span>
              )}
            </div>
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
          {/* KHU VỰC THEO DÕI 24 GIỜ (NỔI BẬT NHẤT) */}
          <div
            className={`${styles.trackingBox} ${
              info24h.isDisposed
                ? styles.trackingDisposed
                : info24h.isReadyToDispose
                ? styles.trackingReady
                : styles.trackingStored
            }`}
          >
            {info24h.isDisposed ? (
              <div className={styles.trackingContent}>
                <div className={styles.trackingHeaderRow}>
                  <div className={styles.trackingTitleWrap}>
                    <CheckCircle2 size={22} className={styles.iconDisposed} />
                    <div>
                      <h3 className={styles.trackingHeading}>ĐÃ KẾT THÚC CHU KỲ LƯU 24 GIỜ</h3>
                      <p className={styles.trackingSub}>
                        Mẫu đã được tiêu hủy và hoàn tất biên bản lưu trữ an toàn thực phẩm.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={styles.trackingDetailsGrid}>
                  <div className={styles.trackingDetailItem}>
                    <span className={styles.trackingDetailLabel}>Thời điểm lấy mẫu:</span>
                    <span className={styles.trackingDetailVal}>{sampledDisplay.full}</span>
                  </div>
                  <div className={styles.trackingDetailItem}>
                    <span className={styles.trackingDetailLabel}>Thời điểm tiêu hủy:</span>
                    <span className={styles.trackingDetailValHighlight}>
                      {disposedDisplay?.full || "—"}
                    </span>
                  </div>
                  {sample.disposalNote && (
                    <div className={`${styles.trackingDetailItem} ${styles.fullWidthItem}`}>
                      <span className={styles.trackingDetailLabel}>Ghi chú tiêu hủy:</span>
                      <span className={styles.trackingDetailNote}>{sample.disposalNote}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : info24h.isReadyToDispose ? (
              <div className={styles.trackingContent}>
                <div className={styles.trackingHeaderRow}>
                  <div className={styles.trackingTitleWrap}>
                    <AlertTriangle size={22} className={styles.iconReady} />
                    <div>
                      <h3 className={styles.trackingHeadingWarning}>ĐÃ ĐỦ 24 GIỜ BẢO QUẢN MẪU</h3>
                      <p className={styles.trackingSub}>
                        Mẫu đã đạt thời gian lưu trữ quy định của Bộ Y Tế. Vui lòng tiến hành lập biên bản tiêu hủy.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={styles.quickDisposeBtn}
                    onClick={() => onOpenDisposeModal(sample)}
                  >
                    <Trash2 size={15} />
                    <span>Ghi nhận tiêu hủy ngay</span>
                  </button>
                </div>

                <div className={styles.trackingDetailsGrid}>
                  <div className={styles.trackingDetailItem}>
                    <span className={styles.trackingDetailLabel}>Thời điểm lấy mẫu:</span>
                    <span className={styles.trackingDetailVal}>{sampledDisplay.full}</span>
                  </div>
                  <div className={styles.trackingDetailItem}>
                    <span className={styles.trackingDetailLabel}>Mốc hoàn thành 24h:</span>
                    <span className={styles.trackingDetailValWarning}>{expiresDisplay.full}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.trackingContent}>
                <div className={styles.trackingHeaderRow}>
                  <div className={styles.trackingTitleWrap}>
                    <Clock size={22} className={styles.iconStored} />
                    <div>
                      <h3 className={styles.trackingHeadingPrimary}>ĐANG LƯU MẪU THEO QUY CHUẨN 24H</h3>
                      <p className={styles.trackingSub}>
                        Bảo quản tủ chuyên dụng 2°C - 8°C. Không mở niêm phong khi không có sự cố.
                      </p>
                    </div>
                  </div>
                  <div className={styles.countdownBigBadge}>
                    <span className={styles.countdownBigLabel}>Thời gian còn lại:</span>
                    <span className={styles.countdownBigValue}>{info24h.timeText}</span>
                  </div>
                </div>

                {/* Thanh tiến trình % thời gian trôi qua */}
                <div className={styles.progressContainer}>
                  <div className={styles.progressLabelRow}>
                    <span>Tiến trình lưu: {info24h.percent}% hoàn tất</span>
                    <span>Mốc đủ 24h: {expiresDisplay.full}</span>
                  </div>
                  <div className={styles.progressBarBg}>
                    <div
                      className={styles.progressBarFill}
                      style={{ width: `${info24h.percent}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* KHỐI 1: THÔNG TIN LÔ CHẾ BIẾN (COOKING BATCH) */}
          <div className={styles.cardSection}>
            <div className={styles.cardSectionHeader}>
              <div className={styles.sectionTitleRow}>
                <Layers size={16} className={styles.sectionIcon} />
                <h4 className={styles.sectionTitle}>Thông tin Lô chế biến liên quan</h4>
              </div>
              <button
                type="button"
                className={styles.viewBatchLink}
                onClick={() => onNavigateBatch(sample.cookingBatchId)}
                title="Mở toàn bộ hồ sơ mẻ nấu"
              >
                <span>Xem mẻ nấu</span>
                <ArrowUpRight size={14} />
              </button>
            </div>

            <div className={styles.grid2}>
              <div className={styles.infoRow}>
                <span className={styles.infoKey}>Mã lô chế biến:</span>
                <span className={styles.infoValMono}>{sample.batchCode || sample.cookingBatchId}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoKey}>Món ăn:</span>
                <span className={styles.infoValBold}>{sample.dishName}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoKey}>Bữa ăn & Ca:</span>
                <span className={styles.infoVal}>
                  {sample.mealLabel || (sample.mealType === "AFTERNOON" ? "Bữa xế" : "Bữa trưa")}
                  {sample.portions ? ` • ${sample.portions} suất` : ""}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoKey}>Phân loại món:</span>
                <span className={styles.infoVal}>{sample.dishCategory || "Món ăn bán trú chuẩn"}</span>
              </div>
            </div>
          </div>

          {/* KHỐI 2: THÔNG TIN MẪU LƯU (RETAINED SAMPLE) */}
          <div className={styles.cardSection}>
            <div className={styles.cardSectionHeader}>
              <div className={styles.sectionTitleRow}>
                <ShieldCheck size={16} className={styles.sectionIcon} />
                <h4 className={styles.sectionTitle}>Thông số mẫu thức ăn lưu trữ</h4>
              </div>
            </div>

            <div className={styles.grid2}>
              <div className={styles.infoRow}>
                <span className={styles.infoKey}>Thời điểm lấy mẫu:</span>
                <span className={styles.infoVal}>{sampledDisplay.full}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoKey}>Khối lượng mẫu lưu:</span>
                <span className={styles.infoValBold}>
                  {sample.quantity} {sample.unit}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoKey}>Vị trí bảo quản:</span>
                <span className={styles.infoVal}>{sample.storageLocation}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoKey}>Quy cách bao bì:</span>
                <span className={styles.infoVal}>{sample.packaging || "Lọ thủy tinh tiệt trùng có tem niêm phong"}</span>
              </div>
              <div className={`${styles.infoRow} ${styles.fullWidthGrid}`}>
                <span className={styles.infoKey}>Người thực hiện ghi nhận:</span>
                <span className={styles.infoVal}>
                  {sample.recordedByName || "Nguyễn Văn Vận (Bếp trưởng)"}
                </span>
              </div>
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
                <Edit3 size={15} />
                <span>Cập nhật thông tin</span>
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
                <Trash2 size={15} />
                <span>Ghi nhận tiêu hủy</span>
              </button>
            </div>
          )}
        </div>
      </div>
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
