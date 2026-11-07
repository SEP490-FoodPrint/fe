import React, { useState } from "react"
import PropTypes from "prop-types"
import {
  ArrowLeft,
  QrCode,
  Send,
  Eye,
  Store,
  Clock,
  FileText,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react"
import DeliveryStatusBadge from "./DeliveryStatusBadge"
import LotQRTraceModal from "./LotQRTraceModal"
import {
  LOT_STATUS_CONFIG,
  FEEDBACK_STATUS_CONFIG,
} from "../mockDeliveryData"
import styles from "./DeliveryDetailView.module.scss"

export default function DeliveryDetailView({
  delivery,
  feedbacks = [],
  onBack,
  onOpenSubmitFeedback,
  onOpenApprovalModal,
  onSelectFeedback,
}) {
  // State xem tem nhãn QR của lô
  const [activeQRLot, setActiveQRLot] = useState(null)
  const [activeQRIngredient, setActiveQRIngredient] = useState("")

  const handleOpenQRModal = (lot, ingredientName) => {
    setActiveQRLot(lot)
    setActiveQRIngredient(ingredientName)
  }

  // Lọc danh sách phản hồi liên quan đến delivery này
  const deliveryFeedbacks = feedbacks.filter((f) => f.deliveryId === delivery.id)

  // Kiểm tra đánh giá của Cán bộ Y tế
  const healthApproval = delivery.deliveryApprovals?.find(
    (a) => a.roleCode === "SCHOOL_HEALTH_OFFICER"
  )

  // Format date helper (dd/mm/yyyy)
  const formatDate = (isoString) => {
    if (!isoString) return "--"
    try {
      const d = new Date(isoString)
      const day = String(d.getDate()).padStart(2, "0")
      const month = String(d.getMonth() + 1).padStart(2, "0")
      const year = d.getFullYear()
      return `${day}/${month}/${year}`
    } catch {
      return "--"
    }
  }

  // Format datetime helper (hh:mm • dd/mm/yyyy)
  const formatDateTime = (isoString) => {
    if (!isoString) return "--"
    try {
      const d = new Date(isoString)
      const day = String(d.getDate()).padStart(2, "0")
      const month = String(d.getMonth() + 1).padStart(2, "0")
      const year = d.getFullYear()
      const hours = String(d.getHours()).padStart(2, "0")
      const minutes = String(d.getMinutes()).padStart(2, "0")
      return `${hours}:${minutes} • ${day}/${month}/${year}`
    } catch {
      return "--"
    }
  }

  // Tập hợp danh sách các dòng hiển thị phẳng (nguyên liệu & lô)
  const flatLotRows = []
  delivery.deliveryItems?.forEach((item) => {
    if (!item.ingredientLots || item.ingredientLots.length === 0) {
      flatLotRows.push({
        id: `item-${item.id}`,
        isItemOnly: true,
        ingredientName: item.ingredientName,
        category: item.category,
        lotCode: "--",
        sourceFacility: "--",
        manufactureDate: null,
        expiryDate: null,
        quantityText: `${item.actualQuantity} ${item.unit}`,
        status: null,
        lot: null,
      })
    } else {
      item.ingredientLots.forEach((lot, idx) => {
        flatLotRows.push({
          id: lot.id,
          isItemOnly: false,
          ingredientName: item.ingredientName,
          category: item.category,
          isFirstLotOfItem: idx === 0,
          lotCount: item.ingredientLots.length,
          lotCode: lot.lotCode,
          qrToken: lot.qrToken,
          sourceFacility: lot.sourceFacility,
          manufactureDate: lot.manufactureDate,
          expiryDate: lot.expiryDate,
          quantityText: `${lot.receivedQuantity} ${lot.unit}`,
          status: lot.status,
          lot: lot,
        })
      })
    }
  })

  // Thời gian giao nhận chuẩn (ưu tiên arrivedAt hoặc receivedAt, fallback expectedArrivalAt)
  const deliveryTime = delivery.arrivedAt || delivery.receivedAt || delivery.expectedArrivalAt

  // Kiểm tra nếu đợt giao bị từ chối tiếp nhận
  const rejectApproval = delivery.deliveryApprovals?.find(
    (a) => a.decision === "REJECT"
  )
  const isRejected = delivery.status === "REJECTED" || Boolean(rejectApproval)

  return (
    <div className={styles.detailWrapper}>
      {/* 1. Header Bar: Tiêu đề + Nút thao tác nằm ngang hàng 2 bên */}
      <div className={styles.headerBar}>
        <div className={styles.headerLeft}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={onBack}
            title="Quay lại danh sách chuyến giao"
            aria-label="Quay lại danh sách chuyến giao"
          >
            <ArrowLeft size={18} />
          </button>
          <div className={styles.titleGroup}>
            <h1 className={styles.pageTitle}>Chi tiết giao hàng</h1>
            <span className={styles.deliveryCode}>{delivery.deliveryNo}</span>
            <DeliveryStatusBadge status={delivery.status} />
          </div>
        </div>

        {/* Action Buttons: Đánh giá & Gửi phản hồi */}
        <div className={styles.headerActions}>
          {healthApproval ? (
            <button
              type="button"
              className={styles.approvalEditBtn}
              onClick={() => onOpenApprovalModal(delivery, healthApproval)}
              title="Cập nhật lại kết quả đánh giá của Cán bộ Y tế"
            >
              <ShieldCheck size={15} />
              <span>Sửa đánh giá Y tế</span>
            </button>
          ) : (
            <button
              type="button"
              className={styles.approvalPrimaryBtn}
              onClick={() => onOpenApprovalModal(delivery, null)}
              title="Đánh giá cảm quan và ra quyết định duyệt hoặc từ chối"
            >
              <ShieldCheck size={16} />
              <span>Đánh giá kiểm thực</span>
            </button>
          )}

          <button
            type="button"
            className={styles.feedbackActionBtn}
            onClick={() => onOpenSubmitFeedback(delivery)}
            title="Gửi phản hồi chất lượng, nhãn mác tới nhà cung cấp"
          >
            <Send size={15} />
            <span>Gửi phản hồi chất lượng</span>
          </button>
        </div>
      </div>

      {/* 2. Thanh tóm tắt thông tin chuyến giao */}
      <div className={styles.summaryBar}>
        <div className={styles.summaryCol}>
          <span className={styles.summaryLabel}>Nhà cung cấp</span>
          <div className={styles.summaryValRow}>
            <Store size={15} className={styles.summaryIcon} />
            <span className={styles.summaryValue}>{delivery.supplierName}</span>
          </div>
        </div>

        <div className={styles.summaryDivider} />

        <div className={styles.summaryCol}>
          <span className={styles.summaryLabel}>Thời gian giao</span>
          <div className={styles.summaryValRow}>
            <Clock size={15} className={styles.summaryIcon} />
            <span className={styles.summaryValue}>{formatDateTime(deliveryTime)}</span>
          </div>
        </div>

        {delivery.note && (
          <>
            <div className={styles.summaryDivider} />
            <div className={`${styles.summaryCol} ${styles.noteCol}`}>
              <span className={styles.summaryLabel}>Ghi chú giao hàng</span>
              <div className={styles.summaryValRow}>
                <FileText size={15} className={styles.summaryIcon} />
                <span className={styles.summaryNote}>{delivery.note}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Thông báo nếu đợt giao bị từ chối tiếp nhận */}
      {isRejected && (
        <div className={styles.rejectedBanner}>
          <AlertTriangle size={16} className={styles.rejectedBannerIcon} />
          <div className={styles.rejectedBannerText}>
            <span>
              <strong>Đợt giao hàng đã bị từ chối tiếp nhận!</strong> Không đủ điều kiện ATTP nhập bếp ăn học đường.
            </span>
            {(rejectApproval?.reason || healthApproval?.reason) && (
              <span className={styles.rejectedReasonText}>
                Lý do từ chối: {rejectApproval?.reason || healthApproval?.reason}
              </span>
            )}
          </div>
        </div>
      )}

      {/* 3. Bảng Danh sách Nguyên liệu & Lô hàng */}
      <div className={styles.contentSection}>
        <div className={styles.sectionHeading}>
          <h2 className={styles.sectionTitle}>
            Danh sách nguyên liệu & Lô hàng
          </h2>
          <span className={styles.countText}>
            {delivery.deliveryItems?.length || 0} nguyên liệu • {flatLotRows.length} lô
          </span>
        </div>

        <div className={styles.tableResponsive}>
          <table className={styles.flatTable}>
            <thead>
              <tr>
                <th className={styles.thIngredient}>Nguyên liệu</th>
                <th className={styles.thLotCode}>Mã lô (Lot Code)</th>
                <th className={styles.thFacility}>Cơ sở nguồn</th>
                <th className={styles.thExpiry}>Hạn dùng</th>
                <th className={styles.thQuantity}>Số lượng</th>
                <th className={styles.thStatus}>Trạng thái</th>
                <th className={styles.thAction}>Tem QR</th>
              </tr>
            </thead>
            <tbody>
              {flatLotRows.map((row) => {
                const lotCfg = row.status
                  ? LOT_STATUS_CONFIG[row.status] || {
                      label: row.status,
                      bg: "#f1f5f9",
                      color: "#64748b",
                    }
                  : null

                return (
                  <tr key={row.id}>
                    {/* Nguyên liệu */}
                    <td className={styles.tdIngredient}>
                      <span className={styles.ingredientName}>{row.ingredientName}</span>
                      {row.category && (
                        <span className={styles.categorySubText}>{row.category}</span>
                      )}
                    </td>

                    {/* Mã lô */}
                    <td className={styles.tdLotCode}>
                      {row.lotCode !== "--" ? (
                        <span className={styles.monoCode}>{row.lotCode}</span>
                      ) : (
                        <span className={styles.emptyText}>Chưa có lô</span>
                      )}
                    </td>

                    {/* Cơ sở nguồn */}
                    <td className={styles.tdFacility}>
                      {row.sourceFacility || "Nhà cung cấp trực tiếp"}
                    </td>

                    {/* Hạn dùng */}
                    <td className={styles.tdExpiry}>
                      {formatDate(row.expiryDate)}
                    </td>

                    {/* Số lượng */}
                    <td className={styles.tdQuantity}>
                      <strong>{row.quantityText}</strong>
                    </td>

                    {/* Trạng thái lô */}
                    <td className={styles.tdStatus}>
                      {lotCfg ? (
                        <span
                          className={styles.statusPill}
                          style={{
                            backgroundColor: lotCfg.bg,
                            color: lotCfg.color,
                          }}
                        >
                          {lotCfg.label}
                        </span>
                      ) : (
                        <span className={styles.emptyText}>--</span>
                      )}
                    </td>

                    {/* Thao tác Tem QR */}
                    <td className={styles.tdAction}>
                      {row.lot ? (
                        <button
                          type="button"
                          className={styles.qrIconBtn}
                          onClick={() => handleOpenQRModal(row.lot, row.ingredientName)}
                          title={`Quét / Xem tem QR lô ${row.lotCode}`}
                          aria-label={`Xem mã QR của lô ${row.lotCode}`}
                        >
                          <QrCode size={16} />
                        </button>
                      ) : (
                        <span className={styles.emptyText}>--</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Phản hồi chất lượng nguyên liệu */}
      <div className={styles.contentSection}>
        <div className={styles.sectionHeading}>
          <h2 className={styles.sectionTitle}>
            Phản hồi chất lượng nguyên liệu gửi Supplier
          </h2>
          <span className={styles.countText}>
            {deliveryFeedbacks.length} phản hồi
          </span>
        </div>

        {deliveryFeedbacks.length > 0 ? (
          <div className={styles.tableResponsive}>
            <table className={styles.flatTable}>
              <thead>
                <tr>
                  <th>Tiêu đề phản hồi</th>
                  <th>Lô liên quan</th>
                  <th>Thời gian gửi</th>
                  <th>Trạng thái</th>
                  <th className={styles.thAction}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {deliveryFeedbacks.map((fb) => {
                  const statusCfg = FEEDBACK_STATUS_CONFIG[fb.status] || {
                    label: fb.status,
                    bg: "#eff6ff",
                    color: "#1d4ed8",
                  }

                  return (
                    <tr key={fb.id}>
                      <td>
                        <span className={styles.feedbackTitleText}>{fb.title}</span>
                      </td>
                      <td>
                        {fb.lotCode ? (
                          <div className={styles.feedbackLotTargetCol}>
                            <span className={styles.targetIngredientName}>
                              {fb.ingredientName}
                            </span>
                            <span className={styles.monoCode}>{fb.lotCode}</span>
                          </div>
                        ) : (
                          <span className={styles.emptyText}>Toàn bộ đợt giao</span>
                        )}
                      </td>
                      <td className={styles.timeText}>
                        {formatDateTime(fb.createdAt)}
                      </td>
                      <td>
                        <span
                          className={styles.statusPill}
                          style={{
                            backgroundColor: statusCfg.bg,
                            color: statusCfg.color,
                          }}
                        >
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className={styles.tdAction}>
                        <button
                          type="button"
                          className={styles.tableActionIconBtn}
                          onClick={() => onSelectFeedback(fb)}
                          title="Xem chi tiết trao đổi phản hồi"
                          aria-label="Xem chi tiết trao đổi phản hồi"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.emptyInlineNotice}>
            Chưa có phản hồi chất lượng nào cho đợt giao này.
          </div>
        )}
      </div>

      {/* Modal Xem / Quét tem QR truy xuất nguồn gốc */}
      {activeQRLot && (
        <LotQRTraceModal
          lot={activeQRLot}
          ingredientName={activeQRIngredient}
          supplierName={delivery.supplierName}
          onClose={() => setActiveQRLot(null)}
          onFeedbackThisLot={(lot) => {
            setActiveQRLot(null)
            onOpenSubmitFeedback(delivery, lot.id)
          }}
        />
      )}
    </div>
  )
}

DeliveryDetailView.propTypes = {
  delivery: PropTypes.object.isRequired,
  feedbacks: PropTypes.array.isRequired,
  onBack: PropTypes.func.isRequired,
  onOpenSubmitFeedback: PropTypes.func.isRequired,
  onOpenApprovalModal: PropTypes.func.isRequired,
  onSelectFeedback: PropTypes.func.isRequired,
}
