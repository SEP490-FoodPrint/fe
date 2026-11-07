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
} from "lucide-react"
import styles from "./LotQRTraceModal.module.scss"

export default function LotQRTraceModal({
  lot,
  ingredientName,
  supplierName,
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
                <svg
                  className={styles.qrSvg}
                  viewBox="0 0 120 120"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="120" height="120" fill="white" />
                  {/* Outer corner markers */}
                  <rect x="10" y="10" width="30" height="30" stroke="#00654f" strokeWidth="6" fill="white" />
                  <rect x="19" y="19" width="12" height="12" fill="#00654f" />

                  <rect x="80" y="10" width="30" height="30" stroke="#00654f" strokeWidth="6" fill="white" />
                  <rect x="89" y="19" width="12" height="12" fill="#00654f" />

                  <rect x="10" y="80" width="30" height="30" stroke="#00654f" strokeWidth="6" fill="white" />
                  <rect x="19" y="89" width="12" height="12" fill="#00654f" />

                  {/* QR Data Pattern */}
                  <rect x="48" y="12" width="6" height="6" fill="#0a8066" />
                  <rect x="62" y="12" width="6" height="6" fill="#0a8066" />
                  <rect x="54" y="22" width="12" height="6" fill="#00654f" />
                  <rect x="48" y="32" width="6" height="12" fill="#0a8066" />
                  <rect x="66" y="32" width="6" height="6" fill="#00654f" />

                  <rect x="12" y="48" width="6" height="6" fill="#0a8066" />
                  <rect x="24" y="48" width="12" height="6" fill="#00654f" />
                  <rect x="12" y="60" width="6" height="12" fill="#00654f" />
                  <rect x="24" y="66" width="6" height="6" fill="#0a8066" />

                  {/* Center core */}
                  <rect x="45" y="45" width="30" height="30" fill="#eaf7f0" rx="4" />
                  <path d="M55 60 L60 65 L67 55" stroke="#0a8066" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                  <rect x="82" y="48" width="12" height="6" fill="#0a8066" />
                  <rect x="98" y="54" width="8" height="6" fill="#00654f" />
                  <rect x="82" y="66" width="6" height="8" fill="#00654f" />

                  <rect x="48" y="82" width="12" height="6" fill="#0a8066" />
                  <rect x="66" y="82" width="6" height="12" fill="#00654f" />
                  <rect x="54" y="94" width="8" height="8" fill="#0a8066" />
                  <rect x="70" y="98" width="10" height="6" fill="#00654f" />

                  <rect x="84" y="84" width="6" height="6" fill="#00654f" />
                  <rect x="96" y="84" width="12" height="6" fill="#0a8066" />
                  <rect x="84" y="96" width="12" height="6" fill="#0a8066" />
                  <rect x="100" y="96" width="8" height="8" fill="#00654f" />
                </svg>
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
                  {lot.receivedQuantity} {lot.unit}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.tagFooter}>
            <div className={styles.verifyBadge}>
              <ShieldCheck size={14} className={styles.verifyIcon} />
              <span>Mã QR hợp chuẩn chuỗi cung ứng FoodPrint</span>
            </div>
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
  onClose: PropTypes.func.isRequired,
}

