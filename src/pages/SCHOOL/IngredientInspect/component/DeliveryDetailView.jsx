import { formatLargeQuantity } from "src/utils/quantity"
import { deliveryTimeLines } from "src/utils/deliveryTime"
import { formatSmallQuantity } from "src/utils/quantity"
import React, { useContext, useEffect, useState } from "react"
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
  Truck,
} from "lucide-react"
import InlineError from "src/components/InlineError"
import { StoreContext } from "src/contexts"
import BlockchainProofCard from "src/components/BlockchainProof/BlockchainProofCard"
import DeliveryStatusBadge from "./DeliveryStatusBadge"
import LotQRTraceModal from "./LotQRTraceModal"
import { LOT_STATUS_CONFIG } from "src/services/DeliveryInspectionService"
import styles from "./DeliveryDetailView.module.scss"

export default function DeliveryDetailView({
  delivery,
  onBack,
  onOpenApprovalModal,
  onConfirmArrival,
}) {
  const { userStore } = useContext(StoreContext) || {}
  const permissions = userStore?.user?.permissions || []
  // State xem tem nhãn QR của lô
  const [activeQRRow, setActiveQRRow] = useState(null)
  // Ảnh thực tế của bộ phận kiểm tra đang phóng to
  const [zoomPhoto, setZoomPhoto] = useState(null)

  const handleOpenQRModal = (row) => setActiveQRRow(row)

  // Esc để đóng ảnh đang phóng to
  useEffect(() => {
    if (!zoomPhoto) return undefined
    const onKey = event => { if (event.key === "Escape") setZoomPhoto(null) }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [zoomPhoto])

  // Kiểm tra đánh giá của Cán bộ Y tế
  const healthApproval = delivery.deliveryApprovals?.find(
    (a) => a.roleCode === delivery.currentRole
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
        quantityText: formatLargeQuantity(item.actualQuantity, item.unit),
        status: null,
        lot: null,
        traceUrl: item.traceUrl || "",
        qrImageDataUrl: item.qrImageDataUrl || "",
        itemQuantity: item.actualQuantity,
        itemUnit: item.unit,
        itemFacility: item.sourceFacility?.name || "",
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
          quantityText: formatLargeQuantity(lot.receivedQuantity, lot.unit),
          status: lot.status,
          lot: lot,
          traceUrl: item.traceUrl || "",
          qrImageDataUrl: item.qrImageDataUrl || "",
        })
      })
    }
  })


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
    delivery.status === "CANCELLED" || delivery.status === "CANCELLED_MEAL" || Boolean(delivery.cancellationNotice)

  const primaryRole = (delivery.requiredRoles || []).find((r) => r.tier === "PRIMARY")
  const primaryRoleName = primaryRole?.name || "Bếp trưởng"

  const tierOrder = { PRIMARY: 1, REQUIRED: 2, OPTIONAL: 3 }
  const sortedRoles = [...(delivery.requiredRoles || [])].sort((a, b) => {
    return (tierOrder[a.tier] || 2) - (tierOrder[b.tier] || 2)
  })

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
            <DeliveryStatusBadge status={delivery.status} />
            {delivery.vehiclePlate && <span className={styles.vehiclePlate} title="Biển số xe giao">{delivery.vehiclePlate}</span>}
            {delivery.requestNo && <span className={styles.requestNo}>Đơn {delivery.requestNo}</span>}
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
                <span>Bộ phận của bạn đã đồng ý</span>
              </div>
            ) : (
              <div
                className={styles.inspectedRejectedBadge}
                title={`Đã từ chối tiếp nhận lúc ${formatDateTime(healthApproval.decidedAt)} (Biên bản kiểm thực không thể sửa đổi)`}
              >
                <XCircle size={15} />
                <span>Bộ phận của bạn đã từ chối</span>
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
          ) : delivery.status === "IN_TRANSIT" && onConfirmArrival && permissions.includes("delivery.inspect") ? (
            delivery.canConfirmArrival ? (
              <button
                type="button"
                className={styles.approvalPrimaryBtn}
                onClick={() => onConfirmArrival(delivery)}
                title="Xác nhận xe giao đã đến trường để các bộ phận bắt đầu kiểm tra"
              >
                <Truck size={16} />
                <span>Xác nhận xe đến</span>
              </button>
            ) : (
              <button
                type="button"
                className={styles.approvalDisabledBtn}
                disabled
                title={`Chờ người duyệt chính (${primaryRoleName}) xác nhận xe đến`}
              >
                <Truck size={16} />
                <span>Chờ {primaryRoleName} xác nhận</span>
              </button>
            )
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
              disabled={!delivery.canInspect}
              title={delivery.canInspect
                ? "Đánh giá cảm quan và ra quyết định duyệt hoặc từ chối"
                : delivery.status === "RECEIVED"
                  ? "Đợt giao đã tiếp nhận, không thể đánh giá lại"
                  : delivery.status === "REJECTED"
                    ? "Đợt giao đã bị từ chối, không thể đánh giá tiếp"
                    : "Bạn chưa thể đánh giá đợt giao này"}
            >
              <ShieldCheck size={16} />
              <span>Đánh giá kiểm thực</span>
            </button>
          )}
        </div>
      </div>

      {delivery.receiptIssue && <InlineError messages={`Đợt giao chưa thể tiếp nhận vào kho: ${delivery.receiptIssue}. Các bộ phận chỉ có thể đánh giá "Không đạt".`} />}
      {delivery.cancellationNotice && <div className={styles.rejectedBanner} role="alert"><AlertTriangle size={18} /><p>{delivery.cancellationNotice}</p></div>}
      <section className={styles.contentSection} aria-label="Kết quả kiểm tra của các bộ phận">
        <div className={styles.sectionHeading}>
          <h2 className={styles.sectionTitle}>Kết quả kiểm tra từng bộ phận</h2>
          <span className={styles.countText}>
            Số lần phải giao lại của đơn: {delivery.redeliveryRequiredCount}/{delivery.redeliveryLimit}
          </span>
        </div>
        <div className={styles.tableResponsive}>
          <table className={`${styles.flatTable} ${styles.inspectionTable}`}>
            <thead>
              <tr>
                <th className={styles.thRole}>Bộ phận</th>
                <th className={styles.thTier}>Nhóm</th>
                <th className={styles.thInspector}>Người kiểm tra</th>
                <th className={styles.thResult}>Kết quả</th>
                <th className={styles.thPhoto}>Ảnh thực tế</th>
                <th className={styles.thTime}>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {sortedRoles.map((role) => {
                const decision = delivery.deliveryApprovals?.find(
                  (item) => item.roleCode === role.code
                )
                const approved = decision?.decision === "APPROVE"
                const isOptional = role.tier === "OPTIONAL"
                const tierClass =
                  role.tier === "PRIMARY"
                    ? styles.tierBadgePrimary
                    : role.tier === "REQUIRED"
                      ? styles.tierBadgeRequired
                      : styles.tierBadgeOptional
                const tierLabel =
                  role.tierLabel ||
                  (role.tier === "PRIMARY"
                    ? "Duyệt chính"
                    : role.tier === "REQUIRED"
                      ? "Bắt buộc"
                      : "Tùy chọn")
                const photoAlt = `Ảnh kiểm tra thực tế của ${role.name}`
                return (
                  <tr key={role.code}>
                    <td className={styles.tdRole}>{role.name}</td>
                    <td>
                      <span className={tierClass}>{tierLabel}</span>
                    </td>
                    <td>{decision?.userName || <span className={styles.emptyText}>—</span>}</td>
                    <td>
                      {decision ? (
                        <span className={`${styles.resultPill} ${approved ? styles.resultApprove : styles.resultReject}`}>
                          {approved ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                          {approved ? "Đồng ý" : "Từ chối"}
                        </span>
                      ) : (
                        <span className={`${styles.resultPill} ${styles.resultPending}`}>
                          <Clock size={13} /> {isOptional ? "Không bắt buộc" : "Chưa kiểm tra"}
                        </span>
                      )}
                      {decision?.reason && <p className={styles.resultReason}>{decision.reason}</p>}
                      {decision?.decision === "REJECT" && isOptional && (
                        <span className={styles.optionalRefNote}>
                          (Ý kiến tham khảo, không làm từ chối đợt giao)
                        </span>
                      )}
                    </td>
                    <td>
                      {decision?.photoUrl ? (
                        <button
                          type="button"
                          className={styles.photoThumbBtn}
                          onClick={() => setZoomPhoto({ src: decision.photoUrl, alt: photoAlt })}
                          title="Bấm để phóng to ảnh"
                          aria-label={`Phóng to ${photoAlt.toLowerCase()}`}
                        >
                          <img src={decision.photoUrl} alt={photoAlt} className={styles.photoThumb} />
                          <span className={styles.photoZoomHint}><Eye size={12} /> Phóng to</span>
                        </button>
                      ) : (
                        <span className={styles.emptyText}>Không có ảnh</span>
                      )}
                    </td>
                    <td className={styles.tdTime}>{formatDateTime(decision?.decidedAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Biên bản đã chốt (nhận hoặc từ chối) được niêm phong trên blockchain */}
      {(delivery.status === "RECEIVED" || delivery.status === "REJECTED") && permissions.includes("traceability.view") && (
        <BlockchainProofCard
          kind="deliveries"
          recordId={delivery.id}
          title="Niêm phong biên bản kiểm nhận"
          canVerify={permissions.includes("traceability.verify")}
          canAnchor={permissions.includes("traceability.verify")}
          refreshKey={delivery.status}
        />
      )}

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
          {deliveryTimeLines(delivery).map((line) => (
            <div key={line.label} className={styles.summaryValRow}>
              <Clock size={15} className={styles.summaryIcon} />
              <span className={styles.summaryValue}>{line.label}: {line.value}</span>
            </div>
          ))}
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
            Xe hàng đang trên đường vận chuyển đến trường. Các bộ phận sẽ kiểm tra nguyên liệu khi xe đến nơi.
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
                      {row.lot || row.traceUrl ? (
                        <button
                          type="button"
                          className={styles.qrIconBtn}
                          onClick={() => handleOpenQRModal(row)}
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
      {activeQRRow && (
        <LotQRTraceModal
          lot={activeQRRow.lot || {
            lotCode: "Chưa tạo lô",
            sourceFacility: activeQRRow.itemFacility,
            manufactureDate: null,
            expiryDate: null,
            receivedQuantity: activeQRRow.itemQuantity,
            unit: activeQRRow.itemUnit,
          }}
          ingredientName={activeQRRow.ingredientName}
          supplierName={delivery.supplierName}
          qrImageDataUrl={activeQRRow.qrImageDataUrl}
          traceUrl={activeQRRow.traceUrl}
          onClose={() => setActiveQRRow(null)}
        />
      )}

      {/* Phóng to ảnh thực tế của bộ phận kiểm tra */}
      {zoomPhoto && (
        <div
          className={styles.photoLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={zoomPhoto.alt}
          onClick={() => setZoomPhoto(null)}
        >
          <button type="button" className={styles.photoLightboxClose} onClick={() => setZoomPhoto(null)} aria-label="Đóng ảnh">
            <XCircle size={28} />
          </button>
          <img src={zoomPhoto.src} alt={zoomPhoto.alt} className={styles.photoLightboxImg} onClick={event => event.stopPropagation()} />
          <span className={styles.photoLightboxCaption}>{zoomPhoto.alt}</span>
        </div>
      )}
    </div>
  )
}

DeliveryDetailView.propTypes = {
  delivery: PropTypes.object.isRequired,
  onBack: PropTypes.func.isRequired,
  onOpenApprovalModal: PropTypes.func.isRequired,
}
