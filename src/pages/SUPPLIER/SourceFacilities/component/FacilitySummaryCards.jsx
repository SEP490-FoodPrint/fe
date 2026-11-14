import React from "react"
import PropTypes from "prop-types"
import {
  CheckCircleOutlined,
  PauseCircleOutlined,
  StorefrontOutlined,
} from "@mui/icons-material"
import styles from "./FacilitySummaryCards.module.scss"

const CARD_ITEMS = [
  {
    key: "ALL",
    label: "Cơ sở trên trang",
    statKey: "total",
    icon: StorefrontOutlined,
    toneClass: "toneNeutral",
  },
  {
    key: "ACTIVE",
    label: "Đang hoạt động",
    statKey: "active",
    icon: CheckCircleOutlined,
    toneClass: "toneSuccess",
  },
  {
    key: "INACTIVE",
    label: "Ngừng hoạt động",
    statKey: "inactive",
    icon: PauseCircleOutlined,
    toneClass: "toneMuted",
  },
]

function FacilitySummaryCards({ stats, activeStatusFilter = "ALL", onSelectStatus }) {
  return (
    <section
      className={styles.summaryGrid}
      aria-label="Thống kê cơ sở nguồn cung"
    >
      {CARD_ITEMS.map(card => {
        const Icon = card.icon
        const value = stats?.[card.statKey] ?? 0
        const isSelected = activeStatusFilter === card.key

        return (
          <button
            key={card.key}
            type="button"
            className={`${styles.statCard} ${styles[card.toneClass]} ${
              isSelected ? styles.isSelected : ""
            }`}
            aria-pressed={isSelected}
            onClick={() => onSelectStatus?.(card.key)}
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
    inactive: PropTypes.number,
  }),
  activeStatusFilter: PropTypes.string,
  onSelectStatus: PropTypes.func,
}

export default FacilitySummaryCards
