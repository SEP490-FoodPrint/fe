import React from "react"
import styles from "./CreateMenuHeader.module.scss"

export default function CreateMenuHeader({ onBack, selectedDayMenu, readOnly = false, statusLabel }) {
  const hasMeal = Boolean(selectedDayMenu?.hasMeal)
  return (
    <div className={styles.headerContainer}>
      <div className={styles.titleRow}>
        <div className={styles.titleBlock}>
          <div className={styles.titleWithBadge}>
            <span className={styles.statusPill}>
              <span className={styles.statusDot}></span>
              {hasMeal ? statusLabel : "Bản nháp mới"}
            </span>
          </div>
          <p className={styles.pageSubtitle}>
            Khai báo cơ cấu món ăn, chọn nguyên liệu từ các Nhà cung cấp liên kết và bố trí suất ăn riêng cho học sinh dị ứng.
          </p>
        </div>

        <button type="button" className={styles.backBtn} onClick={onBack}>
          <span className={`material-symbols-outlined ${styles.backIcon}`}>arrow_back</span>
          <span>Quay lại danh sách</span>
        </button>
      </div>
    </div>
  )
}
