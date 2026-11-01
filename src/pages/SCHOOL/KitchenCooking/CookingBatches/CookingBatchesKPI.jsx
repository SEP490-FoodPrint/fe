import React from "react"
import { CookingPot, Clock, CheckCircle2 } from "lucide-react"
import styles from "./CookingBatchesKPI.module.scss"

const KPIS = [
  {
    id: "total",
    label: "Lô theo bộ lọc",
    field: "total",
    unit: "lô",
    icon: <CookingPot size={16} />,
    iconTheme: "primary",
  },
  {
    id: "pending",
    label: "Chờ nấu",
    field: "confirmed",
    icon: <Clock size={16} />,
    iconTheme: "warning",
  },
  {
    id: "completed",
    label: "Đã xong",
    field: "completed",
    icon: <CheckCircle2 size={16} />,
    iconTheme: "success",
  },
]

function CookingBatchesKPI({ stats, loading }) {
  return (
    <div
      className={styles.kpiGrid}
      role="region"
      aria-label="Thống kê lô chế biến theo bộ lọc"
      aria-busy={loading}
    >
      {KPIS.map((kpi) => (
        <div key={kpi.id} className={styles.kpiCard}>
          <div
            className={`${styles.iconBox} ${styles[`icon_${kpi.iconTheme}`] || ""}`}
            aria-hidden="true"
          >
            {kpi.icon}
          </div>
          <div className={styles.kpiContent}>
            <div className={styles.kpiValueRow}>
              <span
                className={`${styles.kpiValue} ${kpi.id === "completed" ? styles.valuePrimary : ""}`}
              >
                {stats && !loading
                  ? stats[kpi.field].toLocaleString("vi-VN")
                  : "—"}
              </span>
              {kpi.unit && <span className={styles.kpiUnit}>{kpi.unit}</span>}
              {kpi.badge && (
                <span
                  className={`${styles.kpiBadge} ${styles[`badge_${kpi.badgeType}`] || ""}`}
                >
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
