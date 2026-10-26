import React from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import { ArrowRight, Home } from "lucide-react"
import ROUTER from "src/router/ROUTER"
import BrandLogo from "src/components/Common/BrandLogo"
import BaseHeader from "../BaseHeader"
import styles from "./AuthHeader.module.scss"

function AuthHeader({ mode = "login" }) {
  const isLogin = mode === "login"

  const leftSlot = (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <Link to={ROUTER.DEFAULT} style={{ textDecoration: "none" }}>
        <BrandLogo theme="light" />
      </Link>
      <span className={styles.gateBadge}>ID Gate</span>
    </div>
  )

  const rightSlot = (
    <div className={styles.rightActions}>
      <Link to={ROUTER.DEFAULT} className={styles.homeLink}>
        <Home size={16} />
        <span>Về trang chủ</span>
      </Link>

      <div className={styles.switchPrompt}>
        <span>{isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}</span>
        <Link to={isLogin ? ROUTER.LOGIN : ROUTER.LOGIN}>
          <span>{isLogin ? "Đăng ký" : "Đăng nhập"}</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )

  return (
    <BaseHeader
      leftSlot={leftSlot}
      centerSlot={null}
      rightSlot={rightSlot}
      variant="contained"
    />
  )
}

AuthHeader.propTypes = {
  mode: PropTypes.oneOf(["login", "register"]),
}

export default AuthHeader
