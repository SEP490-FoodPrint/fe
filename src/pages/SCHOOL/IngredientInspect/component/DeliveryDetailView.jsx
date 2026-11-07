import React, { useState } from "react"
import PropTypes from "prop-types"
import {
  ArrowLeft,
  QrCode,
  Eye,
  Store,
  Clock,
  FileText,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import DeliveryStatusBadge from "./DeliveryStatusBadge"
import LotQRTraceModal from "./LotQRTraceModal"
import { LOT_STATUS_CONFIG } from "../mockDeliveryData"
import styles from "./DeliveryDetailView.module.scss"

export default function DeliveryDetailView({
  delivery,
  onBack,
  onOpenApprovalModal,
}) {
  // State xem tem nhãn QR của lô
  const [activeQRLot, setActiveQRLot] = useState(null)
  const [activeQRIngredient, setActiveQRIngredient] = useState("")

  const handleOpenQRModal = (lot, ingredientName) => {
    setActiveQRLot(lot)
    setActiveQRIngredient(ingredientName)
  }

  // Kiểm tra đánh giá của Cán bộ Y tế
  const healthApproval = delivery.deliveryApprovals?.find(
    (a) => a.roleCode === "SCHOOL_NUTRITION_OFFICER" || a.roleCode === "SCHOOL_HEALTH_OFFICER"
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

  // Kiểm tra điều kiện thực hiện kiểm thực:
  // Xe chưa đến trường (CREATED hoặc IN_TRANSIT) -> Chưa thể kiểm thực
  const isBeforeArrival =
    delivery.status === "CREATED" || delivery.status === "IN_TRANSIT"
  const isCancelled =
    delivery.status === "CANCELLED" || delivery.status === "CANCELLED_MEAL"

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

        {/* Action Buttons: Đánh giá kiểm thực (Khi đã đánh giá sẽ khóa vĩnh viễn không cho sửa) */}
        <div className={styles.headerActions}>
          {healthApproval ? (
            healthApproval.decision === "APPROVE" ? (
              <div
                className={styles.inspectedApprovedBadge}
                title={`Đã duyệt đạt chuẩn lúc ${formatDateTime(healthApproval.decidedAt)} (Biên bản kiểm thực không thể sửa đổi)`}
              >
                <CheckCircle2 size={15} />
                <span>Y tế đã duyệt tiếp nhận</span>
              </div>
            ) : (
              <div
                className={styles.inspectedRejectedBadge}
                title={`Đã từ chối tiếp nhận lúc ${formatDateTime(healthApproval.decidedAt)} (Biên bản kiểm thực không thể sửa đổi)`}
              >
                <XCircle size={15} />
                <span>Y tế đã từ chối tiếp nhận</span>
              </div>
            )
          ) : isCancelled ? (
            <button
              type="button"
              className={styles.approvalDisabledBtn}
              disabled
              title="Đợt giao hàng đã bị hủy, không thể thực hiện kiểm thực"
            >
              <ShieldAlert size={15} />
              <span>Đợt giao đã hủy</span>
            </button>
          ) : isBeforeArrival ? (
            <button
              type="button"
              className={styles.approvalDisabledBtn}
              disabled
              title={
                delivery.status === "IN_TRANSIT"
                  ? "Xe hàng đang trên đường vận chuyển, chỉ có thể kiểm thực khi xe đã đến trường"
                  : "Đợt giao hàng mới được tạo tại kho, chưa xuất phát đến trường"
              }
            >
              <ShieldCheck size={15} />
              <span>Chờ xe đến trường</span>
            </button>
          ) : (
            <button
              type="button"
              className={styles.approvalPrimaryBtn}
              onClick={() => onOpenApprovalModal(delivery)}
              title="Đánh giá cảm quan và ra quyết định duyệt hoặc từ chối"
            >
              <ShieldCheck size={16} />
              <span>Đánh giá kiểm thực</span>
            </button>
          )}
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

      {/* Hướng dẫn khi xe đang vận chuyển hoặc mới tạo */}
      {delivery.status === "IN_TRANSIT" && (
        <div className={styles.transitNotice}>
          <Clock size={15} className={styles.transitNoticeIcon} />
          <span>
            Xe hàng đang trên đường vận chuyển đến trường. Cán bộ Y tế sẽ tiến hành kiểm thực (nhiệt độ thùng lạnh, cảm quan, niêm phong tem QR) ngay khi xe đến nơi.
          </span>
        </div>
      )}

      {delivery.status === "CREATED" && (
        <div className={styles.createdNotice}>
          <Clock size={15} className={styles.createdNoticeIcon} />
          <span>
            Đơn giao hàng mới được lập phiếu xuất kho tại nhà cung cấp, xe chưa xuất phát đến trường.
          </span>
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

      {/* Modal Xem / Quét tem QR truy xuất nguồn gốc */}
      {activeQRLot && (
        <LotQRTraceModal
          lot={activeQRLot}
          ingredientName={activeQRIngredient}
          supplierName={delivery.supplierName}
          onClose={() => setActiveQRLot(null)}
        />
      )}
    </div>
  )
}

DeliveryDetailView.propTypes = {
  delivery: PropTypes.object.isRequired,
  onBack: PropTypes.func.isRequired,
  onOpenApprovalModal: PropTypes.func.isRequired,
}
