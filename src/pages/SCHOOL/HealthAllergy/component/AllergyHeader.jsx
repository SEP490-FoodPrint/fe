import React from "react"
import { ShieldCheck, HeartPulse } from "lucide-react"
import styles from "./AllergyHeader.module.scss"

export default function AllergyHeader() {
  return (
    <div className={styles.pageHeader}>
      <div className={styles.titleWrap}>
        <div className={styles.titleRow}>
          <HeartPulse size={22} className={styles.headerIcon} />
          <h1 className={styles.pageTitle}>Thông tin dị ứng</h1>
          <span className={styles.badgeReadonly}>
            <ShieldCheck size={13} />
            <span>Tra cứu</span>
          </span>
        </div>
        <p className={styles.pageSubtitle}>
          Theo dõi thông tin dị ứng được tổng hợp theo từng lớp học phục vụ kiểm tra nguyên liệu thực đơn
        </p>
      </div>
    </div>
  )
}
