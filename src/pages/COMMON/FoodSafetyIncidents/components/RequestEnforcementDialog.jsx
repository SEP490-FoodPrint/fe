import React, { useEffect, useMemo, useState } from "react"
import PropTypes from "prop-types"
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material"
import { InfoOutlined, WarningAmberOutlined } from "@mui/icons-material"
import FoodSafetyIncidentService, {
  formatDateTimeVi,
  INCIDENT_STATUS,
  SUPPLIER_FINDING,
} from "src/services/FoodSafetyIncidentService"
import SupplierEnforcementService, {
  ENFORCEMENT_ACTION_TYPE,
  ENFORCEMENT_ACTION_TYPE_META,
  extractApiError,
} from "src/services/SupplierEnforcementService"
import styles from "../FoodSafetyIncidents.module.scss"

const RESTRICT_ELIGIBLE_STATUSES = new Set([
  INCIDENT_STATUS.AUTHORITY_ACKNOWLEDGED,
  INCIDENT_STATUS.UNDER_INSPECTION,
  INCIDENT_STATUS.INSPECTION_COMPLETED,
])

function RequestEnforcementDialog({
  open,
  incident,
  onClose,
  onSuccess,
  onConflict,
}) {
  const incidentId = incident?.id || ""
  const canRestrict = RESTRICT_ELIGIBLE_STATUSES.has(incident?.status)

  const availableActionTypes = useMemo(() => {
    const types = []
    if (canRestrict) {
      types.push(
        ENFORCEMENT_ACTION_TYPE.PAUSE_INTAKE,
        ENFORCEMENT_ACTION_TYPE.LOCK_ACCOUNT,
      )
    }
    types.push(ENFORCEMENT_ACTION_TYPE.RESTORE)
    return types
  }, [canRestrict])

  const [suppliers, setSuppliers] = useState([])
  const [loadingSuppliers, setLoadingSuppliers] = useState(false)
  const [supplierId, setSupplierId] = useState("")
  const [actionType, setActionType] = useState(availableActionTypes[0])
  const [evidenceInspectionId, setEvidenceInspectionId] = useState("")
  const [reason, setReason] = useState("")
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitError, setSubmitError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open || !incidentId) return undefined
    setActionType(availableActionTypes[0])
    setSupplierId("")
    setEvidenceInspectionId("")
    setReason("")
    setFieldErrors({})
    setSubmitError("")

    const controller = new AbortController()
    setLoadingSuppliers(true)
    FoodSafetyIncidentService.getInspectionSuppliers(
      incidentId,
      controller.signal,
    )
      .then(res => {
        if (controller.signal.aborted) return
        const items = res.items || []
        setSuppliers(items)
        if (items.length === 1) {
          setSupplierId(items[0].id)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setSuppliers([])
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingSuppliers(false)
      })

    return () => controller.abort()
  }, [open, incidentId, availableActionTypes])

  // Completed inspections containing AT_FAULT finding for the chosen supplierId
  const eligibleEvidenceInspections = useMemo(() => {
    const inspections = Array.isArray(incident?.inspections)
      ? incident.inspections
      : []
    if (!supplierId) return []
    return inspections.filter(insp => {
      if (insp.status !== "COMPLETED") return false
      const findings = Array.isArray(insp.findings) ? insp.findings : []
      return findings.some(
        f =>
          (f.supplierId === supplierId || f.supplier?.id === supplierId) &&
          f.finding === SUPPLIER_FINDING.AT_FAULT,
      )
    })
  }, [incident?.inspections, supplierId])

  useEffect(() => {
    if (actionType !== ENFORCEMENT_ACTION_TYPE.LOCK_ACCOUNT) {
      setEvidenceInspectionId("")
      return
    }
    const stillValid = eligibleEvidenceInspections.some(
      insp => insp.id === evidenceInspectionId,
    )
    if (!stillValid) {
      setEvidenceInspectionId(eligibleEvidenceInspections[0]?.id || "")
    }
  }, [actionType, eligibleEvidenceInspections, evidenceInspectionId])

  const selectedActionMeta = ENFORCEMENT_ACTION_TYPE_META[actionType]

  const validate = () => {
    const errors = {}
    if (!supplierId) {
      errors.supplierId = "Vui lòng chọn nhà cung cấp cần đề nghị chế tài."
    }
    if (
      actionType === ENFORCEMENT_ACTION_TYPE.LOCK_ACCOUNT &&
      !evidenceInspectionId
    ) {
      errors.evidenceInspectionId =
        "Khóa tài khoản NCC bắt buộc chọn đợt kiểm tra đã hoàn tất có kết luận NCC vi phạm."
    }
    const trimmedReason = reason.trim()
    if (trimmedReason.length < 10) {
      errors.reason = "Lý do đề nghị chế tài cần tối thiểu 10 ký tự."
    } else if (trimmedReason.length > 2000) {
      errors.reason = "Lý do đề nghị chế tài không vượt quá 2000 ký tự."
    }
    return errors
  }

  const handleSubmit = async event => {
    event.preventDefault()
    if (submitting || !incidentId) return
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    const payload = {
      supplierId,
      actionType,
      reason: reason.trim(),
    }
    if (actionType === ENFORCEMENT_ACTION_TYPE.LOCK_ACCOUNT) {
      payload.evidenceInspectionId = evidenceInspectionId
    }

    setSubmitting(true)
    setSubmitError("")
    setFieldErrors({})
    try {
      const created = await SupplierEnforcementService.requestEnforcement(
        incidentId,
        payload,
      )
      onSuccess(created)
    } catch (error) {
      const parsed = extractApiError(
        error,
        "Không thể gửi đề nghị chế tài nhà cung cấp lúc này.",
      )
      if (parsed.status === 400 && Object.keys(parsed.fields).length > 0) {
        setFieldErrors(parsed.fields)
      }
      if (parsed.status === 409) {
        onConflict?.(parsed.message)
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
      maxWidth="sm"
      fullWidth
    >
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle sx={{ fontWeight: 700, fontSize: 18 }}>
          Đề nghị chế tài nhà cung cấp
        </DialogTitle>
        <DialogContent dividers>
          <div className={styles.formStack}>
            <div className={`${styles.banner} ${styles.bannerInfo}`}>
              <InfoOutlined fontSize="small" sx={{ mt: "1px", flexShrink: 0 }} />
              <span>
                Đề nghị chế tài sẽ được chuyển tới Quản trị viên Hệ thống
                (System Admin) để phê duyệt và thực thi. Mỗi cặp (hồ sơ, NCC,
                loại chế tài) chỉ có tối đa một yêu cầu đang chờ duyệt.
              </span>
            </div>

            {submitError ? (
              <div className={`${styles.banner} ${styles.bannerDanger}`} role="alert">
                <WarningAmberOutlined
                  fontSize="small"
                  sx={{ mt: "1px", flexShrink: 0 }}
                />
                <span>{submitError}</span>
              </div>
            ) : null}

            <div className={styles.fieldGroup}>
              <label htmlFor="enforce-supplier" className={styles.fieldLabel}>
                Nhà cung cấp
                <span className={styles.requiredMark}>*</span>
              </label>
              <select
                id="enforce-supplier"
                className={`${styles.selectInput} ${
                  fieldErrors.supplierId ? styles.inputError : ""
                }`}
                style={{ width: "100%" }}
                value={supplierId}
                onChange={e => {
                  setSupplierId(e.target.value)
                  setFieldErrors(prev => ({
                    ...prev,
                    supplierId: "",
                    evidenceInspectionId: "",
                  }))
                }}
                disabled={submitting || loadingSuppliers}
              >
                <option value="">
                  {loadingSuppliers
                    ? "Đang tải danh sách nhà cung cấp..."
                    : "Chọn nhà cung cấp"}
                </option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {fieldErrors.supplierId ? (
                <span className={styles.fieldError}>
                  {fieldErrors.supplierId}
                </span>
              ) : null}
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="enforce-action-type" className={styles.fieldLabel}>
                Loại chế tài đề nghị
                <span className={styles.requiredMark}>*</span>
              </label>
              <select
                id="enforce-action-type"
                className={`${styles.selectInput} ${
                  fieldErrors.actionType ? styles.inputError : ""
                }`}
                style={{ width: "100%" }}
                value={actionType}
                onChange={e => {
                  setActionType(e.target.value)
                  setFieldErrors(prev => ({
                    ...prev,
                    actionType: "",
                    evidenceInspectionId: "",
                  }))
                }}
                disabled={submitting}
              >
                {availableActionTypes.map(type => (
                  <option key={type} value={type}>
                    {ENFORCEMENT_ACTION_TYPE_META[type].label}
                  </option>
                ))}
              </select>
              {selectedActionMeta?.description ? (
                <span className={styles.fieldHint}>
                  {selectedActionMeta.description}
                </span>
              ) : null}
            </div>

            {actionType === ENFORCEMENT_ACTION_TYPE.LOCK_ACCOUNT ? (
              <div className={styles.fieldGroup}>
                <label htmlFor="enforce-evidence" className={styles.fieldLabel}>
                  Đợt kiểm tra làm căn cứ vi phạm
                  <span className={styles.requiredMark}>*</span>
                </label>
                <select
                  id="enforce-evidence"
                  className={`${styles.selectInput} ${
                    fieldErrors.evidenceInspectionId ? styles.inputError : ""
                  }`}
                  style={{ width: "100%" }}
                  value={evidenceInspectionId}
                  onChange={e => {
                    setEvidenceInspectionId(e.target.value)
                    setFieldErrors(prev => ({
                      ...prev,
                      evidenceInspectionId: "",
                    }))
                  }}
                  disabled={submitting || !supplierId}
                >
                  <option value="">
                    {!supplierId
                      ? "Chọn nhà cung cấp trước"
                      : eligibleEvidenceInspections.length === 0
                        ? "Chưa có đợt kiểm tra hoàn tất nào kết luận NCC này vi phạm"
                        : "Chọn đợt kiểm tra làm căn cứ"}
                  </option>
                  {eligibleEvidenceInspections.map((insp, idx) => (
                    <option key={insp.id} value={insp.id}>
                      Đợt kiểm tra #{idx + 1} · {formatDateTimeVi(insp.scheduledAt)}
                    </option>
                  ))}
                </select>
                {fieldErrors.evidenceInspectionId ? (
                  <span className={styles.fieldError}>
                    {fieldErrors.evidenceInspectionId}
                  </span>
                ) : null}
              </div>
            ) : null}

            <div className={styles.fieldGroup}>
              <label htmlFor="enforce-reason" className={styles.fieldLabel}>
                Lý do &amp; căn cứ đề nghị
                <span className={styles.requiredMark}>*</span>
              </label>
              <textarea
                id="enforce-reason"
                maxLength={2000}
                className={`${styles.textareaInput} ${
                  fieldErrors.reason ? styles.inputError : ""
                }`}
                placeholder="Trình bày căn cứ nghiệp vụ, mức độ vi phạm hoặc lý do đề nghị khôi phục nhà cung cấp (tối thiểu 10 ký tự)..."
                value={reason}
                onChange={e => {
                  setReason(e.target.value)
                  setFieldErrors(prev => ({ ...prev, reason: "" }))
                }}
                disabled={submitting}
              />
              {fieldErrors.reason ? (
                <span className={styles.fieldError}>{fieldErrors.reason}</span>
              ) : (
                <span className={styles.fieldHint}>
                  {reason.trim().length}/2000 ký tự
                </span>
              )}
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            type="button"
            variant="outlined"
            color="inherit"
            onClick={onClose}
            disabled={submitting}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            color={
              actionType === ENFORCEMENT_ACTION_TYPE.LOCK_ACCOUNT
                ? "error"
                : "primary"
            }
            disabled={submitting}
          >
            {submitting ? "Đang gửi đề nghị..." : "Gửi đề nghị chế tài"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

RequestEnforcementDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  incident: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onConflict: PropTypes.func,
}

export default RequestEnforcementDialog
