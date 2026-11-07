import React, { useState } from "react"
import PropTypes from "prop-types"
import {
  ArrowLeft,
  QrCode,
  Send,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react"
import DeliveryStatusBadge from "./DeliveryStatusBadge"
import LotQRTraceModal from "./LotQRTraceModal"
import { LOT_STATUS_CONFIG, FEEDBACK_STATUS_CONFIG } from "../mockDeliveryData"
import styles from "./DeliveryDetailView.module.scss"

export default function DeliveryDetailView({
  delivery,
  feedbacks = [],
  onBack,
  onOpenSubmitFeedback,
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

  return (
    <div className={styles.detailWrapper}>
      {/* 1. Header Bar tích hợp thông tin tinh gọn */}
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
          <div className={styles.headerTextGroup}>
            <div className={styles.titleRow}>
              <h1 className={styles.pageTitle}>Chi tiết giao hàng</h1>
              <span className={styles.deliveryCode}>{delivery.deliveryNo}</span>
              <DeliveryStatusBadge status={delivery.status} />
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaItem}>
                Nhà cung cấp: <strong>{delivery.supplierName}</strong>
              </span>
              <span className={styles.metaDot}>•</span>
              <span className={styles.metaItem}>
                Thời gian giao: <strong>{formatDateTime(deliveryTime)}</strong>
              </span>
              {delivery.note && (
                <>
                  <span className={styles.metaDot}>•</span>
                  <span className={styles.metaNote}>
                    Ghi chú: {delivery.note}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          className={styles.feedbackActionBtn}
          onClick={() => onOpenSubmitFeedback(delivery)}
        >
          <Send size={15} />
          <span>Gửi phản hồi chất lượng</span>
        </button>
      </div>

      {/* 2. Bảng Danh sách Nguyên liệu & Lô hàng (Thuần chữ, tối giản, phẳng) */}
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

      {/* 3. Phản hồi chất lượng nguyên liệu (Tối giản) */}
      <div className={styles.contentSection}>
        <div className={styles.sectionHeading}>
          <h2 className={styles.sectionTitle}>
            Phản hồi chất lượng
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
                        <span className={styles.monoCode}>
                          {fb.lotCode ? fb.lotCode : "Toàn bộ đợt giao"}
                        </span>
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
  onSelectFeedback: PropTypes.func.isRequired,
}
