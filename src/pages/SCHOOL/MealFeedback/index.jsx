import React, { useCallback, useContext, useEffect, useState } from "react"
import { Alert, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Pagination, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material"
import dayjs from "dayjs"
import { ChevronRight, MessageSquareText, Search } from "lucide-react"
import FoodPrintLoading from "src/components/FoodPrintLoading"
import notice from "src/components/Notice"
import { StoreContext } from "src/contexts"
import { ROLES } from "src/constants/roles"
import ComplaintService from "src/services/ComplaintService"
import "./style.scss"

const typeLabels = { MEAL_QUALITY: "Chất lượng bữa ăn", FOOD_HYGIENE: "Vệ sinh thực phẩm", HEALTH_ISSUE: "Vấn đề sức khỏe", OTHER: "Khác" }
const statusMeta = { SUBMITTED: ["Mới gửi", "warning"], IN_REVIEW: ["Đang xử lý", "info"], RESOLVED: ["Đã giải quyết", "success"], CLOSED: ["Đã đóng", "default"] }
const mealLabels = { LUNCH: "Bữa trưa", AFTERNOON: "Bữa phụ" }
const errorText = (error, fallback) => error?.response?.data?.message || error?.message || fallback
function StatusChip({ value }) { const [label, color] = statusMeta[value] || [value, "default"]; return <Chip size="small" color={color} label={label} /> }

function MealFeedback() {
  const { userStore } = useContext(StoreContext)
  const role = userStore?.user?.role
  const isBoard = role === ROLES.SCHOOL_MANAGEMENT_BOARD
  const [rows, setRows] = useState([]); const [pagination, setPagination] = useState({ page: 1, hasNext: false })
  const [filters, setFilters] = useState({ status: "", complaintType: "", search: "" })
  const [loading, setLoading] = useState(true); const [error, setError] = useState("")
  const [selected, setSelected] = useState(null); const [detailLoading, setDetailLoading] = useState(false)
  const [resolution, setResolution] = useState(""); const [saving, setSaving] = useState(false)
  const load = useCallback(async (page = pagination.page) => { setLoading(true); setError(""); try { const activeFilters = Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== "")); const response = await ComplaintService.list({ page, limit: 10, ...activeFilters }); setRows(response.data.items || []); setPagination(response.data.pagination) } catch (failure) { setRows([]); setError(errorText(failure, "Không thể tải danh sách khiếu nại.")) } finally { setLoading(false) } }, [filters, pagination.page])
  useEffect(() => { load(1) }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const openDetail = async id => { setSelected({ id }); setDetailLoading(true); try { setSelected((await ComplaintService.detail(id)).data) } catch (failure) { setSelected(null); notice({ msg: errorText(failure, "Không thể tải chi tiết."), isSuccess: false }) } finally { setDetailLoading(false) } }
  const act = async (action, text) => { if (!selected || saving) return; setSaving(true); try { const response = await ComplaintService.respond(selected.id, { action, ...(action === "RESOLVE" ? { resolution: text } : {}) }); setSelected(response.data); setResolution(""); notice({ msg: action === "RESOLVE" ? "Đã gửi kết quả xử lý" : "Đã tiếp nhận khiếu nại" }); await load() } catch (failure) { notice({ msg: errorText(failure, "Không thể cập nhật khiếu nại."), isSuccess: false }) } finally { setSaving(false) } }
  return <main className="complaints-page">
    <header className="complaints-page__header"><div><h1>Quản lý khiếu nại bữa ăn</h1><p>Tiếp nhận và phản hồi khiếu nại từ giáo viên chủ nhiệm và đại diện phụ huynh.</p></div></header>
    <Paper variant="outlined" className="complaints-page__filters">
      <TextField size="small" placeholder="Tìm nội dung, người gửi hoặc lớp" value={filters.search} onChange={event => setFilters(current => ({ ...current, search: event.target.value }))} onKeyDown={event => event.key === "Enter" && load(1)} InputProps={{ startAdornment: <Search size={18} /> }} />
      <TextField select size="small" label="Trạng thái" value={filters.status} onChange={event => setFilters(current => ({ ...current, status: event.target.value }))}><MenuItem value="">Tất cả</MenuItem>{Object.entries(statusMeta).map(([value, meta]) => <MenuItem key={value} value={value}>{meta[0]}</MenuItem>)}</TextField>
      <TextField select size="small" label="Loại khiếu nại" value={filters.complaintType} onChange={event => setFilters(current => ({ ...current, complaintType: event.target.value }))}><MenuItem value="">Tất cả</MenuItem>{Object.entries(typeLabels).map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}</TextField>
      <Button variant="outlined" onClick={() => load(1)}>Tìm kiếm</Button>
    </Paper>
    {loading && <div className="complaints-page__loading" role="status" aria-live="polite"><FoodPrintLoading size="medium" /></div>}
    {!loading && error && <Alert severity="error" action={<Button color="inherit" onClick={() => load()}>Thử lại</Button>}>{error}</Alert>}
    {!loading && !error && !rows.length && <Paper variant="outlined" className="complaints-page__empty"><MessageSquareText size={36} /><h2>Chưa có khiếu nại</h2><p>Hiện chưa có phản ánh cần theo dõi.</p></Paper>}
    {!loading && !error && rows.length > 0 && <><TableContainer component={Paper} variant="outlined" className="complaints-page__table"><Table><TableHead><TableRow><TableCell>Suất ăn</TableCell><TableCell>Loại</TableCell>{isBoard && <TableCell>Người gửi</TableCell>}<TableCell>Ngày gửi</TableCell><TableCell>Trạng thái</TableCell><TableCell /></TableRow></TableHead><TableBody>{rows.map(row => <TableRow key={row.id} hover><TableCell><strong>{row.meal.className}</strong><small>{dayjs(row.meal.mealDate).format("DD/MM/YYYY")} · {mealLabels[row.meal.mealType]}</small></TableCell><TableCell>{typeLabels[row.complaintType]}</TableCell>{isBoard && <TableCell>{row.submitter.fullName}</TableCell>}<TableCell>{dayjs(row.submittedAt).format("DD/MM/YYYY HH:mm")}</TableCell><TableCell><StatusChip value={row.status} /></TableCell><TableCell align="right"><Button onClick={() => openDetail(row.id)} endIcon={<ChevronRight size={16} />}>Xem</Button></TableCell></TableRow>)}</TableBody></Table></TableContainer>
      <div className="complaints-page__cards">{rows.map(row => <button key={row.id} onClick={() => openDetail(row.id)}><span><strong>{row.meal.className}</strong><small>{dayjs(row.meal.mealDate).format("DD/MM/YYYY")} · {mealLabels[row.meal.mealType]}</small></span><span><StatusChip value={row.status} /><ChevronRight size={18} /></span><em>{typeLabels[row.complaintType]}</em></button>)}</div>
      <Pagination page={pagination.page} count={pagination.hasNext ? pagination.page + 1 : pagination.page} onChange={(_, page) => load(page)} /></>}
    <ComplaintDetail open={Boolean(selected)} loading={detailLoading} item={selected} isBoard={isBoard} saving={saving} resolution={resolution} setResolution={setResolution} onClose={() => { setSelected(null); setResolution("") }} onAct={act} />
  </main>
}

