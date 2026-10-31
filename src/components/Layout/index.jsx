import React, { useContext, useEffect, useRef, useState } from "react"
import PropTypes from "prop-types"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { useMediaQuery } from "@mui/material"
import { DashboardHeader } from "./Header"
import Sidebar from "./Sidebar"
import RoleSwitcher from "src/components/Common/RoleSwitcher"
import { StoreContext } from "src/contexts"
import AuthService from "src/services/AuthService"
import ROUTER from "src/router/ROUTER"
import styles from "./MainLayout.module.scss"
import notice from "src/components/Notice"

const MainLayout = ({ type }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { loginStore, userStore } = useContext(StoreContext)
  const isMobile = useMediaQuery("(max-width:600px)")
  const isTablet = useMediaQuery("(min-width:601px) and (max-width:1199px)")
  const [navigationOpen, setNavigationOpen] = useState(false)
  const navigationButtonRef = useRef(null)

  useEffect(() => {
    setNavigationOpen(false)
    document.getElementById("root")?.scrollTo(0, 0)
  }, [location.pathname, type])

  useEffect(() => {
    if (!isMobile) setNavigationOpen(false)
  }, [isMobile])

  const handleLogout = async () => {
    setNavigationOpen(false)
    try { await AuthService.logout() }
    catch (error) { notice({ msg: error.message || "Không thể xác nhận đăng xuất. Vui lòng thử lại.", isSuccess: false }); return }
    loginStore.setIsLoginContext(false)
    userStore.setUser(null)
    navigate(ROUTER.LOGIN, { replace: true })
  }

  const handleOpenNavigation = () => {
    navigationButtonRef.current?.focus()
    setNavigationOpen(true)
  }

  return (
    <div className={styles.layoutWrapper}>
      <Sidebar
        type={type}
        iconOnly={isTablet}
        mobile={isMobile}
        open={navigationOpen}
        onClose={() => setNavigationOpen(false)}
      />
      <div className={styles.rightContainer}>
        <DashboardHeader
          mobile={isMobile}
          navigationOpen={navigationOpen}
          onOpenNavigation={handleOpenNavigation}
          navigationButtonRef={navigationButtonRef}
          onLogout={handleLogout}
        />
        <main id="dashboard-content" className={styles.mainContent}>
          <Outlet />
        </main>
      </div>
      <RoleSwitcher />
    </div>
  )
}

MainLayout.propTypes = { type: PropTypes.string }

export { default as PublicLayout } from "./PublicLayout/PublicLayout"
export { default as AuthLayout } from "./AuthLayout/AuthLayout"
export { default as Sidebar } from "./Sidebar"
export * from "./Header"

export default MainLayout
