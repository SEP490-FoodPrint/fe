import React, { useState } from "react"
import AddRoundedIcon from "@mui/icons-material/AddRounded"
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined"
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip } from "@mui/material"
import PropTypes from "prop-types"
import styles from "./HolidayEditor.module.scss"

const blank = { date: "", reason: "" }
const displayDate = value => value ? value.split("-").reverse().join("/") : "—"

function HolidayEditor({ holidays, startDate, endDate, disabled, onChange }) {
  const [dialog, setDialog] = useState(null)
  const [draft, setDraft] = useState(blank)
  const openCreate = () => { setDraft(blank); setDialog({ index: -1 }) }
  const openEdit = index => { setDraft(holidays[index]); setDialog({ index }) }
  const duplicate = holidays.some((item, index) => item.date === draft.date && index !== dialog?.index)
  const dateInvalid = Boolean(draft.date && startDate && endDate && (draft.date < startDate || draft.date > endDate))
  const valid = draft.date && draft.reason.trim() && !duplicate && !dateInvalid
  const save = () => {
    if (!valid) return
    const next = [...holidays]
    const value = { date: draft.date, reason: draft.reason.trim() }
    if (dialog.index < 0) next.push(value); else next[dialog.index] = value
    next.sort((a, b) => a.date.localeCompare(b.date)); onChange(next); setDialog(null)
  }
  const remove = index => onChange(holidays.filter((_, itemIndex) => itemIndex !== index))

  return <section className={styles.section}>
    <div className={styles.heading}><div><h2>Danh sách ngày nghỉ</h2><p>Ngày nghỉ chỉ là dữ liệu lịch chung, chưa tự động thay đổi thực đơn hoặc vận hành bếp.</p></div>
      <Button variant="outlined" startIcon={<AddRoundedIcon />} disabled={disabled || !startDate || !endDate} onClick={openCreate}>Thêm ngày nghỉ</Button></div>
    {!holidays.length ? <div className={styles.empty}><EventBusyOutlinedIcon /><div><strong>Chưa có ngày nghỉ</strong><p>Thêm các ngày nghỉ riêng của trường nếu cần.</p></div></div> : <>
      <TableContainer className={styles.table}><Table size="small"><TableHead><TableRow><TableCell>Ngày nghỉ</TableCell><TableCell>Lý do</TableCell><TableCell align="right">Thao tác</TableCell></TableRow></TableHead>
        <TableBody>{holidays.map((holiday, index) => <TableRow key={holiday.date}><TableCell className={styles.date}>{displayDate(holiday.date)}</TableCell><TableCell>{holiday.reason}</TableCell><TableCell align="right">
          <Tooltip title="Sửa ngày nghỉ"><IconButton size="small" disabled={disabled} onClick={() => openEdit(index)}><EditOutlinedIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Xóa khỏi bản nháp"><IconButton size="small" color="error" disabled={disabled} onClick={() => remove(index)}><DeleteOutlineRoundedIcon fontSize="small" /></IconButton></Tooltip>
        </TableCell></TableRow>)}</TableBody></Table></TableContainer>
      <div className={styles.cards}>{holidays.map((holiday, index) => <article key={holiday.date}><div><strong>{displayDate(holiday.date)}</strong><p>{holiday.reason}</p></div><div>
        <IconButton aria-label="Sửa ngày nghỉ" disabled={disabled} onClick={() => openEdit(index)}><EditOutlinedIcon /></IconButton><IconButton aria-label="Xóa khỏi bản nháp" color="error" disabled={disabled} onClick={() => remove(index)}><DeleteOutlineRoundedIcon /></IconButton></div></article>)}</div>
    </>}
    <Dialog open={Boolean(dialog)} onClose={() => !disabled && setDialog(null)} fullWidth maxWidth="xs"><DialogTitle>{dialog?.index < 0 ? "Thêm ngày nghỉ" : "Sửa ngày nghỉ"}</DialogTitle><DialogContent className={styles.dialogContent}>
      <TextField fullWidth type="date" label="Ngày nghỉ" value={draft.date} disabled={disabled} inputProps={{ min: startDate, max: endDate }} slotProps={{ inputLabel: { shrink: true } }} error={duplicate || dateInvalid}
        helperText={duplicate ? "Ngày này đã có trong danh sách." : dateInvalid ? "Ngày nghỉ phải nằm trong khoảng niên khóa." : " "} onChange={event => setDraft(current => ({ ...current, date: event.target.value }))} />
      <TextField fullWidth multiline minRows={3} label="Lý do" value={draft.reason} disabled={disabled} inputProps={{ maxLength: 255 }} onChange={event => setDraft(current => ({ ...current, reason: event.target.value }))} />
    </DialogContent><DialogActions><Button disabled={disabled} onClick={() => setDialog(null)}>Hủy</Button><Button variant="contained" disabled={disabled || !valid} onClick={save}>Lưu ngày nghỉ</Button></DialogActions></Dialog>
  </section>
}

HolidayEditor.propTypes = { holidays: PropTypes.arrayOf(PropTypes.shape({ date: PropTypes.string.isRequired, reason: PropTypes.string.isRequired })).isRequired, startDate: PropTypes.string.isRequired, endDate: PropTypes.string.isRequired, disabled: PropTypes.bool.isRequired, onChange: PropTypes.func.isRequired }
export default HolidayEditor
