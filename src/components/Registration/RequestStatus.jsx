import React from "react"
import { REQUEST_STATUSES } from "src/lib/registration"
import styles from "./RequestStatus.module.scss"

export default function RequestStatus({ status }) {
  return <span className={`${styles.status} ${styles[status] || ""}`}>{REQUEST_STATUSES[status] || status || "Chưa có"}</span>
}
