import React from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import ROUTER from "src/router/ROUTER"
import styles from "./BatchDetailHeader.module.scss"

export default function BatchDetailHeader({ batchData }) {
  const navigate = useNavigate()

  const getStatusBadge = () => {
    switch (batchData.status) {
      case "CONFIRMED":
        return (
          <span className={`${styles.statusBadge} ${styles.statusConfirmed}`}>
            <span className={styles.pulseDot} />
            Đã xác nhận phương án
          </span>
        )
      case "COMPLETED":
        return (
          <span className={`${styles.statusBadge} ${styles.statusCompleted}`}>
            <span className={styles.pulseDot} />
            Đã hoàn thành
          </span>
        )
      case "DRAFT":
      default:
        return (
          <span className={`${styles.statusBadge} ${styles.statusDraft}`}>
            <span className={styles.pulseDot} />
            Chưa xác nhận
          </span>
        )
    }
  }

  return (
    <div className={styles.headerBar}>
      {/* Title Row: Nút quay lại + Tiêu đề + Badge trạng thái + Nút Desktop */}
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

          <div className={styles.headingWrap}>
            <div className={styles.titleLine}>
              <h1 className={styles.heading}>Chi tiết lô chế biến</h1>
              {getStatusBadge()}
            </div>
            <p className={styles.subTitle}>
              Xem và kiểm tra phương án trước khi tiến hành chế biến tại bếp.
            </p>
          </div>
        </div>

        {/* Nút Desktop bên phải */}
        <div className={styles.headerActionsDesktop}>
          <button
            type="button"
            className={styles.backToListBtn}
            onClick={() => navigate(ROUTER.SCHOOL_KITCHEN_BATCHES)}
          >
            <ArrowLeft size={16} />
            <span>Danh sách lô</span>
          </button>
        </div>
      </div>
    </div>
  )
}
