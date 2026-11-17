import React from "react"
import PropTypes from "prop-types"
import { getComplaintStatusMeta } from "src/services/SupplierComplaintService"
import styles from "./ComplaintStatusBadge.module.scss"

const TONE_CLASS = {
  success: styles.toneSuccess,
  warning: styles.toneWarning,
  muted: styles.toneMuted,
}

function ComplaintStatusBadge({ status }) {
  const meta = getComplaintStatusMeta(status)
  const toneClass = TONE_CLASS[meta.tone] || styles.toneMuted

  return (
    <span className={`${styles.badge} ${toneClass}`}>
      <span className={styles.dot} aria-hidden="true" />
      <span>{meta.label}</span>
    </span>
  )
}

ComplaintStatusBadge.propTypes = {
  status: PropTypes.string,
}

export default ComplaintStatusBadge
