import React from "react"
import PropTypes from "prop-types"
import styles from "../FoodSafetyIncidents.module.scss"

const TONE_CLASS = {
  success: styles.toneSuccess,
  warning: styles.toneWarning,
  danger: styles.toneDanger,
  info: styles.toneInfo,
  muted: styles.toneMuted,
}

function IncidentStatusBadge({ label, tone = "muted" }) {
  const toneClass = TONE_CLASS[tone] || styles.toneMuted
  return (
    <span className={`${styles.badge} ${toneClass}`}>
      <span className={styles.badgeDot} aria-hidden="true" />
      <span>{label}</span>
    </span>
  )
}

IncidentStatusBadge.propTypes = {
  label: PropTypes.string.isRequired,
  tone: PropTypes.oneOf(["success", "warning", "danger", "info", "muted"]),
}

export default IncidentStatusBadge
