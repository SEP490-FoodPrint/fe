import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material"
import { InfoOutlined, WarningAmberOutlined } from "@mui/icons-material"
import { EvidenceFilePicker } from "src/components/EvidenceFiles"
import FoodSafetyIncidentService, {
  extractApiError,
  getFilesError,
  getDefaultDatetimeLocalValue,
  PRELIMINARY_ASSESSMENT,
  PRELIMINARY_ASSESSMENT_OPTIONS,
  toIsoWithTimezone,
} from "src/services/FoodSafetyIncidentService"
import styles from "../FoodSafetyIncidents.module.scss"

function ReportIncidentDialog({
  open,
  mode,
  isHomeroomTeacher,
  currentUserId,
  onClose,
  onSuccess,
}) {
  const isDirect = mode === "direct"

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [reportedSymptomaticCount, setReportedSymptomaticCount] = useState("1")
  const [symptomDescription, setSymptomDescription] = useState("")
  const [occurredAt, setOccurredAt] = useState("")
  const [classId, setClassId] = useState("")
  const [preliminaryAssessment, setPreliminaryAssessment] = useState(
    PRELIMINARY_ASSESSMENT.SCHOOL_MEAL_SUSPECTED,
  )
  const [preliminaryNote, setPreliminaryNote] = useState("")

  const [classes, setClasses] = useState([])
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [files, setFiles] = useState([])
  const [submitError, setSubmitError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return undefined

    setTitle("")
    setDescription("")
    setReportedSymptomaticCount("1")
    setSymptomDescription("")
    setOccurredAt(getDefaultDatetimeLocalValue())
    setClassId("")
    setPreliminaryAssessment(PRELIMINARY_ASSESSMENT.SCHOOL_MEAL_SUSPECTED)
    setPreliminaryNote("")
    setFiles([])
    setFieldErrors({})
    setSubmitError("")

    const controller = new AbortController()
    setLoadingClasses(true)

    FoodSafetyIncidentService.listSchoolClasses(controller.signal, {
      preferMealOptions: !isDirect,
      homeroomOnly: isHomeroomTeacher,
    })
      .then(list => {
        if (controller.signal.aborted) return
        setClasses(list)
        if (isHomeroomTeacher) {
          const ownClass =
            list.find(c => c.homeroomTeacherId === currentUserId) ||
            (list.length === 1 ? list[0] : null)
          if (ownClass) {
            setClassId(ownClass.id)
          }
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setClasses([])
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingClasses(false)
        }
      })

    return () => controller.abort()
  }, [open, isDirect, isHomeroomTeacher, currentUserId])

  const clearFieldError = key => {
    setFieldErrors(prev => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
    if (submitError) setSubmitError("")
  }

  const validate = () => {
    const errors = {}
    const trimmedTitle = title.trim()
    const trimmedDesc = description.trim()
    const countNum = Number(reportedSymptomaticCount)

    if (!trimmedTitle) {
      errors.title = "Vui lòng nhập tiêu đề báo cáo ngộ độc."
    } else if (trimmedTitle.length > 255) {
      errors.title = "Tiêu đề không được vượt quá 255 ký tự."
    }

    if (trimmedDesc.length < 10) {
      errors.description = "Mô tả chi tiết cần tối thiểu 10 ký tự."
    } else if (trimmedDesc.length > 2000) {
      errors.description = "Mô tả chi tiết không được vượt quá 2000 ký tự."
    }

    if (
      !Number.isInteger(countNum) ||
      countNum < 1 ||
      countNum > 100000
    ) {
      errors.reportedSymptomaticCount =
        "Số học sinh có triệu chứng phải là số nguyên từ 1 đến 100.000."
    }

    if (symptomDescription.trim().length > 2000) {
      errors.symptomDescription =
        "Mô tả triệu chứng không được vượt quá 2000 ký tự."
    }

    if (isHomeroomTeacher && !classId) {
      errors.classId = "Giáo viên chủ nhiệm bắt buộc chọn lớp mình phụ trách."
    }

    if (isDirect) {
      if (!preliminaryAssessment) {
        errors.preliminaryAssessment =
          "Vui lòng chọn nhận định sơ bộ của nhà trường."
      }
      if (preliminaryNote.trim().length > 2000) {
        errors.preliminaryNote =
          "Ghi chú sơ bộ không được vượt quá 2000 ký tự."
      }
    }

    return errors
  }

  const handleSubmit = async event => {
    event.preventDefault()
    if (submitting) return

    const localErrors = validate()
    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors)
      return
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      reportedSymptomaticCount: Number(reportedSymptomaticCount),
    }

    if (symptomDescription.trim()) {
      payload.symptomDescription = symptomDescription.trim()
    }

    if (occurredAt) {
      const iso = toIsoWithTimezone(occurredAt)
      if (iso) payload.occurredAt = iso
    }

    if (classId) {
      payload.classId = classId
    }

    if (files.length > 0) payload.files = files

    if (isDirect) {
      payload.preliminaryAssessment = preliminaryAssessment
      if (preliminaryNote.trim()) {
        payload.preliminaryNote = preliminaryNote.trim()
      }
    }

    setSubmitting(true)
    setSubmitError("")
    setFieldErrors({})

    try {
      const created = isDirect
        ? await FoodSafetyIncidentService.reportDirectIncident(payload)
        : await FoodSafetyIncidentService.reportIncident(payload)
      onSuccess(created)
    } catch (error) {
      const parsed = extractApiError(
        error,
        isDirect
          ? "Không thể tạo và gửi báo cáo ngộ độc trực tiếp lúc này."
          : "Không thể gửi báo cáo ngộ độc lúc này.",
      )
      if (parsed.status === 400 && Object.keys(parsed.fields).length > 0) {
        setFieldErrors(parsed.fields)
      }
      const filesError = getFilesError(parsed)
      if (filesError) setFieldErrors(prev => ({ ...prev, files: filesError }))
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
          {isDirect
            ? "Tạo báo cáo ngộ độc gửi trực tiếp ATTP"
            : "Gửi báo cáo ngộ độc"}
        </DialogTitle>
        <DialogContent dividers>
          <div className={styles.formStack}>
            {isDirect ? (
              <div className={`${styles.banner} ${styles.bannerInfo}`}>
                <InfoOutlined fontSize="small" sx={{ mt: "1px", flexShrink: 0 }} />
                <span>
                  Hồ sơ tạo trực tiếp bởi Ban Giám Hiệu sẽ được chuyển ngay tới
                  đơn vị ATTP cấp xã phụ trách địa bàn trường và tự động chụp
                  snapshot truy xuất.
                </span>
              </div>
            ) : null}

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
              <label htmlFor="incident-title" className={styles.fieldLabel}>
                Tiêu đề báo cáo ngộ độc
                <span className={styles.requiredMark}>*</span>
              </label>
              <input
                id="incident-title"
                type="text"
                maxLength={255}
                className={`${styles.textInput} ${
                  fieldErrors.title ? styles.inputError : ""
                }`}
                placeholder="Ví dụ: Học sinh lớp 3A có biểu hiện đau bụng sau bữa trưa"
                value={title}
                onChange={e => {
                  setTitle(e.target.value)
                  clearFieldError("title")
                }}
                disabled={submitting}
              />
              {fieldErrors.title ? (
                <span className={styles.fieldError}>{fieldErrors.title}</span>
              ) : null}
            </div>

            <div className={styles.formGridTwo}>
              <div className={styles.fieldGroup}>
                <label
                  htmlFor="incident-symptomatic-count"
                  className={styles.fieldLabel}
                >
                  Số học sinh có triệu chứng
                  <span className={styles.requiredMark}>*</span>
                </label>
                <input
                  id="incident-symptomatic-count"
                  type="number"
                  min={1}
                  max={100000}
                  step={1}
                  className={`${styles.textInput} ${
                    fieldErrors.reportedSymptomaticCount ? styles.inputError : ""
                  }`}
                  value={reportedSymptomaticCount}
                  onChange={e => {
                    setReportedSymptomaticCount(e.target.value)
                    clearFieldError("reportedSymptomaticCount")
                  }}
                  disabled={submitting}
                />
                {fieldErrors.reportedSymptomaticCount ? (
                  <span className={styles.fieldError}>
                    {fieldErrors.reportedSymptomaticCount}
                  </span>
                ) : null}
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="incident-occurred-at" className={styles.fieldLabel}>
                  Thời điểm phát sinh
                </label>
                <input
                  id="incident-occurred-at"
                  type="datetime-local"
                  className={`${styles.textInput} ${
                    fieldErrors.occurredAt ? styles.inputError : ""
                  }`}
                  value={occurredAt}
                  onChange={e => {
                    setOccurredAt(e.target.value)
                    clearFieldError("occurredAt")
                  }}
                  disabled={submitting}
                />
                {fieldErrors.occurredAt ? (
                  <span className={styles.fieldError}>
                    {fieldErrors.occurredAt}
                  </span>
                ) : null}
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="incident-class" className={styles.fieldLabel}>
                Lớp học liên quan
                {isHomeroomTeacher ? (
                  <span className={styles.requiredMark}>*</span>
                ) : null}
              </label>
              <select
                id="incident-class"
                className={`${styles.selectInput} ${
                  fieldErrors.classId ? styles.inputError : ""
                }`}
                style={{ width: "100%" }}
                value={classId}
                onChange={e => {
                  setClassId(e.target.value)
                  clearFieldError("classId")
                }}
                disabled={submitting || loadingClasses}
              >
                <option value="">
                  {loadingClasses
                    ? "Đang tải danh sách lớp..."
                    : isHomeroomTeacher
                      ? "Chọn lớp chủ nhiệm"
                      : "Không chọn cụ thể / Toàn trường"}
                </option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                    {cls.academicYear ? ` (${cls.academicYear})` : ""}
                  </option>
                ))}
              </select>
              {fieldErrors.classId ? (
                <span className={styles.fieldError}>{fieldErrors.classId}</span>
              ) : isHomeroomTeacher ? (
                <span className={styles.fieldHint}>
                  Giáo viên chủ nhiệm chỉ báo cáo cho lớp mình phụ trách.
                </span>
              ) : null}
            </div>

            <div className={styles.fieldGroup}>
              <label
                htmlFor="incident-description"
                className={styles.fieldLabel}
              >
                Mô tả chi tiết sự việc
                <span className={styles.requiredMark}>*</span>
              </label>
              <textarea
                id="incident-description"
                maxLength={2000}
                className={`${styles.textareaInput} ${
                  fieldErrors.description ? styles.inputError : ""
                }`}
                placeholder="Ghi rõ diễn biến, thời gian phát hiện, bữa ăn nghi ngờ liên quan và các biện pháp sơ cứu đã thực hiện (tối thiểu 10 ký tự)."
                value={description}
                onChange={e => {
                  setDescription(e.target.value)
                  clearFieldError("description")
                }}
                disabled={submitting}
              />
              {fieldErrors.description ? (
                <span className={styles.fieldError}>
                  {fieldErrors.description}
                </span>
              ) : (
                <span className={styles.fieldHint}>
                  {description.trim().length}/2000 ký tự
                </span>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="incident-symptoms" className={styles.fieldLabel}>
                Mô tả triệu chứng (không bắt buộc)
              </label>
              <textarea
                id="incident-symptoms"
                maxLength={2000}
                style={{ minHeight: 74 }}
                className={`${styles.textareaInput} ${
                  fieldErrors.symptomDescription ? styles.inputError : ""
                }`}
                placeholder="Ví dụ: Đau bụng, buồn nôn, sốt nhẹ, tiêu chảy..."
                value={symptomDescription}
                onChange={e => {
                  setSymptomDescription(e.target.value)
                  clearFieldError("symptomDescription")
                }}
                disabled={submitting}
              />
              {fieldErrors.symptomDescription ? (
                <span className={styles.fieldError}>
                  {fieldErrors.symptomDescription}
                </span>
              ) : null}
            </div>

            {isDirect ? (
              <>
                <div className={styles.fieldGroup}>
                  <label
                    htmlFor="incident-prelim-assessment"
                    className={styles.fieldLabel}
                  >
                    Nhận định sơ bộ của nhà trường
                    <span className={styles.requiredMark}>*</span>
                  </label>
                  <select
                    id="incident-prelim-assessment"
                    className={`${styles.selectInput} ${
                      fieldErrors.preliminaryAssessment ? styles.inputError : ""
                    }`}
                    style={{ width: "100%" }}
                    value={preliminaryAssessment}
                    onChange={e => {
                      setPreliminaryAssessment(e.target.value)
                      clearFieldError("preliminaryAssessment")
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
                  <label
                    htmlFor="incident-prelim-note"
                    className={styles.fieldLabel}
                  >
                    Ghi chú nhận định sơ bộ (không bắt buộc)
                  </label>
                  <textarea
                    id="incident-prelim-note"
                    maxLength={2000}
                    style={{ minHeight: 74 }}
                    className={`${styles.textareaInput} ${
                      fieldErrors.preliminaryNote ? styles.inputError : ""
                    }`}
                    placeholder="Ghi chú thêm của Ban Giám Hiệu gửi đơn vị ATTP..."
                    value={preliminaryNote}
                    onChange={e => {
                      setPreliminaryNote(e.target.value)
                      clearFieldError("preliminaryNote")
                    }}
                    disabled={submitting}
                  />
                  {fieldErrors.preliminaryNote ? (
                    <span className={styles.fieldError}>
                      {fieldErrors.preliminaryNote}
                    </span>
                  ) : null}
                </div>
              </>
            ) : null}

            <EvidenceFilePicker
              value={files}
              onChange={next => {
                setFiles(next)
                clearFieldError("files")
              }}
              disabled={submitting}
              label="Ảnh/tài liệu chứng cứ (không bắt buộc)"
              error={fieldErrors.files || ""}
            />
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
            {submitting
              ? "Đang gửi..."
              : isDirect
                ? "Tạo và chuyển ATTP"
                : "Gửi báo cáo ngộ độc"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

ReportIncidentDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  mode: PropTypes.oneOf(["report", "direct"]).isRequired,
  isHomeroomTeacher: PropTypes.bool,
  currentUserId: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
}

export default ReportIncidentDialog
