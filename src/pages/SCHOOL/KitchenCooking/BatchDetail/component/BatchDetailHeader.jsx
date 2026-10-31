import React from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, ArrowUpRight } from "lucide-react"
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
      {/* 1. Breadcrumb Hierarchy (Hiện trên Desktop >= 768px) */}
      <nav className={styles.breadcrumbDesktop} aria-label="Breadcrumb">
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
        <span className={styles.current}>{batchData.code}</span>
      </nav>

      {/* 2. Title Row: Nút quay lại + Tiêu đề + Mã lô + Badge trạng thái + Nút Desktop */}
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
              <span className={styles.codeBadge}>{batchData.code}</span>
              {getStatusBadge()}
            </div>
            <p className={styles.subTitle}>
              Xem và kiểm tra phương án định mức trước khi tiến hành chế biến tại bếp.
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

