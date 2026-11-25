import React, { useEffect, useMemo, useState } from "react"
import PropTypes from "prop-types"
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material"
import {
  AddOutlined,
  InfoOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material"
import FoodSafetyIncidentService, {
  CANCELLATION_REASON,
  CANCELLATION_REASON_OPTIONS,
  extractApiError,
  formatDateVi,
  isUuid,
  MEAL_TYPE_LABELS,
  PRELIMINARY_ASSESSMENT,
  PRELIMINARY_ASSESSMENT_OPTIONS,
} from "src/services/FoodSafetyIncidentService"
import styles from "../FoodSafetyIncidents.module.scss"

export function ForwardIncidentDialog({
  open,
  incidentId,
  onClose,
  onSuccess,
  onConflict,
}) {
  const [preliminaryAssessment, setPreliminaryAssessment] = useState(
    PRELIMINARY_ASSESSMENT.SCHOOL_MEAL_SUSPECTED,
  )
  const [preliminaryNote, setPreliminaryNote] = useState("")
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitError, setSubmitError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setPreliminaryAssessment(PRELIMINARY_ASSESSMENT.SCHOOL_MEAL_SUSPECTED)
      setPreliminaryNote("")
      setFieldErrors({})
      setSubmitError("")
    }
  }, [open])

  const handleSubmit = async event => {
    event.preventDefault()
    if (submitting) return
    if (preliminaryNote.trim().length > 2000) {
      setFieldErrors({
        preliminaryNote: "Ghi chú sơ bộ không được vượt quá 2000 ký tự.",
      })
      return
    }

    const payload = { preliminaryAssessment }
    if (preliminaryNote.trim()) {
      payload.preliminaryNote = preliminaryNote.trim()
    }

    setSubmitting(true)
    setSubmitError("")
    setFieldErrors({})
    try {
      const updated = await FoodSafetyIncidentService.forwardIncident(
        incidentId,
        payload,
      )
      onSuccess(updated)
    } catch (error) {
      const parsed = extractApiError(
        error,
        "Không thể chuyển hồ sơ tới đơn vị ATTP lúc này.",
      )
      if (parsed.status === 400 && Object.keys(parsed.fields).length > 0) {
        setFieldErrors(parsed.fields)
      }
      if (parsed.status === 409) {
        setSubmitError(parsed.message)
        onConflict?.(parsed.message)
      } else {
        setSubmitError(parsed.message)
      }
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
          Xác minh và chuyển hồ sơ tới ATTP
        </DialogTitle>
        <DialogContent dividers>
          <div className={styles.formStack}>
            <div className={`${styles.banner} ${styles.bannerInfo}`}>
              <InfoOutlined fontSize="small" sx={{ mt: "1px", flexShrink: 0 }} />
              <span>
                Theo quy định quản lý ATTP, ngay cả khi nhận định sơ bộ là từ
                nguồn ăn bên ngoài trường, nhà trường vẫn phải chuyển hồ sơ tới
                đơn vị ATTP cấp xã để xác minh độc lập.
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
              <label htmlFor="forward-assessment" className={styles.fieldLabel}>
                Nhận định sơ bộ
                <span className={styles.requiredMark}>*</span>
              </label>
              <select
                id="forward-assessment"
                className={`${styles.selectInput} ${
                  fieldErrors.preliminaryAssessment ? styles.inputError : ""
                }`}
                style={{ width: "100%" }}
                value={preliminaryAssessment}
                onChange={e => {
                  setPreliminaryAssessment(e.target.value)
                  setFieldErrors({})
                }}
                disabled={submitting}
              >
                {PRELIMINARY_ASSESSMENT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {fieldErrors.preliminaryAssessment ? (
                <span className={styles.fieldError}>
                  {fieldErrors.preliminaryAssessment}
                </span>
              ) : null}
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="forward-note" className={styles.fieldLabel}>
                Ghi chú xác minh sơ bộ (không bắt buộc)
              </label>
              <textarea
                id="forward-note"
                maxLength={2000}
                className={`${styles.textareaInput} ${
                  fieldErrors.preliminaryNote ? styles.inputError : ""
                }`}
                placeholder="Ghi nhận kết quả kiểm tra ban đầu tại trường, số lớp bị ảnh hưởng, thực đơn ngày xảy ra..."
                value={preliminaryNote}
                onChange={e => {
                  setPreliminaryNote(e.target.value)
                  setFieldErrors({})
                }}
                disabled={submitting}
              />
              {fieldErrors.preliminaryNote ? (
                <span className={styles.fieldError}>
                  {fieldErrors.preliminaryNote}
                </span>
              ) : null}
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
            Đóng
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={submitting}
          >
            {submitting ? "Đang chuyển..." : "Chuyển hồ sơ tới ATTP"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

ForwardIncidentDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  incidentId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onConflict: PropTypes.func,
}

export function CancelIncidentDialog({
  open,
  incidentId,
  onClose,
  onSuccess,
  onConflict,
}) {
  const [reason, setReason] = useState(CANCELLATION_REASON.DUPLICATE_REPORT)
  const [note, setNote] = useState("")
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitError, setSubmitError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setReason(CANCELLATION_REASON.DUPLICATE_REPORT)
      setNote("")
      setFieldErrors({})
      setSubmitError("")
    }
  }, [open])

  const handleSubmit = async event => {
    event.preventDefault()
    if (submitting) return
    const trimmed = note.trim()
    const errors = {}
    if (!trimmed) {
      errors.note = "Vui lòng nhập lý do chi tiết khi hủy hồ sơ."
    } else if (trimmed.length > 2000) {
      errors.note = "Ghi chú hủy không được vượt quá 2000 ký tự."
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setSubmitting(true)
    setSubmitError("")
    setFieldErrors({})
    try {
      const updated = await FoodSafetyIncidentService.cancelIncident(
        incidentId,
        { reason, note: trimmed },
      )
      onSuccess(updated)
    } catch (error) {
      const parsed = extractApiError(
        error,
        "Không thể hủy báo cáo ngộ độc lúc này.",
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
          Hủy báo cáo ngộ độc tại trường
        </DialogTitle>
        <DialogContent dividers>
          <div className={styles.formStack}>
            <div className={`${styles.banner} ${styles.bannerWarning}`}>
              <WarningAmberOutlined
                fontSize="small"
                sx={{ mt: "1px", flexShrink: 0 }}
              />
              <span>
                Chỉ hủy hồ sơ khi báo cáo bị trùng lặp hoặc nhập sai thông tin.
                Hồ sơ sau khi hủy không thể chuyển sang ATTP.
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
              <label htmlFor="cancel-reason" className={styles.fieldLabel}>
                Lý do hủy
                <span className={styles.requiredMark}>*</span>
              </label>
              <select
                id="cancel-reason"
                className={`${styles.selectInput} ${
                  fieldErrors.reason ? styles.inputError : ""
                }`}
                style={{ width: "100%" }}
                value={reason}
                onChange={e => {
                  setReason(e.target.value)
                  setFieldErrors({})
                }}
                disabled={submitting}
              >
                {CANCELLATION_REASON_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {fieldErrors.reason ? (
                <span className={styles.fieldError}>{fieldErrors.reason}</span>
              ) : null}
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="cancel-note" className={styles.fieldLabel}>
                Ghi chú giải trình
                <span className={styles.requiredMark}>*</span>
              </label>
              <textarea
                id="cancel-note"
                maxLength={2000}
                className={`${styles.textareaInput} ${
                  fieldErrors.note ? styles.inputError : ""
                }`}
                placeholder="Nêu rõ mã hồ sơ bị trùng hoặc sai sót cụ thể..."
                value={note}
                onChange={e => {
                  setNote(e.target.value)
                  setFieldErrors(prev => ({ ...prev, note: "" }))
                }}
                disabled={submitting}
              />
              {fieldErrors.note ? (
                <span className={styles.fieldError}>{fieldErrors.note}</span>
              ) : null}
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
            Đóng
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="error"
            disabled={submitting}
          >
            {submitting ? "Đang hủy..." : "Xác nhận hủy hồ sơ"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

CancelIncidentDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  incidentId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onConflict: PropTypes.func,
}

export function AddAllocationsDialog({
  open,
  incidentId,
  existingAllocations,
  onClose,
  onSuccess,
  onConflict,
}) {
  const [available, setAvailable] = useState([])
  const [loadingAvailable, setLoadingAvailable] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [manualInput, setManualInput] = useState("")
  const [manualError, setManualError] = useState("")
  const [submitError, setSubmitError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const existingIdSet = useMemo(
    () =>
      new Set(
        (existingAllocations || [])
          .map(item => item.mealAllocationId)
          .filter(Boolean),
      ),
    [existingAllocations],
  )

  useEffect(() => {
    if (!open) return undefined
    setSelectedIds([])
    setManualInput("")
    setManualError("")
    setSubmitError("")

    const controller = new AbortController()
    setLoadingAvailable(true)
    FoodSafetyIncidentService.listDistributedAllocations(controller.signal)
      .then(list => {
        if (!controller.signal.aborted) {
          setAvailable(list)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setAvailable([])
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingAvailable(false)
      })

    return () => controller.abort()
  }, [open])

  const selectableAvailable = useMemo(
    () => available.filter(item => !existingIdSet.has(item.mealAllocationId)),
    [available, existingIdSet],
  )

  const toggleSelection = id => {
    setSubmitError("")
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(item => item !== id)
      if (prev.length >= 50) return prev
      return [...prev, id]
    })
  }

  const handleAddManualIds = () => {
    setManualError("")
    const rawTokens = manualInput
      .split(/[\s,;]+/)
      .map(s => s.trim())
      .filter(Boolean)

    if (rawTokens.length === 0) {
      setManualError("Nhập ít nhất một mã UUID suất ăn đã phân bổ.")
      return
    }

    const invalid = rawTokens.filter(token => !isUuid(token))
    if (invalid.length > 0) {
      setManualError(`Mã UUID không hợp lệ: ${invalid[0]}`)
      return
    }

    const next = [...selectedIds]
    let skippedExisting = 0
    for (const token of rawTokens) {
      const normalized = token.toLowerCase()
      if (existingIdSet.has(normalized)) {
        skippedExisting += 1
        continue
      }
      if (!next.includes(normalized)) {
        if (next.length >= 50) {
          setManualError("Chỉ có thể gắn tối đa 50 suất ăn trong một lần.")
          break
        }
        next.push(normalized)
      }
    }

    setSelectedIds(next)
    setManualInput("")
    if (skippedExisting > 0 && next.length === selectedIds.length) {
      setManualError("Các mã suất ăn vừa nhập đã được gắn vào hồ sơ này.")
    }
  }

  const handleSubmit = async event => {
    event.preventDefault()
    if (submitting) return
    if (selectedIds.length === 0) {
      setSubmitError("Vui lòng chọn hoặc thêm ít nhất 1 suất ăn đã phân bổ.")
      return
    }

    setSubmitting(true)
    setSubmitError("")
    try {
      const result = await FoodSafetyIncidentService.addAllocations(
        incidentId,
        selectedIds,
      )
      onSuccess(result)
    } catch (error) {
      const parsed = extractApiError(
        error,
        "Không thể gắn suất ăn vào hồ sơ báo cáo ngộ độc.",
      )
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
          Gắn suất ăn liên quan vào hồ sơ
        </DialogTitle>
        <DialogContent dividers>
          <div className={styles.formStack}>
            <div className={`${styles.banner} ${styles.bannerInfo}`}>
              <InfoOutlined fontSize="small" sx={{ mt: "1px", flexShrink: 0 }} />
              <span>
                Chỉ gắn được các suất ăn đã phát cho lớp (tối đa 50 suất/lần,
                không trùng lặp). Nếu hồ sơ đã chuyển ATTP, hệ thống sẽ tự động
                tạo phiên bản snapshot truy xuất mới.
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

            {(existingAllocations || []).length > 0 ? (
              <div className={styles.fieldGroup}>
                <span className={styles.fieldLabel}>
                  Đã gắn hiện tại ({existingAllocations.length})
                </span>
                <div className={styles.chipList}>
                  {existingAllocations.map(item => (
                    <span key={item.mealAllocationId} className={styles.codeChip}>
                      {item.className || item.mealAllocationId.slice(0, 8)}
                      {item.mealDate ? ` · ${formatDateVi(item.mealDate)}` : ""}
                      {item.mealType
                        ? ` · ${MEAL_TYPE_LABELS[item.mealType] || item.mealType}`
                        : ""}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className={styles.fieldGroup}>
              <span className={styles.fieldLabel}>
                Chọn từ suất ăn đã phát gần đây
              </span>
              {loadingAvailable ? (
                <span className={styles.mutedText}>
                  Đang tải danh sách suất ăn đã phân bổ...
                </span>
              ) : selectableAvailable.length === 0 ? (
                <span className={styles.mutedText}>
                  Không tìm thấy suất ăn đã phát khả dụng trong ngày hôm nay. Bạn
                  có thể dán trực tiếp mã UUID suất ăn ở bên dưới.
                </span>
              ) : (
                <div className={styles.allocationPickList}>
                  {selectableAvailable.map(item => {
                    const checked = selectedIds.includes(item.mealAllocationId)
                    return (
                      <label
                        key={item.mealAllocationId}
                        className={styles.allocationPickItem}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSelection(item.mealAllocationId)}
                          disabled={submitting}
                        />
                        <span>
                          <strong>{item.className}</strong>
                          {item.mealDate
                            ? ` · ${formatDateVi(item.mealDate)}`
                            : ""}
                          {item.mealType
                            ? ` · ${MEAL_TYPE_LABELS[item.mealType] || item.mealType}`
                            : ""}
                        </span>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="manual-allocation-uuid" className={styles.fieldLabel}>
                Hoặc nhập / dán mã UUID suất ăn
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  id="manual-allocation-uuid"
                  type="text"
                  className={`${styles.textInput} ${
                    manualError ? styles.inputError : ""
                  }`}
                  placeholder="Dán một hoặc nhiều UUID (cách nhau bởi dấu phẩy hoặc khoảng trắng)"
                  value={manualInput}
                  onChange={e => {
                    setManualInput(e.target.value)
                    if (manualError) setManualError("")
                  }}
                  disabled={submitting}
                />
                <Button
                  type="button"
                  variant="outlined"
                  color="primary"
                  startIcon={<AddOutlined />}
                  onClick={handleAddManualIds}
                  disabled={submitting}
                  sx={{ flexShrink: 0 }}
                >
                  Thêm
                </Button>
              </div>
              {manualError ? (
                <span className={styles.fieldError}>{manualError}</span>
              ) : null}
            </div>

            {selectedIds.length > 0 ? (
              <div className={styles.fieldGroup}>
                <span className={styles.fieldLabel}>
                  Sẽ gắn thêm ({selectedIds.length}/50)
                </span>
                <div className={styles.chipList}>
                  {selectedIds.map(id => {
                    const match = available.find(a => a.mealAllocationId === id)
                    const label = match
                      ? `${match.className}${match.mealDate ? ` · ${formatDateVi(match.mealDate)}` : ""}`
                      : id
                    return (
                      <span key={id} className={styles.removableChip}>
                        <span className={match ? "" : styles.monoText}>
                          {label}
                        </span>
                        <button
                          type="button"
                          className={styles.chipRemoveBtn}
                          aria-label={`Bỏ chọn ${label}`}
                          onClick={() => toggleSelection(id)}
                        >
                          ×
                        </button>
                      </span>
                    )
                  })}
                </div>
              </div>
            ) : null}
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
            color="primary"
            disabled={submitting || selectedIds.length === 0}
          >
            {submitting
              ? "Đang lưu..."
              : `Gắn ${selectedIds.length} suất ăn`}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

AddAllocationsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  incidentId: PropTypes.string.isRequired,
  existingAllocations: PropTypes.array,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onConflict: PropTypes.func,
}
