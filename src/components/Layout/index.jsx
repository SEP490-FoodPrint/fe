import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { Outlet } from "react-router-dom"
import { DashboardHeader } from "./Header"
import Sidebar from "./Sidebar"
import styles from "./MainLayout.module.scss"

const STORAGE_COLLAPSED_KEY = "foodprint_sidebar_collapsed"

/**
 * MainLayout - Khung Bảng điều khiển quản trị (Dashboard Layout)
 * Cấu trúc: Sidebar chạy dọc toàn chiều cao (100vh) bên trái + Header & Content bên phải
 */
const MainLayout = ({ type }) => {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_COLLAPSED_KEY) === "true"
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_COLLAPSED_KEY, String(collapsed))
    } catch {
      // Ignore
    }
  }, [collapsed])

  const handleToggleCollapse = () => {
    setCollapsed(prev => !prev)
  }

  return (
    <div className={styles.layoutWrapper}>
      {/* 1. Sidebar Forest Emerald chạy dọc 100vh bên trái */}
      <Sidebar
        type={type}
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* 2. Cột nội dung bên phải: Header Sticky trên cùng + Main Content */}
      <div className={styles.rightContainer}>
        <DashboardHeader />

        <main className={styles.mainContent}>
          <Outlet />
        </main>
      </div>

      {/* 3. Tiện ích đổi nhanh vai trò để kiểm thử */}
    </div>
  )
}

MainLayout.propTypes = {
  type: PropTypes.string,
}

export { default as PublicLayout } from "./PublicLayout/PublicLayout"
export { default as AuthLayout } from "./AuthLayout/AuthLayout"
export { default as Sidebar } from "./Sidebar"
export * from "./Header"

export default MainLayout
