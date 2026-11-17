import React, { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import styles from "./MenuDetailHeader.module.scss"
import ROUTER from "src/router/ROUTER"
import { getMenuISOWeek } from "src/services/MenuService/adapter"

/**
 * Định dạng tiêu đề thực đơn hiển thị theo tuần (VD: "Thực đơn Tuần 47 (Toàn trường)"),
 * loại bỏ hoàn toàn ngày tháng khỏi tiêu đề theo yêu cầu người dùng.
 */
function formatWeeklyMenuTitle(menu) {
  if (!menu) return "Thực đơn"
  const weekNum = menu.weekNumber || getMenuISOWeek(menu)
  let title = menu.rawWeeklyTitle || menu.name || "Thực đơn"

  if (weekNum) {
    if (/tuần\s+\d{1,2}\/\d{1,2}\s*[-–—]\s*\d{1,2}\/\d{1,2}/i.test(title)) {
      title = title.replace(/tuần\s+\d{1,2}\/\d{1,2}\s*[-–—]\s*\d{1,2}\/\d{1,2}/gi, `Tuần ${weekNum}`)
    } else if (/tuần\s+\d{1,2}\/\d{1,2}/i.test(title)) {
      title = title.replace(/tuần\s+\d{1,2}\/\d{1,2}/gi, `Tuần ${weekNum}`)
    } else if (!/tuần\s+\d+/i.test(title)) {
      const scope = menu.targetScope || (menu.isSchoolWide ? "Toàn trường" : "")
      title = `Thực đơn Tuần ${weekNum}${scope ? ` (${scope})` : ""}`
    }
  }

  // Đảm bảo không còn ngày tháng sót lại trong cụm từ tuần
  title = title.replace(/\s*\(\d{1,2}\/\d{1,2}\s*[-–—]\s*\d{1,2}\/\d{1,2}\)/g, "")
  return title
}

function getDayOfWeekLabel(dateISO) {
  if (!dateISO) return ""
  const d = new Date(dateISO)
  if (isNaN(d.getTime())) return ""
  const labels = ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"]
  return labels[d.getDay()] || ""
}

export default function MenuDetailHeader({
  menu,
  menuId,
  onSubmitApproval,
  onEdit,
}) {
  const navigate = useNavigate()
  const isApproved = String(menu?.status || "").toUpperCase() === "APPROVED" ||
                     String(menu?.weeklyStatus || "").toUpperCase() === "APPROVED"
  const canEdit = !isApproved && ["DRAFT", "PENDING_APPROVAL", "REVISION_REQUIRED", "REVISION_REQUESTED"].includes(menu?.status)
  const canSubmit = menu?.status === "DRAFT" || menu?.status === "REVISION_REQUESTED" || menu?.status === "REVISION_REQUIRED"

  const displayTitle = useMemo(() => formatWeeklyMenuTitle(menu), [menu])
  const dayOfWeek = useMemo(() => getDayOfWeekLabel(menu?.rawDate), [menu?.rawDate])

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
      {/* Hàng trên: Tiêu đề Thực đơn Tuần XX + Trạng thái phê duyệt + Nhóm nút hành động */}
      <div className={styles.titleRow}>
        <div className={styles.titleLeftGroup}>
          <h1 className={styles.pageTitle}>{displayTitle}</h1>
          {getStatusBadge(menu?.status)}
        </div>

        {/* Nút hành động bên phải */}
        <div className={styles.actionButtons}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => navigate(ROUTER.SCHOOL_MENU_PLANNING)}
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Danh sách</span>
          </button>

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

      {/* Hàng dưới: Thanh metadata ngày phục vụ, ca ăn gọn gàng (đã bỏ mã theo yêu cầu) */}
      <div className={styles.metaInfoRow}>
        <span className={styles.dateInfo}>
          <span className="material-symbols-outlined text-[16px] text-slate-400">calendar_today</span>
          <span>{dayOfWeek ? `${dayOfWeek}, ${menu?.date}` : menu?.date}</span>
        </span>
        <span className={styles.divider}>•</span>
        <span className={styles.mealBadge}>
          {menu?.mealType === "AFTERNOON" ? "Bữa chiều" : "Bữa trưa"}
        </span>
      </div>
    </div>
  )
}
