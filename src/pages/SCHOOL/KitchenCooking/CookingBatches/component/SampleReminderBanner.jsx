import React, { useState } from "react"
import { ShieldCheck, ChevronRight, X } from "lucide-react"
import { Link } from "react-router-dom"
import ROUTER from "src/router/ROUTER"
import styles from "./SampleReminderBanner.module.scss"

function SampleReminderBanner({ pendingSamples }) {
  const [closed, setClosed] = useState(false)

  if (closed || !pendingSamples) return null

  return (
    <div
      className={styles.slimTipBar}
      role="note"
      aria-label="Các lô hoàn thành chưa lưu mẫu"
    >
      <div className={styles.tipLeft}>
        <ShieldCheck size={16} className={styles.tipIcon} aria-hidden="true" />
        <p className={styles.tipText}>
          <strong className={styles.boldText}>
            {pendingSamples.toLocaleString("vi-VN")} lô đã xong chưa lưu mẫu 24h
          </strong>
        </p>
      </div>

      <div className={styles.tipRight}>
        <Link to={ROUTER.SCHOOL_KITCHEN_SAMPLES} className={styles.tipLink}>
          <span>Sổ lưu mẫu</span>
          <ChevronRight size={14} />
        </Link>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={() => setClosed(true)}
          aria-label="Đóng nhắc nhở"
          title="Đóng nhắc nhở"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}

export default SampleReminderBanner
