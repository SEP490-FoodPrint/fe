import React from "react"
import PropTypes from "prop-types"
import { getStaffStatusMeta } from "src/services/SupplierStaffService"
import styles from "./StaffStatusBadge.module.scss"

const TONE_CLASS_MAP = {
  success: styles.toneSuccess,
  warning: styles.toneWarning,
  info: styles.toneInfo,
  muted: styles.toneMuted,
}

function StaffStatusBadge({ status }) {
  const meta = getStaffStatusMeta(status)
  const toneClass = TONE_CLASS_MAP[meta.tone] || styles.toneMuted

  return (
    <span className={`${styles.badge} ${toneClass}`}>
      <span className={styles.dot} aria-hidden="true" />
      <span>{meta.label}</span>
    </span>
  )
}

StaffStatusBadge.propTypes = {
  status: PropTypes.string,
}

export default StaffStatusBadge
