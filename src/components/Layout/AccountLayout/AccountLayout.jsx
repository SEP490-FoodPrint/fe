import React, { useContext, useEffect, useState } from "react"
import { Avatar, Drawer, IconButton, useMediaQuery } from "@mui/material"
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined"
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined"
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined"
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
import { Link, Navigate, Outlet, useLocation } from "react-router-dom"
import { PublicHeader } from "../Header"
import { StoreContext } from "src/contexts"
import { getRegistrationDestination } from "src/lib/utils"
import ROUTER from "src/router/ROUTER"
import styles from "./AccountLayout.module.scss"

export default function AccountLayout() {
  const { loginStore, userStore } = useContext(StoreContext)
  const user = userStore.user
  const location = useLocation()
  const mobile = useMediaQuery("(max-width:899px)")
  const [open, setOpen] = useState(false)
  useEffect(() => { setOpen(false) }, [location.pathname, mobile])
  useEffect(() => { document.getElementById("root")?.scrollTo(0, 0) }, [location.pathname])
  if (!loginStore.isLoginContext || !user) return <Navigate to={ROUTER.LOGIN} replace />
  const name = user.fullName || user.username || "Tài khoản"
  const registrationActive = [ROUTER.REGISTRATION_PROFILE, ROUTER.REGISTRATION_STATUS].includes(location.pathname)
  const pageTitle = location.pathname === ROUTER.CHANGE_PASSWORD ? "Đổi mật khẩu" : registrationActive ? "Hồ sơ đăng ký" : "Profile"
  const navigation = <>
    <div className={styles.identity}>
      <Avatar src={user.avatarUrl || user.avatar || undefined} alt="" className={styles.avatar}>{name.trim().split(/\s+/).slice(-2).map(word => word[0]).join("").toUpperCase()}</Avatar>
      <div><strong>{name}</strong><span>{user.email || user.username}</span></div>
    </div>
    <nav id="account-navigation" aria-label="Quản lý tài khoản" className={styles.navigation}>
      <p>Tài khoản của bạn</p>
      <Link to={ROUTER.PROFILE} onClick={() => setOpen(false)} aria-current={location.pathname === ROUTER.PROFILE ? "page" : undefined}><PersonOutlineOutlinedIcon />Profile</Link>
      <Link to={getRegistrationDestination(user)} onClick={() => setOpen(false)} aria-current={registrationActive ? "page" : undefined}><DescriptionOutlinedIcon />Hồ sơ đăng ký</Link>
      <Link to={ROUTER.CHANGE_PASSWORD} onClick={() => setOpen(false)} aria-current={location.pathname === ROUTER.CHANGE_PASSWORD ? "page" : undefined}><LockOutlinedIcon />Đổi mật khẩu</Link>
    </nav>
  </>
  return <div className={styles.layout}>
    <PublicHeader />
    <div className={styles.body}>
      {mobile ? <>
        <div className={styles.mobileBar}><IconButton aria-label="Mở thanh điều hướng tài khoản" aria-expanded={open} aria-controls={open ? "account-navigation" : undefined} onClick={() => setOpen(true)}><MenuOutlinedIcon /></IconButton><span>{pageTitle}</span></div>
        <Drawer open={open} onClose={() => setOpen(false)} slotProps={{ paper: { className: styles.drawer } }}>
          <div className={styles.drawerHeading}><strong>Tài khoản</strong><IconButton aria-label="Đóng thanh điều hướng tài khoản" onClick={() => setOpen(false)}><CloseOutlinedIcon /></IconButton></div>
          {navigation}
        </Drawer>
      </> : <aside className={styles.sidebar}>{navigation}</aside>}
      <main id="account-content" className={styles.content}><Outlet /></main>
    </div>
  </div>
}
