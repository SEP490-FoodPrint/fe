import React from "react"
import PropTypes from "prop-types"
import { getDeliveryStatusMeta } from "src/services/SupplierDeliveryService"
import styles from "./DeliveryStatusBadge.module.scss"

const TONE_CLASS_MAP = {
  warning: styles.toneWarning,
  success: styles.toneSuccess,
  info: styles.toneInfo,
  error: styles.toneError,
  muted: styles.toneMuted,
}

function DeliveryStatusBadge({ status, statusLabel = "" }) {
  const meta = getDeliveryStatusMeta(status, statusLabel)
  const toneClass = TONE_CLASS_MAP[meta.tone] || styles.toneMuted

  return (
    <span className={`${styles.badge} ${toneClass}`}>
      <span>{meta.label}</span>
    </span>
  )
}

DeliveryStatusBadge.propTypes = {
  status: PropTypes.string,
  statusLabel: PropTypes.string,
}

export default DeliveryStatusBadge
