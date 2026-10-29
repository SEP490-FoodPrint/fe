import React from "react"
import { useNavigate } from "react-router-dom"
import styles from "./CreateBatchSeparateHeader.module.scss"

export default function CreateBatchSeparateHeader() {
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
            Vận hành bếp bán trú
          </button>
          <span className={styles.separator}>•</span>
          <span className={styles.subCategory}>Quy chuẩn Nấu riêng</span>
        </div>
        <h1 className={styles.heading}>Tạo lô chế biến — Nấu riêng</h1>
        <p className={styles.subheading}>
          Áp dụng đối soát nguồn gốc 1:1, tự động tách mẻ chế biến theo từng lô
          nguyên liệu tươi sống đầu vào.
        </p>
      </div>

      <div className={styles.badgeWrap}>
        <div className={styles.strictModeBadge}>
          <span className={styles.pulseDot} />
          <span>Chế độ kiểm thực: Nghiêm ngặt (Nấu riêng)</span>
        </div>
      </div>
    </div>
  )
}
