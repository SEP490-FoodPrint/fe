import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material"
import { CheckCircle2, RotateCcw } from "lucide-react"
import styles from "./DecisionDialog.module.scss"

// Phê duyệt chỉ cần xác nhận; yêu cầu chỉnh sửa bắt buộc nêu lý do (BE yêu cầu)
function DecisionDialog({ type, menu, open, submitting, onClose, onApprove, onReject }) {
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")
  const isReject = type === "reject"

  useEffect(() => {
    if (open) {
      setReason("")
      setError("")
    }
  }, [open, type])

  const handleSubmit = () => {
    if (submitting || !["approve", "reject"].includes(type)) return
    if (!isReject) {
      onApprove()
      return
    }
    const normalized = reason.trim()
    if (!normalized) {
      setError("Vui lòng nhập lý do để Y tế điều chỉnh thực đơn.")
      return
    }
    if (normalized.length > 2000) {
      setError("Nội dung không được vượt quá 2000 ký tự.")
      return
    }
    onReject(normalized)
  }

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth={isReject ? "sm" : "xs"}
      PaperProps={{ className: styles.dialogPaper }}
    >
      <DialogTitle className={styles.title}>
        <span className={isReject ? styles.rejectIcon : styles.approveIcon}>
          {isReject ? <RotateCcw size={21} /> : <CheckCircle2 size={21} />}
        </span>
        {isReject ? "Yêu cầu chỉnh sửa thực đơn" : "Phê duyệt thực đơn"}
      </DialogTitle>
      <DialogContent className={styles.content}>
        {isReject ? (
          <>
            <Alert severity="warning">
              Thực đơn {menu.title} sẽ được trả về Y tế để chỉnh sửa cả tuần.
            </Alert>
            <div>
              <Typography component="label" className={styles.label} htmlFor="decision-reason">
                Lý do yêu cầu chỉnh sửa *
              </Typography>
              <TextField
                id="decision-reason"
                fullWidth
                multiline
                minRows={4}
                value={reason}
                error={Boolean(error)}
                helperText={error || "Nội dung này là bắt buộc."}
                placeholder="Ví dụ: Cần thay thế món có tôm do có học sinh tiền sử dị ứng..."
                onChange={event => {
                  setReason(event.target.value)
                  if (error) setError("")
                }}
                disabled={submitting}
                autoFocus
              />
            </div>
          </>
        ) : (
          <Typography>
            Xác nhận phê duyệt thực đơn <strong>{menu.title}</strong> cho cả tuần?
          </Typography>
        )}
      </DialogContent>
      <DialogActions className={styles.actions}>
        <Button color="inherit" onClick={onClose} disabled={submitting}>Hủy</Button>
        <Button
          variant="contained"
          color={isReject ? "error" : "primary"}
          startIcon={isReject ? <RotateCcw size={17} /> : <CheckCircle2 size={17} />}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Đang xử lý..." : isReject ? "Gửi yêu cầu" : "Phê duyệt"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

DecisionDialog.propTypes = {
  type: PropTypes.oneOf(["approve", "reject"]),
  menu: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onApprove: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
}

export default DecisionDialog
