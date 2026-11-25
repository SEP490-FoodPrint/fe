import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"
import { ROLE_LABELS } from "src/constants/roles"
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material"
import {
  AddOutlined,
  AssignmentTurnedInOutlined,
  DeleteOutlineOutlined,
  EventNoteOutlined,
  InfoOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material"
import FoodSafetyIncidentService, {
  extractApiError,
  formatDateTimeVi,
  getDefaultDatetimeLocalValue,
  getInspectionStatusMeta,
  getSupplierFindingMeta,
  OVERALL_CONCLUSION,
  OVERALL_CONCLUSION_LABELS,
  OVERALL_CONCLUSION_OPTIONS,
  SUPPLIER_FINDING,
  SUPPLIER_FINDING_OPTIONS,
  toIsoWithTimezone,
} from "src/services/FoodSafetyIncidentService"
import IncidentStatusBadge from "./IncidentStatusBadge"
import styles from "../FoodSafetyIncidents.module.scss"

export function PlanInspectionDialog({
  open,
  incidentId,
  onClose,
  onSuccess,
  onConflict,
}) {
  const [teamDescription, setTeamDescription] = useState("")
  const [scheduledAt, setScheduledAt] = useState("")
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitError, setSubmitError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setTeamDescription("")
      setScheduledAt(getDefaultDatetimeLocalValue())
      setFieldErrors({})
      setSubmitError("")
    }
  }, [open])

  const handleSubmit = async event => {
    event.preventDefault()
    if (submitting) return
    const errors = {}
    const trimmedTeam = teamDescription.trim()
    if (!trimmedTeam) {
      errors.teamDescription = "Vui lòng mô tả thành phần đoàn kiểm tra."
    } else if (trimmedTeam.length > 2000) {
      errors.teamDescription = "Mô tả đoàn kiểm tra không vượt quá 2000 ký tự."
    }
    const isoScheduled = toIsoWithTimezone(scheduledAt)
    if (!isoScheduled) {
      errors.scheduledAt = "Vui lòng chọn thời điểm dự kiến kiểm tra."
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setSubmitting(true)
    setSubmitError("")
    setFieldErrors({})
    try {
      const created = await FoodSafetyIncidentService.createInspection(
        incidentId,
        {
          teamDescription: trimmedTeam,
          scheduledAt: isoScheduled,
        },
      )
      onSuccess(created)
    } catch (error) {
      const parsed = extractApiError(
        error,
        "Không thể lập đợt kiểm tra lúc này.",
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
          Lập đợt kiểm tra an toàn thực phẩm
        </DialogTitle>
        <DialogContent dividers>
          <div className={styles.formStack}>
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
              <label htmlFor="inspection-scheduled-at" className={styles.fieldLabel}>
                Thời gian dự kiến kiểm tra
                <span className={styles.requiredMark}>*</span>
              </label>
              <input
                id="inspection-scheduled-at"
                type="datetime-local"
                className={`${styles.textInput} ${
                  fieldErrors.scheduledAt ? styles.inputError : ""
                }`}
                value={scheduledAt}
                onChange={e => {
                  setScheduledAt(e.target.value)
                  setFieldErrors(prev => ({ ...prev, scheduledAt: "" }))
                }}
                disabled={submitting}
              />
              {fieldErrors.scheduledAt ? (
                <span className={styles.fieldError}>
                  {fieldErrors.scheduledAt}
                </span>
              ) : null}
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="inspection-team-desc" className={styles.fieldLabel}>
                Thành phần &amp; phạm vi đoàn kiểm tra
                <span className={styles.requiredMark}>*</span>
              </label>
              <textarea
                id="inspection-team-desc"
                maxLength={2000}
                className={`${styles.textareaInput} ${
                  fieldErrors.teamDescription ? styles.inputError : ""
                }`}
                placeholder="Ghi rõ trưởng đoàn, cán bộ phối hợp (Trạm Y tế, UBND xã, đại diện nhà trường) và nội dung kiểm tra..."
                value={teamDescription}
                onChange={e => {
                  setTeamDescription(e.target.value)
                  setFieldErrors(prev => ({ ...prev, teamDescription: "" }))
                }}
                disabled={submitting}
              />
              {fieldErrors.teamDescription ? (
                <span className={styles.fieldError}>
                  {fieldErrors.teamDescription}
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
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={submitting}
          >
            {submitting ? "Đang tạo..." : "Lập đợt kiểm tra"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

PlanInspectionDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  incidentId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onConflict: PropTypes.func,
}

export function RecordInspectionResultDialog({
  open,
  incidentId,
  inspection,
  onClose,
  onSuccess,
  onConflict,
}) {
  const [overallConclusion, setOverallConclusion] = useState(
    OVERALL_CONCLUSION.INCONCLUSIVE,
  )
  const [resultSummary, setResultSummary] = useState("")
  const [findings, setFindings] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [supplierSource, setSupplierSource] = useState("")
  const [loadingSuppliers, setLoadingSuppliers] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitError, setSubmitError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open || !incidentId) return undefined
    setOverallConclusion(OVERALL_CONCLUSION.INCONCLUSIVE)
    setResultSummary("")
    setFindings([])
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
        setSuppliers(res.items || [])
        setSupplierSource(res.source || "")
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setSuppliers([])
          setSupplierSource("")
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingSuppliers(false)
      })

    return () => controller.abort()
  }, [open, incidentId, inspection?.id])

  const requiresAtFaultSupplier =
    overallConclusion === OVERALL_CONCLUSION.SUPPLIER_AT_FAULT ||
    overallConclusion === OVERALL_CONCLUSION.MIXED_FAULT

  const hasAtFaultFinding = findings.some(
    row => row.supplierId && row.finding === SUPPLIER_FINDING.AT_FAULT,
  )

  const crossFieldViolation =
    (requiresAtFaultSupplier && !hasAtFaultFinding) ||
    (!requiresAtFaultSupplier && hasAtFaultFinding)

  const handleAddFindingRow = () => {
    if (findings.length >= 50) return
    const usedIds = new Set(findings.map(f => f.supplierId))
    const nextSupplier = suppliers.find(s => !usedIds.has(s.id))
    setFindings(prev => [
      ...prev,
      {
        supplierId: nextSupplier?.id || "",
        finding: requiresAtFaultSupplier
          ? SUPPLIER_FINDING.AT_FAULT
          : SUPPLIER_FINDING.CLEARED,
        evidenceNote: "",
      },
    ])
    setFieldErrors(prev => ({ ...prev, findings: "" }))
  }

  const handleUpdateFinding = (index, patch) => {
    setFindings(prev =>
      prev.map((row, idx) => (idx === index ? { ...row, ...patch } : row)),
    )
    setFieldErrors(prev => ({ ...prev, findings: "" }))
  }

  const handleRemoveFinding = index => {
    setFindings(prev => prev.filter((_, idx) => idx !== index))
    setFieldErrors(prev => ({ ...prev, findings: "" }))
  }

  const validate = () => {
    const errors = {}
    const trimmedSummary = resultSummary.trim()
    if (trimmedSummary.length < 10) {
      errors.resultSummary =
        "Nội dung kết quả kiểm tra cần tối thiểu 10 ký tự."
    } else if (trimmedSummary.length > 4000) {
      errors.resultSummary =
        "Nội dung kết quả kiểm tra không được vượt quá 4000 ký tự."
    }

    const seenSuppliers = new Set()
    for (const row of findings) {
      if (!row.supplierId) {
        errors.findings = "Vui lòng chọn nhà cung cấp cho mọi dòng đánh giá."
        break
      }
      if (seenSuppliers.has(row.supplierId)) {
        errors.findings = "Mỗi nhà cung cấp chỉ được đánh giá một lần trong đợt kiểm tra."
        break
      }
      seenSuppliers.add(row.supplierId)
    }

    if (!errors.findings) {
      if (requiresAtFaultSupplier && !hasAtFaultFinding) {
        errors.findings =
          "Kết luận có lỗi nhà cung cấp bắt buộc phải đánh giá ít nhất 1 nhà cung cấp là 'Có vi phạm / lỗi'."
      } else if (!requiresAtFaultSupplier && hasAtFaultFinding) {
        errors.findings =
          "Đã có nhà cung cấp bị kết luận 'Có vi phạm / lỗi' nên kết luận chung phải là 'Lỗi thuộc về nhà cung cấp' hoặc 'Lỗi từ cả nhà cung cấp và nhà trường'."
      }
    }

    return errors
  }

  const handleSubmit = async event => {
    event.preventDefault()
    if (submitting || !inspection?.id) return
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    const payload = {
      overallConclusion,
      resultSummary: resultSummary.trim(),
      findings: findings.map(row => {
        const entry = {
          supplierId: row.supplierId,
          finding: row.finding,
        }
        if (row.evidenceNote.trim()) {
          entry.evidenceNote = row.evidenceNote.trim()
        }
        return entry
      }),
    }

    setSubmitting(true)
    setSubmitError("")
    setFieldErrors({})
    try {
      const response = await FoodSafetyIncidentService.recordInspectionResult(
        incidentId,
        inspection.id,
        payload,
      )
      onSuccess(response)
    } catch (error) {
      const parsed = extractApiError(
        error,
        "Không thể ghi kết quả đợt kiểm tra lúc này.",
      )
      if (parsed.status === 400 && Object.keys(parsed.fields).length > 0) {
        // Gộp lỗi lồng nhau (vd. findings.0.supplierId) về khối "findings" để hiện dưới bảng NCC
        const grouped = {}
        for (const [key, message] of Object.entries(parsed.fields)) {
          const root = key.startsWith("findings") ? "findings" : key
          grouped[root] = grouped[root] ? `${grouped[root]} ${message}` : message
        }
        setFieldErrors(grouped)
      }
      if (parsed.status === 409) {
        onConflict?.(parsed.message)
      }
      setSubmitError(parsed.message)
    } finally {
      setSubmitting(false)
    }
  }

  const usedSupplierIds = new Set(findings.map(f => f.supplierId).filter(Boolean))

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      maxWidth="md"
      fullWidth
    >
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle sx={{ fontWeight: 700, fontSize: 18 }}>
          Ghi kết quả đợt kiểm tra
        </DialogTitle>
        <DialogContent dividers>
          <div className={styles.formStack}>
            <div className={`${styles.banner} ${styles.bannerWarning}`}>
              <WarningAmberOutlined
                fontSize="small"
                sx={{ mt: "1px", flexShrink: 0 }}
              />
              <span>
                Kết quả kiểm tra chỉ được ghi nhận <strong>một lần duy nhất</strong>{" "}
                cho mỗi đợt kiểm tra và không thể chỉnh sửa sau khi lưu.
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
              <label htmlFor="result-conclusion" className={styles.fieldLabel}>
                Kết luận chung của đợt kiểm tra
                <span className={styles.requiredMark}>*</span>
              </label>
              <select
                id="result-conclusion"
                className={`${styles.selectInput} ${
                  fieldErrors.overallConclusion ? styles.inputError : ""
                }`}
                style={{ width: "100%" }}
                value={overallConclusion}
                onChange={e => {
                  setOverallConclusion(e.target.value)
                  setFieldErrors(prev => ({
                    ...prev,
                    overallConclusion: "",
                    findings: "",
                  }))
                }}
                disabled={submitting}
              >
                {OVERALL_CONCLUSION_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {fieldErrors.overallConclusion ? (
                <span className={styles.fieldError}>
                  {fieldErrors.overallConclusion}
                </span>
              ) : null}
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="result-summary" className={styles.fieldLabel}>
                Tóm tắt kết quả kiểm tra
                <span className={styles.requiredMark}>*</span>
              </label>
              <textarea
                id="result-summary"
                maxLength={4000}
                style={{ minHeight: 112 }}
                className={`${styles.textareaInput} ${
                  fieldErrors.resultSummary ? styles.inputError : ""
                }`}
                placeholder="Ghi rõ biên bản kiểm tra hiện trường, kết quả xét nghiệm mẫu lưu (nếu có) và căn cứ kết luận (tối thiểu 10 ký tự)..."
                value={resultSummary}
                onChange={e => {
                  setResultSummary(e.target.value)
                  setFieldErrors(prev => ({ ...prev, resultSummary: "" }))
                }}
                disabled={submitting}
              />
              {fieldErrors.resultSummary ? (
                <span className={styles.fieldError}>
                  {fieldErrors.resultSummary}
                </span>
              ) : (
                <span className={styles.fieldHint}>
                  {resultSummary.trim().length}/4000 ký tự
                </span>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span className={styles.fieldLabel}>
                    Đánh giá theo từng nhà cung cấp ({findings.length}/50)
                  </span>
                  {supplierSource ? (
                    <IncidentStatusBadge
                      label={
                        supplierSource === "SNAPSHOT"
                          ? "Từ snapshot truy xuất"
                          : "Từ quan hệ trường – NCC"
                      }
                      tone={supplierSource === "SNAPSHOT" ? "success" : "info"}
                    />
                  ) : null}
                </div>
                <Button
                  type="button"
                  size="small"
                  variant="outlined"
                  color="primary"
                  startIcon={<AddOutlined />}
                  onClick={handleAddFindingRow}
                  disabled={
                    submitting ||
                    loadingSuppliers ||
                    findings.length >= 50 ||
                    findings.length >= suppliers.length
                  }
                >
                  Thêm NCC đánh giá
                </Button>
              </div>

              {loadingSuppliers ? (
                <span className={styles.mutedText}>
                  Đang tải danh sách nhà cung cấp liên quan...
                </span>
              ) : suppliers.length === 0 ? (
                <span className={styles.mutedText}>
                  Không có nhà cung cấp nào trong snapshot hoặc liên kết với
                  trường.
                </span>
              ) : findings.length === 0 ? (
                <span className={styles.fieldHint}>
                  Chưa thêm nhà cung cấp nào.{" "}
                  {requiresAtFaultSupplier
                    ? "Cần thêm ít nhất 1 nhà cung cấp có kết luận vi phạm để khớp với kết luận chung."
                    : "Bạn có thể thêm nhà cung cấp để ghi nhận kết quả đánh giá cụ thể."}
                </span>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {findings.map((row, idx) => (
                    <div key={idx} className={styles.findingRow}>
                      <select
                        aria-label={`Nhà cung cấp dòng ${idx + 1}`}
                        className={styles.selectInput}
                        style={{ minWidth: 0, width: "100%" }}
                        value={row.supplierId}
                        onChange={e =>
                          handleUpdateFinding(idx, {
                            supplierId: e.target.value,
                          })
                        }
                        disabled={submitting}
                      >
                        <option value="">Chọn nhà cung cấp</option>
                        {suppliers.map(s => {
                          const takenElsewhere =
                            usedSupplierIds.has(s.id) && row.supplierId !== s.id
                          return (
                            <option
                              key={s.id}
                              value={s.id}
                              disabled={takenElsewhere}
                            >
                              {s.name}
                            </option>
                          )
                        })}
                      </select>

                      <select
                        aria-label={`Kết luận nhà cung cấp dòng ${idx + 1}`}
                        className={styles.selectInput}
                        style={{ minWidth: 0, width: "100%" }}
                        value={row.finding}
                        onChange={e =>
                          handleUpdateFinding(idx, { finding: e.target.value })
                        }
                        disabled={submitting}
                      >
                        {SUPPLIER_FINDING_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        aria-label={`Bằng chứng / ghi chú dòng ${idx + 1}`}
                        className={styles.textInput}
                        style={{ height: 38 }}
                        placeholder="Ghi chú bằng chứng (không bắt buộc)"
                        value={row.evidenceNote}
                        onChange={e =>
                          handleUpdateFinding(idx, {
                            evidenceNote: e.target.value,
                          })
                        }
                        disabled={submitting}
                      />

                      <IconButton
                        type="button"
                        size="small"
                        color="error"
                        aria-label="Xóa dòng đánh giá"
                        onClick={() => handleRemoveFinding(idx)}
                        disabled={submitting}
                      >
                        <DeleteOutlineOutlined fontSize="small" />
                      </IconButton>
                    </div>
                  ))}
                </div>
              )}

              {crossFieldViolation && !fieldErrors.findings ? (
                <span className={styles.fieldError}>
                  {requiresAtFaultSupplier
                    ? "Kết luận chung chỉ ra lỗi nhà cung cấp: cần ít nhất 1 nhà cung cấp có kết luận 'Có vi phạm / lỗi'."
                    : "Có nhà cung cấp bị kết luận 'Có vi phạm / lỗi': hãy đổi kết luận chung sang 'Lỗi thuộc về nhà cung cấp' hoặc 'Lỗi từ cả nhà cung cấp và nhà trường'."}
                </span>
              ) : null}
              {fieldErrors.findings ? (
                <span className={styles.fieldError}>{fieldErrors.findings}</span>
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
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={submitting || crossFieldViolation}
          >
            {submitting ? "Đang lưu kết quả..." : "Lưu kết quả kiểm tra"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

RecordInspectionResultDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  incidentId: PropTypes.string.isRequired,
  inspection: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onConflict: PropTypes.func,
}

export function CloseIncidentDialog({
  open,
  incidentId,
  onClose,
  onSuccess,
  onConflict,
}) {
  const [note, setNote] = useState("")
  const [submitError, setSubmitError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setNote("")
      setSubmitError("")
    }
  }, [open])

  const handleSubmit = async event => {
    event.preventDefault()
    if (submitting) return
    const payload = note.trim() ? { note: note.trim() } : {}
    setSubmitting(true)
    setSubmitError("")
    try {
      const res = await FoodSafetyIncidentService.closeIncident(
        incidentId,
        payload,
      )
      onSuccess(res)
    } catch (error) {
      const parsed = extractApiError(error, "Không thể đóng hồ sơ báo cáo ngộ độc lúc này.")
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
          Đóng hồ sơ báo cáo ngộ độc
        </DialogTitle>
        <DialogContent dividers>
          <div className={styles.formStack}>
            <div className={`${styles.banner} ${styles.bannerInfo}`}>
              <InfoOutlined fontSize="small" sx={{ mt: "1px", flexShrink: 0 }} />
              <span>
                Đóng hồ sơ <strong>không tự động gỡ bỏ</strong> các hạn chế hoặc
                chế tài đang áp dụng với nhà cung cấp. Nếu cần khôi phục nhà
                cung cấp, hãy gửi yêu cầu khôi phục chế tài riêng.
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
              <label htmlFor="close-incident-note" className={styles.fieldLabel}>
                Ghi chú đóng hồ sơ (không bắt buộc)
              </label>
              <textarea
                id="close-incident-note"
                maxLength={2000}
                className={styles.textareaInput}
                placeholder="Ghi chú tổng kết hoặc đề xuất theo dõi sau khi đóng hồ sơ..."
                value={note}
                onChange={e => setNote(e.target.value)}
                disabled={submitting}
              />
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
            color="primary"
            disabled={submitting}
          >
            {submitting ? "Đang đóng hồ sơ..." : "Xác nhận đóng hồ sơ"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

CloseIncidentDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  incidentId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onConflict: PropTypes.func,
}

function InspectionsSection({
  inspections,
  isAuthority,
  canPlanInspection,
  onOpenPlanDialog,
  onOpenRecordResult,
}) {
  const list = Array.isArray(inspections) ? inspections : []

  return (
    <section className={styles.surface}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          Đợt kiểm tra ATTP ({list.length})
        </h2>
        {isAuthority && canPlanInspection ? (
          <Button
            type="button"
            variant="contained"
            color="primary"
            size="small"
            startIcon={<EventNoteOutlined />}
            onClick={onOpenPlanDialog}
          >
            Lập đợt kiểm tra
          </Button>
        ) : null}
      </div>

      <div className={styles.sectionBody}>
        {list.length === 0 ? (
          <span className={styles.mutedText}>
            Chưa có đợt kiểm tra nào được ghi nhận cho hồ sơ này.
          </span>
        ) : (
          list.map((insp, idx) => {
            const statusMeta = getInspectionStatusMeta(insp.status)
            const findingsList = Array.isArray(insp.findings) ? insp.findings : []
            const canRecord = isAuthority && insp.status === "PLANNED"

            return (
              <div key={insp.id || idx} className={styles.inspectionItem}>
                <div className={styles.inspectionTop}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <strong>Đợt kiểm tra #{idx + 1}</strong>
                    <IncidentStatusBadge
                      label={statusMeta.label}
                      tone={statusMeta.tone}
                    />
                    <span className={styles.mutedText}>
                      Lịch kiểm tra:{" "}
                      <span className={styles.tabularNum}>
                        {formatDateTimeVi(insp.scheduledAt)}
                      </span>
                    </span>
                  </div>

                  {canRecord ? (
                    <Button
                      type="button"
                      variant="outlined"
                      color="primary"
                      size="small"
                      startIcon={<AssignmentTurnedInOutlined />}
                      onClick={() => onOpenRecordResult(insp)}
                    >
                      Ghi kết quả kiểm tra
                    </Button>
                  ) : null}
                </div>

                {insp.teamDescription ? (
                  <div>
                    <div className={styles.blockHeading}>Đoàn kiểm tra</div>
                    <p className={styles.proseText}>{insp.teamDescription}</p>
                  </div>
                ) : null}

                {insp.overallConclusion ? (
                  <div className={styles.metaGrid}>
                    <div className={styles.metaRow}>
                      <span className={styles.metaLabel}>Kết luận chung</span>
                      <span className={styles.metaValue}>
                        {OVERALL_CONCLUSION_LABELS[insp.overallConclusion] ||
                          insp.overallConclusion}
                      </span>
                    </div>
                    <div className={styles.metaRow}>
                      <span className={styles.metaLabel}>Người ghi kết quả</span>
                      <span className={styles.metaValue}>
                        {insp.recordedBy?.fullName || "—"}
                        {insp.recordedBy?.roleCode
                          ? ` (${ROLE_LABELS[insp.recordedBy.roleCode] || insp.recordedBy.roleCode})`
                          : ""}
                        {insp.recordedAt
                          ? ` · ${formatDateTimeVi(insp.recordedAt)}`
                          : ""}
                      </span>
                    </div>
                  </div>
                ) : null}

                {insp.resultSummary ? (
                  <div>
                    <div className={styles.blockHeading}>Tóm tắt kết quả</div>
                    <p className={styles.proseText}>{insp.resultSummary}</p>
                  </div>
                ) : null}

                {findingsList.length > 0 ? (
                  <div className={styles.tableWrap}>
                    <table
                      className={styles.table}
                      aria-label={`Kết quả đánh giá nhà cung cấp đợt ${idx + 1}`}
                    >
                      <thead>
                        <tr>
                          <th scope="col">Nhà cung cấp</th>
                          <th scope="col">Đánh giá</th>
                          <th scope="col">Ghi chú bằng chứng</th>
                        </tr>
                      </thead>
                      <tbody>
                        {findingsList.map((f, fIdx) => {
                          const fMeta = getSupplierFindingMeta(f.finding)
                          return (
                            <tr key={f.id || f.supplierId || fIdx}>
                              <td style={{ fontWeight: 600 }}>
                                {f.supplier?.name || f.supplierName || f.supplierId}
                              </td>
                              <td>
                                <IncidentStatusBadge
                                  label={fMeta.label}
                                  tone={fMeta.tone}
                                />
                              </td>
                              <td>{f.evidenceNote || "—"}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}

InspectionsSection.propTypes = {
  inspections: PropTypes.array,
  isAuthority: PropTypes.bool,
  canPlanInspection: PropTypes.bool,
  onOpenPlanDialog: PropTypes.func.isRequired,
  onOpenRecordResult: PropTypes.func.isRequired,
}

export default InspectionsSection
