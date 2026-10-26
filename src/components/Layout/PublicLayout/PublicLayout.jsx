import React from "react"
import { Outlet, Link } from "react-router-dom"
import { UtensilsCrossed } from "lucide-react"
import { PublicHeader } from "../Header"
import ROUTER from "src/router/ROUTER"
import styles from "./PublicLayout.module.scss"

function PublicLayout() {
  return (
    <div className={styles.layoutWrapper}>
      <PublicHeader />

      <main className={styles.mainContent}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.grid}>
            {/* Column 1: Brand (5 cols) */}
            <div className={styles.brandCol}>
              <div className={styles.brandLogo}>
                <div className={styles.logoBadge}>
                  <UtensilsCrossed size={20} strokeWidth={2.2} />
                </div>
                <span className={styles.brandName}>FoodPrint</span>
              </div>
              <p className={styles.brandDescription}>
                Hệ thống quản lý và truy xuất nguồn gốc suất ăn học đường. Đồng hành cùng nhà trường xây dựng bữa ăn chuẩn dinh dưỡng và an toàn thực phẩm minh bạch.
              </p>
            </div>

            {/* Column 2: Khám phá */}
            <div className={styles.linksCol}>
              <h4 className={styles.columnTitle}>Khám phá</h4>
              <ul className={styles.linkList}>
                <li>
                  <Link to={ROUTER.DEFAULT} className={styles.footerLink}>Trang chủ</Link>
                </li>
                <li>
                  <a href="#about" className={styles.footerLink}>Giới thiệu</a>
                </li>
                <li>
                  <a href="#schools" className={styles.footerLink}>Tìm trường học</a>
                </li>
              </ul>
            </div>

            {/* Column 3: Tài khoản */}
            <div className={styles.linksCol}>
              <h4 className={styles.columnTitle}>Tài khoản</h4>
              <ul className={styles.linkList}>
                <li>
                  <Link to={ROUTER.LOGIN} className={styles.footerLink}>Đăng nhập</Link>
                </li>
                <li>
                  <a href="#register-school" className={styles.footerLink}>Đăng ký trường học</a>
                </li>
                <li>
                  <a href="#register-supplier" className={styles.footerLink}>Đăng ký nhà cung cấp</a>
                </li>
              </ul>
            </div>

            {/* Column 4: Thông tin */}
            <div className={styles.linksCol}>
              <h4 className={styles.columnTitle}>Thông tin</h4>
              <ul className={styles.linkList}>
                <li>
                  <a href="#about" className={styles.footerLink}>Giới thiệu nền tảng</a>
                </li>
                <li>
                  <a href="#how-it-works" className={styles.footerLink}>Hướng dẫn sử dụng</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright bar */}
          <div className={styles.bottomBar}>
            <p className={styles.copyrightText}>
              © 2026 FoodPrint Platform. Mọi quyền được bảo lưu.
            </p>
            <p className={styles.legalSubtext}>
              Hệ thống chuyển đổi số dinh dưỡng và an toàn thực phẩm học đường
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default PublicLayout
