import React from "react"
import PropTypes from "prop-types"
import {
  CheckCircleOutlined,
  PauseCircleOutlined,
  StorefrontOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material"
import styles from "./FacilitySummaryCards.module.scss"

const CARD_ITEMS = [
  {
    key: "ALL",
    label: "Tổng số cơ sở",
    statKey: "total",
    icon: StorefrontOutlined,
    toneClass: "toneNeutral",
  },
  {
    key: "ACTIVE",
    label: "Đang hợp tác",
    statKey: "active",
    icon: CheckCircleOutlined,
    toneClass: "toneSuccess",
  },
  {
    key: "PAUSED",
    label: "Tạm ngừng",
    statKey: "paused",
    icon: PauseCircleOutlined,
    toneClass: "toneMuted",
  },
  {
    key: "ATTENTION",
    label: "Hồ sơ cần chú ý",
    statKey: "attention",
    icon: WarningAmberOutlined,
    toneClass: "toneWarning",
  },
]

function FacilitySummaryCards({ stats, activeQuickFilter = "ALL", onSelectFilter }) {
  return (
    <section
      className={styles.summaryGrid}
      aria-label="Thống kê cơ sở nguồn cung"
    >
      {CARD_ITEMS.map(card => {
        const Icon = card.icon
        const value = stats?.[card.statKey] ?? 0
        const isSelected = activeQuickFilter === card.key

        return (
          <button
            key={card.key}
            type="button"
            className={`${styles.statCard} ${styles[card.toneClass]} ${
              isSelected ? styles.isSelected : ""
            }`}
            aria-pressed={isSelected}
            onClick={() => onSelectFilter?.(card.key)}
          >
            <div className={styles.statTopRow}>
              <span className={styles.statLabel}>{card.label}</span>
              <span className={styles.statIconBox} aria-hidden="true">
                <Icon className={styles.statIcon} />
              </span>
            </div>
            <strong className={styles.statValue}>{value}</strong>
          </button>
        )
      })}
    </section>
  )
}

FacilitySummaryCards.propTypes = {
  stats: PropTypes.shape({
    total: PropTypes.number,
    active: PropTypes.number,
    paused: PropTypes.number,
    attention: PropTypes.number,
  }),
  activeQuickFilter: PropTypes.string,
  onSelectFilter: PropTypes.func,
}

export default FacilitySummaryCards
