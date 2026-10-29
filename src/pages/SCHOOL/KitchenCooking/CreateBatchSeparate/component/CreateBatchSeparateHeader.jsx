import React from "react"
import { useNavigate } from "react-router-dom"
import styles from "./CreateBatchSeparateHeader.module.scss"

export default function CreateBatchSeparateHeader() {
  const navigate = useNavigate()

  return (
    <div className={styles.headerBar}>
      <div className={styles.leftCol}>
        <div className={styles.breadcrumb}>
          <button
            type="button"
            className={styles.crumbBtn}
            onClick={() => navigate("/school/kitchen-cooking")}
          >
            <span className="material-symbols-outlined">home</span>
            <span>Bếp bán trú</span>
          </button>
          <span className={styles.slash}>/</span>
          <button
            type="button"
            className={styles.crumbBtn}
            onClick={() => navigate("/school/kitchen-cooking/batches")}
          >
            Lô chế biến
          </button>
          <span className={styles.slash}>/</span>
          <span className={styles.crumbActive}>Tạo mẻ nấu riêng</span>
        </div>

        <div className={styles.titleRow}>
          <h1 className={styles.title}>Tạo lô chế biến — Nấu riêng</h1>
          <div className={styles.modePill} title="Mỗi lô nguyên liệu đầu vào sẽ được tự động tách thành 1 mẻ riêng biệt">
            <span className={styles.dotPulse} />
            <span>Chế độ: Nấu riêng 1:1</span>
          </div>
        </div>
      </div>

      <div className={styles.rightCol}>
        <span className={styles.infoTag}>
          <span className="material-symbols-outlined">verified_user</span>
          <span>Kiểm thực nghiêm ngặt</span>
        </span>
      </div>
    </div>
  )
}
