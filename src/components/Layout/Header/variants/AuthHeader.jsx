import React from "react";
import { Link, useLocation } from "react-router-dom";
import { User } from "lucide-react";
import ROUTER from "src/router/ROUTER";
import styles from "./AuthHeader.module.scss";
import BrandLogo from "src/components/Common/BrandLogo";

export default function AuthHeader({ minimal = false }) {
  const location = useLocation();
  const isLoginPage = location.pathname === ROUTER.LOGIN;

  return (
    <header className={`${styles.header} ${minimal ? styles.minimal : ""}`}>
      <div className={styles.inner}>
        {/* Brand logo */}
        <Link
          to={ROUTER.DEFAULT}
          className={styles.brand}
          aria-label="FoodPrint · Về trang chủ"
        >
          {minimal ? <BrandLogo theme="light" /> : <BrandLogo
            variant="auth"
            subtitle="An toàn từ nguồn · An tâm từng bữa"
          />}
        </Link>

        {/* Navigation links & user icon */}
        {!minimal && <div className={styles.navGroup}>
          <nav className={styles.nav}>
            {!minimal && <Link to={ROUTER.DEFAULT} className={styles.navLink}>
              Trang chủ
            </Link>}

            {isLoginPage ? (
              <Link to={ROUTER.REGISTER} className={styles.navLink}>
                Đăng ký đơn vị
              </Link>
            ) : !minimal && (
              <Link to={ROUTER.LOGIN} className={styles.navLink}>
                Đã có tài khoản? Đăng nhập
              </Link>
            )}
          </nav>

          {!minimal && <div className={styles.avatarCircle} title="Tài khoản FoodPrint">
            <User size={16} />
          </div>}
        </div>}
      </div>
    </header>
  );
}
