import React from "react"
import {
  ClipboardCheck,
  CheckCircle2,
  Boxes,
  Warehouse,
  ShieldCheck,
  CheckCheck,
  QrCode
} from "lucide-react"
import styles from "./BatchValidationAuditCard.module.scss"

export default function BatchValidationAuditCard({ totalLots = 5, isCombineLots = false }) {
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

        <div className={styles.validBadge}>
          <CheckCircle2 size={14} />
          <span>Phương án hợp lệ 100%</span>
        </div>
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

        {/* Box 2: Tồn kho khả dụng */}
        <div className={styles.kpiBox}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Tồn kho khả dụng</span>
            <Warehouse size={16} className={styles.kpiIcon} />
          </div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiNum}>100%</span>
            <span className={styles.kpiUnit}>Đủ tồn</span>
          </div>
          <div className={styles.kpiStatusGreen}>
            <CheckCircle2 size={13} />
            <span>Không vượt tồn kho từng lô</span>
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
        <div className={`${styles.kpiBox} ${styles.kpiBoxSuccess}`}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabelSuccess}>Kết quả đối soát</span>
            <ShieldCheck size={16} className={styles.kpiIconSuccess} />
          </div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiNumSuccess}>Hợp lệ 100%</span>
          </div>
          <div className={styles.kpiStatusSuccess}>
            <CheckCircle2 size={13} />
            <span>
              {isCombineLots ? "Đáp ứng quy chuẩn Nấu chung" : "Sẵn sàng lưu & phê duyệt"}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
