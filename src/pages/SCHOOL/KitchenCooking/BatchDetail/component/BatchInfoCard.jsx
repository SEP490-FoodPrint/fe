import React from "react"
import {
  CookingPot,
  ShieldCheck,
  Calendar,
  Clock,
  Utensils,
  Layers,
  User,
  Info
} from "lucide-react"
import styles from "./BatchInfoCard.module.scss"

export default function BatchInfoCard({ batchData }) {
  return (
    <section className={styles.infoCard}>
      {/* Header Thẻ */}
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.iconBox}>
            <CookingPot size={18} />
          </div>
          <h2 className={styles.cardTitle}>Thông tin lô chế biến</h2>
        </div>
        <div className={styles.safetyBadge}>
          <ShieldCheck size={14} />
          <span>Bếp chuẩn an toàn 3 bước</span>
        </div>
      </div>

      {/* Grid thông tin chi tiết */}
      <div className={styles.infoGrid}>
        {/* 1. Mã lô */}
        <div className={styles.infoItem}>
          <span className={styles.fieldLabel}>Mã lô chế biến</span>
          <span className={styles.fieldValueMono}>{batchData.code}</span>
        </div>

        {/* 2. Món ăn */}
        <div className={styles.infoItem}>
          <span className={styles.fieldLabel}>Món ăn</span>
          <div className={styles.dishValueWrap}>
            <span className={styles.dishName}>{batchData.dishName}</span>
            <span className={styles.dishCategoryPill}>{batchData.dishCategory}</span>
          </div>
        </div>

        {/* 3. Ngày thực đơn */}
        <div className={styles.infoItem}>
          <span className={styles.fieldLabel}>Ngày thực đơn</span>
          <div className={styles.valueWithIcon}>
            <Calendar size={15} className={styles.itemIcon} />
            <span className={styles.fieldValueBold}>{batchData.menuDate}</span>
            <span className={styles.subText}>(Tuần 45 - Học kỳ I)</span>
          </div>
        </div>

        {/* 4. Bữa ăn & Giờ phục vụ */}
        <div className={styles.infoItem}>
          <span className={styles.fieldLabel}>Bữa ăn &amp; Giờ phục vụ</span>
          <div className={styles.mealTimeWrap}>
            <span className={styles.mealPill}>
              <Utensils size={13} />
              {batchData.mealType}
            </span>
            <span className={styles.servingTime}>
              Giờ phục vụ: <strong>{batchData.servingTime}</strong>
            </span>
          </div>
        </div>

        {/* 5. Số suất dự kiến */}
        <div className={styles.infoItem}>
          <span className={styles.fieldLabel}>Số suất dự kiến</span>
          <div className={styles.portionWrap}>
            <span className={styles.portionNumber}>{batchData.plannedPortions.toLocaleString("vi-VN")}</span>
            <span className={styles.portionUnit}>suất (Khớp sĩ số báo ăn bán trú)</span>
          </div>
        </div>

        {/* 6. Phương thức chế biến */}
        <div className={styles.infoItem}>
          <span className={styles.fieldLabel}>Phương thức chế biến</span>
          <div className={styles.methodWrap}>
            <span className={styles.fieldValueBold}>
              {batchData.method === "SEPARATE" ? "Nấu riêng theo lô nguyên liệu" : "Nấu chung đa lô"}
            </span>
            <div
              className={styles.methodTooltipBox}
              title="Cấu hình nhà trường: Áp dụng tỷ lệ nguyên liệu xuất kho theo từng lô độc lập để tối ưu khả năng truy xuất nguồn gốc."
            >
              <Layers size={12} />
              <span>Cấu hình nhà trường</span>
            </div>
          </div>
        </div>

        {/* 7. Người tạo lô */}
        <div className={styles.infoItem}>
          <span className={styles.fieldLabel}>Người tạo lô</span>
          <div className={styles.userWrap}>
            <div className={styles.userAvatar}>VV</div>
            <span className={styles.userName}>{batchData.createdBy}</span>
            <span className={styles.subText}>(Bếp trưởng cơ sở / USR-092)</span>
          </div>
        </div>

        {/* 8. Thời điểm tạo */}
        <div className={styles.infoItem}>
          <span className={styles.fieldLabel}>Thời điểm tạo</span>
          <div className={styles.valueWithIcon}>
            <Clock size={15} className={styles.itemIcon} />
            <span className={styles.fieldValueBold}>{batchData.createdAt}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
