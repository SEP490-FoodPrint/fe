import React from "react"
import PropTypes from "prop-types"
import styles from "./FoodPrintLoading.module.scss"

/**
 * FoodPrintLoading - Hiệu ứng Loading chuẩn mực và thống nhất cho toàn bộ hệ thống FoodPrint
 * - Vòng tròn viền xanh sage FoodPrint (#84baa9 - #52b299)
 * - 5 chấm tròn màu xanh FoodPrint (#08604d, #0a8066, #239378, #52b299, #84baa9) chuyển động xoay và nhấp nháy êm dịu
 * - Không chữ, không logo, không thanh tiến trình
 * - Nền trong suốt hoặc trắng tinh tế (không dùng nền be)
 */
export default function FoodPrintLoading({
  size = "medium",
  fullscreen = false,
  background = fullscreen ? "white" : "transparent",
  className = "",
  style = {},
}) {
  let dimension = 50
  let sizeClass = styles.sizeMedium

  if (size === "small") {
    dimension = 32
    sizeClass = styles.sizeSmall
  } else if (size === "large") {
    dimension = 50
    sizeClass = styles.sizeLarge
  } else if (typeof size === "number") {
    dimension = size
    sizeClass = ""
  }

  const bgClass =
    background === "white"
      ? styles.whiteBg
      : background === "transparent"
      ? styles.transparentBg
      : ""

  const content = (
    <div
      className={`${styles.container} ${sizeClass} ${bgClass} ${className}`}
      style={typeof size === "number" ? { width: dimension, height: dimension, ...style } : style}
      role="status"
      aria-label="Đang tải dữ liệu"
    >
      <svg
        className={styles.svgLoader}
        width={dimension}
        height={dimension}
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        {/* Vòng tròn ngoài viền xanh sage */}
        <circle className={styles.outerRing} cx="50" cy="50" r="46" />

        {/* 5 chấm tròn màu xanh FoodPrint chuyển động xoay và nhấp nháy */}
        <g className={styles.dotsCluster}>
          {/* Hàng trên: 2 chấm */}
          <circle
            className={`${styles.dot} ${styles.dot1}`}
            cx="41"
            cy="38.5"
            r="7.5"
            fill="#08604D"
          />
          <circle
            className={`${styles.dot} ${styles.dot2}`}
            cx="61"
            cy="39.5"
            r="5.5"
            fill="#52B299"
          />

          {/* Hàng dưới: 3 chấm */}
          <circle
            className={`${styles.dot} ${styles.dot3}`}
            cx="50"
            cy="62"
            r="7.5"
            fill="#0A8066"
          />
          <circle
            className={`${styles.dot} ${styles.dot4}`}
            cx="31"
            cy="62"
            r="5.5"
            fill="#239378"
          />
          <circle
            className={`${styles.dot} ${styles.dot5}`}
            cx="69"
            cy="62"
            r="4.5"
            fill="#84BAA9"
          />
        </g>
      </svg>
    </div>
  )

  if (fullscreen) {
    return (
      <div className={styles.fullscreenOverlay} role="alert" aria-busy="true">
        {content}
      </div>
    )
  }

  return content
}

FoodPrintLoading.propTypes = {
  size: PropTypes.oneOfType([PropTypes.oneOf(["small", "medium", "large"]), PropTypes.number]),
  fullscreen: PropTypes.bool,
  background: PropTypes.oneOf(["white", "transparent", "none"]),
  className: PropTypes.string,
  style: PropTypes.object,
}
