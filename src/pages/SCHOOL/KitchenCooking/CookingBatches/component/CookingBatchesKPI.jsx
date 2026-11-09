import React from "react";
import { CookingPot, Clock, CheckCircle2 } from "lucide-react";
import styles from "./CookingBatchesKPI.module.scss";

function CookingBatchesKPI({
  stats,
  loading,
  selectedWeekObj,
  isAllWeeks = false,
}) {
  const isCurrentWeek = Boolean(selectedWeekObj?.isCurrentWeek && !isAllWeeks);
  const weekLabel = isAllWeeks
    ? "Tổng lô cả năm"
    : isCurrentWeek
      ? "Lô tuần này"
      : selectedWeekObj?.shortLabel
        ? `Lô ${selectedWeekObj.shortLabel}`
        : "Tổng lô trong tuần";

  const weekTooltip = isAllWeeks
    ? "Tổng số lô chế biến trong cả năm học"
    : isCurrentWeek
      ? "Tổng số lô chế biến đã tạo trong tuần này"
      : `Tổng số lô chế biến trong ${selectedWeekObj?.shortLabel || "tuần"}`;

  const kpiList = [
    {
      id: "total",
      label: weekLabel,
      field: "total",
      unit: "lô",
      tooltip: weekTooltip,
      icon: <CookingPot size={16} />,
      iconTheme: "primary",
    },
    {
      id: "pending",
      label: "Chờ nấu",
      field: "confirmed",
      unit: "lô",
      tooltip: "Số lô đang ở trạng thái chờ nấu",
      icon: <Clock size={16} />,
      iconTheme: "warning",
    },
    {
      id: "completed",
      label: "Đã hoàn thành",
      field: "completed",
      unit: "lô",
      tooltip: "Số lô đã nấu xong hoàn thành",
      icon: <CheckCircle2 size={16} />,
      iconTheme: "success",
    },
  ];

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
            <span className={styles.kpiLabel} title={kpi.tooltip || kpi.label}>
              {kpi.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CookingBatchesKPI;
