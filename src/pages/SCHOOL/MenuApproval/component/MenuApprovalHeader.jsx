import React from "react"
import PropTypes from "prop-types"
import { Button } from "@mui/material"
import { CheckCircle2, ClipboardCheck, Printer, RotateCcw } from "lucide-react"
import styles from "./MenuApprovalHeader.module.scss"

const STATUS_CONFIG = {
  PENDING_APPROVAL: {
    label: "Chờ BGH phê duyệt",
    className: styles.statusPending,
    icon: <ClipboardCheck size={14} />,
  },
  APPROVED: {
    label: "Đã phê duyệt",
    className: styles.statusApproved,
    icon: <CheckCircle2 size={14} />,
  },
  REVISION_REQUIRED: {
    label: "Yêu cầu điều chỉnh",
    className: styles.statusRejected,
    icon: <RotateCcw size={14} />,
  },
}

function MenuApprovalHeader({
  menu,
  onApprove,
  onReject,
  onPrint,
  canDecide,
  submitting,
}) {
  const status = STATUS_CONFIG[menu.status] || { label: "Chưa gửi duyệt", className: styles.statusPending }

  return (
    <>
      <header className={styles.header}>
        <div>
          <nav className={styles.breadcrumb} aria-label="Đường dẫn trang">
            <span>Ban Giám hiệu</span>
            <span>/</span>
            <strong>Phê duyệt thực đơn</strong>
          </nav>
          <h1 id="menu-approval-title" className={styles.title}>Phê duyệt thực đơn</h1>
        </div>
      </header>

      <section className={styles.decisionBar} aria-labelledby="menu-approval-title">
        <div className={styles.decisionInfo}>
          <span className={`${styles.status} ${status.className}`}>
            {status.icon}
            {status.label}
          </span>        </div>

        <div className={styles.actions}>
          <Button
            variant="text"
            color="inherit"
            startIcon={<Printer size={17} />}
            onClick={onPrint}
          >
            In / Xuất PDF
          </Button>
          {canDecide && (
            <>
              <Button variant="outlined" color="error" onClick={onReject} disabled={submitting}>
                Yêu cầu chỉnh sửa
              </Button>
              <Button
                variant="contained"
                startIcon={<CheckCircle2 size={17} />}
                onClick={onApprove}
                disabled={submitting}
              >
                Phê duyệt
              </Button>
            </>
          )}
        </div>
      </section>
    </>
  )
}

MenuApprovalHeader.propTypes = {
  menu: PropTypes.object.isRequired,
  onApprove: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
  onPrint: PropTypes.func.isRequired,
  canDecide: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
}

export default MenuApprovalHeader
