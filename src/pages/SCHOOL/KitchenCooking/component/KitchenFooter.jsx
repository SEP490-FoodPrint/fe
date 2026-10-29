import React from "react"
import styles from "./KitchenFooter.module.scss"

function KitchenFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.left}>
        <span className={styles.brandTitle}>FoodPrint Bếp trường học</span>
        <span className={styles.sep}>—</span>
        <span>Hệ thống quản lý an toàn &amp; vận hành bữa ăn học đường</span>
      </div>
      <div className={styles.right}>
        <a href="#3step" className={styles.link}>
          Quy trình kiểm thực 3 bước
        </a>
        <a href="#samples" className={styles.link}>
          Lưu mẫu 24h - 48h
        </a>
        <a href="#support" className={styles.link}>
          Hỗ trợ kỹ thuật
        </a>
      </div>
    </footer>
  )
}

export default KitchenFooter
