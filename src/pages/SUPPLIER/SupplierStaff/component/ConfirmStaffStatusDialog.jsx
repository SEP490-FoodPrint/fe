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
import { LockOpenOutlined, LockOutlined } from "@mui/icons-material"
import { STAFF_STATUS } from "src/services/SupplierStaffService"
import styles from "./ConfirmStaffStatusDialog.module.scss"

const STATUS_DIALOG_CONFIG = {
  [STAFF_STATUS.LOCKED]: {
    title: "Khóa tài khoản nhân viên",
    actionWord: "khóa",
    targetLabel: "Đã khóa",
    hint: "Sau khi khóa, nhân viên này sẽ không thể đăng nhập hoặc thực hiện thao tác trên hệ thống cho đến khi được mở khóa lại.",
    confirmLabel: "Xác nhận khóa",
    submittingLabel: "Đang khóa...",
    iconClassName: styles.warningIcon,
    confirmBtnClassName: styles.confirmLockBtn,
    IconComponent: LockOutlined,
  },
  [STAFF_STATUS.ACTIVE]: {
    title: "Mở khóa tài khoản nhân viên",
    actionWord: "mở khóa",
    targetLabel: "Đang hoạt động",
    hint: "Sau khi mở khóa, nhân viên có thể đăng nhập trở lại với các quyền thao tác đang được cấp.",
    confirmLabel: "Xác nhận mở khóa",
    submittingLabel: "Đang mở khóa...",
    iconClassName: styles.activateIcon,
    confirmBtnClassName: styles.confirmUnlockBtn,
    IconComponent: LockOpenOutlined,
  },
}

function ConfirmStaffStatusDialog({
  open,
  staff,
  targetStatus = STAFF_STATUS.LOCKED,
  submitting = false,
  onClose,
  onConfirm,
}) {
  const config =
    STATUS_DIALOG_CONFIG[targetStatus] ||
    STATUS_DIALOG_CONFIG[STAFF_STATUS.LOCKED]
  const Icon = config.IconComponent
  const displayName = staff?.fullName || staff?.username || "nhân viên này"

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { className: styles.dialogPaper } }}
      aria-labelledby="confirm-staff-status-dialog-title"
    >
      <DialogTitle
        id="confirm-staff-status-dialog-title"
        className={styles.dialogTitle}
      >
        <Icon className={config.iconClassName} aria-hidden="true" />
        <span>{config.title}</span>
      </DialogTitle>
      <DialogContent className={styles.dialogContent}>
        <p className={styles.message}>
          Bạn có chắc muốn {config.actionWord} tài khoản{" "}
          <strong>{displayName}</strong>
          {staff?.username ? ` (@${staff.username})` : ""} và chuyển sang trạng
          thái <strong>{config.targetLabel}</strong> không?
        </p>
        <p className={styles.hint}>{config.hint}</p>
      </DialogContent>
      <DialogActions className={styles.dialogActions}>
        <Button
          type="button"
          variant="outlined"
          className={styles.cancelBtn}
          onClick={onClose}
          disabled={submitting}
        >
          Hủy
        </Button>
        <Button
          type="button"
          variant="contained"
          className={config.confirmBtnClassName}
          onClick={onConfirm}
          disabled={submitting}
          startIcon={
            submitting ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          {submitting ? config.submittingLabel : config.confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

ConfirmStaffStatusDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  staff: PropTypes.shape({
    id: PropTypes.string,
    username: PropTypes.string,
    fullName: PropTypes.string,
  }),
  targetStatus: PropTypes.string,
  submitting: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
}

export default ConfirmStaffStatusDialog
