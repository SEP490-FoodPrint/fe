import React from "react"
import PropTypes from "prop-types"
import logo from "src/assets/images/logo.png"
import styles from "./BrandLogo.module.scss"

/**
 * BrandLogo - Bộ nhận diện thương hiệu FoodPrint chuẩn hóa
 * @param {"dark" | "light"} theme - Màu thương hiệu theo nền đặt logo
 * @param {boolean} iconOnly - Chỉ hiển thị ảnh logo trong thanh icon tablet
 */
function BrandLogo({ theme = "light", iconOnly = false, compact = false, variant = "default", subtitle = "School Food Safety", className = "", onClick }) {
  const themeClass = theme === "dark" ? styles.isDark : styles.isLight
  const Component = onClick ? "button" : "div"

  return (
    <Component
      type={onClick ? "button" : undefined}
      className={[styles.brandContainer, themeClass, variant === "dashboard" && styles.dashboard, compact && styles.compact, iconOnly && styles.iconOnly, className].filter(Boolean).join(" ")}
      onClick={onClick}
    >
      <div className={styles.iconBox}>
        <img src={logo} alt={iconOnly ? "FoodPrint" : ""} className={styles.logoImage} width={36} height={36} />
      </div>

      {!iconOnly && (
        <div className={styles.textGroup}>
          <span className={styles.brandTitle}>FoodPrint</span>
          {!compact && <span className={styles.brandSubtitle}>{subtitle}</span>}
        </div>
      )}
    </Component>
  )
}

BrandLogo.propTypes = {
  theme: PropTypes.oneOf(["dark", "light"]),
  iconOnly: PropTypes.bool,
  compact: PropTypes.bool,
  variant: PropTypes.oneOf(["default", "dashboard"]),
  subtitle: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
}

export default BrandLogo
