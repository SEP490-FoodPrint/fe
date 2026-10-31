import React from "react"
import {
  ClipboardCheck,
  CheckCircle2,
  Boxes,
  Warehouse,
  ShieldCheck,
  CheckCheck,
  QrCode,
  AlertCircle,
  AlertTriangle
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
    <section className={styles.auditCard}>
      {/* 1. Header Thẻ */}
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.iconBox}>
            <ClipboardCheck size={18} />
          </div>
          <h2 className={styles.cardTitle}>Đối soát tính hợp lệ kho trước khi cập nhật</h2>
        </div>

        {isValid ? (
          <div className={styles.validBadge}>
            <CheckCircle2 size={14} />
            <span>Phương án hợp lệ 100%</span>
          </div>
        ) : hasStockOverflow ? (
          <div className={styles.invalidBadge}>
            <AlertTriangle size={14} />
            <span>Cảnh báo: Vượt tồn kho khả dụng</span>
          </div>
        ) : (
          <div className={styles.warningBadge}>
            <AlertCircle size={14} />
            <span>Chưa đủ định mức ({totalAllocated.toFixed(1)} / 10.0 kg)</span>
          </div>
        )}
      </div>

      {/* 2. 4 Thẻ KPI Kiểm Tra Kho Logic, Không Trùng Lặp */}
      <div className={styles.kpiGrid}>
        {/* Box 1: Lô nguyên liệu */}
        <div className={styles.kpiBox}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Lô nguyên liệu</span>
            <Boxes size={16} className={styles.kpiIcon} />
          </div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiNum}>{lotCountDisplay}</span>
            <span className={styles.kpiUnit}>lô hợp chuẩn</span>
          </div>
          <div className={styles.kpiStatusGreen}>
            <CheckCheck size={13} />
            <span>
              {isCombineLots
                ? "Các lô phối trộn đạt chuẩn kiểm định"
                : "Mỗi nguyên liệu 01 lô độc lập"}
            </span>
          </div>
        </div>

        {/* Box 2: Tồn kho & Định mức */}
        <div
          className={`${styles.kpiBox} ${
            hasStockOverflow
              ? styles.kpiBoxError
              : !isValid
              ? styles.kpiBoxWarning
              : ""
          }`}
        >
          <div className={styles.kpiTop}>
            <span
              className={
                hasStockOverflow
                  ? styles.kpiLabelError
                  : !isValid
                  ? styles.kpiLabelWarning
                  : styles.kpiLabel
              }
            >
              {isCombineLots ? "Định mức & Tồn kho" : "Tồn kho khả dụng"}
            </span>
            <Warehouse
              size={16}
              className={
                hasStockOverflow
                  ? styles.kpiIconError
                  : !isValid
                  ? styles.kpiIconWarning
                  : styles.kpiIcon
              }
            />
          </div>
          <div className={styles.kpiValueRow}>
            {hasStockOverflow ? (
              <>
                <span className={styles.kpiNumError}>Vượt tồn</span>
              </>
            ) : isCombineLots && diffAmount !== 0 ? (
              <>
                <span className={styles.kpiNumWarning}>{totalAllocated.toFixed(1)}</span>
                <span className={styles.kpiUnit}>/ 10.0 kg</span>
              </>
            ) : (
              <>
                <span className={styles.kpiNum}>100%</span>
                <span className={styles.kpiUnit}>Đủ tồn</span>
              </>
            )}
          </div>
          <div>
            {hasStockOverflow ? (
              <div className={styles.kpiStatusError}>
                <AlertTriangle size={13} />
                <span>Số lượng vượt quá tồn trong kho</span>
              </div>
            ) : isCombineLots && diffAmount !== 0 ? (
              <div className={styles.kpiStatusWarning}>
                <AlertCircle size={13} />
                <span>
                  {diffAmount < 0
                    ? `Còn thiếu ${Math.abs(diffAmount).toFixed(1)} kg`
                    : `Dư thừa +${diffAmount.toFixed(1)} kg`}
                </span>
              </div>
            ) : (
              <div className={styles.kpiStatusGreen}>
                <CheckCircle2 size={13} />
                <span>Không vượt tồn kho từng lô</span>
              </div>
            )}
          </div>
        </div>

        {/* Box 3: Truy xuất nguồn gốc */}
        <div className={styles.kpiBox}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Truy xuất nguồn gốc</span>
            <QrCode size={16} className={styles.kpiIcon} />
          </div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiNumSuccess}>
              {isCombineLots ? "QR Đa nguồn" : "Chuẩn QR 1:1"}
            </span>
          </div>
          <span className={styles.kpiSub}>
            {isCombineLots
              ? "Lưu vết toàn bộ các lô phối trộn"
              : "Bảo toàn tem nhãn từng khay ăn"}
          </span>
        </div>

        {/* Box 4: Kết quả kiểm tra */}
        <div
          className={`${styles.kpiBox} ${
            isValid
              ? styles.kpiBoxSuccess
              : hasStockOverflow
              ? styles.kpiBoxError
              : styles.kpiBoxWarning
          }`}
        >
          <div className={styles.kpiTop}>
            <span
              className={
                isValid
                  ? styles.kpiLabelSuccess
                  : hasStockOverflow
                  ? styles.kpiLabelError
                  : styles.kpiLabelWarning
              }
            >
              Kết quả đối soát
            </span>
            <ShieldCheck
              size={16}
              className={
                isValid
                  ? styles.kpiIconSuccess
                  : hasStockOverflow
                  ? styles.kpiIconError
                  : styles.kpiIconWarning
              }
            />
          </div>
          <div className={styles.kpiValueRow}>
            <span
              className={
                isValid
                  ? styles.kpiNumSuccess
                  : hasStockOverflow
                  ? styles.kpiNumError
                  : styles.kpiNumWarning
              }
            >
              {isValid ? "Hợp lệ 100%" : "Cần cân đối"}
            </span>
          </div>
          <div>
            {isValid ? (
              <div className={styles.kpiStatusSuccess}>
                <CheckCircle2 size={13} />
                <span>
                  {isCombineLots
                    ? "Đáp ứng quy chuẩn Nấu chung"
                    : "Sẵn sàng lưu & phê duyệt"}
                </span>
              </div>
            ) : (
              <div
                className={
                  hasStockOverflow ? styles.kpiStatusError : styles.kpiStatusWarning
                }
              >
                <AlertCircle size={13} />
                <span>Kiểm tra lại số lượng hoặc tồn kho</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
