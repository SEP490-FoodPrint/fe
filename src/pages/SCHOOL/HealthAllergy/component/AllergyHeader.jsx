import React from "react"
import { ShieldCheck, Stethoscope } from "lucide-react"
import styles from "./AllergyHeader.module.scss"

export default function AllergyHeader() {
  return (
    <div className={styles.headerContainer}>
      <div className={styles.titleArea}>
        <div className={styles.titleRow}>
          <div className={styles.iconBadge}>
            <Stethoscope size={22} className={styles.headerIcon} />
          </div>
          <div>
            <div className={styles.titleWithTag}>
              <h1 className={styles.title}>Thông tin dị ứng</h1>
              <span className={styles.badgeReadonly}>
                <ShieldCheck size={14} />
                Chế độ tra cứu
              </span>
            </div>
            <p className={styles.description}>
              Theo dõi thông tin dị ứng được tổng hợp theo từng lớp học, phục vụ việc kiểm tra nguyên liệu khi lập và duyệt thực đơn.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
