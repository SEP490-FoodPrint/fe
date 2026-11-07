import React from "react"
import styles from "./DeliveryHeader.module.scss"

export default function DeliveryHeader() {
  return (
    <div className={styles.header}>
      <div className={styles.titleArea}>
        <h1 className={styles.title}>Giao hàng nguyên liệu</h1>
        <p className={styles.description}>
          Theo dõi tình hình giao hàng và kiểm tra thông tin nguyên liệu được cung cấp bởi các nhà cung cấp.
        </p>
      </div>
    </div>
  )
}
