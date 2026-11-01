import React from "react";
import { Link, useLocation } from "react-router-dom";
import { User } from "lucide-react";
import ROUTER from "src/router/ROUTER";
import styles from "./AuthHeader.module.scss";
import BrandLogo from "src/components/Common/BrandLogo";

export default function AuthHeader() {
  const location = useLocation();
  const isLoginPage = location.pathname === ROUTER.LOGIN;

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Brand logo */}
        <Link
          to={ROUTER.DEFAULT}
          className={styles.brand}
          aria-label="FoodPrint · Về trang chủ"
        >
          <BrandLogo
            variant="auth"
            subtitle="An toàn từ nguồn · An tâm từng bữa"
          />
        </Link>

        {/* Navigation links & user icon */}
        <div className={styles.navGroup}>
          <nav className={styles.nav}>
            <Link to={ROUTER.DEFAULT} className={styles.navLink}>
              Trang chủ
            </Link>

            {isLoginPage ? (
              <Link to={ROUTER.REGISTER} className={styles.navLink}>
                Đăng ký đơn vị
              </Link>
            ) : (
              <Link to={ROUTER.LOGIN} className={styles.navLink}>
                Đã có tài khoản? Đăng nhập
              </Link>
            )}
          </nav>

          <div className={styles.avatarCircle} title="Tài khoản FoodPrint">
            <User size={16} />
          </div>
        </div>
      </div>
    </header>
  );
}
