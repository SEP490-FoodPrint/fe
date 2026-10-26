import React, { useContext, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  Avatar,
  Box,
  Divider,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material"
import {
  Bell,
  ChevronDown,
  ChevronRight,
  LogOut,
  Plus,
  Search,
  User as UserIcon,
} from "lucide-react"
import { StoreContext } from "src/contexts"
import { ROLE_LABELS } from "src/constants/roles"
import {
  MenuItemSchool,
  MenuItemSupplier,
  MenuItemSystem,
} from "src/router/MenuItem"
import AuthService from "src/services/AuthService"
import ROUTER from "src/router/ROUTER"
import BaseHeader from "../BaseHeader"
import styles from "./DashboardHeader.module.scss"

function DashboardHeader() {
  const navigate = useNavigate()
  const location = useLocation()
  const { loginStore, userStore } = useContext(StoreContext)
  const setIsLoginContext = loginStore?.setIsLoginContext
  const user = userStore?.user
  const setUser = userStore?.setUser

  const [anchorEl, setAnchorEl] = useState(null)
  const isMenuOpen = Boolean(anchorEl)

  const handleOpenUserMenu = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseUserMenu = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    handleCloseUserMenu()
    AuthService.logout()
    if (setIsLoginContext) setIsLoginContext(false)
    if (setUser) setUser(null)
    navigate(ROUTER.LOGIN, { replace: true })
  }

  // Tự động tìm tên trang hiện tại cho Breadcrumb
  const currentPageTitle = useMemo(() => {
    const allItems = [
      ...MenuItemSchool(),
      ...MenuItemSupplier(),
      ...MenuItemSystem(),
    ]
    const matched = allItems.find(item => item.key === location.pathname)
    return matched?.label || "Tổng quan phân hệ"
  }, [location.pathname])

  // Vùng Trái: Breadcrumbs ngữ cảnh phân cấp
  const leftSlot = (
    <nav className={styles.breadcrumbWrap} aria-label="Breadcrumb">
      <span
        className={styles.crumbItem}
        onClick={() => navigate(ROUTER.DEFAULT)}
      >
        Trang chủ
      </span>
      <ChevronRight size={14} color="var(--text-muted)" />
      <span className={styles.crumbItem}>Bảng điều khiển</span>
      <ChevronRight size={14} color="var(--text-muted)" />
      <span className={styles.crumbCurrent} title={currentPageTitle}>
        {currentPageTitle}
      </span>
    </nav>
  )

  // Vùng Giữa: Thanh tìm kiếm chuyên nghiệp kèm phím tắt ⌘K
  const centerSlot = (
    <div className={styles.searchBox}>
      <Search size={18} color="var(--text-muted)" />
      <input
        type="text"
        placeholder="Tra cứu thực đơn, lô hàng hoặc số kiểm tra..."
        aria-label="Search"
      />
      <span className={styles.kbdShortcut}>⌘K</span>
    </div>
  )

  // Vùng Phải: Thông báo + Nút Quick CTA + Thông tin tài khoản
  const rightSlot = (
    <div className={styles.actionWrap}>
      {/* 1. Nút Thông báo */}
      <button
        type="button"
        className={styles.iconBtn}
        title="Thông báo mới"
        aria-label="Notifications"
      >
        <Bell size={18} />
        <span className={styles.badgeDot} />
      </button>

      {/* 2. Nút Thao tác nhanh (Quick Action CTA) */}
      <button
        type="button"
        className={styles.quickCtaBtn}
        onClick={() => {}}
      >
        <Plus size={16} strokeWidth={2.5} />
        <span>Thao tác nhanh</span>
      </button>

      {/* 3. Khối Avatar & Dropdown Menu */}
      {user && (
        <>
          <div
            className={styles.userProfile}
            onClick={handleOpenUserMenu}
            role="button"
            tabIndex={0}
          >
            <Avatar
              src={user.avatar}
              sx={{
                width: 36,
                height: 36,
                bgcolor: "var(--color-primary)",
                color: "var(--white)",
                fontWeight: 600,
                fontSize: "0.85rem",
              }}
            >
              {!user.avatar && <UserIcon size={18} />}
            </Avatar>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user.fullName}</span>
              <span className={styles.userRole}>
                {ROLE_LABELS[user.role]?.split("(")[0]?.trim() || user.role}
              </span>
            </div>
            <ChevronDown size={15} color="var(--text-muted)" />
          </div>

          <Menu
            anchorEl={anchorEl}
            open={isMenuOpen}
            onClose={handleCloseUserMenu}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            slotProps={{
              paper: {
                sx: {
                  width: 250,
                  mt: 1.2,
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "0 8px 24px rgba(29, 43, 38, 0.12)",
                  border: "1px solid var(--border-default)",
                },
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                {user.fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user.orgName || user.orgType}
              </Typography>
            </Box>
            <Divider />
            <MenuItem
              onClick={handleLogout}
              sx={{ color: "error.main", gap: 1.5, py: 1.2 }}
            >
              <LogOut size={16} />
              <Typography variant="body2" fontWeight={600}>
                Đăng xuất
              </Typography>
            </MenuItem>
          </Menu>
        </>
      )}
    </div>
  )

  return (
    <BaseHeader
      leftSlot={leftSlot}
      centerSlot={centerSlot}
      rightSlot={rightSlot}
      variant="fluid"
    />
  )
}

export default DashboardHeader
