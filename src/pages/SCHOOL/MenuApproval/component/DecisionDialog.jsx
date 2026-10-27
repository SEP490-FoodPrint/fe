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

function DecisionDialog({
  type,
  menu,
  open,
  submitting,
  initialNotes,
  onClose,
  onApprove,
  onReject,
}) {
  const [value, setValue] = useState("")
  const [error, setError] = useState("")
  const isReject = type === "reject"

  useEffect(() => {
    if (open) {
      setValue(initialNotes || "")
      setError("")
    }
  }, [initialNotes, open, type])

  const handleSubmit = () => {
    const normalizedValue = value.trim()
    if (isReject && !normalizedValue) {
      setError("Vui lòng nhập lý do cụ thể để Tổ Bếp tiếp thu và điều chỉnh.")
      return
    }
    if (isReject) onReject(normalizedValue)
    else onApprove(normalizedValue)
  }

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ className: styles.dialogPaper }}
    >
      <DialogTitle className={styles.title}>
        <span className={isReject ? styles.rejectIcon : styles.approveIcon}>
          {isReject ? <RotateCcw size={21} /> : <CheckCircle2 size={21} />}
        </span>
        {isReject ? "Yêu cầu điều chỉnh thực đơn" : "Phê duyệt thực đơn tuần"}
      </DialogTitle>
      <DialogContent className={styles.content}>
        <Alert severity={isReject ? "warning" : "info"}>
          {isReject
            ? "Hồ sơ sẽ được chuyển về Tổ Dinh dưỡng và Bếp trưởng để chỉnh sửa."
            : `Thực đơn ${menu.code} đã có thẩm định y tế hợp lệ và sẵn sàng ký duyệt.`}
        </Alert>
        <div>
          <Typography component="label" className={styles.label} htmlFor="decision-notes">
            {isReject ? "Lý do yêu cầu điều chỉnh *" : "Ý kiến chỉ đạo lưu văn bản"}
          </Typography>
          <TextField
            id="decision-notes"
            fullWidth
            multiline
            minRows={4}
            value={value}
            error={Boolean(error)}
            helperText={error || (isReject ? "Nội dung này là bắt buộc." : "Nội dung này không bắt buộc.")}
            placeholder={
              isReject
                ? "Ví dụ: Cần thay thế món có tôm do có học sinh tiền sử dị ứng..."
                : "Lưu ý về lưu mẫu, nhiệt độ thức ăn hoặc quy trình phục vụ..."
            }
            onChange={event => {
              setValue(event.target.value)
              if (error) setError("")
            }}
            disabled={submitting}
          />
        </div>
      </DialogContent>
      <DialogActions className={styles.actions}>
        <Button color="inherit" onClick={onClose} disabled={submitting}>Hủy bỏ</Button>
        <Button
          variant="contained"
          color={isReject ? "error" : "primary"}
          startIcon={isReject ? <RotateCcw size={17} /> : <CheckCircle2 size={17} />}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting
            ? "Đang xử lý..."
            : isReject
              ? "Gửi yêu cầu"
              : "Ban Giám hiệu ký duyệt"}
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
  initialNotes: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onApprove: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
}

export default DecisionDialog
