import React from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, GitFork, Combine } from "lucide-react"
import ROUTER from "src/router/ROUTER"
import styles from "./EditBatchHeader.module.scss"

export default function EditBatchHeader({
  batchCode = "CB-20261023-01",
  rule = "COMBINE_LOTS",
  onToggleRule
}) {
  const navigate = useNavigate()
  const isCombineLots = rule === "COMBINE_LOTS"

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
        <span className={styles.current}>
          {isCombineLots ? "Chỉnh sửa lô nấu chung" : "Chỉnh sửa lô riêng"}
        </span>
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
              <h1 className={styles.heading}>
                {isCombineLots ? "Chỉnh sửa lô nấu chung" : "Chỉnh sửa lô chế biến"}
              </h1>
              <span className={styles.codeBadge}>{batchCode}</span>
              <span className={styles.statusDraftBadge}>
                <span className={styles.pulseDot} />
                Chưa xác nhận
              </span>
              {isCombineLots ? (
                <span className={styles.ruleBadgeCombine}>
                  <Combine size={13} />
                  Quy tắc: Nấu chung đa lô
                </span>
              ) : (
                <span className={styles.ruleBadge}>
                  <GitFork size={13} />
                  Quy tắc: Nấu riêng 1:1
                </span>
              )}
            </div>
            <p className={styles.subTitle}>
              {isCombineLots
                ? "Rà soát phương án phối trộn nguyên liệu giữa các lô nguồn gốc cho mẻ chế biến theo quy tắc Nấu chung trước khi phê duyệt."
                : "Rà soát phương án phân bổ nguyên liệu và thay thế nguồn lô hợp chuẩn theo quy tắc Nấu riêng trước khi phê duyệt."}
            </p>
          </div>
        </div>

        {/* Chuyển đổi nhanh chế độ kiểm tra phương án */}
        {onToggleRule && (
          <div className={styles.ruleSwitchWrap}>
            <button
              type="button"
              className={`${styles.switchBtn} ${isCombineLots ? styles.switchBtnActive : ""}`}
              onClick={() => onToggleRule("COMBINE_LOTS")}
              title="Xem giao diện Nấu chung đa lô"
            >
              <Combine size={13} />
              <span>Nấu chung</span>
            </button>
            <button
              type="button"
              className={`${styles.switchBtn} ${!isCombineLots ? styles.switchBtnActive : ""}`}
              onClick={() => onToggleRule("SEPARATE_BY_LOT")}
              title="Xem giao diện Nấu riêng 1:1"
            >
              <GitFork size={13} />
              <span>Nấu riêng</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
