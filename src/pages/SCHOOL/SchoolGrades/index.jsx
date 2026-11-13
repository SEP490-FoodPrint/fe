import React, { useEffect, useRef, useState } from "react"
import {
  Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField,
} from "@mui/material"
import { Link } from "react-router-dom"
import ROUTER from "src/router/ROUTER"
import SchoolGradeService from "src/services/SchoolGradeService"
import notice from "src/components/Notice"
import styles from "./SchoolGrades.module.scss"

export default function SchoolGrades() {
  const [items, setItems] = useState([])
  const [version, setVersion] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [dialog, setDialog] = useState(null)
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const busy = useRef(false)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError("")
    SchoolGradeService.list(controller.signal)
      .then(({ data }) => { if (!controller.signal.aborted) setItems(data) })
      .catch(failure => { if (!controller.signal.aborted) setError(failure.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [version])

  function open(mode, item) {
    setName(item?.name ?? "")
    setSaveError("")
    setDialog({ mode, item })
  }

  const deleting = dialog?.mode === "delete"
  const blocked = deleting && dialog.item.classCount > 0

  async function save(event) {
    event.preventDefault()
    if (busy.current || blocked || (!deleting && !name.trim())) return
    busy.current = true
    setSaving(true)
    setSaveError("")
    try {
      const data = { name: name.trim() }
      if (deleting) await SchoolGradeService.remove(dialog.item.id)
      else if (dialog.item) await SchoolGradeService.update(dialog.item.id, data)
      else await SchoolGradeService.create(data)
      setDialog(null)
      setVersion(value => value + 1)
      notice({ msg: deleting ? "Đã xóa khối học" : "Đã lưu khối học" })
    } catch (failure) {
      setSaveError(failure.message)
    } finally {
      busy.current = false
      setSaving(false)
    }
  }

  return (
    <section className={styles.page} aria-labelledby="school-grade-title">
      <header className={styles.header}>
        <h1 id="school-grade-title">Khối học</h1>
        <Button variant="contained" onClick={() => open("create")}>Thêm khối</Button>
      </header>
      {loading && <LinearProgress aria-label="Đang tải khối học" />}
      {error && <Alert severity="error" action={<Button color="inherit" onClick={() => setVersion(value => value + 1)}>Thử lại</Button>}>{error}</Alert>}
      {!loading && !error && (
        <TableContainer component={Paper} variant="outlined">
          <Table aria-label="Danh sách khối học">
            <TableHead><TableRow><TableCell>Tên khối</TableCell><TableCell align="right">Số lớp</TableCell><TableCell align="right">Thao tác</TableCell></TableRow></TableHead>
            <TableBody>
              {items.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell><TableCell align="right">{item.classCount}</TableCell>
                  <TableCell align="right">
                    <div className={styles.actions}>
                      <Button aria-label={`Sửa ${item.name}`} onClick={() => open("edit", item)}>Sửa</Button>
                      <Button color="error" aria-label={`Xóa ${item.name}`} onClick={() => open("delete", item)}>Xóa</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!items.length && <TableRow><TableCell colSpan={3}>Chưa có khối học.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {dialog && (
        <Dialog open onClose={saving ? undefined : () => setDialog(null)} fullWidth maxWidth="xs" aria-labelledby="grade-dialog-title">
          <form onSubmit={save}>
            <DialogTitle id="grade-dialog-title">{deleting ? "Xóa khối học" : dialog.item ? "Sửa khối học" : "Thêm khối học"}</DialogTitle>
            <DialogContent dividers className={styles.form}>
              {saveError && <Alert severity="error">{saveError}</Alert>}
              {deleting ? (
                blocked ? <Alert severity="warning">
                  Khối này còn {dialog.item.classCount} lớp liên kết. Hãy chuyển hoặc bỏ gán khối trong{" "}
                  <Link to={`${ROUTER.SCHOOL_CLASS_ASSIGNMENT}?gradeId=${dialog.item.id}`}>Lớp học &amp; GVCN</Link>.
                </Alert> : <p>Bạn muốn xóa khối <strong>{dialog.item.name}</strong>?</p>
              ) : (
                <TextField required label="Tên khối" value={name} disabled={saving} onChange={event => setName(event.target.value)} slotProps={{ htmlInput: { maxLength: 120 } }} />
              )}
            </DialogContent>
            <DialogActions>
              <Button disabled={saving} onClick={() => setDialog(null)}>{blocked ? "Đóng" : "Hủy"}</Button>
              {!blocked && <Button type="submit" variant="contained" color={deleting ? "error" : "primary"} disabled={saving}>{deleting ? "Xóa khối" : "Lưu"}</Button>}
            </DialogActions>
          </form>
        </Dialog>
      )}
    </section>
  )
}
