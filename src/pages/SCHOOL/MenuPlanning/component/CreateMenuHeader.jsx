import React from "react"
import styles from "./CreateMenuHeader.module.scss"

export default function CreateMenuHeader({ onBack }) {
  return (
    <div className={styles.headerContainer}>
      <div className={styles.topRow}>
        <div className={styles.breadcrumb}>
          <span className={styles.crumbItem}>Trang chủ</span>
          <span className={styles.crumbSeparator}>/</span>
          <span className={styles.crumbItem}>Thực đơn</span>
          <span className={styles.crumbSeparator}>/</span>
          <span className={`${styles.crumbItem} ${styles.activeCrumb}`}>Tạo mới</span>
        </div>
        <button type="button" className={styles.backBtn} onClick={onBack}>
          <span className={`material-symbols-outlined ${styles.backIcon}`}>arrow_back</span>
          <span>Quay lại danh sách</span>
        </button>
      </div>

      <div className={styles.titleRow}>
        <div className={styles.titleBlock}>
          <h1 className={styles.pageTitle}>Tạo thực đơn</h1>
          <p className={styles.pageSubtitle}>
            Khai báo cơ cấu món ăn, kiểm tra tương thích dị ứng theo lớp và tính toán nhu cầu nguyên liệu.
          </p>
        </div>
        <div className={styles.badgeGroup}>
          <span className={styles.statusPill}>
            <span className={styles.statusDot}></span>
            Bản nháp mới
          </span>
        </div>
      </div>
    </div>
  )
}

