import React from "react"
import PropTypes from "prop-types"
import { ScanLine } from "lucide-react"
import styles from "./DeliveryHeader.module.scss"

export default function DeliveryHeader({ onScan }) {
  return (
    <div className={styles.header}>
      <div className={styles.titleArea}>
        <h1 className={styles.title}>Giao hàng nguyên liệu</h1>
        <p className={styles.description}>
          Theo dõi tình hình giao hàng và kiểm tra thông tin nguyên liệu được cung cấp bởi các nhà cung cấp.
        </p>
      </div>
      {onScan && (
        <button type="button" className={styles.scanBtn} onClick={onScan}>
          <ScanLine size={18} aria-hidden="true" />
          <span>Quét mã QR</span>
        </button>
      )}
    </div>
  )
}

DeliveryHeader.propTypes = { onScan: PropTypes.func }
