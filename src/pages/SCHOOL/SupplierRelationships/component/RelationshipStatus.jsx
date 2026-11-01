import React from "react"
import PropTypes from "prop-types"
import styles from "./RelationshipStatus.module.scss"

const LABELS = {
  ACTIVE: "Đang liên kết",
  SUSPENDED: "Tạm dừng",
  UNLINKED: "Đã hủy liên kết",
  NONE: "Chưa liên kết",
}

function RelationshipStatus({ status }) {
  const normalized = status || "NONE"
  return (
    <span className={`${styles.status} ${styles[normalized.toLowerCase()]}`}>
      <span className={styles.dot} aria-hidden="true" />
      {LABELS[normalized] || normalized}
    </span>
  )
}

RelationshipStatus.propTypes = {
  status: PropTypes.string,
}

export default RelationshipStatus
