import React, { useEffect, useRef, useState } from "react"
import PropTypes from "prop-types"
import {
  Alert,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  LinearProgress,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material"
import { Download, FileSpreadsheet } from "lucide-react"
import ClassService from "src/services/ClassService"
import { ClassFileError, downloadClassTemplate, IMPORT_MAX_ROWS, readClassFile } from "../classExcel"
import styles from "./ImportClassesDialog.module.scss"

const errorMessage = (failure, fallback) => failure?.response?.data?.message || fallback

const STATUS = {
  CREATE: { label: "Sẽ tạo", color: "success" },
  SKIP: { label: "Bỏ qua", color: "default" },
  ERROR: { label: "Lỗi", color: "error" },
}

// Nhập lớp từ Excel: đọc file → backend kiểm tra (dryRun) → xem trước từng dòng → lưu tất cả hoặc không.
function ImportClassesDialog({ open, academicYear, writableYears, onClose, onDone }) {
  const [year, setYear] = useState("")
  const [file, setFile] = useState(null)
  const [rows, setRows] = useState(null)
  const [preview, setPreview] = useState(null)
  const [busy, setBusy] = useState("")
  const [error, setError] = useState("")
  const [onlyErrors, setOnlyErrors] = useState(false)
  const inputRef = useRef(null)
  const submitLock = useRef(false)

  useEffect(() => {
    if (!open) return
    setYear(writableYears.includes(academicYear) ? academicYear : writableYears[0] || "")
    setFile(null)
    setRows(null)
    setPreview(null)
    setError("")
    setOnlyErrors(false)
  }, [open, academicYear, writableYears])

  // Kiểm tra lại mỗi khi đổi file hoặc niên khóa; chưa lưu dữ liệu.
  useEffect(() => {
    if (!open || !rows || !year) return undefined
    let active = true
    setBusy("preview")
    setError("")
    ClassService.importClasses(year, rows, true)
      .then(response => {
        if (!active) return
        setPreview(response.data)
        setOnlyErrors(response.data.summary.error > 0)
      })
      .catch(failure => {
        if (!active) return
        setPreview(null)
        setError(errorMessage(failure, "Không thể kiểm tra file. Vui lòng thử lại."))
      })
      .finally(() => {
        if (active) setBusy("")
      })
    return () => {
      active = false
    }
  }, [open, rows, year])

  const downloadTemplate = async () => {
    setBusy("template")
    setError("")
    try {
      const response = await ClassService.getEligibleTeachers(year)
      const teachers = response.data.items.filter(teacher => !teacher.currentClass)
      await downloadClassTemplate({ academicYear: year, teachers })
    } catch (failure) {
      setError(errorMessage(failure, "Không thể tạo file mẫu. Vui lòng thử lại."))
    } finally {
      setBusy("")
    }
  }

  const chooseFile = async event => {
    const selected = event.target.files?.[0]
    event.target.value = ""
    if (!selected) return
    setFile(selected)
    setRows(null)
    setPreview(null)
    setError("")
    setBusy("read")
    try {
      setRows(await readClassFile(selected))
    } catch (failure) {
      setError(failure instanceof ClassFileError ? failure.message : "Không đọc được file Excel.")
    } finally {
      setBusy("")
    }
  }

  const summary = preview?.summary
  const canSubmit = Boolean(summary) && summary.error === 0 && summary.create > 0 && !busy

  const submit = async () => {
    if (submitLock.current || !canSubmit) return
    submitLock.current = true
    setBusy("submit")
    setError("")
    try {
      const response = await ClassService.importClasses(year, rows, false)
      onDone(response.data)
    } catch (failure) {
      setError(errorMessage(failure, "Không thể nhập lớp. Vui lòng thử lại."))
      // Dữ liệu có thể đã thay đổi từ lúc xem trước: kiểm tra lại để cập nhật bảng.
      setRows(current => (current ? [...current] : current))
    } finally {
      submitLock.current = false
      setBusy("")
    }
  }

  const visibleRows = (preview?.rows || []).filter(row => !onlyErrors || row.status === "ERROR")
  const closeDisabled = busy === "submit"

  return (
    <Dialog open={open} onClose={closeDisabled ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle className={styles.title}>Nhập lớp từ Excel</DialogTitle>
      <DialogContent className={styles.content}>
        <div className={styles.toolbar}>
          <TextField
            select
            size="small"
            label="Niên khóa"
            value={writableYears.includes(year) ? year : ""}
            onChange={event => setYear(event.target.value)}
            disabled={Boolean(busy)}
            className={styles.year}
          >
            {writableYears.map(item => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="outlined"
            startIcon={<Download size={18} />}
            onClick={downloadTemplate}
            disabled={!year || Boolean(busy)}
          >
            {busy === "template" ? "Đang tạo file mẫu..." : "Tải file mẫu"}
          </Button>
        </div>

        <button
          type="button"
          className={styles.dropzone}
          onClick={() => inputRef.current?.click()}
          disabled={!year || Boolean(busy)}
        >
          <FileSpreadsheet size={28} aria-hidden="true" />
          <span className={styles.dropzoneTitle}>{file ? file.name : "Chọn file Excel (.xlsx)"}</span>
          <span className={styles.dropzoneHint}>
            {file ? "Bấm để chọn file khác" : `Tối đa ${IMPORT_MAX_ROWS} lớp, dung lượng không quá 2MB`}
          </span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className={styles.fileInput}
          onChange={chooseFile}
          tabIndex={-1}
          aria-hidden="true"
        />

        {(busy === "read" || busy === "preview") && <LinearProgress />}
        {error && <Alert severity="error">{error}</Alert>}

        {summary && (
          <>
            <div className={styles.summary}>
              <Chip color="success" variant="outlined" label={`Sẽ tạo: ${summary.create}`} />
              <Chip variant="outlined" label={`Bỏ qua (đã có): ${summary.skip}`} />
              <Chip color="error" variant="outlined" label={`Lỗi: ${summary.error}`} />
              {summary.error > 0 && (
                <FormControlLabel
                  className={styles.filter}
                  control={
                    <Checkbox
                      size="small"
                      checked={onlyErrors}
                      onChange={event => setOnlyErrors(event.target.checked)}
                    />
                  }
                  label="Chỉ hiện dòng lỗi"
                />
              )}
            </div>
            {summary.error > 0 && (
              <Alert severity="warning">
                File còn {summary.error} dòng lỗi. Sửa các dòng này trong Excel rồi chọn lại file; hệ thống chỉ lưu
                khi không còn lỗi.
              </Alert>
            )}
            <TableContainer className={styles.tableWrap}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Dòng</TableCell>
                    <TableCell>Tên lớp</TableCell>
                    <TableCell>Số suất</TableCell>
                    <TableCell>GVCN</TableCell>
                    <TableCell>Kết quả</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibleRows.map(row => (
                    <TableRow key={row.rowNumber} className={row.status === "ERROR" ? styles.errorRow : undefined}>
                      <TableCell>{row.rowNumber}</TableCell>
                      <TableCell className={styles.name}>{row.name || "—"}</TableCell>
                      <TableCell>{row.registeredMealPortions ?? "—"}</TableCell>
                      <TableCell>{row.teacher ? row.teacher.fullName : "—"}</TableCell>
                      <TableCell>
                        <Chip size="small" color={STATUS[row.status].color} label={STATUS[row.status].label} />
                        {row.errors.map(message => (
                          <span key={message} className={styles.reason}>
                            {message}
                          </span>
                        ))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        <Typography className={styles.hint}>
          Lớp đã có trong niên khóa sẽ được bỏ qua, không bị ghi đè. Mọi lớp trong file được lưu cùng lúc; nếu có
          lỗi, không lớp nào được tạo.
        </Typography>
      </DialogContent>
      <DialogActions className={styles.actions}>
        <Button color="inherit" onClick={onClose} disabled={closeDisabled}>
          Hủy
        </Button>
        <Button variant="contained" onClick={submit} disabled={!canSubmit}>
          {busy === "submit" ? "Đang nhập..." : `Nhập ${summary?.create || 0} lớp`}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

ImportClassesDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  academicYear: PropTypes.string.isRequired,
  writableYears: PropTypes.arrayOf(PropTypes.string).isRequired,
  onClose: PropTypes.func.isRequired,
  onDone: PropTypes.func.isRequired,
}

export default ImportClassesDialog
