import React from "react"
import { useNavigate } from "react-router-dom"
import styles from "./CreateBatchHeader.module.scss"

export default function CreateBatchHeader() {
  const navigate = useNavigate()

  return (
    <div className={styles.headerBar}>
      <div className={styles.titleGroup}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <button
            type="button"
            className={styles.breadcrumbLink}
            onClick={() => navigate("/school/kitchen-cooking")}
          >
            <span className="material-symbols-outlined">home</span>
            <span>Bếp bán trú</span>
          </button>
          <span className="material-symbols-outlined">chevron_right</span>
          <button
            type="button"
            className={styles.breadcrumbLink}
            onClick={() => navigate("/school/kitchen-cooking/batches")}
          >
            Lô chế biến
          </button>
          <span className="material-symbols-outlined">chevron_right</span>
          <span className={styles.current}>Tạo mẻ nấu chung</span>
        </nav>
        <div className={styles.headingRow}>
          <h1 className={styles.heading}>Tạo lô chế biến — Nấu chung</h1>
          <div className={styles.modeBadge}>
            <span className={styles.pulseDot} />
            <span className={styles.modeText}>Chế độ: Nấu chung đa lô</span>
          </div>
        </div>
      </div>

      <div className={styles.badgeGroup}>
        <div
          className={styles.policyTag}
          title="Cho phép kết hợp nhiều lô cùng loại vào 1 mẻ nhưng bảo toàn định lượng từng lô"
        >
          <span className="material-symbols-outlined">blender</span>
          <span>Gộp lô cùng loại</span>
        </div>
      </div>
    </div>
  )
}
