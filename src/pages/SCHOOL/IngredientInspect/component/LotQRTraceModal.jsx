import { formatLargeQuantity } from "src/utils/quantity"
import { formatSmallQuantity } from "src/utils/quantity"
import React from "react"
import PropTypes from "prop-types"
import {
  X,
  QrCode,
  Building,
  Calendar,
  Layers,
  ShieldCheck,
  Package,
  ExternalLink,
} from "lucide-react"
import styles from "./LotQRTraceModal.module.scss"

export default function LotQRTraceModal({
  lot,
  ingredientName,
  supplierName,
  qrImageDataUrl = "",
  traceUrl = "",
  onClose,
}) {
  if (!lot) return null

  const formatDate = (isoDate) => {
    if (!isoDate) return "--"
    try {
      const d = new Date(isoDate)
      return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
    } catch {
      return "--"
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modalCard}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <div className={styles.qrBadge}>
              <QrCode size={18} />
            </div>
            <h3 className={styles.title}>Tem nhãn QR & Truy xuất nguồn gốc</h3>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* Thẻ mô phỏng Tem nhãn dán trên lô hàng thực tế */}
        <div className={styles.physicalTag}>
          <div className={styles.tagContent}>
            {/* Khung QR Code đồ họa */}
            <div className={styles.qrVisualWrap}>
              <div className={styles.qrFrame}>
                {/* Đúng mã QR trên nhãn bao bì NCC tạo khi lập đơn giao cho xe */}
                {qrImageDataUrl ? (
                  <img
                    src={qrImageDataUrl}
                    alt={`Mã QR nhãn bao bì của ${ingredientName}`}
                    className={styles.qrSvg}
                  />
                ) : (
                  <div className={styles.qrMissing}>
                    <QrCode size={28} />
                    <span>Đơn giao này chưa có nhãn QR từ nhà cung cấp</span>
                  </div>
                )}
              </div>
            </div>

            {/* Thông tin truy xuất chi tiết từ mã */}
            <div className={styles.tagInfoCol}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Nguyên liệu:</span>
                <span className={styles.infoValHighlight}>{ingredientName}</span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Mã lô:</span>
                <span className={styles.infoValMono}>{lot.lotCode}</span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Nhà cung cấp:</span>
                <span className={styles.infoVal}>{supplierName}</span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Cơ sở / Vùng trồng:</span>
                <span className={styles.infoVal}>{lot.sourceFacility || "Đang cập nhật cơ sở"}</span>
              </div>

              <div className={styles.dateGrid}>
                <div className={styles.dateBlock}>
                  <span className={styles.infoLabel}>Ngày sản xuất:</span>
                  <span className={styles.infoValDate}>{formatDate(lot.manufactureDate)}</span>
                </div>
                <div className={styles.dateBlock}>
                  <span className={styles.infoLabel}>Hạn sử dụng:</span>
                  <span className={styles.infoValDate}>{formatDate(lot.expiryDate)}</span>
                </div>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Khối lượng kiện/lô:</span>
                <span className={styles.infoValStrong}>
                  {formatLargeQuantity(lot.receivedQuantity, lot.unit)}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.tagFooter}>
            <div className={styles.verifyBadge}>
              <ShieldCheck size={14} className={styles.verifyIcon} />
              <span>Mã QR do nhà cung cấp tạo khi lập đơn giao</span>
            </div>
            {traceUrl && (
              <a href={traceUrl} target="_blank" rel="noopener noreferrer" className={styles.traceLink}>
                <span>Mở trang truy xuất</span>
                <ExternalLink size={13} aria-hidden="true" />
              </a>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.closeActionBtn}
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}

LotQRTraceModal.propTypes = {
  lot: PropTypes.object,
  ingredientName: PropTypes.string.isRequired,
  supplierName: PropTypes.string.isRequired,
  qrImageDataUrl: PropTypes.string,
  traceUrl: PropTypes.string,
  onClose: PropTypes.func.isRequired,
}

