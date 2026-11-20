import React from "react"
import PropTypes from "prop-types"
import { Button } from "@mui/material"
import { CheckCircle2, ClipboardCheck, RotateCcw } from "lucide-react"
import { menuScopeLabel } from "src/utils/approvalWeek"
import MenuReview from "./MenuReview"
import MenuSchedule from "./MenuSchedule"
import styles from "./GradeMenuCard.module.scss"

const STATUS_CONFIG = {
  PENDING_APPROVAL: { label: "Chờ BGH phê duyệt", className: styles.statusPending, Icon: ClipboardCheck },
  APPROVED: { label: "Đã phê duyệt", className: styles.statusApproved, Icon: CheckCircle2 },
  REVISION_REQUIRED: { label: "Yêu cầu điều chỉnh", className: styles.statusRejected, Icon: RotateCcw },
}

// Một thực đơn của một (hoặc nhiều) khối: tên khối + thao tác + bảng món tuần
function GradeMenuCard({ menu, position, total, submitting, disabled, onApprove, onReject }) {
  const status = STATUS_CONFIG[menu.status] || { label: "Chưa gửi duyệt", className: styles.statusPending, Icon: ClipboardCheck }
  const scope = menuScopeLabel(menu)
  const titleId = `grade-menu-${menu.id}`
  const meta = [
    menu.title,
    menu.submittedAt && `Gửi đề xuất: ${menu.submittedAt}`,
    menu.summary?.proposer && `Người đề xuất: ${menu.summary.proposer}`,
    menu.summary?.supplier,
  ].filter(Boolean)

  return (
    <article className={styles.card} aria-labelledby={titleId}>
      <header className={styles.head}>
        <div className={styles.identity}>
          <span className={styles.position}>Thực đơn {position}/{total}</span>
          <div className={styles.titleRow}>
            <h2 id={titleId} className={styles.title}>{scope}</h2>
            <span className={`${styles.status} ${status.className}`}>
              <status.Icon size={14} />
              {status.label}
            </span>
          </div>
          {meta.length > 0 && <p className={styles.meta}>{meta.join(" · ")}</p>}
        </div>

        {menu.canDecide && (
          <div className={styles.actions}>
            <Button variant="outlined" color="error" onClick={onReject} disabled={disabled}>
              Yêu cầu chỉnh sửa
            </Button>
            <Button
              variant="contained"
              startIcon={<CheckCircle2 size={17} />}
              onClick={onApprove}
              disabled={disabled}
            >
              {submitting ? "Đang xử lý..." : "Phê duyệt"}
            </Button>
          </div>
        )}
      </header>

      <MenuSchedule days={menu.days} label={`Thực đơn tuần ${scope}`} />

      {/* Chỉ hiện ý kiến BGH khi đã có quyết định; lúc chờ duyệt đã có nhãn trạng thái */}
      {menu.status !== "PENDING_APPROVAL" && menu.approval && (
        <MenuReview approval={menu.approval} status={menu.status} />
      )}
    </article>
  )
}

GradeMenuCard.propTypes = {
  menu: PropTypes.object.isRequired,
  position: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  submitting: PropTypes.bool,
  disabled: PropTypes.bool,
  onApprove: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
}

export default GradeMenuCard
