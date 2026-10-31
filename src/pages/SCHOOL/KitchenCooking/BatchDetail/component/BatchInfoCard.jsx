import React from "react"
import {
  CookingPot,
  ShieldCheck,
  Calendar,
  Clock,
  Utensils,
  Layers,
  User,
  Hash,
  Sparkles
} from "lucide-react"
import styles from "./BatchInfoCard.module.scss"

export default function BatchInfoCard({ batchData = {} }) {
  const portions = (batchData.portions || 1250).toLocaleString("vi-VN")
  const methodLabel =
    batchData.method === "SEPARATE" ? "Nấu riêng 1:1 theo lô" : "Nấu chung đa lô"

  return (
    <section className={styles.infoCard}>
      {/* 1. Header Card */}
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.iconBox}>
            <CookingPot size={18} />
          </div>
          <div>
            <h2 className={styles.cardTitle}>Thông tin lô chế biến</h2>
            <span className={styles.cardSub}>Hồ sơ mẻ nấu và thông số định lượng bán trú</span>
          </div>
        </div>
        <div className={styles.safetyBadge}>
          <ShieldCheck size={14} />
          <span>Kiểm thực 3 bước ATTP</span>
        </div>
      </div>

      {/* 2. Hero Món ăn & Nhận diện mẻ (Khối nổi bật chính) */}
      <div className={styles.heroDishBox}>
        <div className={styles.heroLeft}>
          <div className={styles.heroMetaRow}>
            <span className={styles.heroCategoryBadge}>
              {batchData.dishCategory || "Món mặn chính"}
            </span>
            <div className={styles.batchCodePill} title="Mã lô chế biến">
              <Hash size={12} className={styles.hashIcon} />
              <span className={styles.batchCodeText}>{batchData.code || "CB-20241110-001"}</span>
            </div>
          </div>
          <h3 className={styles.dishNameTitle}>{batchData.dishName || "Thịt heo kho cút nước dừa"}</h3>
        </div>

        <div className={styles.heroPortionBox}>
          <span className={styles.portionLabel}>Quy mô chế biến</span>
          <div className={styles.portionValueRow}>
            <span className={styles.portionBigNumber}>{portions}</span>
            <span className={styles.portionUnit}>suất ăn</span>
          </div>
        </div>
      </div>

      {/* 3. Lưới thông số vận hành (Clean 4 Columns) */}
      <div className={styles.metricsGrid}>
        {/* Metric 1: Bữa ăn & Giờ phục vụ */}
        <div className={styles.metricItem}>
          <div className={styles.metricLabelRow}>
            <Utensils size={13} className={styles.metricIcon} />
            <span className={styles.metricLabel}>Bữa ăn</span>
          </div>
          <div className={styles.metricValue}>
            <strong>{batchData.mealType || "Bữa trưa"}</strong>
            <span className={styles.metricSeparator}>•</span>
            <span className={styles.metricSubTime}>{batchData.servingTime || "11:15"}</span>
          </div>
        </div>

        {/* Metric 2: Ngày thực đơn */}
        <div className={styles.metricItem}>
          <div className={styles.metricLabelRow}>
            <Calendar size={13} className={styles.metricIcon} />
            <span className={styles.metricLabel}>Ngày thực đơn</span>
          </div>
          <div className={styles.metricValue}>
            <strong>{batchData.menuDate || "10/11/2024"}</strong>
          </div>
        </div>

        {/* Metric 3: Phương thức chế biến */}
        <div className={styles.metricItem}>
          <div className={styles.metricLabelRow}>
            <Layers size={13} className={styles.metricIcon} />
            <span className={styles.metricLabel}>Quy cách nấu</span>
          </div>
          <div className={styles.metricValue}>
            <span className={styles.methodTag}>{methodLabel}</span>
          </div>
        </div>

        {/* Metric 4: Người tạo lô */}
        <div className={styles.metricItem}>
          <div className={styles.metricLabelRow}>
            <User size={13} className={styles.metricIcon} />
            <span className={styles.metricLabel}>Người tạo lô</span>
          </div>
          <div className={styles.metricValue}>
            <strong>{batchData.createdBy || "Nguyễn Văn Vận"}</strong>
            <span className={styles.roleTag}>Bếp trưởng</span>
          </div>
        </div>
      </div>

      {/* 4. Footer Dấu vết thời gian tinh tế */}
      <div className={styles.cardFooterBar}>
        <div className={styles.timestampWrap}>
          <Clock size={12} className={styles.clockIcon} />
          <span>Thời điểm khởi tạo lô: <strong>{batchData.createdAt || "10/11/2024 07:15"}</strong></span>
        </div>
        <div className={styles.originHint}>
          Khớp sĩ số báo ăn học sinh từ GVCN
        </div>
      </div>
    </section>
  )
}
