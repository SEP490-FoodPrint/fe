import React from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import ROUTER from "src/router/ROUTER"
import styles from "./CreateBatchSeparateHeader.module.scss"

export default function CreateBatchSeparateHeader() {
  const navigate = useNavigate()

  return (
    <div className={styles.headerBar}>
      {/* Breadcrumb (Hiện trên Desktop >= 768px) */}
      <div className={styles.breadcrumbDesktop}>
        <button
          type="button"
          className={styles.breadcrumbLink}
          onClick={() => navigate(ROUTER.SCHOOL_KITCHEN_COOKING)}
        >
          Vận hành bếp
        </button>
        <span className={styles.separator}>/</span>
        <button
          type="button"
          className={styles.breadcrumbLink}
          onClick={() => navigate(ROUTER.SCHOOL_KITCHEN_BATCHES)}
        >
          Lô chế biến
        </button>
        <span className={styles.separator}>/</span>
        <span className={styles.current}>Tạo mới (Nấu riêng)</span>
      </div>

      {/* Title Row: Nút quay lại icon không viền + Tiêu đề + Chip Chế độ trên cùng 1 hàng */}
      <div className={styles.titleRow}>
        <div className={styles.titleLeft}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => navigate(ROUTER.SCHOOL_KITCHEN_BATCHES)}
            title="Quay lại danh sách lô"
            aria-label="Quay lại danh sách lô chế biến"
          >
            <ArrowLeft size={20} />
          </button>

          <h1 className={styles.heading}>Tạo lô chế biến</h1>
        </div>

        <div
          className={styles.modeBadge}
          title="Chế độ nấu riêng 1:1: Mỗi lô nguyên liệu đầu vào được tự động tách thành một lô chế biến độc lập"
        >
          <span className={styles.pulseDot} />
          <span className={styles.modeMobileText}>Nấu riêng 1:1</span>
          <span className={styles.modeDesktopText}>
            Chế độ: Nấu riêng 1:1 (Tách lô nguyên liệu)
          </span>
        </div>
      </div>
    </div>
  )
}
