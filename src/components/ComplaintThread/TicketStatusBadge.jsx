import React from "react"
import NorthEastIcon from "@mui/icons-material/NorthEast"
import { getTicketStatusMeta } from "./ticketHelpers"
import styles from "./TicketStatusBadge.module.scss"

const TONE_CLASS = {
  info: styles.toneInfo,
  success: styles.toneSuccess,
  warning: styles.toneWarning,
  muted: styles.toneMuted,
}

export default function TicketStatusBadge({
  status,
  hasNewMessage = false,
  escalated = false,
  size = "md",
  showNewMessageText = false,
  className = "",
}) {
  const meta = getTicketStatusMeta(status)
  const toneClass = TONE_CLASS[meta.tone] || styles.toneMuted

  return (
    <span className={`${styles.wrap} ${className}`.trim()}>
      <span
        className={`${styles.badge} ${toneClass} ${size === "sm" ? styles.sm : ""}`.trim()}
      >
        {meta.label}
      </span>
      {escalated ? (
        <span
          className={`${styles.badge} ${styles.toneEscalated} ${size === "sm" ? styles.sm : ""}`.trim()}
          title="Khiếu nại đã được leo thang lên Cơ quan An toàn thực phẩm"
        >
          <NorthEastIcon className={styles.escalatedIcon} aria-hidden="true" />
          Leo thang
        </span>
      ) : null}
      {hasNewMessage ? (
        <span
          className={styles.newMsgTag}
          title="Có tin nhắn mới từ người gửi"
          aria-label="Có tin nhắn mới"
        >
          <span className={styles.newMsgDot} aria-hidden="true" />
          {showNewMessageText ? <span>Tin mới</span> : null}
        </span>
      ) : null}
    </span>
  )
}
