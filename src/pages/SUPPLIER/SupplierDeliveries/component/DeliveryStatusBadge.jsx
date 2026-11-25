import React from "react"
import PropTypes from "prop-types"
import { DELIVERY_STATUS, getDeliveryStatusMeta, PREPARATION_STAGE_LABEL } from "src/services/SupplierDeliveryService"
import styles from "./DeliveryStatusBadge.module.scss"

const TONE_CLASS_MAP = {
  warning: styles.toneWarning,
  success: styles.toneSuccess,
  info: styles.toneInfo,
  error: styles.toneError,
  muted: styles.toneMuted,
}

function DeliveryStatusBadge({ status, statusLabel = "", preparationStage }) {
  const label = status === DELIVERY_STATUS.PREPARING ? PREPARATION_STAGE_LABEL[preparationStage] : null
  const meta = getDeliveryStatusMeta(status, label || statusLabel)
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
  preparationStage: PropTypes.string,
}

export default DeliveryStatusBadge
