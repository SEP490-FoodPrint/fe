import React from "react"
import PropTypes from "prop-types"
import { Box, Card, Typography } from "@mui/material"
import { Package, AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react"
import styles from "./WarehouseStatsRail.module.scss"

export default function WarehouseStatsRail({ stats, activeFilter, onFilterChange }) {
  const cards = [
    {
      id: "all",
      label: "Tổng mặt hàng",
      count: stats.total || 0,
    },
    {
      id: "CRITICAL_LOW",
      label: "Dưới 50% tồn kho",
      count: stats.criticalLowCount || 0,
    },
    {
      id: "WARNING",
      label: "Trên 50% tồn kho",
      count: stats.warningCount || 0,
    },
    {
      id: "SAFE",
      label: "Tồn kho an toàn",
      count: stats.safeStockCount || 0,
    },
  ]

  return (
    <Box className={styles.statsGrid}>
      {cards.map(card => {
        const isActive = activeFilter === card.id
        return (
          <Card
            key={card.id}
            className={`${styles.statCard} ${isActive ? styles.activeCard : ""}`}
            onClick={() => onFilterChange(card.id)}
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

WarehouseStatsRail.propTypes = {
  stats: PropTypes.shape({
    total: PropTypes.number,
    criticalLowCount: PropTypes.number,
    warningCount: PropTypes.number,
    safeStockCount: PropTypes.number,
  }).isRequired,
  activeFilter: PropTypes.string,
  onFilterChange: PropTypes.func.isRequired,
}
