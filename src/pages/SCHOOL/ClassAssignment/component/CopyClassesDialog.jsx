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
import styles from "./CopyClassesDialog.module.scss"

const errorMessage = (failure, fallback) => failure?.response?.data?.message || fallback

// Niên khóa nguồn mặc định là năm gần nhất trước niên khóa đích.
const defaultSource = (years, target) =>
  years.filter(year => year < target).sort((a, b) => b.localeCompare(a))[0] ||
  years.find(year => year !== target) ||
  ""

// Sao chép tên lớp và số suất đăng ký của các lớp đang hoạt động; không sao chép GVCN.
function CopyClassesDialog({ open, years, targetYear, writableYears, onClose, onDone }) {
  const [fromYear, setFromYear] = useState("")
  const [toYear, setToYear] = useState("")
  const [preview, setPreview] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const submitLock = useRef(false)

  useEffect(() => {
    if (!open) return
    const target = writableYears.includes(targetYear) ? targetYear : writableYears[0] || ""
    setToYear(target)
    setFromYear(defaultSource(years, target))
    setError("")
  }, [open, years, targetYear, writableYears])

  useEffect(() => {
    if (!open || !fromYear) {
      setPreview(null)
      return undefined
    }
    let active = true
    setPreviewLoading(true)
    ClassService.getClasses({ academicYear: fromYear, limit: 100 })
      .then(response => {
        if (!active) return
        const names = response.data.items.filter(item => item.status === "ACTIVE").map(item => item.name)
        setPreview(names)
      })
      .catch(() => {
        if (active) setPreview(null)
      })
      .finally(() => {
        if (active) setPreviewLoading(false)
      })
    return () => {
      active = false
    }
  }, [open, fromYear])

  const sameYear = Boolean(fromYear) && fromYear === toYear
  const canSubmit = Boolean(fromYear && toYear) && !sameYear && !submitting && preview?.length !== 0

  const submit = async () => {
    if (submitLock.current || !canSubmit) return
    submitLock.current = true
    setSubmitting(true)
    setError("")
    try {
      const response = await ClassService.copyClasses(fromYear, toYear)
      onDone(response.data)
    } catch (failure) {
      setError(errorMessage(failure, "Không thể sao chép danh sách lớp. Vui lòng thử lại."))
    } finally {
      submitLock.current = false
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle className={styles.title}>Sao chép danh sách lớp</DialogTitle>
      <DialogContent className={styles.content}>
        <div className={styles.fields}>
          <TextField
            select
            fullWidth
            label="Từ niên khóa"
            value={years.includes(fromYear) ? fromYear : ""}
            onChange={event => setFromYear(event.target.value)}
            disabled={submitting}
          >
            {years.map(year => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            fullWidth
            label="Sang niên khóa"
            value={writableYears.includes(toYear) ? toYear : ""}
            onChange={event => setToYear(event.target.value)}
            error={sameYear}
            helperText={sameYear ? "Niên khóa đích phải khác niên khóa nguồn." : " "}
            disabled={submitting}
          >
            {writableYears.map(year => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </TextField>
        </div>

        {previewLoading ? (
          <Skeleton variant="rounded" height={56} />
        ) : preview && preview.length > 0 ? (
          <div className={styles.preview}>
            <Typography className={styles.previewTitle}>
              {preview.length} lớp đang hoạt động sẽ được sao chép
            </Typography>
            <Typography className={styles.previewNames}>{preview.join(", ")}</Typography>
          </div>
        ) : (
          preview && (
            <Alert severity="info">Niên khóa {fromYear} không có lớp đang hoạt động để sao chép.</Alert>
          )
        )}

        <Typography className={styles.hint}>
          Chỉ sao chép tên lớp và số suất đăng ký. GVCN và thông tin dị ứng không được sao chép; lớp đã có tên
          trùng ở niên khóa đích sẽ được bỏ qua.
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
      </DialogContent>
      <DialogActions className={styles.actions}>
        <Button color="inherit" onClick={onClose} disabled={submitting}>
          Hủy
        </Button>
        <Button variant="contained" onClick={submit} disabled={!canSubmit}>
          {submitting ? "Đang sao chép..." : "Sao chép"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

CopyClassesDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  years: PropTypes.arrayOf(PropTypes.string).isRequired,
  targetYear: PropTypes.string.isRequired,
  writableYears: PropTypes.arrayOf(PropTypes.string).isRequired,
  onClose: PropTypes.func.isRequired,
  onDone: PropTypes.func.isRequired,
}

export default CopyClassesDialog
