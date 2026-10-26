import React from "react"
import { Outlet } from "react-router-dom"
import { AuthHeader } from "../Header"
import styles from "./AuthLayout.module.scss"

function AuthLayout() {
  return (
    <div className={styles.layoutWrapper}>
      <AuthHeader />

      <main className={styles.authContent}>
        <div className={styles.authCardContainer}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default AuthLayout
