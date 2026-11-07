import React from "react"
import PropTypes from "prop-types"
import { Box, Card, Typography } from "@mui/material"
import { Package, Sunrise, Users, CheckCircle2 } from "lucide-react"
import styles from "./DeliveryStatsRail.module.scss"

export default function DeliveryStatsRail({ stats, onFilterBatchType, activeBatchFilter }) {
  const cards = [
    {
      id: "all",
      label: "Tổng phiếu giao nhận",
      count: stats.total || 0,
      icon: <Package size={22} />,
      color: "var(--color-primary, #1e7e34)",
      bg: "var(--color-primary-soft, #e6f4ea)",
      subtext: "Bao gồm cả 2 đợt giao",
    },
    {
      id: "BATCH_1",
      label: "Đợt 1 (50% Suất tối đa)",
      count: stats.batch1Count || 0,
      icon: <Sunrise size={22} />,
      color: "#0284c7",
      bg: "#e0f2fe",
      subtext: "Giao sớm 5h30 để sơ chế",
    },
    {
      id: "WAITING_ATTENDANCE",
      label: "Đợt 2: Chờ sĩ số GVCN",
      count: stats.waitingAttendanceCount || 0,
      icon: <Users size={22} />,
      color: "#d97706",
      bg: "#fffbeb",
      subtext: "Cân đối sát sĩ số học sinh",
    },
    {
      id: "COMPLETED",
      label: "Đã duyệt 4/4 & Vào bếp",
      count: stats.completedCount || 0,
      icon: <CheckCircle2 size={22} />,
      color: "#059669",
      bg: "#ecfdf5",
      subtext: "Hoàn tất kiểm tra cổng trường",
    },
  ]

  return (
    <Box className={styles.statsGrid}>
      {cards.map(card => {
        const isActive = activeBatchFilter === card.id
        return (
          <Card
            key={card.id}
            className={`${styles.statCard} ${isActive ? styles.activeCard : ""}`}
            onClick={() => onFilterBatchType(card.id)}
            tabIndex={0}
            role="button"
          >
            <Box className={styles.statContent}>
              <Typography variant="body2" className={styles.statLabel}>
                {card.label}
              </Typography>
              <Typography variant="h4" className={styles.statCount}>
                {card.count}
              </Typography>
              {card.subtext && (
                <Typography variant="caption" className={styles.statSubtext}>
                  {card.subtext}
                </Typography>
              )}
            </Box>
            <Box className={styles.iconCircle} style={{ color: card.color, backgroundColor: card.bg }}>
              {card.icon}
            </Box>
          </Card>
        )
      })}
    </Box>
  )
}

DeliveryStatsRail.propTypes = {
  stats: PropTypes.shape({
    total: PropTypes.number,
    batch1Count: PropTypes.number,
    waitingAttendanceCount: PropTypes.number,
    completedCount: PropTypes.number,
  }).isRequired,
  onFilterBatchType: PropTypes.func.isRequired,
  activeBatchFilter: PropTypes.string,
}
