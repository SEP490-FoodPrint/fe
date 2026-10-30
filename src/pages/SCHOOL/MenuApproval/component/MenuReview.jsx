import React from "react"
import PropTypes from "prop-types"
import { Alert, Button, Card, Chip, TextField, Typography } from "@mui/material"
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
  canDecide,
  scopeLabel,
  onDirectiveChange,
  onApprove,
  onReject,
  submitting,
}) {
  const isPending = canDecide

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
            <Typography className={styles.subtitle}>Phạm vi: {scopeLabel}</Typography>
          </div>
        </div>

        <TextField
          multiline
          minRows={5}
          fullWidth
          value={isPending ? directive : approval.note || ""}
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
              {submitting ? "Đang xử lý..." : `Phê duyệt ${scopeLabel}`}
            </Button>
          </div>
        ) : (
          <Alert severity={status === "APPROVED" ? "success" : status === "REVISION_REQUIRED" ? "warning" : "info"}>
            {status === "APPROVED"
              ? `Đã phê duyệt ${scopeLabel}`
              : status === "REVISION_REQUIRED"
                ? `Có yêu cầu điều chỉnh trong phạm vi ${scopeLabel}`
                : "Thực đơn chưa sẵn sàng để duyệt"}
          </Alert>
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
  canDecide: PropTypes.bool.isRequired,
  scopeLabel: PropTypes.string.isRequired,
  onDirectiveChange: PropTypes.func.isRequired,
  onApprove: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
}

export default MenuReview
