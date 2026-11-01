import React from "react"
import styles from "./MenuDetailBasicInfo.module.scss"

export default function MenuDetailBasicInfo({ menu }) {
  if (!menu) return null

  return (
    <div className={styles.summaryBar}>
      {/* Cột 1: Ngày & Ca ăn */}
      <div className={styles.metricCol}>
        <span className={styles.metricLabel}>Ngày & Ca phục vụ</span>
        <div className={styles.metricValueRow}>
          <span className="material-symbols-outlined text-[17px] text-[#0a8066]">calendar_today</span>
          <span className={styles.metricValue}>{menu.date}</span>
          <span className={styles.mealBadge}>
            {menu.mealType === "LUNCH" ? "Bữa trưa" : "Bữa chiều"}
          </span>
        </div>
        <span className={styles.metricSub}>Bán trú trường học</span>
      </div>

      <div className={styles.divider}></div>

      {/* Cột 2: Khối lớp áp dụng */}
      <div className={styles.metricCol}>
        <span className={styles.metricLabel}>Khối lớp áp dụng</span>
        <div className={styles.metricValueRow}>
          <span className="material-symbols-outlined text-[17px] text-[#0a8066]">school</span>
          <span className={styles.metricValueText}>{menu.targetScope || "Toàn trường"}</span>
        </div>
        <span className={styles.metricSub}>Phân bổ theo tháp dinh dưỡng</span>
      </div>

      <div className={styles.divider}></div>

      {/* Cột 3: CBYT phụ trách & Tiêu chuẩn */}
      <div className={styles.metricCol}>
        <span className={styles.metricLabel}>Cán bộ Y tế lập kế hoạch</span>
        <div className={styles.metricValueRow}>
          <span className="material-symbols-outlined text-[17px] text-[#0a8066]">verified_user</span>
          <span className={styles.metricValueText}>BS. Nguyễn Thu Trang</span>
        </div>
        <span className={styles.metricSub}>100% VietGAP từ NCC liên kết</span>
      </div>
    </div>
  )
}
