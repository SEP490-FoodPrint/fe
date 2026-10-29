import React from "react"
import PropTypes from "prop-types"
import logoImg from "src/assets/images/logo.png"
import styles from "./BrandLogo.module.scss"

/**
 * BrandLogo - Bộ nhận diện thương hiệu FoodPrint chuẩn hóa với Logo chính thức của dự án
 * @param {"dark" | "light"} theme - "dark" cho Sidebar xanh, "light" cho Header trắng/nền sáng
 * @param {boolean} collapsed - Chỉ hiển thị icon khi Sidebar thu nhỏ
 * @param {string} subtitle - Phụ đề bên dưới tên thương hiệu (Mặc định: "School Food Safety")
 */
function BrandLogo({
  theme = "light",
  collapsed = false,
  subtitle = "School Food Safety",
  className = "",
  onClick,
  style,
}) {
  const themeClass = theme === "dark" ? styles.isDark : styles.isLight

  return (
    <div
      className={`${styles.brandContainer} ${themeClass} ${className}`}
      onClick={onClick}
      style={style}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className={styles.logoBox}>
        <img src={logoImg} alt="FoodPrint Logo" className={styles.logoImg} />
      </div>

      {!collapsed && (
        <div className={styles.textGroup}>
          <span className={styles.brandTitle}>FoodPrint</span>
          <span className={styles.brandSubtitle}>{subtitle}</span>
        </div>
      )}
    </div>
  )
}

BrandLogo.propTypes = {
  theme: PropTypes.oneOf(["dark", "light"]),
  collapsed: PropTypes.bool,
  subtitle: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
  style: PropTypes.object,
}

export default BrandLogo
