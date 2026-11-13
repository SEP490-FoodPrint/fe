import React from "react"
import { useNavigate } from "react-router-dom"
import styles from "./MenuDetailHeader.module.scss"
import ROUTER from "src/router/ROUTER"

export default function MenuDetailHeader({
  menu,
  menuId,
  onSubmitApproval,
  onEdit,
}) {
  const navigate = useNavigate()
  // Thực đơn chưa được duyệt: bất kỳ trạng thái nào khác "APPROVED" (DRAFT, PENDING_APPROVAL, REVISION_REQUESTED...)
  const isApproved = String(menu?.status || "").toUpperCase() === "APPROVED" ||
                     String(menu?.weeklyStatus || "").toUpperCase() === "APPROVED"
  const canEdit = !isApproved && ["DRAFT", "PENDING_APPROVAL", "REVISION_REQUIRED", "REVISION_REQUESTED"].includes(menu?.status)
  const canSubmit = menu?.status === "DRAFT" || menu?.status === "REVISION_REQUESTED" || menu?.status === "REVISION_REQUIRED"

  const displayTitle = menu?.rawWeeklyTitle || menu?.name || "Th\u1ef1c \u0111\u01a1n"

  const getStatusBadge = (status) => {
    switch (status) {
      case "REVISION_REQUESTED":
      case "REVISION_REQUIRED":
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
              <span className="material-symbols-outlined text-[15px]">calendar_today</span>
              {menu.date}
            </span>
            <span className={styles.mealBadge}>
              {menu.mealType === "AFTERNOON" ? "Bữa chiều" : "Bữa trưa"}
            </span>
          </div>
          <h1 className={styles.pageTitle}>{displayTitle}</h1>
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

          {/* Nút Chỉnh sửa: Hiển thị khi thực đơn CHƯA ĐƯỢC DUYỆT */}
          {canEdit && onEdit && (
            <button
              type="button"
              className={styles.btnEdit}
              onClick={onEdit}
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              <span>Chỉnh sửa</span>
            </button>
          )}

          {/* Nút Gửi duyệt BGH (chỉ hiện khi nháp hoặc cần chỉnh sửa) */}
          {canSubmit && (
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
