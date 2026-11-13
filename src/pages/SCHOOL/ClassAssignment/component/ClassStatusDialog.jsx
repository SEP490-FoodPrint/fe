import React, { useEffect, useRef, useState } from "react"
import PropTypes from "prop-types"
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material"
import ClassService from "src/services/ClassService"
import styles from "./ClassStatusDialog.module.scss"

const errorMessage = (failure, fallback) => failure?.response?.data?.message || fallback

// Ngừng hoạt động hoặc kích hoạt lại lớp; không có thao tác xóa lớp.
function ClassStatusDialog({ open, item, onClose, onDone }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const submitLock = useRef(false)
  const deactivate = item?.status === "ACTIVE"
  const teacher = item?.homeroomTeacher || null

  useEffect(() => {
    if (open) setError("")
  }, [open])

  const submit = async () => {
    if (submitLock.current || !item) return
    submitLock.current = true
    setSubmitting(true)
    setError("")
    try {
      await ClassService.changeClassStatus(item.id, deactivate ? "INACTIVE" : "ACTIVE")
      onDone(deactivate ? `Đã ngừng hoạt động lớp ${item.name}` : `Đã kích hoạt lại lớp ${item.name}`)
    } catch (failure) {
      setError(errorMessage(failure, "Không thể cập nhật trạng thái lớp. Vui lòng thử lại."))
    } finally {
      submitLock.current = false
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle className={styles.title}>
        {deactivate ? "Ngừng hoạt động lớp" : "Kích hoạt lại lớp"} {item?.name}
      </DialogTitle>
      <DialogContent className={styles.content}>
        {deactivate ? (
          <>
            <Typography>
              Lớp sẽ không nhận phân công GVCN và khai báo suất ăn mới. Dữ liệu suất ăn đã ghi vẫn được giữ để
              truy xuất.
            </Typography>
            {teacher && (
              <Alert severity="warning">
                GVCN hiện tại <strong>{teacher.fullName}</strong> sẽ bị gỡ khỏi lớp này.
              </Alert>
            )}
          </>
        ) : (
          <Typography>
            Lớp sẽ hoạt động trở lại. GVCN cũ không được gán lại tự động; hãy phân công GVCN sau khi kích hoạt.
          </Typography>
        )}
        {error && <Alert severity="error">{error}</Alert>}
      </DialogContent>
      <DialogActions className={styles.actions}>
        <Button color="inherit" onClick={onClose} disabled={submitting}>
          Hủy
        </Button>
        <Button
          variant="contained"
          color={deactivate ? "error" : "primary"}
          onClick={submit}
          disabled={submitting}
        >
          {submitting ? "Đang lưu..." : deactivate ? "Ngừng hoạt động" : "Kích hoạt lại"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

ClassStatusDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  item: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onDone: PropTypes.func.isRequired,
}

export default ClassStatusDialog
