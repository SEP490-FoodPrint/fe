import React from "react"
import { Outlet } from "react-router-dom"
import { AuthHeader } from "../Header"
import styles from "./AuthLayout.module.scss"

function AuthLayout() {
  return (
    <div className={styles.layoutWrapper}>
      {/* 1. Fixed Header kính mờ */}
      <AuthHeader />

      {/* 2. Quầng sáng decor ambient blur phía sau */}
      <div className={styles.haloTop} aria-hidden="true" />
      <div className={styles.haloBottom} aria-hidden="true" />

      {/* 3. Vùng chứa nội dung trang đăng nhập / đăng ký */}
      <main className={styles.authContent}>
        <Outlet />
      </main>

      {/* 4. Footer chuẩn chân trang */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <p className={styles.copyright}>© 2026 FoodPrint. All rights reserved.</p>
          <p className={styles.platformName}>
            Nền tảng quản lý và truy xuất nguồn gốc bữa ăn học đường
          </p>
        </div>
      </footer>
    </div>
  )
}

export default AuthLayout
