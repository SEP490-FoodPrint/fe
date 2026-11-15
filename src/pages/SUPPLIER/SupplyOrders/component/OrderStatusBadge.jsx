import React from "react"
import PropTypes from "prop-types"
import { getOrderStatusMeta } from "src/services/SupplierOrderService"
import styles from "./OrderStatusBadge.module.scss"

const TONE_CLASS_MAP = {
  warning: styles.toneWarning,
  success: styles.toneSuccess,
  info: styles.toneInfo,
  muted: styles.toneMuted,
}

function OrderStatusBadge({ status, showDot = false }) {
  const meta = getOrderStatusMeta(status)
  const toneClass = TONE_CLASS_MAP[meta.tone] || styles.toneMuted

  return (
    <span className={`${styles.badge} ${toneClass}`}>
      {showDot && <span className={styles.dot} aria-hidden="true" />}
      <span>{meta.label}</span>
    </span>
  )
}

OrderStatusBadge.propTypes = {
  status: PropTypes.string,
  showDot: PropTypes.bool,
}

export default OrderStatusBadge
