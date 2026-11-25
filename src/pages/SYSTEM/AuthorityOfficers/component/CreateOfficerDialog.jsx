import React, { useEffect, useMemo, useState } from "react"
import PropTypes from "prop-types"
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material"
import {
  CheckCircleOutlined,
  Close,
  RadioButtonUnchecked,
  VisibilityOffOutlined,
  VisibilityOutlined,
} from "@mui/icons-material"
import LocationSelector from "src/components/LocationSelector"
import AuthorityOfficerService, {
  checkPasswordChecks,
  extractAuthorityOfficerError,
  validateCreateOfficer,
} from "src/services/AuthorityOfficerService"
import styles from "../AuthorityOfficers.module.scss"

const INITIAL_VALUES = {
  locationId: "",
  username: "",
  password: "",
  fullName: "",
  phone: "",
}

export default function CreateOfficerDialog({ open, onClose, onCreated }) {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [fieldErrors, setFieldErrors] = useState({})
  const [serverError, setServerError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setValues(INITIAL_VALUES)
      setFieldErrors({})
      setServerError("")
      setShowPassword(false)
    }
  }, [open])

  const normalizedUsername = useMemo(
    () => values.username.trim().toLowerCase(),
    [values.username],
  )

  const pwdChecks = useMemo(
    () => checkPasswordChecks(values.password),
    [values.password],
  )

  const handleChange = key => event => {
    const nextValue = event.target.value
    setValues(prev => ({ ...prev, [key]: nextValue }))
    if (fieldErrors[key]) {
      setFieldErrors(prev => {
        const copy = { ...prev }
        delete copy[key]
        return copy
      })
    }
    if (serverError) setServerError("")
  }

  const handleSubmit = async event => {
    event.preventDefault()
    if (submitting) return

    const validation = validateCreateOfficer(values)
    if (!validation.isValid) {
      setFieldErrors(validation.errors)
      setServerError("")
      return
    }

    setSubmitting(true)
    setFieldErrors({})
    setServerError("")
    try {
      const created = await AuthorityOfficerService.create(values)
      onCreated(created)
    } catch (error) {
      const parsed = extractAuthorityOfficerError(
        error,
        "Không thể tạo tài khoản cán bộ ATTP.",
      )
      setFieldErrors(parsed.fields || {})
      setServerError(parsed.message)
    } finally {
      setSubmitting(false)
    }
  }

  const passwordRules = [
    {
      key: "minLength",
      label: "Tối thiểu 8 ký tự",
      passed: pwdChecks.minLength,
    },
    {
      key: "maxBytes",
      label: `Tối đa 72 byte UTF-8 (${pwdChecks.byteLength}/72)`,
      passed: values.password.length > 0 && pwdChecks.maxBytes,
      failed: pwdChecks.byteLength > 72,
    },
    {
      key: "hasLower",
      label: "Ít nhất 1 chữ thường",
      passed: pwdChecks.hasLower,
    },
    {
      key: "hasUpper",
      label: "Ít nhất 1 chữ hoa",
      passed: pwdChecks.hasUpper,
    },
    {
      key: "hasDigit",
      label: "Ít nhất 1 chữ số",
      passed: pwdChecks.hasDigit,
    },
    {
      key: "hasSymbol",
      label: "Ít nhất 1 ký tự đặc biệt",
      passed: pwdChecks.hasSymbol,
    },
  ]

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="create-authority-officer-title"
    >
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle
          id="create-authority-officer-title"
          className={styles.dialogTitle}
        >
          <span>Tạo tài khoản cán bộ ATTP</span>
          <IconButton
            type="button"
            size="small"
            onClick={onClose}
            disabled={submitting}
            aria-label="Đóng hộp thoại"
          >
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent className={styles.dialogContent}>
          <p className={styles.dialogIntro}>
            Mỗi phường/xã được cấp tối đa một tài khoản cán bộ ATTP. Đơn vị ATTP
            theo phường/xã sẽ được tự động khởi tạo nếu chưa tồn tại. Cán bộ sẽ
            đăng nhập lần đầu bằng tên đăng nhập và cập nhật email qua OTP.
          </p>

          {serverError ? (
            <Alert severity="error" role="alert">
              {serverError}
            </Alert>
          ) : null}

          <LocationSelector
            id="officer-locationId"
            required
            value={values.locationId}
            onChange={locationId => {
              setValues(prev => ({ ...prev, locationId }))
              if (fieldErrors.locationId) {
                setFieldErrors(prev => {
                  const copy = { ...prev }
                  delete copy.locationId
                  return copy
                })
              }
              if (serverError) setServerError("")
            }}
            error={fieldErrors.locationId}
            disabled={submitting}
          />

          <div className={styles.formGridTwo}>
            <div className={styles.formField}>
              <label htmlFor="officer-fullName">
                Họ và tên <span className={styles.requiredMark}>*</span>
              </label>
              <TextField
                id="officer-fullName"
                size="small"
                fullWidth
                placeholder="Nhập họ và tên cán bộ"
                value={values.fullName}
                onChange={handleChange("fullName")}
                error={Boolean(fieldErrors.fullName)}
                helperText={fieldErrors.fullName || undefined}
                disabled={submitting}
                slotProps={{ htmlInput: { maxLength: 255 } }}
              />
            </div>

            <div className={styles.formField}>
              <label htmlFor="officer-phone">Số điện thoại (tùy chọn)</label>
              <TextField
                id="officer-phone"
                size="small"
                fullWidth
                type="tel"
                placeholder="Nhập số điện thoại liên hệ"
                value={values.phone}
                onChange={handleChange("phone")}
                error={Boolean(fieldErrors.phone)}
                helperText={fieldErrors.phone || undefined}
                disabled={submitting}
                slotProps={{ htmlInput: { maxLength: 30 } }}
              />
            </div>
          </div>

          <div className={styles.formField}>
            <label htmlFor="officer-username">
              Tên đăng nhập <span className={styles.requiredMark}>*</span>
            </label>
            <TextField
              id="officer-username"
              size="small"
              fullWidth
              placeholder="Ví dụ: attp_phuong_dich_vong"
              value={values.username}
              onChange={handleChange("username")}
              error={Boolean(fieldErrors.username)}
              helperText={fieldErrors.username || undefined}
              disabled={submitting}
              autoComplete="off"
              slotProps={{ htmlInput: { maxLength: 120 } }}
            />
            {values.username.trim() ? (
              <p className={styles.previewHint}>
                Tên đăng nhập chuẩn hóa: <code>{normalizedUsername}</code>
              </p>
            ) : (
              <p className={styles.previewHint}>
                3–120 ký tự, tự động chuyển chữ thường; chỉ gồm chữ cái không dấu,
                số và ký tự <code>.</code> <code>_</code> <code>-</code>.
              </p>
            )}
          </div>

          <div className={styles.formField}>
            <label htmlFor="officer-password">
              Mật khẩu cấp lần đầu <span className={styles.requiredMark}>*</span>
            </label>
            <TextField
              id="officer-password"
              size="small"
              fullWidth
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu đạt yêu cầu bảo mật"
              value={values.password}
              onChange={handleChange("password")}
              error={Boolean(fieldErrors.password)}
              helperText={fieldErrors.password || undefined}
              disabled={submitting}
              autoComplete="new-password"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        type="button"
                        size="small"
                        edge="end"
                        onClick={() => setShowPassword(prev => !prev)}
                        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      >
                        {showPassword ? (
                          <VisibilityOffOutlined fontSize="small" />
                        ) : (
                          <VisibilityOutlined fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <ul className={styles.passwordChecklist} aria-label="Tiêu chí mật khẩu">
              {passwordRules.map(rule => (
                <li
                  key={rule.key}
                  className={`${styles.checkItem} ${
                    rule.failed
                      ? styles.checkFail
                      : rule.passed
                        ? styles.checkPass
                        : ""
                  }`}
                >
                  {rule.passed ? (
                    <CheckCircleOutlined sx={{ fontSize: 15 }} aria-hidden="true" />
                  ) : (
                    <RadioButtonUnchecked sx={{ fontSize: 15 }} aria-hidden="true" />
                  )}
                  <span>{rule.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </DialogContent>

        <DialogActions className={styles.dialogActions}>
          <Button
            type="button"
            variant="outlined"
            onClick={onClose}
            disabled={submitting}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            className={styles.primaryBtn}
            disabled={submitting}
          >
            {submitting ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              "Tạo tài khoản"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

CreateOfficerDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreated: PropTypes.func.isRequired,
}
