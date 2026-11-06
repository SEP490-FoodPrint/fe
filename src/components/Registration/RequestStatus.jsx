import React from "react"
import { REQUEST_STATUSES } from "src/lib/registration"
import styles from "./RequestStatus.module.scss"

export default function RequestStatus({ status, variant = "text" }) {
  return <span className={`${styles.status} ${styles[status] || ""} ${variant === "badge" ? styles.badge : ""}`}>{REQUEST_STATUSES[status] || status || "Chưa có"}</span>
}
