import React from "react"
import PropTypes from "prop-types"
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material"
import { PauseCircleOutlined } from "@mui/icons-material"
import styles from "./ConfirmDeactivateDialog.module.scss"

function ConfirmDeactivateDialog({
  open,
  facility,
  submitting = false,
  onClose,
  onConfirm,
}) {
  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="confirm-deactivate-dialog-title"
    >
      <DialogTitle
        id="confirm-deactivate-dialog-title"
        className={styles.dialogTitle}
      >
        <PauseCircleOutlined className={styles.warningIcon} />
        <span>Dừng hoạt động cơ sở nguồn cung</span>
      </DialogTitle>
      <DialogContent className={styles.dialogContent}>
        <p className={styles.message}>
          Bạn có chắc muốn chuyển cơ sở{" "}
          <strong>{facility?.name || "này"}</strong>
          {facility?.facilityCode ? ` (${facility.facilityCode})` : ""} sang trạng
          thái <strong>Ngừng hoạt động</strong> không?
        </p>
        <p className={styles.hint}>
          Sau khi dừng hoạt động, cơ sở sẽ không được sử dụng cho các lô nguyên
          liệu mới và không thể tự kích hoạt lại trên hệ thống.
        </p>
      </DialogContent>
      <DialogActions className={styles.dialogActions}>
        <Button
          type="button"
          variant="outlined"
          color="primary"
          onClick={onClose}
          disabled={submitting}
        >
          Hủy
        </Button>
        <Button
          type="button"
          variant="contained"
          color="warning"
          onClick={onConfirm}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {submitting ? "Đang xử lý..." : "Xác nhận dừng"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

ConfirmDeactivateDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  facility: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    facilityCode: PropTypes.string,
  }),
  submitting: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
}

export default ConfirmDeactivateDialog
