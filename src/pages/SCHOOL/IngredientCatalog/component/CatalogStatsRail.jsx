import React from "react"
import PropTypes from "prop-types"
import { Box, Card, Typography } from "@mui/material"
import { BookOpen, Leaf, Archive, Building2 } from "lucide-react"
import styles from "./CatalogStatsRail.module.scss"

export default function CatalogStatsRail({ stats, activeFilter, onFilterHandlingType }) {
  const cards = [
    {
      id: "all",
      label: "Tổng nguyên liệu chuẩn",
      count: stats.total || 0,

    },
    {
      id: "DIRECT_USE",
      label: "Tươi sống (dùng trong ngày)",
      count: stats.directUse || 0,

    },
    {
      id: "DRY_STOCK",
      label: "Kho khô (lưu kho)",
      count: stats.dryStock || 0,

    },
    {
      id: "suppliers",
      label: "Nhà cung cấp đối tác",
      count: stats.suppliersCount || 0,

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
            onClick={() => {
              if (["all", "DIRECT_USE", "DRY_STOCK"].includes(card.id)) {
                onFilterHandlingType(card.id)
              }
            }}
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

CatalogStatsRail.propTypes = {
  stats: PropTypes.shape({
    total: PropTypes.number,
    directUse: PropTypes.number,
    dryStock: PropTypes.number,
    suppliersCount: PropTypes.number,
  }).isRequired,
  activeFilter: PropTypes.string,
  onFilterHandlingType: PropTypes.func.isRequired,
}
