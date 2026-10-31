import React from "react"
import {
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  QrCode,
  Boxes,
  Warehouse
} from "lucide-react"
import styles from "./BatchValidationAuditCard.module.scss"

export default function BatchValidationAuditCard({
  totalLots = 5,
  isCombineLots = false,
  isValid = true,
  totalAllocated = 10.0,
  hasStockOverflow = false,
  diffAmount = 0
}) {
  const lotCountDisplay = totalLots < 10 ? `0${totalLots}` : `${totalLots}`

  return (
    <div className={styles.auditBar}>
      {/* 1. Tiêu đề đối soát */}
      <div className={styles.auditHeader}>
        <ClipboardCheck size={16} className={styles.headerIcon} />
        <span className={styles.auditTitle}>Đối soát hợp lệ kho &amp; ATTP:</span>
      </div>

      {/* 2. Dải 4 chỉ số inline thanh thoát */}
      <div className={styles.checkStrip}>
        {/* Item 1: Lô nguyên liệu */}
        <div className={styles.checkPill}>
          <Boxes size={13} className={styles.pillIcon} />
          <span>{lotCountDisplay} lô hợp chuẩn</span>
        </div>

        {/* Item 2: Tồn kho & Định mức */}
        {hasStockOverflow ? (
          <div className={styles.checkPillError}>
            <AlertTriangle size={13} />
            <span>Vượt tồn kho khả dụng</span>
          </div>
        ) : isCombineLots && diffAmount !== 0 ? (
          <div className={styles.checkPillWarning}>
            <AlertCircle size={13} />
            <span>
              {diffAmount < 0
                ? `Thiếu ${Math.abs(diffAmount).toFixed(1)} kg (${totalAllocated.toFixed(1)}/10.0 kg)`
                : `Dư +${diffAmount.toFixed(1)} kg (${totalAllocated.toFixed(1)}/10.0 kg)`}
            </span>
          </div>
        ) : (
          <div className={styles.checkPill}>
            <Warehouse size={13} className={styles.pillIcon} />
            <span>{isCombineLots ? "Đủ tồn (10.0/10.0 kg)" : "100% Đủ tồn kho"}</span>
          </div>
        )}

        {/* Item 3: Chuẩn QR */}
        <div className={styles.checkPill}>
          <QrCode size={13} className={styles.pillIcon} />
          <span>{isCombineLots ? "Chuẩn QR đa nguồn" : "Chuẩn QR 1:1"}</span>
        </div>

        {/* Item 4: Kết quả tổng hợp */}
        {isValid ? (
          <div className={styles.checkPillSuccess}>
            <CheckCircle2 size={13} />
            <span>Hợp lệ 100%</span>
          </div>
        ) : (
          <div className={styles.checkPillWarning}>
            <AlertCircle size={13} />
            <span>Cần cân đối</span>
          </div>
        )}
      </div>
    </div>
  )
}
