import React from "react"
import PropTypes from "prop-types"
import {
  getContractStatusMeta,
  getRelationshipStatusMeta,
  getSchoolStatusMeta,
} from "src/services/SupplierSchoolService"
import styles from "./SchoolStatusBadge.module.scss"

const TONE_CLASS = {
  success: styles.toneSuccess,
  warning: styles.toneWarning,
  info: styles.toneInfo,
  muted: styles.toneMuted,
}

function getMetaByKind(kind, status) {
  if (kind === "school") return getSchoolStatusMeta(status)
  if (kind === "contract") return getContractStatusMeta(status)
  return getRelationshipStatusMeta(status)
}

function SchoolStatusBadge({ kind = "relationship", status }) {
  const meta = getMetaByKind(kind, status)
  const toneClass = TONE_CLASS[meta.tone] || styles.toneMuted

  return (
    <span className={`${styles.badge} ${toneClass}`}>
      <span className={styles.dot} aria-hidden="true" />
      <span>{meta.label}</span>
    </span>
  )
}

SchoolStatusBadge.propTypes = {
  kind: PropTypes.oneOf(["relationship", "school", "contract"]),
  status: PropTypes.string,
}

export default SchoolStatusBadge
