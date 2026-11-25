import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import IconButton from "@mui/material/IconButton"
import { parseApiError } from "src/components/ComplaintThread"
import ROUTER from "src/router/ROUTER"
import ComplaintService from "src/services/ComplaintService"
import {
  createComplaintTypes,
  errorMessage,
  formatMealDate,
  mealLabels,
} from "../labels"
import styles from "./ComplaintDrawer.module.scss"

const mealChoices = [
  ["lunch", "LUNCH"],
  ["afternoon", "AFTERNOON"],
]

export default function ComplaintDrawer({ isTeacher, onClose, onCreated }) {
  const [options, setOptions] = useState(null)
  const [optionsError, setOptionsError] = useState("")
  const [submitError, setSubmitError] = useState("")
  const [fieldErrors, setFieldErrors] = useState({})
  const [loadVersion, setLoadVersion] = useState(0)
  const [classId, setClassId] = useState("")
  const [mealId, setMealId] = useState("")
  const [complaintType, setComplaintType] = useState("")
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    ComplaintService.mealOptions(controller.signal)
      .then(({ data }) => {
        if (!controller.signal.aborted) setOptions(data)
      })
      .catch(error => {
        if (!controller.signal.aborted) {
          setOptionsError(
            errorMessage(error, "Không tải được danh sách bữa ăn."),
          )
        }
      })
    return () => controller.abort()
  }, [loadVersion])

  // GVCN chủ nhiệm một lớp thì chọn sẵn; chủ nhiệm nhiều lớp thì hiện ô chọn như phụ huynh
  const classCount = options?.classes?.length || 0
  const autoPickClass = isTeacher && classCount === 1
  const selectedClass = autoPickClass
    ? options.classes[0]
    : options?.classes?.find(item => item.classId === classId)

  const eligible = mealChoices.some(
    ([key]) =>
      selectedClass?.[key]?.canComplain &&
      selectedClass[key].dailyMealPortionId === mealId,
  )
  const trimmedDescLength = Array.from(description.trim()).length
  const canSubmit =
    eligible &&
    complaintType &&
    trimmedDescLength >= 10 &&
    trimmedDescLength <= 2000 &&
    !saving

  function reloadOptions() {
    setOptions(null)
    setOptionsError("")
    setMealId("")
    setLoadVersion(version => version + 1)
  }

  async function submit(event) {
    event.preventDefault()
    if (!canSubmit) return
    setSaving(true)
    setSubmitError("")
    setFieldErrors({})
    try {
      await ComplaintService.create({
        dailyMealPortionId: mealId,
        complaintType,
        description: description.trim(),
      })
      onCreated()
    } catch (error) {
      const parsed = parseApiError(error, "Không thể gửi khiếu nại.")
      setSubmitError(parsed.message)
      setFieldErrors(parsed.fields || {})
      if ([404, 409].includes(parsed.status)) reloadOptions()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open
      onClose={saving ? undefined : onClose}
      fullWidth
      aria-labelledby="create-complaint-title"
      slotProps={{ paper: { className: styles.dialog } }}
    >
      <form className={styles.form} onSubmit={submit}>
        <header className={styles.header}>
          <h2 id="create-complaint-title">Gửi khiếu nại bữa ăn</h2>
          <IconButton aria-label="Đóng" onClick={onClose} disabled={saving}>
            <CloseIcon />
          </IconButton>
        </header>
        <div className={styles.content}>
          <Alert severity="info" variant="outlined" className={styles.notice}>
            Học sinh có dấu hiệu ngộ độc? Báo ngay tại{" "}
            <Link to={ROUTER.SCHOOL_INCIDENTS} onClick={onClose}>
              Báo cáo ngộ độc
            </Link>
            .
          </Alert>

          {!options && !optionsError ? (
            <CircularProgress size={24} aria-label="Đang tải bữa ăn" />
          ) : null}
          {optionsError ? (
            <Alert
              severity="error"
              action={
                <Button color="inherit" onClick={reloadOptions}>
                  Thử lại
                </Button>
              }
            >
              {optionsError}
            </Alert>
          ) : null}
          {submitError ? <Alert severity="error">{submitError}</Alert> : null}

          {options ? (
            <>
              <div className={styles.field}>
                <label htmlFor="cc-meal-date">Ngày ăn</label>
                <TextField
                  id="cc-meal-date"
                  size="small"
                  value={formatMealDate(options.mealDate)}
                  slotProps={{ input: { readOnly: true } }}
                />
              </div>
              {!autoPickClass ? (
                <div className={styles.field}>
                  <label id="cc-class-label" htmlFor="cc-class">
                    Lớp
                  </label>
                  <TextField
                    id="cc-class"
                    select
                    size="small"
                    slotProps={{ select: { labelId: "cc-class-label" } }}
                    value={selectedClass?.classId ?? ""}
                    disabled={saving || !options.classes?.length}
                    helperText={
                      options.classes?.length
                        ? undefined
                        : "Chưa có lớp để chọn."
                    }
                    onChange={event => {
                      setClassId(event.target.value)
                      setMealId("")
                    }}
                  >
                    {(options.classes || []).map(item => (
                      <MenuItem key={item.classId} value={item.classId}>
                        {item.className}
                      </MenuItem>
                    ))}
                  </TextField>
                </div>
              ) : null}
              {selectedClass ? (
                <FormControl component="fieldset">
                  <FormLabel component="legend">Bữa ăn</FormLabel>
                  <RadioGroup
                    className={styles.meals}
                    value={mealId}
                    onChange={event => setMealId(event.target.value)}
                  >
                    {mealChoices.map(([key, type]) => {
                      const meal = selectedClass[key]
                      return (
                        <div key={key} className={styles.meal}>
                          <FormControlLabel
                            value={meal?.dailyMealPortionId ?? key}
                            control={<Radio />}
                            label={mealLabels[type]}
                            disabled={saving || !meal?.canComplain}
                          />
                          {!meal?.canComplain ? (
                            <small>
                              {meal ? "Chưa xác nhận giao" : "Chưa có bữa"}
                            </small>
                          ) : null}
                        </div>
                      )
                    })}
                  </RadioGroup>
                </FormControl>
              ) : null}
            </>
          ) : null}

          <div className={styles.field}>
            <label id="cc-type-label" htmlFor="cc-type">
              Loại khiếu nại <span className={styles.required}>*</span>
            </label>
            <TextField
              id="cc-type"
              select
              required
              size="small"
              slotProps={{ select: { labelId: "cc-type-label" } }}
              value={complaintType}
              disabled={saving}
              error={Boolean(fieldErrors.complaintType)}
              helperText={fieldErrors.complaintType}
              onChange={event => {
                setComplaintType(event.target.value)
                setFieldErrors(prev => ({ ...prev, complaintType: "" }))
              }}
            >
              {Object.entries(createComplaintTypes).map(([key, label]) => (
                <MenuItem key={key} value={key}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
          </div>

          <div className={styles.field}>
            <label htmlFor="cc-description">
              Nội dung khiếu nại <span className={styles.required}>*</span>
            </label>
            <TextField
              id="cc-description"
              required
              multiline
              minRows={4}
              value={description}
              disabled={saving}
              error={Boolean(fieldErrors.description)}
              onChange={event => {
                setDescription(event.target.value)
                setFieldErrors(prev => ({ ...prev, description: "" }))
              }}
              slotProps={{ htmlInput: { maxLength: 2000 } }}
              helperText={
                fieldErrors.description ||
                `${trimmedDescLength.toLocaleString("vi-VN")}/2.000 ký tự · Tối thiểu 10 ký tự`
              }
            />
          </div>
        </div>
        <footer className={styles.footer}>
          <Button variant="contained" type="submit" disabled={!canSubmit}>
            {saving ? "Đang gửi…" : "Gửi khiếu nại"}
          </Button>
        </footer>
      </form>
    </Dialog>
  )
}
