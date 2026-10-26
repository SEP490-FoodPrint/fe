import React from "react"
import PropTypes from "prop-types"
import { Salad } from "lucide-react"
import styles from "./BrandLogo.module.scss"

/**
 * BrandLogo - Bộ nhận diện thương hiệu FoodPrint chuẩn hóa
 * @param {"dark" | "light"} theme - "dark" cho Sidebar xanh, "light" cho Header trắng
 * @param {boolean} collapsed - Chỉ hiển thị icon khi Sidebar thu nhỏ
 */
function BrandLogo({ theme = "light", collapsed = false, className = "", onClick }) {
  const themeClass = theme === "dark" ? styles.isDark : styles.isLight

  return (
    <div
      className={`${styles.brandContainer} ${themeClass} ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className={styles.iconBox}>
        <Salad size={20} strokeWidth={2.4} />
      </div>

      {!collapsed && (
        <div className={styles.textGroup}>
          <span className={styles.brandTitle}>FoodPrint</span>
          <span className={styles.brandSubtitle}>School Food Safety</span>
        </div>
      )}
    </div>
  )
}

BrandLogo.propTypes = {
  theme: PropTypes.oneOf(["dark", "light"]),
  collapsed: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
}

export default BrandLogo
