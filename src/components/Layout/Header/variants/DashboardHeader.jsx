import React, { useContext, useEffect, useState } from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import { Avatar, ButtonBase, Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material"
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined"
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined"
import { StoreContext } from "src/contexts"
import { ROLE_LABELS, ROLES } from "src/constants/roles"
import { getDefaultRedirectByOrg, getDefaultRedirectByUser } from "src/lib/utils"
import BrandLogo from "src/components/Common/BrandLogo"
import styles from "./DashboardHeader.module.scss"

function DashboardHeader({ mobile = false, navigationOpen = false, onOpenNavigation, navigationButtonRef, onLogout }) {
  const { userStore } = useContext(StoreContext)
  const user = userStore?.user
  const [accountAnchor, setAccountAnchor] = useState(null)
  const [notificationAnchor, setNotificationAnchor] = useState(null)
  const words = (user?.fullName || "").trim().split(/\s+/).filter(Boolean)
  const initials = words.length ? (words[0][0] + (words.length > 1 ? words[words.length - 1][0] : "")).toUpperCase() : "FP"
  const roleLabel = user?.role === ROLES.SYSTEM_ADMIN ? "Quản trị viên" : ROLE_LABELS[user?.role]?.split("(")[0]?.trim() || user?.role
  const closeAccount = () => setAccountAnchor(null)

  useEffect(() => {
    if (mobile) setAccountAnchor(null)
  }, [mobile])

  return (
    <header className={styles.header} aria-label="Thanh tiêu đề">
      {mobile && (
        <Link
          to={user ? getDefaultRedirectByUser(user) : getDefaultRedirectByOrg(user?.orgType)}
          className={styles.mobileBrand}
          aria-label="FoodPrint"
        >
          <BrandLogo theme="light" variant="dashboard" compact />
        </Link>
      )}
      <div className={styles.actions}>
        <IconButton
          aria-label="Thông báo"
          aria-haspopup="menu"
          aria-expanded={Boolean(notificationAnchor)}
          aria-controls={notificationAnchor ? "dashboard-notifications" : undefined}
          className={styles.iconButton}
          onClick={event => setNotificationAnchor(event.currentTarget)}
        >
          <NotificationsNoneOutlinedIcon />
        </IconButton>
        {mobile ? (
          <IconButton
            ref={navigationButtonRef}
            aria-label="Mở điều hướng"
            aria-haspopup="dialog"
            aria-expanded={navigationOpen}
            aria-controls={navigationOpen ? "dashboard-mobile-navigation" : undefined}
            onClick={onOpenNavigation}
            className={styles.iconButton}
          >
            <MenuOutlinedIcon />
          </IconButton>
        ) : user && (
          <ButtonBase
            className={styles.accountButton}
            onClick={event => setAccountAnchor(event.currentTarget)}
            aria-label={"Tài khoản " + user.fullName}
            aria-haspopup="menu"
            aria-expanded={Boolean(accountAnchor)}
            aria-controls={accountAnchor ? "dashboard-account-menu" : undefined}
          >
            <Avatar className={styles.avatar}>{initials}</Avatar>
            <span className={styles.userInfo}>
              <span className={styles.userName}>{user.fullName}</span>
              <span className={styles.userRole}>{roleLabel}</span>
            </span>
            <KeyboardArrowDownIcon className={styles.chevron} />
          </ButtonBase>
        )}
      </div>
      <Menu
        id="dashboard-account-menu"
        anchorEl={accountAnchor}
        open={Boolean(accountAnchor) && !mobile}
        onClose={closeAccount}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { className: styles.menuPaper }, list: { "aria-label": "Tài khoản" } }}
      >
        <MenuItem disabled className={styles.accountDetails}>
          <strong>{user?.fullName}</strong>
          <span>{user?.orgName || roleLabel}</span>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { closeAccount(); onLogout() }} className={styles.logout}>
          <ListItemIcon><LogoutOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Đăng xuất</ListItemText>
        </MenuItem>
      </Menu>
      <Menu
        id="dashboard-notifications"
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={() => setNotificationAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { className: styles.menuPaper }, list: { "aria-label": "Thông báo" } }}
      >
        <MenuItem disabled className={styles.notificationTitle}>Thông báo</MenuItem>
        <MenuItem disabled className={styles.emptyNotification}>Chưa có thông báo</MenuItem>
      </Menu>
    </header>
  )
}

DashboardHeader.propTypes = {
  mobile: PropTypes.bool,
  navigationOpen: PropTypes.bool,
  onOpenNavigation: PropTypes.func,
  navigationButtonRef: PropTypes.shape({ current: PropTypes.any }),
  onLogout: PropTypes.func.isRequired,
}

export default DashboardHeader
