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

    },
    {
      id: "BATCH_1",
      label: "Đợt 1 (50% Suất tối đa)",
      count: stats.batch1Count || 0,

    },
    {
      id: "BATCH_2",
      label: "Đợt 2 (Cân đối sĩ số)",
      count: stats.batch2Count || 0,
    },
    {
      id: "COMPLETED",
      label: "Đã duyệt 4/4 & Vào bếp",
      count: stats.completedCount || 0,

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
