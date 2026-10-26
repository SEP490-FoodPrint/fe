import React, { useContext, useMemo } from "react"
import PropTypes from "prop-types"
import { useLocation, useNavigate } from "react-router-dom"
import { Avatar, Tooltip } from "@mui/material"
import {
  Building2,
  ChevronsUpDown,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  School,
  Store,
  User as UserIcon,
} from "lucide-react"
import { StoreContext } from "src/contexts"
import { ROLE_LABELS } from "src/constants/roles"
import { hasPermission } from "src/lib/utils"
import {
  MenuItemSchool,
  MenuItemSupplier,
  MenuItemSystem,
} from "src/router/MenuItem"
import AuthService from "src/services/AuthService"
import ROUTER from "src/router/ROUTER"
import BrandLogo from "src/components/Common/BrandLogo"
import styles from "./Sidebar.module.scss"

function Sidebar({ type, collapsed = false, onToggleCollapse }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { loginStore, userStore } = useContext(StoreContext)
  const setIsLoginContext = loginStore?.setIsLoginContext
  const user = userStore?.user
  const setUser = userStore?.setUser

  // Xác định danh sách menu thô dựa theo phân hệ
  const rawMenuItems = useMemo(() => {
    const org = type || user?.orgType
    switch (org) {
      case "SYSTEM":
        return MenuItemSystem()
      case "SUPPLIER":
        return MenuItemSupplier()
      case "SCHOOL":
      default:
        return MenuItemSchool()
    }
  }, [type, user?.orgType])

  // Lọc menu động dựa theo vai trò (hasPermission)
  const filteredMenuItems = useMemo(() => {
    if (!user?.role) return []
    return rawMenuItems.filter(item => hasPermission(item.roles, user.role))
  }, [rawMenuItems, user?.role])

  // Icon biểu trưng theo phân hệ
  const orgIcon = useMemo(() => {
    const org = type || user?.orgType
    switch (org) {
      case "SYSTEM":
        return <Building2 size={16} />
      case "SUPPLIER":
        return <Store size={16} />
      case "SCHOOL":
      default:
        return <School size={16} />
    }
  }, [type, user?.orgType])

  const handleLogout = () => {
    AuthService.logout()
    if (setIsLoginContext) setIsLoginContext(false)
    if (setUser) setUser(null)
    navigate(ROUTER.LOGIN, { replace: true })
  }

  return (
    <aside
      className={`${styles.sidebar} ${
        collapsed ? styles.isCollapsed : styles.isExpanded
      }`}
      aria-label="Sidebar navigation"
    >
      {/* 1. Header của Sidebar: Brand Logo + Nút thu gọn */}
      <div className={styles.sidebarHeader}>
        <BrandLogo
          theme="dark"
          collapsed={collapsed}
          onClick={() => navigate(ROUTER.DEFAULT)}
          style={{ cursor: "pointer" }}
        />
        {onToggleCollapse && (
          <button
            type="button"
            className={styles.collapseBtn}
            onClick={onToggleCollapse}
            title={collapsed ? "Mở rộng thanh menu" : "Thu gọn thanh menu"}
            aria-label="Toggle sidebar collapse"
            style={{ margin: collapsed ? "0 auto" : undefined }}
          >
            {collapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
          </button>
        )}
      </div>

      {/* 2. Thẻ Thông tin Cơ sở / Tổ chức (Org Context Card) */}
      {!collapsed ? (
        <div className={styles.orgCard}>
          <div className={styles.orgIconCircle}>{orgIcon}</div>
          <div className={styles.orgContent}>
            <span className={styles.orgName}>
              {user?.orgName || "Cơ sở Giáo dục FoodPrint"}
            </span>
            <span className={styles.orgRoleBadge}>
              {ROLE_LABELS[user?.role]?.split("(")[0]?.trim() || "Người dùng"}
            </span>
          </div>
          <ChevronsUpDown size={15} color="var(--green-200)" />
        </div>
      ) : (
        <Tooltip title={user?.orgName || "Cơ sở"} placement="right" arrow>
          <div
            className={styles.orgIconCircle}
            style={{ margin: "12px auto 6px", cursor: "pointer" }}
          >
            {orgIcon}
          </div>
        </Tooltip>
      )}

      {/* 3. Tiêu đề phân khu nghiệp vụ */}
      {!collapsed && (
        <div className={styles.sectionTitle}>Nghiệp vụ cốt lõi</div>
      )}

      {/* 4. Danh sách Menu có scroll độc lập */}
      <nav className={styles.navList}>
        {filteredMenuItems.map(item => {
          const isSelected = location.pathname === item.key

          const itemContent = (
            <div
              key={item.key}
              className={`${styles.navItem} ${isSelected ? styles.isActive : ""}`}
              onClick={() => navigate(item.key)}
              role="button"
              tabIndex={0}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {!collapsed && (
                <span className={styles.navLabel}>{item.label}</span>
              )}
            </div>
          )

          if (collapsed) {
            return (
              <Tooltip
                key={item.key}
                title={item.label}
                placement="right"
                arrow
              >
                {itemContent}
              </Tooltip>
            )
          }

          return itemContent
        })}
      </nav>

      {/* 5. Footer của Sidebar: User Info Card + Nút Đăng xuất */}
      {user && (
        <div className={styles.sidebarFooter}>
          <div
            className={styles.userCard}
            style={{ justifyContent: collapsed ? "center" : undefined }}
          >
            <Avatar
              src={user.avatar}
              sx={{
                width: 32,
                height: 32,
                bgcolor: "var(--white)",
                color: "var(--color-primary)",
                fontWeight: 700,
                fontSize: "0.8rem",
                border: "2px solid rgba(255, 255, 255, 0.4)",
              }}
            >
              {!user.avatar && <UserIcon size={16} />}
            </Avatar>
            {!collapsed && (
              <div className={styles.userMeta}>
                <span className={styles.userName}>{user.fullName}</span>
                <span className={styles.userRole}>
                  {ROLE_LABELS[user.role]?.split("(")[0]?.trim() || user.role}
                </span>
              </div>
            )}
          </div>

          {!collapsed && (
            <Tooltip title="Đăng xuất khỏi hệ thống" arrow>
              <button
                type="button"
                className={styles.logoutBtn}
                onClick={handleLogout}
                aria-label="Logout"
              >
                <LogOut size={16} />
              </button>
            </Tooltip>
          )}
        </div>
      )}
    </aside>
  )
}

Sidebar.propTypes = {
  type: PropTypes.string,
  collapsed: PropTypes.bool,
  onToggleCollapse: PropTypes.func,
}

export default Sidebar
