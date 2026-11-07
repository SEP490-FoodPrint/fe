import React from "react"
import PropTypes from "prop-types"
import { Alert, Card, Chip, Typography } from "@mui/material"
import {
  CheckCircle2,
  FileCheck2,
  ShieldCheck,
  Signature,
  Stethoscope,
} from "lucide-react"
import styles from "./MenuReview.module.scss"

function MenuReview({ review, approval, status }) {

  return (
    <section className={styles.grid} aria-label="Thẩm định và phê duyệt">
      <Card className={styles.card} elevation={0}>
        <div className={styles.cardHeader}>
          <span className={styles.headerIcon}><Stethoscope size={20} /></span>
          <div>
            <Typography component="h2" className={styles.title}>Thẩm định Y tế & VSATTP</Typography>
            <Typography className={styles.subtitle}>Bộ phận Y tế học đường</Typography>
          </div>
          <Chip size="small" label={review.status} color={review.isApproved ? "success" : "warning"} variant="outlined" />
        </div>

        <div className={styles.reviewBox}>
          <div className={styles.reviewerRow}>
            <span className={styles.avatar}>{review.reviewer.split(" ").slice(-2).map(word => word[0]).join("")}</span>
            <div>
              <Typography className={styles.reviewer}>{review.reviewer}</Typography>
              <Typography className={styles.role}>{review.role}</Typography>
            </div>
            <Typography className={styles.reviewedAt}>{review.reviewedAt}</Typography>
          </div>
          <Typography className={styles.note}>“{review.note}”</Typography>
        </div>

        <Typography className={styles.documentLabel}>Hồ sơ pháp lý đính kèm</Typography>
        {!review.documents.length && <Typography className={styles.subtitle}>Chưa có tài liệu đính kèm.</Typography>}
        <div className={styles.documents}>
          {review.documents.map(document => (
            <div className={styles.document} key={document}>
              <FileCheck2 size={17} />
              <span>{document}</span>
              <CheckCircle2 size={16} />
            </div>
          ))}
        </div>
      </Card>

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
  review: PropTypes.object.isRequired,
  approval: PropTypes.object.isRequired,
  status: PropTypes.string,
}

export default MenuReview
