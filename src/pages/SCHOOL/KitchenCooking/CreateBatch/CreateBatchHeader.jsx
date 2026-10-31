import React from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import ROUTER from "src/router/ROUTER"
import styles from "./CreateBatchHeader.module.scss"

export default function CreateBatchHeader() {
  const navigate = useNavigate()

  return (
    <div className={styles.headerBar}>
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
          title="Chế độ cấu hình vận hành: Cho phép kết hợp nhiều lô nguyên liệu cùng loại"
        >
          <span className={styles.pulseDot} />
          <span className={styles.modeMobileText}>Nấu chung</span>
          <span className={styles.modeDesktopText}>
            Chế độ: Nấu chung (Đa lô nguyên liệu)
          </span>
        </div>
      </div>
    </div>
  )
}
