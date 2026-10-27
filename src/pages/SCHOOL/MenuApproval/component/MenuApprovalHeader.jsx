import React from "react"
import PropTypes from "prop-types"
import { Breadcrumbs, Button, Card, Chip, Typography } from "@mui/material"
import {
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Printer,
  RotateCcw,
} from "lucide-react"
import styles from "./MenuApprovalHeader.module.scss"

const STATUS_CONFIG = {
  PENDING_APPROVAL: {
    label: "Chờ BGH phê duyệt",
    className: styles.statusPending,
    icon: <ClipboardCheck size={14} />,
  },
  APPROVED: {
    label: "Đã phê duyệt bởi BGH",
    className: styles.statusApproved,
    icon: <CheckCircle2 size={14} />,
  },
  REVISION_REQUESTED: {
    label: "Yêu cầu điều chỉnh",
    className: styles.statusRejected,
    icon: <RotateCcw size={14} />,
  },
}

function MenuApprovalHeader({ menu, onApprove, onReject, onPrint }) {
  const status = STATUS_CONFIG[menu.status] || STATUS_CONFIG.PENDING_APPROVAL
  const isPending = menu.status === "PENDING_APPROVAL"

  return (
    <section className={styles.wrapper} aria-labelledby="menu-approval-title">
      <Breadcrumbs
        separator={<ChevronRight size={14} />}
        aria-label="Điều hướng trang"
        className={styles.breadcrumbs}
      >
        <Typography variant="caption">Ban Giám hiệu</Typography>
        <Typography variant="caption">Duyệt thực đơn</Typography>
        <Typography variant="caption" className={styles.currentBreadcrumb}>
          Chi tiết đề xuất
        </Typography>
      </Breadcrumbs>

      <Card className={styles.headerCard} elevation={0}>
        <div className={styles.headingGroup}>
          <div className={styles.titleRow}>
            <Typography id="menu-approval-title" component="h1" className={styles.title}>
              Chi tiết thực đơn đề xuất
            </Typography>
            <Chip label={`Mã: ${menu.code}`} size="small" className={styles.codeChip} />
            <span className={`${styles.status} ${status.className}`}>
              {status.icon}
              {status.label}
            </span>
          </div>
          <Typography className={styles.description}>{menu.description}</Typography>
        </div>

        <div className={styles.actions}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<Printer size={17} />}
            onClick={onPrint}
          >
            In / Xuất PDF
          </Button>
          {isPending && (
            <>
              <Button variant="text" color="error" onClick={onReject}>
                Yêu cầu chỉnh sửa
              </Button>
              <Button
                variant="contained"
                startIcon={<CheckCircle2 size={17} />}
                onClick={onApprove}
              >
                Phê duyệt thực đơn
              </Button>
            </>
          )}
        </div>
      </Card>
    </section>
  )
}

MenuApprovalHeader.propTypes = {
  menu: PropTypes.object.isRequired,
  onApprove: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
  onPrint: PropTypes.func.isRequired,
}

export default MenuApprovalHeader