function ComplaintDetail({ open, loading, item, isBoard, saving, resolution, setResolution, onClose, onAct }) {
  const actions = item?.allowedActions || []
  return <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="md"><DialogTitle>Chi tiết khiếu nại</DialogTitle><DialogContent dividers>{loading || !item?.meal ? <div className="complaints-page__dialog-loading"><FoodPrintLoading size="small" /></div> : <div className="complaint-detail"><div className="complaint-detail__top"><div><h2>{typeLabels[item.complaintType]}</h2><p>Mã {item.id}</p></div><StatusChip value={item.status} /></div><dl><div><dt>Lớp</dt><dd>{item.meal.className}</dd></div><div><dt>Suất ăn</dt><dd>{dayjs(item.meal.mealDate).format("DD/MM/YYYY")} · {mealLabels[item.meal.mealType]}</dd></div><div><dt>Người gửi</dt><dd>{item.submitter.fullName}</dd></div><div><dt>Thời gian gửi</dt><dd>{dayjs(item.submittedAt).format("DD/MM/YYYY HH:mm")}</dd></div></dl><section><h3>Nội dung phản ánh</h3><p>{item.description}</p></section>{item.resolution && <section className="complaint-detail__resolution"><h3>Kết quả xử lý</h3><p>{item.resolution}</p><small>{item.handler?.fullName}{item.resolvedAt ? ` · ${dayjs(item.resolvedAt).format("DD/MM/YYYY HH:mm")}` : ""}</small></section>}{isBoard && actions.includes("RESOLVE") && <TextField fullWidth multiline minRows={4} label="Kết quả xử lý" value={resolution} onChange={event => setResolution(event.target.value)} inputProps={{ maxLength: 2000 }} helperText={`${resolution.length}/2000 ký tự`} />}</div>}</DialogContent><DialogActions><Button onClick={onClose} disabled={saving}>Đóng</Button>{actions.includes("START_REVIEW") && <Button variant="outlined" disabled={saving} onClick={() => onAct("START_REVIEW")}>Tiếp nhận</Button>}{actions.includes("RESOLVE") && <Button variant="contained" disabled={saving || resolution.trim().length < 10} onClick={() => onAct("RESOLVE", resolution.trim())}>Gửi kết quả</Button>}</DialogActions></Dialog>
}

export default MealFeedback
