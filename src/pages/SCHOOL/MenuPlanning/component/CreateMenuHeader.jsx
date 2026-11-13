import React from "react"
import styles from "./CreateMenuHeader.module.scss"

export default function CreateMenuHeader({ onBack, selectedDayMenu, readOnly = false, statusLabel, title, subtitle }) {
  const hasMeal = Boolean(selectedDayMenu?.hasMeal)
  return (
    <div className={styles.headerContainer}>
      <div className={styles.titleRow}>
        <div className={styles.titleBlock}>
          <div className={styles.titleWithBadge}>
            <h1 className={styles.pageTitle}>{title || (readOnly ? "Xem thực đơn" : hasMeal ? "Chỉnh sửa thực đơn" : "Tạo thực đơn")}</h1>
            <span className={styles.statusPill}>
              <span className={styles.statusDot}></span>
              {statusLabel || (hasMeal ? "Chỉnh sửa" : "Bản nháp mới")}
            </span>
          </div>
          <p className={styles.pageSubtitle}>
            {subtitle || "Chọn món từ danh sách món ăn bán trú để thiết lập cơ cấu dinh dưỡng và hoàn thiện thực đơn tuần học đường."}
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
