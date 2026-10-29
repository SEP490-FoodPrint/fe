import React, { useContext } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { StoreContext } from "src/contexts"
import AuthService from "src/services/AuthService"
import ROUTER from "src/router/ROUTER"
import BrandLogo from "src/components/Common/BrandLogo"
import styles from "./KitchenSidebar.module.scss"

const NAV_ITEMS = [
  {
    key: "home",
    path: ROUTER.SCHOOL_KITCHEN_COOKING,
    label: "Trang chủ",
    icon: "home",
  },
  {
    key: "menu",
    path: "#menu",
    label: "Thực đơn đã lên",
    icon: "restaurant_menu",
  },
  {
    key: "cooking-batches",
    path: "#batches",
    label: "Mẻ chế biến",
    icon: "soup_kitchen",
  },
  {
    key: "meal-allocations",
    path: "#allocations",
    label: "Phân bổ suất ăn",
    icon: "room_service",
  },
  {
    key: "ingredients",
    path: "#ingredients",
    label: "Danh sách nguyên liệu",
    icon: "inventory_2",
  },
  {
    key: "samples",
    path: "#samples",
    label: "Mẫu lưu thực phẩm",
    icon: "science",
  },
  {
    key: "inspections",
    path: "#inspections",
    label: "Đánh giá nguyên liệu",
    icon: "fact_check",
    badge: "1",
  },
  {
    key: "traceability",
    path: "#traceability",
    label: "Truy xuất nguồn gốc",
    icon: "qr_code_scanner",
  },
]

function KitchenSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { loginStore, userStore } = useContext(StoreContext)
  const user = userStore?.user
  const setIsLoginContext = loginStore?.setIsLoginContext
  const setUser = userStore?.setUser

  const handleLogout = () => {
    AuthService.logout()
    if (setIsLoginContext) setIsLoginContext(false)
    if (setUser) setUser(null)
    navigate(ROUTER.LOGIN)
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.topSection}>
        {/* Brand Header */}
        <div className={styles.brandHeader}>
          <BrandLogo
            theme="dark"
            subtitle="VẬN HÀNH BẾP ĂN"
            onClick={() => navigate(ROUTER.SCHOOL_KITCHEN_COOKING)}
            style={{ cursor: "pointer" }}
          />

          {/* Safety Badge */}
          <div className={styles.safetyBadge}>
            <div className={styles.safetyLeft}>
              <span className="material-symbols-outlined">verified_user</span>
              <span className={styles.safetyText}>
                An toàn bếp: <strong>98.6%</strong>
              </span>
            </div>
            <span className={styles.vsattpTag}>VSATTP</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className={styles.navMenu}>
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.path === location.pathname ||
              (item.key === "home" &&
                (location.pathname === ROUTER.SCHOOL_KITCHEN_COOKING ||
                  location.pathname === "/school/overview"))
            return (
              <a
                key={item.key}
                href={item.path}
                onClick={(e) => {
                  if (item.path.startsWith("/")) {
                    e.preventDefault()
                    navigate(item.path)
                  }
                }}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
              >
                <div className={styles.navItemLeft}>
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={styles.navBadge}>{item.badge}</span>
                )}
              </a>
            )
          })}
        </nav>
      </div>

      {/* Sidebar Footer Links */}
      <div className={styles.footerSection}>
        <a href="#settings" className={styles.footerLink}>
          <span className="material-symbols-outlined">settings</span>
          <span>Cài đặt hệ thống</span>
        </a>
        <a href="#help" className={styles.footerLink}>
          <span className="material-symbols-outlined">help_outline</span>
          <span>Trợ giúp &amp; Hướng dẫn</span>
        </a>

        {/* User Profile & Logout */}
        <div className={styles.userBar}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {user?.fullName
                ? user.fullName
                    .split(" ")
                    .slice(-2)
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                : "NV"}
            </div>
            <div className={styles.userMeta}>
              <span className={styles.userName}>
                {user?.fullName || "Nguyễn Văn Vận"}
              </span>
              <span className={styles.userRole}>
                {user?.role === "SCHOOL_KITCHEN_STAFF"
                  ? "Bếp trưởng"
                  : "Nhân viên bếp"}
              </span>
            </div>
          </div>
          <button
            type="button"
            className={styles.logoutBtn}
            onClick={handleLogout}
            title="Đăng xuất"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

export default KitchenSidebar
