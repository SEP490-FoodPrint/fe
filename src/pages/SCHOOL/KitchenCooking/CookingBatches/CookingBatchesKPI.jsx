import React from "react"
import styles from "./CookingBatchesKPI.module.scss"

const KPIS = [
  {
    id: "total",
    label: "Hôm nay",
    value: "08",
    unit: "lô trong ca",
    icon: "restaurant",
    iconTheme: "primary",
  },
  {
    id: "pending",
    label: "Chờ xác nhận",
    value: "03",
    badge: "Cần duyệt",
    badgeType: "warning",
    icon: "schedule",
    iconTheme: "warning",
  },
  {
    id: "completed",
    label: "Hoàn thành",
    value: "03",
    badge: "Đã nấu xong",
    badgeType: "success",
    icon: "check_circle",
    iconTheme: "success",
  },
  {
    id: "samples",
    label: "Lưu mẫu 24h",
    value: "03/03",
    badge: "100% đạt",
    badgeType: "success",
    icon: "science",
    iconTheme: "primary",
  },
]

function CookingBatchesKPI() {
  return (
    <div className={styles.kpiGrid}>
      {KPIS.map((kpi) => (
        <div key={kpi.id} className={styles.kpiCard}>
          <div className={styles.kpiContent}>
            <span className={styles.kpiLabel}>{kpi.label}</span>
            <div className={styles.kpiValueRow}>
              <span className={`${styles.kpiValue} ${kpi.id === "completed" ? styles.valuePrimary : ""}`}>
                {kpi.value}
              </span>
              {kpi.unit && <span className={styles.kpiUnit}>{kpi.unit}</span>}
              {kpi.badge && (
                <span className={`${styles.kpiBadge} ${styles[`badge_${kpi.badgeType}`] || ""}`}>
                  {kpi.badge}
                </span>
              )}
            </div>
          </div>
          <div className={`${styles.iconBox} ${styles[`icon_${kpi.iconTheme}`] || ""}`}>
            <span className="material-symbols-outlined">{kpi.icon}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default CookingBatchesKPI
