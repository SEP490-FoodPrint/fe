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
import {
  CheckCircleOutlineOutlined,
  RemoveCircleOutlineOutlined,
} from "@mui/icons-material"
import styles from "./ConfirmPermissionToggleDialog.module.scss"

function ConfirmPermissionToggleDialog({
  open,
  roleName = "",
  permission = null,
  nextAssigned = true,
  submitting = false,
  onClose,
  onConfirm,
}) {
  const isEnabling = Boolean(nextAssigned)
  const permissionName = permission?.name || "quyền này"
  const isInactiveRevoke = !isEnabling && permission?.isActive === false

  const title = isEnabling
    ? "Xác nhận bật quyền cho vai trò"
    : "Xác nhận tắt quyền khỏi vai trò"
  const Icon = isEnabling
    ? CheckCircleOutlineOutlined
    : RemoveCircleOutlineOutlined

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { className: styles.dialogPaper } }}
      aria-labelledby="confirm-role-permission-dialog-title"
    >
      <DialogTitle
        id="confirm-role-permission-dialog-title"
        className={styles.dialogTitle}
      >
        <Icon
          className={isEnabling ? styles.enableIcon : styles.disableIcon}
          aria-hidden="true"
        />
        <span>{title}</span>
      </DialogTitle>

      <DialogContent className={styles.dialogContent}>
        <p className={styles.message}>
          Bạn có chắc muốn {isEnabling ? "bật" : "tắt"} quyền{" "}
          <strong>{permissionName}</strong>{" "}
          {isEnabling ? "cho" : "khỏi"} vai trò{" "}
          <strong>{roleName || "này"}</strong> không?
        </p>

        <p className={styles.hint}>
          {isEnabling
            ? "Mọi tài khoản đang hoạt động thuộc vai trò này trên toàn hệ thống sẽ được sử dụng quyền từ lần thao tác kế tiếp (giữ nguyên các hạn chế riêng đã thiết lập nếu có)."
            : "Mọi tài khoản thuộc vai trò này trên toàn hệ thống sẽ ngừng được sử dụng quyền này từ lần thao tác kế tiếp."}
        </p>

        {isInactiveRevoke ? (
          <p className={styles.warningNote}>
            Lưu ý: Quyền này hiện đang tạm ngừng trên toàn hệ thống. Sau khi
            tắt, bạn sẽ không thể cấp lại cho đến khi quyền được kích hoạt trở
            lại.
          </p>
        ) : null}
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
          className={
            isEnabling ? styles.confirmEnableBtn : styles.confirmDisableBtn
          }
          onClick={onConfirm}
          disabled={submitting}
          startIcon={
            submitting ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          {submitting
            ? "Đang lưu..."
            : isEnabling
              ? "Xác nhận bật quyền"
              : "Xác nhận tắt quyền"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

ConfirmPermissionToggleDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  roleName: PropTypes.string,
  permission: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    isActive: PropTypes.bool,
  }),
  nextAssigned: PropTypes.bool,
  submitting: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
}

export default ConfirmPermissionToggleDialog
