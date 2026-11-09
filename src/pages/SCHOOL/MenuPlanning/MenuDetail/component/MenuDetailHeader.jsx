import React from "react"
import { useNavigate } from "react-router-dom"
import styles from "./MenuDetailHeader.module.scss"
import ROUTER from "src/router/ROUTER"

export default function MenuDetailHeader({
  menu,
  onSubmitApproval
}) {
  const navigate = useNavigate()
  const canEdit = menu.status === "DRAFT" || menu.status === "REVISION_REQUESTED"

  const getStatusBadge = (status) => {
    switch (status) {
      case "REVISION_REQUESTED":
        return <span className={`${styles.statusBadge} ${styles.revision}`}>Yêu cầu chỉnh sửa</span>
      case "APPROVED":
        return <span className={`${styles.statusBadge} ${styles.approved}`}>Đã phê duyệt</span>
      case "PENDING_APPROVAL":
        return <span className={`${styles.statusBadge} ${styles.pending}`}>Chờ BGH duyệt</span>
      case "DRAFT":
      default:
        return <span className={`${styles.statusBadge} ${styles.draft}`}>Bản nháp</span>
    }
  }

  return (
    <div className={styles.headerContainer}>
      {/* Main Title Row */}
      <div className={styles.titleRow}>
        <div className={styles.titleInfo}>
          <div className={styles.codeWithStatus}>
            <span className={styles.codePill}>{menu.code}</span>
            {getStatusBadge(menu.status)}
            <span className={styles.dateLabel}>
              <span className="material-symbols-outlined text-[16px]">calendar_today</span>
              Ngày ăn: {menu.date}
            </span>
          </div>
          <h1 className={styles.pageTitle}>{menu.name}</h1>
          <p className={styles.pageSubtitle}>
            Kế hoạch thực đơn dinh dưỡng bán trú đã được lập và đối soát an toàn theo quy chuẩn y tế học đường.
          </p>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          {/* Nút Quay lại */}
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => navigate(ROUTER.SCHOOL_MENU_PLANNING)}
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Danh sách</span>
          </button>

          {/* Nút Chỉnh sửa: CHỈ hiển thị nếu status là DRAFT hoặc REVISION_REQUESTED */}
          {canEdit && (
            <button
              type="button"
              className={styles.btnEdit}
              onClick={() => navigate(ROUTER.SCHOOL_MENU_EDIT.replace(":id", menu.id), { state: { menu } })}
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              <span>Chỉnh sửa</span>
            </button>
          )}

          {/* Nút Gửi duyệt BGH */}
          {canEdit && (
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={onSubmitApproval}
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              <span>Gửi BGH duyệt</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
