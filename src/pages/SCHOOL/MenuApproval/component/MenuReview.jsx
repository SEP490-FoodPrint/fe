import React from "react"
import PropTypes from "prop-types"
import { Button, Card, TextField, Typography } from "@mui/material"
import {
  CheckCircle2,
  FileCheck2,
  RotateCcw,
  ShieldCheck,
  Signature,
  Stethoscope,
} from "lucide-react"
import styles from "./MenuReview.module.scss"

function MenuReview({
  review,
  approval,
  directive,
  status,
  onDirectiveChange,
  onApprove,
  onReject,
  submitting,
}) {
  const isPending = status === "PENDING_APPROVAL"

  return (
    <section className={styles.grid} aria-label="Thẩm định và phê duyệt">
      <Card className={styles.card} elevation={0}>
        <div className={styles.cardHeader}>
          <span className={styles.headerIcon}><Stethoscope size={20} /></span>
          <div>
            <Typography component="h2" className={styles.title}>Thẩm định Y tế & VSATTP</Typography>
            <Typography className={styles.subtitle}>Bộ phận Y tế học đường</Typography>
          </div>
          <span className={styles.approvedBadge}>
            <CheckCircle2 size={15} /> {review.status}
          </span>
        </div>

        <div className={styles.reviewBox}>
          <div className={styles.reviewerRow}>
            <span className={styles.avatar}>LH</span>
            <div>
              <Typography className={styles.reviewer}>{review.reviewer}</Typography>
              <Typography className={styles.role}>{review.role}</Typography>
            </div>
            <Typography className={styles.reviewedAt}>{review.reviewedAt}</Typography>
          </div>
          <Typography className={styles.note}>“{review.note}”</Typography>
        </div>

        <Typography className={styles.documentLabel}>Hồ sơ pháp lý đính kèm</Typography>
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
            <Typography className={styles.subtitle}>Ghi chú được lưu trong biên bản điện tử</Typography>
          </div>
        </div>

        <TextField
          multiline
          minRows={5}
          fullWidth
          value={directive}
          disabled={!isPending || submitting}
          onChange={event => onDirectiveChange(event.target.value)}
          placeholder="Nhập ý kiến chỉ đạo về dị nguyên, nhiệt độ món ăn, lưu mẫu hoặc quy trình phục vụ..."
          className={styles.directiveInput}
        />

        <div className={styles.approver}>
          <ShieldCheck size={18} />
          <span>Người phê duyệt: <strong>{approval.approver}</strong> ({approval.role})</span>
        </div>

        {isPending ? (
          <div className={styles.actions}>
            <Button
              color="error"
              startIcon={<RotateCcw size={17} />}
              onClick={onReject}
              disabled={submitting}
            >
              Yêu cầu sửa đổi
            </Button>
            <Button
              variant="contained"
              startIcon={<CheckCircle2 size={17} />}
              onClick={onApprove}
              disabled={submitting}
            >
              {submitting ? "Đang xử lý..." : "Phê duyệt ngay"}
            </Button>
          </div>
        ) : (
          <div className={`${styles.finalState} ${status === "APPROVED" ? styles.finalApproved : styles.finalRevision}`}>
            {status === "APPROVED" ? <CheckCircle2 size={18} /> : <RotateCcw size={18} />}
            {status === "APPROVED"
              ? "Hồ sơ đã được Ban Giám hiệu phê duyệt"
              : "Hồ sơ đã được chuyển về để điều chỉnh"}
          </div>
        )}
      </Card>
    </section>
  )
}

MenuReview.propTypes = {
  review: PropTypes.object.isRequired,
  approval: PropTypes.object.isRequired,
  directive: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  onDirectiveChange: PropTypes.func.isRequired,
  onApprove: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
}

export default MenuReview
