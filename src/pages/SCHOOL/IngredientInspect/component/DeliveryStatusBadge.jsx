import React from "react"
import PropTypes from "prop-types"
import { DELIVERY_STATUS_CONFIG } from "../mockDeliveryData"
import styles from "./DeliveryStatusBadge.module.scss"

export default function DeliveryStatusBadge({ status }) {
  const config = DELIVERY_STATUS_CONFIG[status] || {
    label: status || "Không rõ",
    bg: "#f1f5f9",
    color: "#64748b",
    border: "#e2e8f0",
    dot: "#94a3b8",
  }

  return (
    <span
      className={styles.badge}
      style={{
        backgroundColor: config.bg,
        color: config.color,
        borderColor: config.border,
      }}
    >
      <span
        className={`${styles.dot} ${config.pulse ? styles.pulse : ""}`}
        style={{ backgroundColor: config.dot }}
      />
      <span className={styles.label}>{config.label}</span>
    </span>
  )
}

DeliveryStatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
}
