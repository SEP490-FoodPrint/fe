import React, { useContext } from "react"
import { useNavigate } from "react-router-dom"
import styles from "./MenuListHeader.module.scss"
import ROUTER from "src/router/ROUTER"
import { StoreContext } from "src/contexts"
import { ROLES } from "src/constants/roles"

export default function MenuListHeader({ onNavigateCreate }) {
  const navigate = useNavigate()
  const { userStore } = useContext(StoreContext) || {}
  const user = userStore?.user

  const isKitchenStaff = user?.role === ROLES.SCHOOL_KITCHEN_STAFF
  const homePath = isKitchenStaff
    ? ROUTER.SCHOOL_KITCHEN_COOKING
    : ROUTER.SCHOOL_HEALTH_OVERVIEW

  return (
    <div className={styles.headerContainer}>
      <div className={styles.titleArea}>
        {/* Subdued Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <button
            type="button"
            className={styles.breadcrumbLink}
            onClick={() => navigate(homePath)}
          >
            Trang chủ
          </button>
          <span className={`material-symbols-outlined ${styles.chevronIcon}`}>
            chevron_right
          </span>
          <span className={styles.breadcrumbActive}>Danh sách thực đơn</span>
        </nav>

        {/* Primary Title & Subtitle */}
        <div className={styles.headingGroup}>
          <h1 className={styles.pageTitle}>Danh sách thực đơn</h1>
          <p className={styles.pageSubtitle}>
            Quản lý và theo dõi thực đơn theo năm, tuần học đường, ca ăn và trạng thái duyệt.
          </p>
        </div>
      </div>

      {/* Header Action Button (Chỉ hiển thị cho vai trò được tạo thực đơn) */}
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
