import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material"
import {
  Close,
  VisibilityOffOutlined,
  VisibilityOutlined,
} from "@mui/icons-material"
import {
  PASSWORD_HINT,
  validateCreateStaffForm,
} from "src/services/SupplierStaffService"
import styles from "./StaffCreateModal.module.scss"

const EMPTY_FORM = {
  fullName: "",
  username: "",
  email: "",
  phone: "",
  password: "",
}

function StaffCreateModal({
  open,
  submitting = false,
  serverError = "",
  serverFieldErrors = {},
  onClose,
  onSubmit,
}) {
  const [values, setValues] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (!open) return
    setValues(EMPTY_FORM)
    setErrors({})
    setShowPassword(false)
  }, [open])

  const mergedErrors = { ...serverFieldErrors, ...errors }

  const handleChange = field => event => {
    const nextValue = event.target.value
    setValues(prev => ({ ...prev, [field]: nextValue }))
    if (errors[field] || serverFieldErrors[field]) {
      setErrors(prev => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const handleSubmit = event => {
    event.preventDefault()
    const validation = validateCreateStaffForm(values)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }
    setErrors({})
    onSubmit(values)
  }

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { className: styles.dialogPaper } }}
      aria-labelledby="create-staff-dialog-title"
    >
      <DialogTitle id="create-staff-dialog-title" className={styles.dialogHeader}>
        <span className={styles.dialogTitleText}>Tạo tài khoản nhân viên</span>
        <IconButton
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          disabled={submitting}
          aria-label="Đóng cửa sổ"
          size="small"
        >
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <form className={styles.formWrapper} onSubmit={handleSubmit} noValidate>
        <DialogContent className={styles.dialogContent}>
          {serverError ? (
            <div className={styles.serverErrorBanner} role="alert">
              {serverError}
            </div>
          ) : null}

          <div className={styles.fieldGrid}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="staff-create-full-name">
                Họ và tên <span className={styles.requiredMark}>*</span>
              </label>
              <input
                id="staff-create-full-name"
                type="text"
                className={`${styles.inputControl} ${mergedErrors.fullName ? styles.inputInvalid : ""}`}
                placeholder="Nguyễn Văn An"
                value={values.fullName}
                onChange={handleChange("fullName")}
                disabled={submitting}
                autoComplete="name"
                aria-invalid={Boolean(mergedErrors.fullName)}
              />
              {mergedErrors.fullName ? (
                <p className={styles.fieldError}>{mergedErrors.fullName}</p>
              ) : null}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="staff-create-username">
                Tên đăng nhập <span className={styles.requiredMark}>*</span>
              </label>
              <input
                id="staff-create-username"
                type="text"
                className={`${styles.inputControl} ${mergedErrors.username ? styles.inputInvalid : ""}`}
                placeholder="nhanvien_kho01"
                value={values.username}
                onChange={handleChange("username")}
                disabled={submitting}
                autoComplete="off"
                aria-invalid={Boolean(mergedErrors.username)}
              />
              {mergedErrors.username ? (
                <p className={styles.fieldError}>{mergedErrors.username}</p>
              ) : null}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="staff-create-email">
                Email <span className={styles.requiredMark}>*</span>
              </label>
              <input
                id="staff-create-email"
                type="email"
                className={`${styles.inputControl} ${mergedErrors.email ? styles.inputInvalid : ""}`}
                placeholder="nhanvien@nhacungcap.vn"
                value={values.email}
                onChange={handleChange("email")}
                disabled={submitting}
                autoComplete="off"
                aria-invalid={Boolean(mergedErrors.email)}
              />
              {mergedErrors.email ? (
                <p className={styles.fieldError}>{mergedErrors.email}</p>
              ) : null}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="staff-create-phone">
                Số điện thoại
              </label>
              <input
                id="staff-create-phone"
                type="tel"
                className={`${styles.inputControl} ${mergedErrors.phone ? styles.inputInvalid : ""}`}
                placeholder="0912345678"
                value={values.phone}
                onChange={handleChange("phone")}
                disabled={submitting}
                autoComplete="tel"
                aria-invalid={Boolean(mergedErrors.phone)}
              />
              {mergedErrors.phone ? (
                <p className={styles.fieldError}>{mergedErrors.phone}</p>
              ) : null}
            </div>

            <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
              <label className={styles.fieldLabel} htmlFor="staff-create-password">
                Mật khẩu khởi tạo <span className={styles.requiredMark}>*</span>
              </label>
              <div className={styles.inputWrap}>
                <input
                  id="staff-create-password"
                  type={showPassword ? "text" : "password"}
                  className={`${styles.inputControl} ${styles.passwordInput} ${mergedErrors.password ? styles.inputInvalid : ""}`}
                  placeholder="Nhập mật khẩu khởi tạo"
                  value={values.password}
                  onChange={handleChange("password")}
                  disabled={submitting}
                  autoComplete="new-password"
                  aria-invalid={Boolean(mergedErrors.password)}
                />
                <button
                  type="button"
                  className={styles.visibilityBtn}
                  onClick={() => setShowPassword(prev => !prev)}
                  disabled={submitting}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? (
                    <VisibilityOffOutlined className={styles.visibilityIcon} />
                  ) : (
                    <VisibilityOutlined className={styles.visibilityIcon} />
                  )}
                </button>
              </div>
              {mergedErrors.password ? (
                <p className={styles.fieldError}>{mergedErrors.password}</p>
              ) : (
                <p className={styles.fieldHint}>{PASSWORD_HINT}</p>
              )}
            </div>
          </div>
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
            type="submit"
            variant="contained"
            className={styles.submitBtn}
            disabled={submitting}
            startIcon={
              submitting ? <CircularProgress size={16} color="inherit" /> : null
            }
          >
            {submitting ? "Đang tạo..." : "Tạo tài khoản"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

StaffCreateModal.propTypes = {
  open: PropTypes.bool.isRequired,
  submitting: PropTypes.bool,
  serverError: PropTypes.string,
  serverFieldErrors: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
}

export default StaffCreateModal
