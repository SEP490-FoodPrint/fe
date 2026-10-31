import React from "react"
import { Outlet, useLocation } from "react-router-dom"
import ROUTER from "src/router/ROUTER"
import { AuthHeader } from "../Header"
import styles from "./AuthLayout.module.scss"

function AuthLayout() {
  const location = useLocation()
  const compactFooter = [ROUTER.FORGOT_PASSWORD, ROUTER.PASSWORD_RECOVERY_CODE, ROUTER.RESET_PASSWORD].includes(location.pathname)
  return (
    <div className={styles.layoutWrapper}>
      <main className={styles.authContent}>
        <AuthHeader />
        <Outlet />
        <p className={`${styles.footer} ${compactFooter ? styles.compactFooter : ""}`}>FoodPrint · Nền tảng quản lý và truy xuất nguồn gốc bữa ăn học đường</p>
      </main>
    </div>
  )
}

export default AuthLayout
