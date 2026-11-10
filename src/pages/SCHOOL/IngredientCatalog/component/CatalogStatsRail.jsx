import React from "react"
import PropTypes from "prop-types"
import { Box, Card, Typography } from "@mui/material"
import { BookOpen, Leaf, Archive, Building2 } from "lucide-react"
import styles from "./CatalogStatsRail.module.scss"

export default function CatalogStatsRail({ stats, onFilterHandlingType }) {
  const cards = [
    {
      id: "all",
      label: "Tổng nguyên liệu chuẩn",
      count: stats.total || 0,
      icon: <BookOpen size={22} />,
      color: "#1e7e34",
      bg: "#e6f4ea",
    },
    {
      id: "DIRECT_USE",
      label: "Tươi sống (dùng trong ngày)",
      count: stats.directUse || 0,
      icon: <Leaf size={22} />,
      color: "#059669",
      bg: "#d1fae5",
    },
    {
      id: "DRY_STOCK",
      label: "Kho khô (lưu kho)",
      count: stats.dryStock || 0,
      icon: <Archive size={22} />,
      color: "#d97706",
      bg: "#fef3c7",
    },
    {
      id: "suppliers",
      label: "Nhà cung cấp đối tác",
      count: stats.suppliersCount || 0,
      icon: <Building2 size={22} />,
      color: "#2563eb",
      bg: "#dbeafe",
    },
  ]

  return (
    <Box className={styles.statsGrid}>
      {cards.map(card => (
        <Card
          key={card.id}
          className={styles.statCard}
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
      ))}
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
  onFilterHandlingType: PropTypes.func.isRequired,
}
