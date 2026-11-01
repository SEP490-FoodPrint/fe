import React from "react"
import styles from "./EditMenuHeader.module.scss"

export default function EditMenuHeader({ menu, onBack }) {
  if (!menu) return null

  const getStatusBadge = (status) => {
    switch (status) {
      case "REVISION_REQUESTED":
        return (
          <span className={`${styles.statusBadge} ${styles.revision}`}>
            <span className={styles.statusDot}></span>
            Yêu cầu chỉnh sửa
          </span>
        )
      case "APPROVED":
        return (
          <span className={`${styles.statusBadge} ${styles.approved}`}>
            <span className={styles.statusDot}></span>
            Đã duyệt
          </span>
        )
      case "PENDING_APPROVAL":
        return (
          <span className={`${styles.statusBadge} ${styles.pending}`}>
            <span className={styles.statusDot}></span>
            Chờ BGH duyệt
          </span>
        )
      case "DRAFT":
      default:
        return (
          <span className={`${styles.statusBadge} ${styles.draft}`}>
            <span className={styles.statusDot}></span>
            Bản nháp
          </span>
        )
    }
  }

  return (
    <div className={styles.headerContainer}>
      <div className={styles.titleRow}>
        <div className={styles.titleBlock}>
          <div className={styles.titleWithBadge}>
            <h1 className={styles.pageTitle}>Chỉnh sửa thực đơn</h1>
            <span className={styles.codePill}>{menu.code}</span>
            {getStatusBadge(menu.status)}
          </div>
          <p className={styles.pageSubtitle}>
            Cập nhật cơ cấu món ăn, định lượng khẩu phần và đối soát nguyên liệu theo ý kiến chỉ đạo của Ban Giám Hiệu.
          </p>
        </div>

        <button type="button" className={styles.backBtn} onClick={onBack}>
          <span className={`material-symbols-outlined ${styles.backIcon}`}>arrow_back</span>
          <span>Quay lại chi tiết</span>
        </button>
      </div>
    </div>
  )
}

