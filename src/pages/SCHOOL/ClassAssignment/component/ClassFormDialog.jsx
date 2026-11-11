import React, { useEffect, useRef, useState } from "react"
import PropTypes from "prop-types"
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material"
import ClassService from "src/services/ClassService"
import styles from "./ClassFormDialog.module.scss"

const NAME_MAX_LENGTH = 120
const errorMessage = (failure, fallback) => failure?.response?.data?.message || fallback

// mode "create": tạo lớp mới; mode "edit": sửa tên và số suất đăng ký của lớp đã có
function ClassFormDialog({ open, mode, item, academicYear, writableYears, onClose, onDone }) {
  const isEdit = mode === "edit"
  const [name, setName] = useState("")
  const [year, setYear] = useState("")
  const [portions, setPortions] = useState("0")
  const [errors, setErrors] = useState({})
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const submitLock = useRef(false)

  useEffect(() => {
    if (!open) return
    setName(isEdit ? item?.name || "" : "")
    setPortions(String(isEdit ? item?.registeredMealPortions ?? 0 : 0))
    setYear(writableYears.includes(academicYear) ? academicYear : writableYears[0] || "")
    setErrors({})
    setError("")
  }, [open, isEdit, item, academicYear, writableYears])

  const validate = () => {
    const next = {}
    const trimmed = name.trim()
    if (!trimmed) next.name = "Vui lòng nhập tên lớp."
    else if (trimmed.length > NAME_MAX_LENGTH) next.name = `Tên lớp tối đa ${NAME_MAX_LENGTH} ký tự.`
    if (!isEdit && !year) next.year = "Vui lòng chọn niên khóa."
    if (!/^\d+$/.test(portions.trim())) next.portions = "Số suất đăng ký phải là số nguyên không âm."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async () => {
    if (submitLock.current || !validate()) return
    const payload = { name: name.trim(), registeredMealPortions: Number(portions.trim()) }
    submitLock.current = true
    setSubmitting(true)
    setError("")
    try {
      if (isEdit) {
        const changes = {}
        if (payload.name !== item.name) changes.name = payload.name
        if (payload.registeredMealPortions !== item.registeredMealPortions)
          changes.registeredMealPortions = payload.registeredMealPortions
        if (!Object.keys(changes).length) {
          onClose()
          return
        }
        await ClassService.updateClass(item.id, changes)
        onDone(`Đã cập nhật lớp ${payload.name}`)
      } else {
        await ClassService.createClass({ ...payload, academicYear: year })
        onDone(`Đã tạo lớp ${payload.name} niên khóa ${year}`)
      }
    } catch (failure) {
      setError(errorMessage(failure, "Không thể lưu lớp học. Vui lòng thử lại."))
    } finally {
      submitLock.current = false
      setSubmitting(false)
    }
  }

  const handleSubmit = event => {
    event.preventDefault()
    submit()
  }

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} fullWidth maxWidth="xs">
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle className={styles.title}>
          {isEdit ? `Sửa lớp ${item?.name || ""}` : "Thêm lớp học"}
        </DialogTitle>
        <DialogContent className={styles.content}>
          <TextField
            autoFocus
            fullWidth
            label="Tên lớp"
            placeholder="VD: 1A, Lá 2, 10A1"
            value={name}
            onChange={event => {
              setName(event.target.value)
              setErrors(current => ({ ...current, name: undefined }))
            }}
            error={Boolean(errors.name)}
            helperText={errors.name || "Trường tự đặt tên; không trùng trong cùng niên khóa."}
            disabled={submitting}
            inputProps={{ maxLength: NAME_MAX_LENGTH }}
          />
          {isEdit ? (
            <Typography className={styles.yearNote}>
              Niên khóa: <strong>{item?.academicYear}</strong>
            </Typography>
          ) : (
            <TextField
              select
              fullWidth
              label="Niên khóa"
              value={year}
              onChange={event => {
                setYear(event.target.value)
                setErrors(current => ({ ...current, year: undefined }))
              }}
              error={Boolean(errors.year)}
              helperText={errors.year || "Chỉ hiển thị niên khóa đã cấu hình và chưa kết thúc."}
              disabled={submitting}
            >
              {writableYears.map(option => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          )}
          <TextField
            fullWidth
            type="number"
            label="Số suất ăn đăng ký"
            value={portions}
            onChange={event => {
              setPortions(event.target.value)
              setErrors(current => ({ ...current, portions: undefined }))
            }}
            error={Boolean(errors.portions)}
            helperText={errors.portions || "Mức tối đa GVCN được khai báo mỗi bữa."}
            disabled={submitting}
            inputProps={{ min: 0, step: 1, inputMode: "numeric" }}
          />
          {error && <Alert severity="error">{error}</Alert>}
        </DialogContent>
        <DialogActions className={styles.actions}>
          <Button color="inherit" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo lớp"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

ClassFormDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  mode: PropTypes.oneOf(["create", "edit"]).isRequired,
  item: PropTypes.object,
  academicYear: PropTypes.string.isRequired,
  writableYears: PropTypes.arrayOf(PropTypes.string).isRequired,
  onClose: PropTypes.func.isRequired,
  onDone: PropTypes.func.isRequired,
}

export default ClassFormDialog
