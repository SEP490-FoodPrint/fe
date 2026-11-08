import React from "react"
import { CookingPot, Clock, CheckCircle2 } from "lucide-react"
import styles from "./CookingBatchesKPI.module.scss"

function CookingBatchesKPI({ stats, loading, selectedWeekObj, isAllWeeks = false }) {
  const isCurrentWeek = Boolean(selectedWeekObj?.isCurrentWeek && !isAllWeeks)
  const weekLabel = isAllWeeks
    ? "Tổng lô năm học"
    : isCurrentWeek
      ? "Lô tuần này"
      : selectedWeekObj?.shortLabel
        ? `Lô ${selectedWeekObj.shortLabel}`
        : "Lô trong tuần"

  const weekBadge = isAllWeeks
    ? "Cả năm"
    : isCurrentWeek
      ? "Tuần này"
      : selectedWeekObj?.shortLabel || "Theo tuần"

  const total = stats?.total ?? 0
  const totalCreatedHint = stats && !loading
    ? (isCurrentWeek
        ? `Tuần này đã tạo ${total.toLocaleString("vi-VN")} lô`
        : isAllWeeks
          ? `Năm học đã tạo ${total.toLocaleString("vi-VN")} lô`
          : `${selectedWeekObj?.shortLabel || "Tuần"} đã tạo ${total.toLocaleString("vi-VN")} lô`)
    : undefined

  const kpiList = [
    {
      id: "total",
      label: weekLabel,
      field: "total",
      unit: "lô",
      badge: weekBadge,
      badgeType: "primary",
      hint: totalCreatedHint,
      icon: <CookingPot size={16} />,
      iconTheme: "primary",
    },
    {
      id: "pending",
      label: "Chờ nấu",
      field: "confirmed",
      unit: "lô",
      icon: <Clock size={16} />,
      iconTheme: "warning",
    },
    {
      id: "completed",
      label: "Đã hoàn thành",
      field: "completed",
      unit: "lô",
      icon: <CheckCircle2 size={16} />,
      iconTheme: "success",
    },
  ]

  return (
    <div
      className={styles.kpiGrid}
      role="region"
      aria-label="Thống kê lô chế biến theo bộ lọc"
      aria-busy={loading}
    >
      {kpiList.map((kpi) => (
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
            <span className={styles.kpiLabel} title={kpi.hint || kpi.label}>
              {kpi.label}
            </span>
            {kpi.hint && (
              <span className={styles.kpiSubHint} title={kpi.hint}>
                {kpi.hint}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default CookingBatchesKPI
