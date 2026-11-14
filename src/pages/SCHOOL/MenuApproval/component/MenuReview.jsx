import React from "react"
import PropTypes from "prop-types"
import { Alert, Card, Typography } from "@mui/material"
import { ShieldCheck, Signature } from "lucide-react"
import styles from "./MenuReview.module.scss"

function MenuReview({ approval, status }) {
  return (
    <section className={styles.grid} aria-label="Phê duyệt">
      <Card className={styles.card} elevation={0}>
        <div className={styles.cardHeader}>
          <span className={`${styles.headerIcon} ${styles.primaryIcon}`}><Signature size={20} /></span>
          <div>
            <Typography component="h2" className={styles.title}>Ý kiến chỉ đạo của Ban Giám hiệu</Typography>
            <Typography className={styles.subtitle}>Quyết định áp dụng cho cả tuần</Typography>
          </div>
        </div>

        {approval.note ? (
          <Typography className={styles.note}>“{approval.note}”</Typography>
        ) : (
          <Typography className={styles.subtitle}>Chưa có ý kiến chỉ đạo.</Typography>
        )}

        {approval.approver && (
          <div className={styles.approver}>
            <ShieldCheck size={18} />
            <span>Người quyết định: <strong>{approval.approver}</strong> ({approval.role})</span>
          </div>
        )}

        <Alert severity={status === "APPROVED" ? "success" : status === "REVISION_REQUIRED" ? "warning" : "info"}>
          {status === "APPROVED"
            ? "Thực đơn tuần đã được phê duyệt"
            : status === "REVISION_REQUIRED"
              ? "Đã yêu cầu Y tế chỉnh sửa thực đơn tuần"
              : "Đang chờ Ban Giám hiệu quyết định"}
        </Alert>
      </Card>
    </section>
  )
}

MenuReview.propTypes = {
  approval: PropTypes.object.isRequired,
  status: PropTypes.string,
}

export default MenuReview
