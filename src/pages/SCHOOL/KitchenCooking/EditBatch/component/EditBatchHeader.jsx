import React from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, GitFork } from "lucide-react"
import ROUTER from "src/router/ROUTER"
import styles from "./EditBatchHeader.module.scss"

export default function EditBatchHeader({ batchCode = "CB-20261023-01A" }) {
  const navigate = useNavigate()

  const handleBackToDetail = () => {
    navigate(`/school/kitchen-cooking/batches/${batchCode}`)
  }

  return (
    <div className={styles.headerBar}>
      {/* 1. Breadcrumb navigation (Desktop >= 768px) */}
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
        <button
          type="button"
          className={styles.breadcrumbLink}
          onClick={handleBackToDetail}
        >
          <span>Chi tiết lô</span>
          <span className={styles.codeTag}>{batchCode}</span>
        </button>
        <span className={styles.separator}>/</span>
        <span className={styles.current}>Chỉnh sửa phương án</span>
      </nav>

      {/* 2. Main Title Row: Chỉ 1 nút Back duy nhất chuẩn mực bên cạnh tiêu đề */}
      <div className={styles.titleRow}>
        <div className={styles.titleLeft}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={handleBackToDetail}
            title="Quay lại chi tiết lô"
            aria-label="Quay lại chi tiết lô chế biến"
          >
            <ArrowLeft size={20} />
          </button>

          <div className={styles.headingWrap}>
            <div className={styles.titleLine}>
              <h1 className={styles.heading}>Chỉnh sửa lô chế biến</h1>
              <span className={styles.codeBadge}>{batchCode}</span>
              <span className={styles.statusDraftBadge}>
                <span className={styles.pulseDot} />
                Chưa xác nhận
              </span>
              <span className={styles.ruleBadge}>
                <GitFork size={13} />
                Quy tắc: Nấu riêng 1:1
              </span>
            </div>
            <p className={styles.subTitle}>
              Rà soát phương án phân bổ nguyên liệu và thay thế nguồn lô hợp chuẩn theo quy tắc Nấu riêng trước khi phê duyệt.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
