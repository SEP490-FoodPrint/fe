import React, { useContext, useState } from "react"
import { Avatar, Button, ListItemIcon, Menu, MenuItem } from "@mui/material"
import { Link, useNavigate } from "react-router-dom"
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined"
import AuthService from "src/services/AuthService"
import notice from "src/components/Notice"
import { clearSignupSession } from "src/lib/signupSession"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined"
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"
import { StoreContext } from "src/contexts"
import { getRegistrationDestination } from "src/lib/utils"
import ROUTER from "src/router/ROUTER"
import styles from "./PublicAccountMenu.module.scss"

export default function PublicAccountMenu() {
  const { userStore, loginStore, signupStore, passwordRecoveryStore } = useContext(StoreContext)
  const navigate = useNavigate()
  const user = userStore.user
  const [anchor, setAnchor] = useState(null)
  const [loggingOut, setLoggingOut] = useState(false)
  const open = Boolean(anchor)
  const close = () => setAnchor(null)
  const name = user?.fullName || user?.username || "Tài khoản"
  const logout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await AuthService.logout()
      clearSignupSession()
      signupStore.setSignupCredentials(null)
      passwordRecoveryStore.setPasswordRecovery(null)
      loginStore.setIsLoginContext(false)
      userStore.setUser(null)
      close()
      navigate(ROUTER.LOGIN, { replace: true })
    } catch (error) { notice({ msg: error.message || "Không thể đăng xuất. Vui lòng thử lại.", isSuccess: false }) }
    finally { setLoggingOut(false) }
  }
  return <>
    <Button id="public-account-button" className={styles.trigger} aria-label={`Tài khoản ${name}`} aria-haspopup="menu" aria-expanded={open} aria-controls={open ? "public-account-menu" : undefined} onClick={event => setAnchor(event.currentTarget)}>
      <Avatar src={user?.avatarUrl || user?.avatar || undefined} alt="" className={styles.avatar}>{name.trim().split(/\s+/).slice(-2).map(word => word[0]).join("").toUpperCase()}</Avatar>
      <span className={styles.name}>{name}</span><KeyboardArrowDownIcon className={styles.chevron} />
    </Button>
    <Menu id="public-account-menu" anchorEl={anchor} open={open} onClose={close} slotProps={{ list: { "aria-labelledby": "public-account-button" }, paper: { className: styles.menu } }}>
      <MenuItem component={Link} to={ROUTER.PROFILE} onClick={close}><ListItemIcon><PersonOutlineOutlinedIcon /></ListItemIcon>Profile</MenuItem>
      <MenuItem component={Link} to={getRegistrationDestination(user)} onClick={close}><ListItemIcon><DescriptionOutlinedIcon /></ListItemIcon>Hồ sơ đăng ký</MenuItem>
      <MenuItem onClick={logout} disabled={loggingOut} className={styles.logout}><ListItemIcon><LogoutOutlinedIcon /></ListItemIcon>{loggingOut ? "Đang đăng xuất…" : "Đăng xuất"}</MenuItem>
    </Menu>
  </>
}
