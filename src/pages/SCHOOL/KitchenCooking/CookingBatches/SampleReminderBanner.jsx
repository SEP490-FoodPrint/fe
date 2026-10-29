import React from "react"
import styles from "./SampleReminderBanner.module.scss"

function SampleReminderBanner() {
  return (
    <div className={styles.banner}>
      <div className={styles.left}>
        <div className={styles.iconBox}>
          <span className="material-symbols-outlined">shield</span>
        </div>
        <p className={styles.text}>
          <strong className={styles.boldText}>Quy chuẩn lưu mẫu thực phẩm 24h:</strong> Mẫu lưu tối
          thiểu 100g trong hộp tiệt trùng sau khi hoàn thành mẻ.
        </p>
      </div>

      <a href="#sample-book" className={styles.link}>
        <span>Sổ lưu mẫu</span>
        <span className="material-symbols-outlined">arrow_forward</span>
      </a>
    </div>
  )
}

export default SampleReminderBanner
