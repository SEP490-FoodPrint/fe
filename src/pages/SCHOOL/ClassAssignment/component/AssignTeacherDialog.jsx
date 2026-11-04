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
  Skeleton,
  TextField,
  Typography,
} from "@mui/material"
import ClassService from "src/services/ClassService"
import styles from "./AssignTeacherDialog.module.scss"

const errorMessage = (failure, fallback) => failure?.response?.data?.message || fallback

// mode "assign": gán hoặc đổi GVCN; mode "remove": xác nhận bỏ phân công
function AssignTeacherDialog({ open, mode, item, academicYear, onClose, onDone }) {
  const [teachers, setTeachers] = useState([])
  const [teacherId, setTeacherId] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const submitLock = useRef(false)
  const isRemove = mode === "remove"
  const current = item?.homeroomTeacher || null

  useEffect(() => {
    if (!open || isRemove) return undefined
    let active = true
    setTeacherId("")
    setError("")
    setLoading(true)
    ClassService.getEligibleTeachers(academicYear)
      .then(response => {
        if (active) setTeachers(response.data.items)
      })
      .catch(failure => {
        if (active) setError(errorMessage(failure, "Không thể tải danh sách GVCN."))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [open, isRemove, academicYear])

  useEffect(() => {
    if (open) setError("")
  }, [open])

  const selected = teachers.find(teacher => teacher.id === teacherId)

  const submit = async () => {
    if (submitLock.current || !item) return
    if (!isRemove && !teacherId) {
      setError("Vui lòng chọn giáo viên chủ nhiệm.")
      return
    }
    submitLock.current = true
    setSubmitting(true)
    try {
      if (isRemove) {
        await ClassService.removeHomeroomTeacher(item.id)
        onDone(`Đã bỏ phân công GVCN lớp ${item.name}`)
      } else {
        await ClassService.assignHomeroomTeacher(item.id, teacherId)
        onDone(`Đã phân công ${selected?.fullName} chủ nhiệm lớp ${item.name}`)
      }
    } catch (failure) {
      setError(errorMessage(failure, "Không thể lưu phân công. Vui lòng thử lại."))
    } finally {
      submitLock.current = false
      setSubmitting(false)
    }
  }

  const title = isRemove
    ? "Bỏ phân công GVCN"
    : current
      ? "Đổi giáo viên chủ nhiệm"
      : "Phân công giáo viên chủ nhiệm"

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle className={styles.title}>
        {title} — lớp {item?.name}
      </DialogTitle>
      <DialogContent className={styles.content}>
        {isRemove ? (
          <Typography>
            Bỏ <strong>{current?.fullName}</strong> khỏi vị trí GVCN lớp {item?.name}? Giáo viên sẽ không
            còn chức năng chủ nhiệm của lớp này.
          </Typography>
        ) : (
          <>
            {current && (
              <Alert severity="warning">
                GVCN hiện tại là <strong>{current.fullName}</strong>. Sau khi đổi, giáo viên này không còn
                chức năng chủ nhiệm lớp {item?.name}.
              </Alert>
            )}
            {loading ? (
              <Skeleton variant="rounded" height={40} />
            ) : teachers.length ? (
              <TextField
                select
                fullWidth
                label="Giáo viên chủ nhiệm"
                value={teacherId}
                onChange={event => {
                  setTeacherId(event.target.value)
                  setError("")
                }}
                disabled={submitting}
              >
                {teachers.map(teacher => {
                  const busy = teacher.currentClass && teacher.currentClass.id !== item?.id
                  const isCurrent = teacher.id === current?.id
                  return (
                    <MenuItem key={teacher.id} value={teacher.id} disabled={Boolean(busy) || isCurrent}>
                      <span className={styles.option}>
                        <span>{teacher.fullName}</span>
                        <small>
                          {teacher.username}
                          {isCurrent
                            ? " · GVCN hiện tại"
                            : busy
                              ? ` · Đang chủ nhiệm lớp ${teacher.currentClass.name}`
                              : ""}
                        </small>
                      </span>
                    </MenuItem>
                  )
                })}
              </TextField>
            ) : (
              !error && (
                <Alert severity="info">
                  Chưa có tài khoản GVCN đang hoạt động trong trường. Tài khoản do Quản trị nhà trường quản lý.
                </Alert>
              )
            )}
            <Typography className={styles.hint}>
              Chỉ hiển thị tài khoản GVCN đang hoạt động của trường. Mỗi giáo viên chủ nhiệm một lớp trong
              niên khóa {academicYear}.
            </Typography>
          </>
        )}
        {error && <Alert severity="error">{error}</Alert>}
      </DialogContent>
      <DialogActions className={styles.actions}>
        <Button color="inherit" onClick={onClose} disabled={submitting}>
          Hủy
        </Button>
        <Button
          variant="contained"
          color={isRemove ? "error" : "primary"}
          onClick={submit}
          disabled={submitting || (!isRemove && (loading || !teachers.length))}
        >
          {submitting ? "Đang lưu..." : isRemove ? "Bỏ phân công" : "Xác nhận phân công"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

AssignTeacherDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  mode: PropTypes.oneOf(["assign", "remove"]).isRequired,
  item: PropTypes.object,
  academicYear: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onDone: PropTypes.func.isRequired,
}

export default AssignTeacherDialog
