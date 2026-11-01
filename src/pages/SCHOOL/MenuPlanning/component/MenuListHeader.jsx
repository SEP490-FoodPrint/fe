import React from "react"
import { useNavigate } from "react-router-dom"
import styles from "./MenuListHeader.module.scss"
import ROUTER from "src/router/ROUTER"

export default function MenuListHeader({ onNavigateCreate }) {
  const navigate = useNavigate()

  return (
    <div className={styles.headerContainer}>
      <div className={styles.titleArea}>
        {/* Subdued Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <button
            type="button"
            className={styles.breadcrumbLink}
            onClick={() => navigate(ROUTER.SCHOOL_HEALTH_OVERVIEW)}
          >
            Trang chủ
          </button>
          <span className={`material-symbols-outlined ${styles.chevronIcon}`}>chevron_right</span>
          <span className={styles.breadcrumbActive}>Thực đơn</span>
        </nav>

        {/* Primary Title & Subtitle */}
        <div className={styles.headingGroup}>
          <h1 className={styles.pageTitle}>Danh sách thực đơn</h1>
          <p className={styles.pageSubtitle}>
            Quản lý thực đơn theo ngày, bữa ăn và trạng thái phê duyệt.
          </p>
        </div>
      </div>

      {/* Header Action Button */}
      <div className={styles.actionArea}>
        <button
          type="button"
          className={styles.createBtn}
          onClick={onNavigateCreate}
        >
          <span className={`material-symbols-outlined ${styles.addIcon}`}>add</span>
          <span>Tạo thực đơn</span>
        </button>
      </div>
    </div>
  )
}

