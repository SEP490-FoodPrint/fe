import React, { useEffect, useRef, useState } from "react"
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
  TextField,
  useMediaQuery,
} from "@mui/material"
import { Close, SaveOutlined } from "@mui/icons-material"
import {
  extractApiError,
  getFacilityStatusLabel,
  validateFacilityForm,
} from "src/services/SourceFacilityService"
import styles from "./FacilityFormModal.module.scss"

function buildInitialState(mode, initialData) {
  if (mode === "edit" && initialData) {
    return {
      name: initialData.name || "",
      address: initialData.address || "",
      contactName: initialData.contactName || "",
      contactPhone: initialData.contactPhone || "",
      contactEmail: initialData.contactEmail || "",
    }
  }

  return {
    name: "",
    address: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
  }
}

function FacilityFormModal({
  open,
  mode = "create",
  initialData = null,
  loadingDetail = false,
  onClose,
  onSubmit,
}) {
  const isEdit = mode === "edit" && Boolean(initialData)
  const fullScreen = useMediaQuery("(max-width:600px)")
  const nameInputRef = useRef(null)

  const [formState, setFormState] = useState(() =>
    buildInitialState(mode, initialData),
  )
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitError, setSubmitError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setFormState(buildInitialState(mode, initialData))
    setFieldErrors({})
    setSubmitError("")
    setSubmitting(false)

    if (!loadingDetail) {
      const timer = setTimeout(() => {
        nameInputRef.current?.focus()
      }, 60)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [open, mode, initialData, loadingDetail])

  const handleFieldChange = (field, value) => {
    setFormState(prev => ({ ...prev, [field]: value }))
    setSubmitError("")
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const handleSubmit = async event => {
    event.preventDefault()
    if (submitting || loadingDetail) return

    const errors = validateFacilityForm(formState)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setSubmitError("Vui lòng kiểm tra lại các trường thông tin bên dưới.")
      if (errors.name) {
        nameInputRef.current?.focus()
      }
      return
    }

    setSubmitting(true)
    setSubmitError("")
    try {
      await onSubmit?.(formState)
    } catch (error) {
      const parsed = extractApiError(
        error,
        isEdit
          ? "Không thể cập nhật cơ sở nguồn cung."
          : "Không thể tạo cơ sở nguồn cung.",
      )
      if (Object.keys(parsed.fieldErrors).length > 0) {
        setFieldErrors(parsed.fieldErrors)
      } else if (parsed.status === 409) {
        setFieldErrors({ name: parsed.message })
      }
      setSubmitError(parsed.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={fullScreen}
      aria-labelledby="facility-form-dialog-title"
      slotProps={{
        paper: { className: styles.dialogPaper },
      }}
    >
      <DialogTitle
        id="facility-form-dialog-title"
        className={styles.dialogHeader}
      >
        <div className={styles.dialogTitleGroup}>
          <span className={styles.dialogTitleText}>
            {isEdit
              ? "Chỉnh sửa cơ sở nguồn cung"
              : "Thêm cơ sở nguồn cung"}
          </span>
          <span className={styles.dialogSubtitle}>
            {isEdit
              ? "Cập nhật tên, địa chỉ và thông tin người liên hệ của cơ sở."
              : "Khai báo tên cơ sở, địa chỉ và đầu mối liên hệ."}
          </span>
        </div>

        <IconButton
          size="small"
          aria-label="Đóng hộp thoại"
          onClick={onClose}
          disabled={submitting}
        >
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit} noValidate className={styles.formWrapper}>
        <DialogContent dividers className={styles.dialogContent}>
          {loadingDetail ? (
            <div className={styles.loadingBox} role="status" aria-live="polite">
              <CircularProgress size={26} />
              <span>Đang tải thông tin chi tiết cơ sở...</span>
            </div>
          ) : (
            <div className={styles.formSections}>
              {submitError && (
                <Alert severity="error" onClose={() => setSubmitError("")}>
                  {submitError}
                </Alert>
              )}

              <section
                className={styles.formSection}
                aria-labelledby="form-section-facility"
              >
                <h3 id="form-section-facility" className={styles.sectionHeading}>
                  1. Thông tin cơ sở
                </h3>

                <div className={styles.systemMetaBanner}>
                  {isEdit ? (
                    <div className={styles.readonlyBadges}>
                      <span className={styles.metaItem}>
                        Mã cơ sở:{" "}
                        <strong>
                          {initialData.facilityCode || "Chưa cấp mã"}
                        </strong>
                      </span>
                      <span className={styles.metaItem}>
                        Trạng thái:{" "}
                        <strong>
                          {getFacilityStatusLabel(initialData.status)}
                        </strong>
                      </span>
                    </div>
                  ) : (
                    <span>
                      Mã cơ sở (dạng <strong>FP-SF-...</strong>) được hệ thống tự
                      động cấp sau khi lưu.
                    </span>
                  )}
                </div>

                <TextField
                  inputRef={nameInputRef}
                  label="Tên cơ sở nguồn cung"
                  required
                  value={formState.name}
                  onChange={e => handleFieldChange("name", e.target.value)}
                  error={Boolean(fieldErrors.name)}
                  helperText={
                    fieldErrors.name ||
                    "Tên duy nhất trong nhà cung cấp (tối đa 255 ký tự)."
                  }
                  placeholder="Ví dụ: Vùng trồng Lâm Hà"
                  size="small"
                  fullWidth
                  slotProps={{ htmlInput: { maxLength: 255 } }}
                />

                <TextField
                  label="Địa chỉ"
                  value={formState.address}
                  onChange={e => handleFieldChange("address", e.target.value)}
                  error={Boolean(fieldErrors.address)}
                  helperText={fieldErrors.address || "Không bắt buộc."}
                  placeholder="Ví dụ: Thôn 3, xã Gia Lâm, huyện Lâm Hà, Lâm Đồng"
                  size="small"
                  fullWidth
                  multiline
                  minRows={2}
                  maxRows={4}
                />
              </section>

              <section
                className={styles.formSection}
                aria-labelledby="form-section-contact"
              >
                <h3 id="form-section-contact" className={styles.sectionHeading}>
                  2. Thông tin liên hệ
                </h3>

                <TextField
                  label="Người liên hệ"
                  value={formState.contactName}
                  onChange={e =>
                    handleFieldChange("contactName", e.target.value)
                  }
                  error={Boolean(fieldErrors.contactName)}
                  helperText={fieldErrors.contactName || ""}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  size="small"
                  fullWidth
                  slotProps={{ htmlInput: { maxLength: 255 } }}
                />

                <div className={styles.twoColRow}>
                  <TextField
                    label="Số điện thoại"
                    value={formState.contactPhone}
                    onChange={e =>
                      handleFieldChange("contactPhone", e.target.value)
                    }
                    error={Boolean(fieldErrors.contactPhone)}
                    helperText={fieldErrors.contactPhone || ""}
                    placeholder="Ví dụ: 0912345678"
                    size="small"
                    fullWidth
                    slotProps={{ htmlInput: { maxLength: 30 } }}
                  />

                  <TextField
                    label="Email liên hệ"
                    type="email"
                    value={formState.contactEmail}
                    onChange={e =>
                      handleFieldChange("contactEmail", e.target.value)
                    }
                    error={Boolean(fieldErrors.contactEmail)}
                    helperText={fieldErrors.contactEmail || ""}
                    placeholder="Ví dụ: lienhe@coso.vn"
                    size="small"
                    fullWidth
                    slotProps={{ htmlInput: { maxLength: 255 } }}
                  />
                </div>
              </section>
            </div>
          )}
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
            type="submit"
            variant="contained"
            color="primary"
            disabled={submitting || loadingDetail}
            startIcon={
              submitting ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <SaveOutlined />
              )
            }
          >
            {submitting
              ? "Đang lưu..."
              : isEdit
                ? "Lưu thay đổi"
                : "Lưu cơ sở"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

FacilityFormModal.propTypes = {
  open: PropTypes.bool.isRequired,
  mode: PropTypes.oneOf(["create", "edit"]),
  initialData: PropTypes.object,
  loadingDetail: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
}

export default FacilityFormModal
