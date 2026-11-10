import React, { useCallback, useEffect, useMemo, useState } from "react"
import FoodPrintLoading from "src/components/FoodPrintLoading"
import {
  Alert, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, MenuItem, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField,
} from "@mui/material"
import dayjs from "dayjs"
import { CheckCircle2, ClipboardList, Save } from "lucide-react"
import { useSearchParams } from "react-router-dom"
import notice from "src/components/Notice"
import MealPortionService from "src/services/MealPortionService"
import "./style.scss"

const errorMessage = (failure, fallback) => failure?.response?.data?.message || fallback
const statusLabel = status => (status === "FINALIZED" ? "Đã chốt" : "Bản nháp")
const mealLabel = mealType => (mealType === "AFTERNOON" ? "Bữa phụ" : "Bữa trưa")

function DailyMealConfirm() {
  const [searchParams] = useSearchParams()
  const initialMealType = searchParams.get("mealType") === "AFTERNOON" ? "AFTERNOON" : "LUNCH"
  const initialDate = /^\d{4}-\d{2}-\d{2}$/.test(searchParams.get("date") || "")
    ? searchParams.get("date") : dayjs().format("YYYY-MM-DD")
  const [date, setDate] = useState(initialDate)
  const [mealType, setMealType] = useState(initialMealType)
  const [context, setContext] = useState(null)
  const [history, setHistory] = useState([])
  const [totalPortions, setTotalPortions] = useState("")
  const [allergyNotes, setAllergyNotes] = useState("")
  const [allergyCounts, setAllergyCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const [contextResponse, historyResponse] = await Promise.all([
        MealPortionService.getMyClassMeal({ date, mealType }),
        MealPortionService.getHistory({ page: 1, limit: 20 }),
      ])
      const next = contextResponse.data
      const submission = next.submission
      setContext(next)
      setHistory(historyResponse.data.items || [])
      setTotalPortions(submission ? String(submission.totalPortions) : "")
      setAllergyNotes(submission?.allergyNotes || "")
      setAllergyCounts(Object.fromEntries(
        (submission?.dailyAllergyPortions || []).map(item => [item.ingredientEntryId, item.portionCount]),
      ))
    } catch (failure) {
      setContext(null)
      setHistory([])
      setError(errorMessage(failure, "Không thể tải thông tin suất ăn của lớp."))
    } finally {
      setLoading(false)
    }
  }, [date, mealType])

  useEffect(() => { load() }, [load])

  const submission = context?.submission
  const finalized = submission?.status === "FINALIZED"
  const allergies = context?.class?.classAllergies || []
  const payload = useMemo(() => ({
    date,
    mealType,
    totalPortions: Number(totalPortions),
    allergyNotes: allergyNotes || null,
    allergies: allergies.map(item => ({
      ingredientEntryId: item.ingredientEntryId,
      portionCount: Number(allergyCounts[item.ingredientEntryId] || 0),
    })),
  }), [allergies, allergyCounts, allergyNotes, date, mealType, totalPortions])

  const valid = totalPortions !== ""
    && Number.isInteger(Number(totalPortions))
    && Number(totalPortions) >= 0
    && Number(totalPortions) <= (context?.class?.registeredMealPortions ?? -1)
    && allergies.every(item => {
      const count = Number(allergyCounts[item.ingredientEntryId] || 0)
      return Number.isInteger(count) && count >= 0
        && count <= item.affectedCount && count <= Number(totalPortions)
    })

  const submit = async shouldFinalize => {
    if (!valid || saving || finalized) return
    setSaving(true)
    try {
      const saved = await MealPortionService.saveDraft(payload)
      if (shouldFinalize) await MealPortionService.finalize(saved.data.id)
      notice({ msg: shouldFinalize ? "Đã chốt số suất ăn của lớp" : "Đã lưu bản nháp" })
      await load()
    } catch (failure) {
      notice({ msg: errorMessage(failure, "Không thể lưu số suất ăn."), isSuccess: false })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="daily-meal-page">
      <header className="daily-meal-page__header">
        <div>
          <nav className="daily-meal-page__breadcrumb" aria-label="Đường dẫn trang">
            <span>Giáo viên chủ nhiệm</span><span>/</span><strong>Suất ăn hằng ngày</strong>
          </nav>
          <h1>Chốt số suất ăn của lớp</h1>
          <p>Khai báo tổng số suất và nhu cầu tránh nguyên liệu theo dữ liệu dị ứng của lớp.</p>
        </div>
        <div className="daily-meal-page__filters">
          <TextField size="small" type="date" label="Ngày dùng bữa" value={date}
            onChange={event => setDate(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
          <TextField select size="small" label="Ca ăn" value={mealType}
            onChange={event => setMealType(event.target.value)}>
            <MenuItem value="LUNCH">Bữa trưa</MenuItem>
            <MenuItem value="AFTERNOON">Bữa phụ</MenuItem>
          </TextField>
        </div>
      </header>

      {loading && <div style={{ padding: "48px 0", display: "flex", justifyContent: "center" }}><FoodPrintLoading size="medium" /></div>}
      {!loading && error && <Alert severity="warning">{error}</Alert>}
      {!loading && context && <>
        <Paper variant="outlined" className="daily-meal-page__summary">
          <div><span>Lớp được phân công</span><strong>{context.class.name}</strong><small>Niên khóa {context.class.academicYear}</small></div>
          <div><span>Số suất đăng ký</span><strong>{context.class.registeredMealPortions}</strong><small>Giới hạn tối đa trong ngày</small></div>
          <div><span>Trạng thái</span><Chip size="small" color={finalized ? "success" : "warning"}
            label={submission ? statusLabel(submission.status) : "Chưa khai báo"} /></div>
        </Paper>

        <Paper variant="outlined" className="daily-meal-page__form">
          <div className="daily-meal-page__section-title"><ClipboardList size={20} /><div>
            <h2>Số suất {mealLabel(mealType).toLowerCase()}</h2><p>Được phép sửa khi còn là bản nháp.</p>
          </div></div>
          {finalized && <Alert severity="success">Số suất ngày này đã được chốt và giữ nguyên để bếp lập kế hoạch.</Alert>}
          <TextField fullWidth type="number" label="Tổng số suất" value={totalPortions}
            disabled={finalized || saving} onChange={event => setTotalPortions(event.target.value)}
            inputProps={{ min: 0, max: context.class.registeredMealPortions, step: 1 }}
            helperText={`Tối đa ${context.class.registeredMealPortions} suất đã đăng ký`} />

          <div className="daily-meal-page__allergies">
            <div><h3>Suất cần tránh nguyên liệu</h3><p>Chỉ hiển thị dữ liệu dị ứng tổng hợp đã lưu cho lớp.</p></div>
            {!allergies.length && <Alert severity="info">Lớp chưa có thông tin dị ứng tổng hợp.</Alert>}
            {allergies.map(item => <div className="daily-meal-page__allergy-row" key={item.ingredientEntryId}>
              <div><strong>{item.IngredientEntry.Ingredient.name}</strong><span>Tối đa {item.affectedCount} suất theo hồ sơ lớp</span></div>
              <TextField size="small" type="number" label="Số suất"
                value={allergyCounts[item.ingredientEntryId] ?? ""} disabled={finalized || saving}
                onChange={event => setAllergyCounts(current => ({ ...current, [item.ingredientEntryId]: event.target.value }))}
                inputProps={{ min: 0, max: item.affectedCount, step: 1 }} />
            </div>)}
          </div>
          <TextField fullWidth multiline minRows={2} label="Ghi chú chung (không bắt buộc)"
            value={allergyNotes} disabled={finalized || saving}
            onChange={event => setAllergyNotes(event.target.value)} inputProps={{ maxLength: 1000 }} />
          {!finalized && <div className="daily-meal-page__actions">
            <Button variant="outlined" startIcon={<Save size={18} />} disabled={!valid || saving}
              onClick={() => submit(false)}>Lưu nháp</Button>
            <Button variant="contained" startIcon={<CheckCircle2 size={18} />} disabled={!valid || saving}
              onClick={() => setConfirmOpen(true)}>{saving ? "Đang xử lý..." : "Chốt số suất"}</Button>
          </div>}
        </Paper>

        <section className="daily-meal-page__history">
          <div><h2>Lịch sử khai báo gần đây</h2><p>Dữ liệu của lớp đang được phân công, lấy trực tiếp từ hệ thống.</p></div>
          <TableContainer component={Paper} variant="outlined"><Table size="small">
            <TableHead><TableRow><TableCell>Ngày</TableCell><TableCell>Ca ăn</TableCell><TableCell>Lớp</TableCell><TableCell align="right">Số suất</TableCell><TableCell>Trạng thái</TableCell></TableRow></TableHead>
            <TableBody>
              {history.map(item => <TableRow key={item.id}>
                <TableCell>{dayjs(item.mealDate).format("DD/MM/YYYY")}</TableCell><TableCell>{mealLabel(item.mealType)}</TableCell>
                <TableCell>{item.Class?.name || context.class.name}</TableCell><TableCell align="right">{item.totalPortions}</TableCell>
                <TableCell><Chip size="small" color={item.status === "FINALIZED" ? "success" : "warning"} label={statusLabel(item.status)} /></TableCell>
              </TableRow>)}
              {!history.length && <TableRow><TableCell colSpan={5} align="center">Chưa có lịch sử khai báo.</TableCell></TableRow>}
            </TableBody>
          </Table></TableContainer>
        </section>
        <Dialog open={confirmOpen} onClose={() => !saving && setConfirmOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Chốt số suất ăn?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Sau khi chốt, số suất ngày {dayjs(date).format("DD/MM/YYYY")} sẽ được giữ nguyên để bếp lập kế hoạch và không thể sửa trực tiếp.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button disabled={saving} onClick={() => setConfirmOpen(false)}>Quay lại</Button>
            <Button variant="contained" disabled={saving} onClick={async () => {
              setConfirmOpen(false)
              await submit(true)
            }}>Xác nhận chốt</Button>
          </DialogActions>
        </Dialog>
      </>}
    </div>
  )
}

export default DailyMealConfirm
