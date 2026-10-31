import React from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Tag, GitFork, ShieldCheck } from "lucide-react"
import ROUTER from "src/router/ROUTER"
import styles from "./EditBatchHeader.module.scss"

export default function EditBatchHeader({ batchCode = "CB-20261023-01A" }) {
  const navigate = useNavigate()

  const handleBackToDetail = () => {
    navigate(`/school/kitchen-cooking/batches/${batchCode}`)
  }

  return (
    <div className={styles.headerContainer}>
      {/* 1. Breadcrumb navigation */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <button
          type="button"
          className={styles.breadcrumbItem}
          onClick={() => navigate(ROUTER.SCHOOL_KITCHEN_COOKING)}
        >
          Vận hành bếp
        </button>
        <span className={styles.separator}>/</span>
        <button
          type="button"
          className={styles.breadcrumbItem}
          onClick={() => navigate(ROUTER.SCHOOL_KITCHEN_BATCHES)}
        >
          Lô chế biến
        </button>
        <span className={styles.separator}>/</span>
        <button
          type="button"
          className={styles.breadcrumbItem}
          onClick={handleBackToDetail}
        >
          <span>Chi tiết lô</span>
          <span className={styles.codeTag}>{batchCode}</span>
        </button>
        <span className={styles.separator}>/</span>
        <span className={styles.breadcrumbActive}>Chỉnh sửa phương án (Nấu riêng)</span>
      </nav>

      {/* 2. Main title row */}
      <div className={styles.titleRow}>
        <div className={styles.titleGroup}>
          <div className={styles.titleWithBadges}>
            <button
              type="button"
              className={styles.backButtonMobile}
              onClick={handleBackToDetail}
              title="Quay lại chi tiết lô"
              aria-label="Quay lại chi tiết lô chế biến"
            >
              <ArrowLeft size={18} />
            </button>

            <h1 className={styles.title}>Chỉnh sửa lô chế biến</h1>

            <div className={styles.codeBadge}>
              <Tag size={15} className={styles.codeBadgeIcon} />
              <span className={styles.codeBadgeText}>{batchCode}</span>
            </div>

            <div className={styles.statusBadge}>
              <span className={styles.pulseDot} />
              <span>Chưa xác nhận</span>
            </div>

            <div className={styles.ruleBadge}>
              <GitFork size={14} />
              <span>Quy tắc: Nấu riêng 1:1</span>
            </div>
          </div>

          <p className={styles.description}>
            Rà soát phương án phân bổ nguyên liệu và thay thế nguồn lô hợp chuẩn cho Lô 01 theo quy tắc Nấu riêng trước khi phê duyệt.
          </p>
        </div>

        <div className={styles.actionGroup}>
          <button
            type="button"
            className={styles.backButton}
            onClick={handleBackToDetail}
          >
            <ArrowLeft size={17} />
            <span>Quay lại chi tiết</span>
          </button>
        </div>
      </div>
    </div>
  )
}

