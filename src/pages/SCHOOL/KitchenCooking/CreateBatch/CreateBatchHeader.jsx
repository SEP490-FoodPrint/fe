import React from "react"
import { useNavigate } from "react-router-dom"
import styles from "./CreateBatchHeader.module.scss"

export default function CreateBatchHeader() {
  const navigate = useNavigate()

  return (
    <div className={styles.headerBar}>
      <div className={styles.titleGroup}>
        <div className={styles.breadcrumb}>
          <button
            type="button"
            className={styles.breadcrumbLink}
            onClick={() => navigate("/school/kitchen-cooking")}
          >
            Vận hành bếp
          </button>
          <span className={styles.separator}>/</span>
          <button
            type="button"
            className={styles.breadcrumbLink}
            onClick={() => navigate("/school/kitchen-cooking/batches")}
          >
            Lô chế biến
          </button>
          <span className={styles.separator}>/</span>
          <span className={styles.current}>Tạo mới</span>
        </div>
        <h1 className={styles.heading}>Tạo lô chế biến thực phẩm</h1>
      </div>

      <div className={styles.modeBadge}>
        <span className={styles.pulseDot} />
        <div className={styles.modeText}>
          <span className={styles.modeCategory}>Cấu hình vận hành</span>
          <span className={styles.modeValue}>
            Chế độ: Nấu chung (Cho phép kết hợp nhiều lô nguyên liệu cùng loại)
          </span>
        </div>
      </div>
    </div>
  )
}
