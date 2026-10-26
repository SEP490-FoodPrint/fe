import React from "react"
import PropTypes from "prop-types"
import styles from "./BaseHeader.module.scss"

/**
 * BaseHeader - Khung Header 3 vùng chuẩn hóa (Left - Center - Right)
 * Hỗ trợ 2 kiểu hiển thị: fluid (tràn màn hình) và contained (giới hạn 1200px)
 */
function BaseHeader({
  leftSlot,
  centerSlot,
  rightSlot,
  variant = "fluid",
  className = "",
}) {
  const containerClass = variant === "contained" ? styles.isContained : styles.isFluid

  return (
    <header className={`${styles.header} ${containerClass} ${className}`}>
      <div className={styles.innerContainer}>
        <div className={styles.headerLeft}>{leftSlot}</div>
        {centerSlot && <div className={styles.headerCenter}>{centerSlot}</div>}
        <div className={styles.headerRight}>{rightSlot}</div>
      </div>
    </header>
  )
}

BaseHeader.propTypes = {
  leftSlot: PropTypes.node,
  centerSlot: PropTypes.node,
  rightSlot: PropTypes.node,
  variant: PropTypes.oneOf(["fluid", "contained"]),
  className: PropTypes.string,
}

export default BaseHeader
