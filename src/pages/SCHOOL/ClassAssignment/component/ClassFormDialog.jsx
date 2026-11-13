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
import TeacherAutocomplete from "./TeacherAutocomplete"
import styles from "./ClassFormDialog.module.scss"

const NAME_MAX_LENGTH = 120
const errorMessage = (failure, fallback) => failure?.response?.data?.message || fallback

// mode "create": tạo lớp mới; mode "edit": sửa tên và số suất đăng ký của lớp đã có
function ClassFormDialog({ open, mode, item, academicYear, writableYears, grades, canEditGrade, gradeOnly, onClose, onDone }) {
  const isEdit = mode === "edit"
  const [name, setName] = useState("")
  const [gradeId, setGradeId] = useState("")
  const [year, setYear] = useState("")
  const [portions, setPortions] = useState("0")
  const [errors, setErrors] = useState({})
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [teachers, setTeachers] = useState([])
  const [teachersLoading, setTeachersLoading] = useState(false)
  const [teachersError, setTeachersError] = useState("")
  const [teacherId, setTeacherId] = useState("")
  const submitLock = useRef(false)

  // GVCN chỉ chọn khi tạo lớp; danh sách phụ thuộc niên khóa vì mỗi GVCN chủ nhiệm một lớp mỗi năm.
  useEffect(() => {
    setTeacherId("")
    if (!open || isEdit || !year) {
      setTeachers([])
      return undefined
    }
    let active = true
    setTeachersLoading(true)
    setTeachersError("")
    ClassService.getEligibleTeachers(year)
      .then(response => {
        if (active) setTeachers(response.data.items)
      })
      .catch(failure => {
        if (!active) return
        setTeachers([])
        setTeachersError(errorMessage(failure, "Không thể tải danh sách GVCN."))
      })
      .finally(() => {
        if (active) setTeachersLoading(false)
      })
    return () => {
      active = false
    }
  }, [open, isEdit, year])

  useEffect(() => {
    if (!open) return
    setName(isEdit ? item?.name || "" : "")
    setGradeId(isEdit ? item?.grade?.id || "" : "")
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
    if (submitLock.current || (!gradeOnly && !validate())) return
    const payload = { name: name.trim(), registeredMealPortions: Number(portions.trim()) }
    submitLock.current = true
    setSubmitting(true)
    setError("")
    try {
      if (isEdit) {
        const changes = {}
        if (!gradeOnly && payload.name !== item.name) changes.name = payload.name
        if (!gradeOnly && payload.registeredMealPortions !== item.registeredMealPortions)
          changes.registeredMealPortions = payload.registeredMealPortions
        if (canEditGrade && (gradeId || null) !== (item.grade?.id ?? null))
          changes.gradeId = gradeId || null
        if (!Object.keys(changes).length) {
          onClose()
          return
        }
        await ClassService.updateClass(item.id, changes)
        onDone(`Đã cập nhật lớp ${payload.name}`)
      } else {
        const teacher = teachers.find(option => option.id === teacherId)
        await ClassService.createClass({
          ...payload,
          academicYear: year,
          ...(canEditGrade && gradeId ? { gradeId } : {}),
          ...(teacher ? { homeroomTeacherUserId: teacher.id } : {}),
        })
        onDone(
          teacher
            ? `Đã tạo lớp ${payload.name} niên khóa ${year} và phân công ${teacher.fullName} làm GVCN`
            : `Đã tạo lớp ${payload.name} niên khóa ${year}`,
        )
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
            disabled={submitting || gradeOnly}
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
            disabled={submitting || gradeOnly}
            inputProps={{ min: 0, step: 1, inputMode: "numeric" }}
          />
          {canEditGrade && (
            <TextField select label="Khối học" value={gradeId} disabled={submitting}
              onChange={event => setGradeId(event.target.value)}>
              <MenuItem value="">Chưa gán khối</MenuItem>
              {grades.map(grade => <MenuItem key={grade.id} value={grade.id}>{grade.name}</MenuItem>)}
              {gradeId && !grades.some(grade => grade.id === gradeId) && <MenuItem value={gradeId} disabled>{item?.grade?.name}</MenuItem>}
            </TextField>
          )}
          {!isEdit && (
            <TeacherAutocomplete
              teachers={teachers}
              value={teacherId}
              onChange={setTeacherId}
              label="Giáo viên chủ nhiệm (không bắt buộc)"
              helperText={
                teachersError ||
                (!teachersLoading && year && !teachers.length
                  ? "Trường chưa có tài khoản GVCN đang hoạt động; có thể phân công sau."
                  : "Có thể bỏ trống và phân công sau.")
              }
              error={Boolean(teachersError)}
              loading={teachersLoading}
              disabled={submitting || !year}
            />
          )}
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
  grades: PropTypes.arrayOf(PropTypes.object).isRequired,
  canEditGrade: PropTypes.bool.isRequired,
  gradeOnly: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onDone: PropTypes.func.isRequired,
}

export default ClassFormDialog
