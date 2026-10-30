import React from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, Layers } from "lucide-react"
import ROUTER from "src/router/ROUTER"
import styles from "./CreateBatchHeader.module.scss"

export default function CreateBatchHeader() {
  const navigate = useNavigate()

  return (
    <div className={styles.headerBar}>
      <div className={styles.leftWrap}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate(ROUTER.SCHOOL_KITCHEN_BATCHES)}
          aria-label="Quay lại danh sách lô chế biến"
        >
          <ChevronLeft size={18} />
          <span className={styles.backText}>Lô chế biến</span>
        </button>

        <div className={styles.titleGroup}>
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
            <span className={styles.current}>Tạo mới</span>
          </div>
          <h1 className={styles.heading}>Tạo lô chế biến (Nấu chung)</h1>
        </div>
      </div>

      <div className={styles.modeBadge} title="Chế độ cấu hình vận hành: Cho phép kết hợp nhiều lô nguyên liệu cùng loại">
        <span className={styles.pulseDot} />
        <Layers size={13} className={styles.modeIcon} />
        <span className={styles.modeValue}>
          Nấu chung (Đa lô nguyên liệu)
        </span>
      </div>
    </div>
  )
}
