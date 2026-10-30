import React from "react"
import { CookingPot, Clock, CheckCircle2, FlaskConical } from "lucide-react"
import styles from "./CookingBatchesKPI.module.scss"

const KPIS = [
  {
    id: "total",
    label: "Mẻ trong ca",
    value: "08",
    unit: "mẻ",
    icon: <CookingPot size={16} />,
    iconTheme: "primary",
  },
  {
    id: "pending",
    label: "Chờ nấu",
    value: "02",
    badge: "Cần nấu",
    badgeType: "warning",
    icon: <Clock size={16} />,
    iconTheme: "warning",
  },
  {
    id: "completed",
    label: "Đã xong",
    value: "06",
    badge: "Hoàn tất",
    badgeType: "success",
    icon: <CheckCircle2 size={16} />,
    iconTheme: "success",
  },
  {
    id: "samples",
    label: "Lưu mẫu 24h",
    value: "06/06",
    badge: "100%",
    badgeType: "primary",
    icon: <FlaskConical size={16} />,
    iconTheme: "primary",
  },
]

function CookingBatchesKPI() {
  return (
    <div className={styles.kpiGrid} role="region" aria-label="Thống kê mẻ chế biến">
      {KPIS.map((kpi) => (
        <div key={kpi.id} className={styles.kpiCard}>
          <div className={`${styles.iconBox} ${styles[`icon_${kpi.iconTheme}`] || ""}`} aria-hidden="true">
            {kpi.icon}
          </div>
          <div className={styles.kpiContent}>
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
            <span className={styles.kpiLabel}>{kpi.label}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default CookingBatchesKPI
