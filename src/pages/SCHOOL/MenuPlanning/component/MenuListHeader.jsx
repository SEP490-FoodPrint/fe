import React, { useContext } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Home, ChevronRight, ShieldCheck } from "lucide-react"
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
        {/* Breadcrumb tối giản */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <button
            type="button"
            className={styles.breadcrumbLink}
            onClick={() => navigate(homePath)}
          >
            <Home size={13} />
            <span>Trang chủ</span>
          </button>
          <ChevronRight size={13} className={styles.chevronIcon} />
          <span className={styles.breadcrumbActive}>Thực đơn học đường</span>
        </nav>

        {/* Tiêu đề trang sạch & Tag nghiệp vụ Y tế */}
        <div className={styles.headingGroup}>
          <div className={styles.titleWithBadge}>
            <h1 className={styles.pageTitle}>Thực đơn học đường</h1>
            <span className={styles.roleBadge}>
              <ShieldCheck size={13} />
              <span>Ban Y tế</span>
            </span>
          </div>
          <p className={styles.pageSubtitle}>
            Lập kế hoạch dinh dưỡng tuần, kiểm soát an toàn dị ứng và theo dõi phê duyệt BGH.
          </p>
        </div>
      </div>

      {/* Nút hành động Tạo thực đơn */}
      <div className={styles.actionArea}>
        <button
          type="button"
          className={styles.createBtn}
          onClick={onNavigateCreate}
          title="Tạo thực đơn mới"
        >
          <Plus size={16} />
          <span>Tạo thực đơn</span>
        </button>
      </div>
    </div>
  )
}
