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

  const displayTitle = React.useMemo(() => {
    if (!menu) return "Thực đơn tuần"
    if (menu.name && menu.name.startsWith("Thực đơn tuần")) {
      return menu.name
    }
    const weekMatch = (menu.name || "").match(/tuần\s*(\d+)/i) || (menu.rawWeeklyTitle || "").match(/tuần\s*(\d+)/i)
    const weekNum = weekMatch ? weekMatch[1] : null
    const scope = menu.targetScope || ""
    const gradeMatch = scope.match(/\((Khối[^)]+)\)/i) || scope.match(/(Khối\s*\d+\s*[-–]\s*\d+)/i)
    const gradeText = gradeMatch ? gradeMatch[1] : "Khối 1 - 5"
    return weekNum ? `Thực đơn tuần ${weekNum} - ${gradeText}` : `Thực đơn tuần - ${gradeText}`
  }, [menu])

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
