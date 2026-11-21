import React from "react"
import PropTypes from "prop-types"
import logo from "src/assets/images/logo.png"
import styles from "./BrandLogo.module.scss"

/**
 * BrandLogo - Bộ nhận diện thương hiệu FoodPrint chuẩn hóa
 * @param {"dark" | "light"} theme - Màu thương hiệu theo nền đặt logo
 * @param {boolean} iconOnly - Chỉ hiển thị ảnh logo trong thanh icon tablet
 * @param {string} logoSrc - Ảnh logo riêng (vd. logo trường); bỏ trống dùng logo FoodPrint
 * @param {string} title - Tên hiển thị thay cho "FoodPrint" (vd. tên trường)
 */
function BrandLogo({
  theme = "light",
  iconOnly = false,
  collapsed = false,
  compact = false,
  variant = "default",
  subtitle = "",
  logoSrc = "",
  title = "",
  className = "",
  onClick,
  style,
}) {
  const isIconOnly = iconOnly || collapsed
  const brandName = title || "FoodPrint"
  const themeClass = theme === "dark" ? styles.isDark : styles.isLight
  const Component = onClick ? "button" : "div"

  return (
    <Component
      type={onClick ? "button" : undefined}
      className={[
        styles.brandContainer,
        themeClass,
        variant === "dashboard" && styles.dashboard,
        variant === "auth" && styles.auth,
        compact && styles.compact,
        title && styles.organization,
        isIconOnly && styles.iconOnly,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
      style={style}
    >
      <div className={styles.iconBox}>
        <img
          src={logoSrc || logo}
          alt={isIconOnly ? brandName : ""}
          className={styles.logoImage}
          width={42}
          height={42}
        />
      </div>

      {!isIconOnly && (
        <div className={styles.textGroup}>
          <span className={styles.brandTitle}>{brandName}</span>
          {!compact && subtitle ? (
            <span className={styles.brandSubtitle}>{subtitle}</span>
          ) : null}
        </div>
      )}
    </Component>
  )
}

BrandLogo.propTypes = {
  theme: PropTypes.oneOf(["dark", "light"]),
  iconOnly: PropTypes.bool,
  collapsed: PropTypes.bool,
  compact: PropTypes.bool,
  variant: PropTypes.oneOf(["default", "dashboard", "auth"]),
  subtitle: PropTypes.string,
  logoSrc: PropTypes.string,
  title: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
  style: PropTypes.object,
}

export default BrandLogo
