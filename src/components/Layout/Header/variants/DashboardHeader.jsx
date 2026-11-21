import React, { useContext, useEffect, useState } from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import { ButtonBase, Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material"
import UserAvatar from "src/components/Common/UserAvatar"
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
            <UserAvatar user={user} className={styles.avatar} />
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
