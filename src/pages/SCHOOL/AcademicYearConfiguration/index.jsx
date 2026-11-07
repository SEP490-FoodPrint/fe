import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Skeleton, TextField } from "@mui/material"
import notice from "src/components/Notice"
import AcademicYearService from "src/services/AcademicYearService"
import AcademicYearList from "./component/AcademicYearList"
import HolidayEditor from "./component/HolidayEditor"
import "./style.scss"

const emptyForm = { academicYear: "", startDate: "", endDate: "", holidays: [] }
const errorMessage = (failure, fallback) => failure?.response?.data?.message || fallback
const normalize = value => ({ academicYear: value?.academicYear || "", startDate: value?.startDate || "", endDate: value?.endDate || "", holidays: value?.holidays || [] })

function AcademicYearConfiguration() {
  const [years, setYears] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [saved, setSaved] = useState(emptyForm)
  const [form, setForm] = useState(emptyForm)
  const [creating, setCreating] = useState(false)
  const [loadingList, setLoadingList] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [pendingAction, setPendingAction] = useState(null)
  const savingRef = useRef(false)

  const changed = useMemo(() => JSON.stringify(form) !== JSON.stringify(saved), [form, saved])
  const duplicateLabel = creating && years.some(year => year.academicYear.trim().toLowerCase() === form.academicYear.trim().toLowerCase())
  const dateRangeInvalid = Boolean(form.startDate && form.endDate && form.startDate > form.endDate)
  const holidayRangeInvalid = form.holidays.some(holiday => holiday.date < form.startDate || holiday.date > form.endDate)
  const valid = form.academicYear.trim() && form.startDate && form.endDate && !dateRangeInvalid && !holidayRangeInvalid && !duplicateLabel

  const loadDetail = useCallback(async id => {
    setLoadingDetail(true); setError("")
    try {
      const response = await AcademicYearService.get(id)
      const value = normalize(response.data)
      setSelectedId(id); setCreating(false); setSaved(value); setForm(value)
    } catch (failure) { setError(errorMessage(failure, "Không thể tải cấu hình niên khóa.")) }
    finally { setLoadingDetail(false) }
  }, [])

  const loadList = useCallback(async preferredId => {
    setLoadingList(true); setError("")
    try {
      const response = await AcademicYearService.list()
      const items = response.data || []
      setYears(items)
      const nextId = preferredId || items[0]?.id
      if (nextId) await loadDetail(nextId)
      else { setCreating(true); setSelectedId(null); setSaved(emptyForm); setForm(emptyForm) }
    } catch (failure) { setError(errorMessage(failure, "Không thể tải danh sách niên khóa.")) }
    finally { setLoadingList(false) }
  }, [loadDetail])

  useEffect(() => { void loadList() }, [loadList])
  useEffect(() => {
    const warn = event => { if (changed) { event.preventDefault(); event.returnValue = "" } }
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [changed])

  const startCreate = () => { setSelectedId(null); setCreating(true); setSaved(emptyForm); setForm(emptyForm); setError("") }
  const requestAction = action => { if (changed) setPendingAction(() => action); else action() }
  const cancelChanges = () => { if (creating) { if (years[0]) void loadDetail(years[0].id); else startCreate() } else setForm(saved) }

  const save = async () => {
    if (!valid || !changed || savingRef.current) return
    savingRef.current = true; setSaving(true)
    try {
      const payload = { startDate: form.startDate, endDate: form.endDate, holidays: form.holidays }
      const response = creating ? await AcademicYearService.create({ academicYear: form.academicYear.trim(), ...payload }) : await AcademicYearService.update(selectedId, payload)
      notice({ msg: creating ? "Đã thêm niên khóa" : "Đã lưu cấu hình niên khóa" })
      const value = normalize(response.data)
      setSaved(value); setForm(value); setSelectedId(response.data.id); setCreating(false)
      await loadList(response.data.id)
    } catch (failure) { notice({ msg: errorMessage(failure, "Không thể lưu cấu hình niên khóa."), isSuccess: false }) }
    finally { savingRef.current = false; setSaving(false) }
  }

  return <div className="academic-year-page">
    <nav className="academic-year-page__breadcrumb" aria-label="Đường dẫn trang"><span>Ban Giám hiệu</span><span>/</span><strong>Thiết lập niên khóa</strong></nav>
    {error && <Alert severity="error" action={<Button color="inherit" onClick={() => loadList(selectedId)}>Thử lại</Button>}>{error}</Alert>}
    <main className="academic-year-page__workspace">
      <AcademicYearList years={years} selectedId={selectedId} loading={loadingList} onCreate={() => requestAction(startCreate)} onSelect={id => requestAction(() => loadDetail(id))} />
      <section className="academic-year-page__form" aria-busy={loadingDetail || saving}>
        {loadingDetail ? <><Skeleton width="45%" height={38} /><Skeleton variant="rounded" height={230} /><Skeleton variant="rounded" height={180} /></> : <>
          <div className="academic-year-page__form-heading"><div><h2>{creating ? "Thêm niên khóa" : `Niên khóa ${form.academicYear}`}</h2><p>{creating ? "Khai báo lịch học chung mới cho toàn trường." : "Cập nhật khoảng thời gian và ngày nghỉ. Tên niên khóa được giữ nguyên để bảo toàn lịch sử."}</p></div>{!creating && <span>Đã lưu</span>}</div>
          <div className="academic-year-page__fields">
            <TextField fullWidth label="Niên khóa" value={form.academicYear} disabled={!creating || saving} error={duplicateLabel} helperText={duplicateLabel ? "Niên khóa này đã tồn tại." : creating ? "Không bắt buộc theo một định dạng cố định." : "Tên niên khóa không thể đổi sau khi tạo."} inputProps={{ maxLength: 30 }} onChange={event => setForm(current => ({ ...current, academicYear: event.target.value }))} />
            <TextField fullWidth type="date" label="Ngày bắt đầu" value={form.startDate} disabled={saving} slotProps={{ inputLabel: { shrink: true } }} onChange={event => setForm(current => ({ ...current, startDate: event.target.value }))} />
            <TextField fullWidth type="date" label="Ngày kết thúc" value={form.endDate} disabled={saving} error={dateRangeInvalid} helperText={dateRangeInvalid ? "Ngày kết thúc phải bằng hoặc sau ngày bắt đầu." : " "} slotProps={{ inputLabel: { shrink: true } }} onChange={event => setForm(current => ({ ...current, endDate: event.target.value }))} />
          </div>
          {holidayRangeInvalid && <Alert severity="warning">Có ngày nghỉ nằm ngoài khoảng niên khóa mới. Hãy sửa hoặc xóa ngày đó trước khi lưu.</Alert>}
          <HolidayEditor holidays={form.holidays} startDate={form.startDate} endDate={form.endDate} disabled={saving} onChange={holidays => setForm(current => ({ ...current, holidays }))} />
          <div className="academic-year-page__actions"><p>{changed ? "Bạn có thay đổi chưa lưu." : "Dữ liệu đang hiển thị đã được lưu."}</p><div>
            <Button disabled={saving || !changed} onClick={() => requestAction(cancelChanges)}>Hủy thay đổi</Button>
            <Button variant="contained" disabled={saving || !changed || !valid} onClick={save}>{saving ? <><CircularProgress size={18} color="inherit" /> Đang lưu</> : "Lưu cấu hình"}</Button>
          </div></div>
        </>}
      </section>
    </main>
    <Dialog open={Boolean(pendingAction)} onClose={() => setPendingAction(null)} maxWidth="xs" fullWidth><DialogTitle>Bỏ thay đổi chưa lưu?</DialogTitle><DialogContent><DialogContentText>Các thay đổi trong biểu mẫu hiện tại sẽ không được lưu lại.</DialogContentText></DialogContent><DialogActions><Button onClick={() => setPendingAction(null)}>Tiếp tục chỉnh sửa</Button><Button color="error" onClick={() => { const action = pendingAction; setPendingAction(null); action?.() }}>Bỏ thay đổi</Button></DialogActions></Dialog>
  </div>
}

export default AcademicYearConfiguration
