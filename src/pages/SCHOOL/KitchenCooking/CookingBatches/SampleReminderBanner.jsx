import React, { useState } from "react"
import { ShieldCheck, ChevronRight, X } from "lucide-react"
import styles from "./SampleReminderBanner.module.scss"

function SampleReminderBanner() {
  const [closed, setClosed] = useState(false)

  if (closed) return null

  return (
    <div className={styles.slimTipBar} role="note" aria-label="Quy chuẩn lưu mẫu thực phẩm">
      <div className={styles.tipLeft}>
        <ShieldCheck size={16} className={styles.tipIcon} aria-hidden="true" />
        <p className={styles.tipText}>
          <strong className={styles.boldText}>Lưu mẫu 24h:</strong> Tối thiểu 100g/món trong hộp tiệt trùng sau khi nấu xong.
        </p>
      </div>

      <div className={styles.tipRight}>
        <a href="#sample-log" className={styles.tipLink}>
          <span>Sổ lưu mẫu</span>
          <ChevronRight size={14} />
        </a>
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
