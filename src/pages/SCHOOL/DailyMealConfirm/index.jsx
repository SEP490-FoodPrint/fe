import React, { useCallback, useEffect, useMemo, useState } from "react"
import FoodPrintLoading from "src/components/FoodPrintLoading"
import {
  Alert,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  TextField,
} from "@mui/material"
import dayjs from "dayjs"
import { CheckCircle2, Clock, MessageSquarePlus, Send, Users } from "lucide-react"
import notice from "src/components/Notice"
import MealPortionService from "src/services/MealPortionService"
import PortionStepper from "./component/PortionStepper"
import RecentDays from "./component/RecentDays"
import "./style.scss"

const MEALS = [
  { type: "LUNCH", label: "Bữa trưa" },
  { type: "AFTERNOON", label: "Bữa xế" },
]
const WEEKDAYS = ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"]
// Theo quyết định nghiệp vụ: số suất khoá lúc 8:30, sau đó điều chỉnh qua BGH.
const DEADLINE = { hour: 8, minute: 30 }

const errorMessage = (failure, fallback) => failure?.response?.data?.message || fallback
const labelOf = type => MEALS.find(meal => meal.type === type)?.label || type
const joinMeals = types => types.map(type => labelOf(type).toLowerCase()).join(" và ")

function deadlineState(now) {
  const deadline = now.hour(DEADLINE.hour).minute(DEADLINE.minute).second(0)
  const minutes = deadline.diff(now, "minute")
  if (minutes < 0) return { tone: "late", text: "Đã quá giờ chốt 8:30" }
  if (minutes <= 60) return { tone: "soon", text: `Hạn gửi 8:30 · còn ${minutes} phút` }
  return { tone: "normal", text: "Hạn gửi bếp trước 8:30" }
}

/**
 * GVCN báo số suất ăn hôm nay cho bếp: điền sẵn sĩ số đăng ký, chỉnh số em vắng bằng −/+,
 * tích bữa cần báo rồi bấm một nút "Gửi bếp". Gửi xong thì chỉ xem, cần sửa thì báo BGH.
 */
function DailyMealConfirm() {
  const today = useMemo(() => dayjs().format("YYYY-MM-DD"), [])
  const isWeekend = [0, 6].includes(dayjs(today).day())

  const [contexts, setContexts] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [portions, setPortions] = useState("")
  const [selected, setSelected] = useState({ LUNCH: true, AFTERNOON: true })
  const [allergyCounts, setAllergyCounts] = useState({})
  const [notes, setNotes] = useState("")
  const [showNotes, setShowNotes] = useState(false)
  const [sending, setSending] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [sendErrors, setSendErrors] = useState([])
  const [now, setNow] = useState(() => dayjs())

  useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 30000)
    return () => clearInterval(timer)
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const historyRequest = MealPortionService.getHistory({ page: 1, limit: 100 })
      if (isWeekend) {
        setHistory((await historyRequest).data.items || [])
        setContexts(null)
        return
      }
      const [lunch, afternoon, historyResponse] = await Promise.all([
        ...MEALS.map(meal => MealPortionService.getMyClassMeal({ date: today, mealType: meal.type })),
        historyRequest,
      ])
      const next = { LUNCH: lunch.data, AFTERNOON: afternoon.data }
      setContexts(next)
      setHistory(historyResponse.data.items || [])

      const open = MEALS.map(meal => meal.type).filter(type => next[type].submission?.status !== "FINALIZED")
      setSelected(Object.fromEntries(MEALS.map(meal => [meal.type, open.includes(meal.type)])))
      // Điền sẵn: bản nháp đang dở, nếu không có thì sĩ số đăng ký (giả định đủ lớp).
      const draft = open.map(type => next[type].submission).find(Boolean)
      const registered = Number(next.LUNCH.class.registeredMealPortions || 0)
      setPortions(draft ? draft.totalPortions : registered)
      setNotes(draft?.allergyNotes || "")
      setShowNotes(Boolean(draft?.allergyNotes))
      setAllergyCounts(Object.fromEntries(
        (draft?.dailyAllergyPortions || []).map(item => [item.ingredientEntryId, item.portionCount]),
      ))
    } catch (failure) {
      setContexts(null)
      setError(errorMessage(failure, "Không thể tải thông tin lớp. Vui lòng thử lại."))
    } finally {
      setLoading(false)
    }
  }, [isWeekend, today])

  useEffect(() => { load() }, [load])

  const klass = contexts?.LUNCH?.class
  const registered = Number(klass?.registeredMealPortions || 0)
  const allergies = klass?.classAllergies || []
  const submissions = Object.fromEntries(MEALS.map(meal => [meal.type, contexts?.[meal.type]?.submission || null]))
  const sentMeals = MEALS.filter(meal => submissions[meal.type]?.status === "FINALIZED")
  const openMeals = MEALS.filter(meal => submissions[meal.type]?.status !== "FINALIZED")
  const chosen = openMeals.map(meal => meal.type).filter(type => selected[type])
  const portionCount = portions === "" ? null : Number(portions)
  const absent = portionCount === null ? null : registered - portionCount
  const allergyValid = allergies.every(item => Number(allergyCounts[item.ingredientEntryId] || 0) <= (portionCount ?? 0))
  const canSend = chosen.length > 0 && portionCount !== null && allergyValid && !sending
  const deadline = deadlineState(now)

  const send = async () => {
    setConfirmOpen(false)
    setSending(true)
    setSendErrors([])
    const payload = {
      date: today,
      totalPortions: portionCount,
      allergyNotes: notes.trim() || null,
      allergies: allergies.map(item => ({
        ingredientEntryId: item.ingredientEntryId,
        portionCount: Number(allergyCounts[item.ingredientEntryId] || 0),
      })),
    }
    const done = []
    const failed = []
    for (const type of chosen) {
      try {
        const saved = await MealPortionService.saveDraft({ ...payload, mealType: type })
        await MealPortionService.finalize(saved.data.id)
        done.push(type)
      } catch (failure) {
        failed.push({ type, message: errorMessage(failure, "Không gửi được, vui lòng thử lại.") })
      }
    }
    if (done.length) notice({ msg: `Đã gửi bếp ${portionCount} suất ${joinMeals(done)}` })
    setSendErrors(failed)
    setSending(false)
    await load()
  }

  const header = (
    <header className="meal-report__header">
      <div>
        <h1>Báo suất ăn hôm nay</h1>
        <p>
          {klass && <><Users size={16} aria-hidden /> <strong>{klass.name}</strong> · </>}
          {WEEKDAYS[dayjs(today).day()]}, {dayjs(today).format("DD/MM/YYYY")}
        </p>
      </div>
      {contexts && openMeals.length > 0 && (
        <span className={`meal-report__deadline meal-report__deadline--${deadline.tone}`}>
          <Clock size={16} aria-hidden /> {deadline.text}
        </span>
      )}
    </header>
  )

  return (
    <div className="meal-report">
      {header}

      {loading && <div className="meal-report__loading" role="status"><FoodPrintLoading size="medium" /></div>}

      {!loading && error && (
        <Alert severity="warning" action={<Button color="inherit" onClick={load}>Thử lại</Button>}>{error}</Alert>
      )}

      {!loading && isWeekend && (
        <div className="meal-report__card meal-report__rest">Hôm nay là cuối tuần, lớp không có bữa bán trú.</div>
      )}

      {!loading && contexts && (
        <>
          {sendErrors.length > 0 && (
            <Alert severity="error">
              {sendErrors.map(item => <div key={item.type}><strong>{labelOf(item.type)}:</strong> {item.message}</div>)}
            </Alert>
          )}

          {sentMeals.length > 0 && (
            <section className="meal-report__card meal-report__sent" aria-label="Đã gửi bếp">
              <div className="meal-report__sent-head">
                <CheckCircle2 size={22} aria-hidden />
                <strong>{openMeals.length ? "Đã gửi bếp" : "Đã gửi bếp cả hai bữa"}</strong>
              </div>
              <ul>
                {sentMeals.map(meal => {
                  const item = submissions[meal.type]
                  const allergyTotal = (item.dailyAllergyPortions || []).reduce((sum, row) => sum + row.portionCount, 0)
                  return (
                    <li key={meal.type}>
                      <span>{meal.label}</span>
                      <b>{item.totalPortions} suất</b>
                      <small>
                        {item.finalizedAt ? `lúc ${dayjs(item.finalizedAt).format("HH:mm")}` : ""}
                        {allergyTotal ? ` · ${allergyTotal} suất tránh dị ứng` : ""}
                      </small>
                    </li>
                  )
                })}
              </ul>
              {!openMeals.length && (
                <p className="meal-report__hint">Cần thay đổi sau khi đã gửi? Vui lòng báo Ban giám hiệu để điều chỉnh với bếp.</p>
              )}
            </section>
          )}

          {openMeals.length > 0 && (
            <section className="meal-report__card" aria-busy={sending}>
              <fieldset className="meal-report__meals">
                <legend>Báo cho bữa</legend>
                {openMeals.map(meal => (
                  <FormControlLabel
                    key={meal.type}
                    className={`meal-report__meal ${selected[meal.type] ? "meal-report__meal--on" : ""}`}
                    control={(
                      <Checkbox
                        checked={selected[meal.type]}
                        disabled={sending}
                        onChange={event => setSelected(current => ({ ...current, [meal.type]: event.target.checked }))}
                      />
                    )}
                    label={(
                      <span>
                        {meal.label}
                        {submissions[meal.type] && <small>Có bản nháp {submissions[meal.type].totalPortions} suất</small>}
                      </span>
                    )}
                  />
                ))}
              </fieldset>

              <div className="meal-report__portions">
                <span className="meal-report__label">Số suất ăn mỗi bữa</span>
                <PortionStepper
                  size="lg"
                  label="số suất ăn"
                  value={portions}
                  max={registered}
                  disabled={sending}
                  onChange={setPortions}
                />
                <p className="meal-report__absent">
                  Đăng ký {registered} suất
                  {absent !== null && (absent > 0 ? <> · <b>vắng {absent}</b></> : " · đủ sĩ số")}
                </p>
              </div>

              {allergies.length > 0 && (
                <div className="meal-report__allergies">
                  <span className="meal-report__label">Suất tránh nguyên liệu dị ứng</span>
                  {allergies.map(item => (
                    <div key={item.ingredientEntryId} className="meal-report__allergy">
                      <span>
                        <strong>{item.IngredientEntry?.Ingredient?.name}</strong>
                        <small>Lớp có {item.affectedCount} em</small>
                      </span>
                      <PortionStepper
                        label={`suất tránh ${item.IngredientEntry?.Ingredient?.name || "nguyên liệu"}`}
                        value={allergyCounts[item.ingredientEntryId] ?? 0}
                        max={Math.min(item.affectedCount, portionCount ?? 0)}
                        disabled={sending}
                        onChange={value => setAllergyCounts(current => ({ ...current, [item.ingredientEntryId]: value }))}
                      />
                    </div>
                  ))}
                </div>
              )}

              {showNotes ? (
                <TextField
                  multiline
                  minRows={2}
                  size="small"
                  label="Ghi chú cho bếp"
                  value={notes}
                  disabled={sending}
                  onChange={event => setNotes(event.target.value)}
                  inputProps={{ maxLength: 1000 }}
                />
              ) : (
                <Button
                  className="meal-report__add-note"
                  size="small"
                  startIcon={<MessageSquarePlus size={16} aria-hidden />}
                  onClick={() => setShowNotes(true)}
                >
                  Thêm ghi chú cho bếp
                </Button>
              )}

              <div className="meal-report__actions">
                <Button
                  fullWidth
                  size="large"
                  variant="contained"
                  disabled={!canSend}
                  onClick={() => setConfirmOpen(true)}
                  startIcon={sending ? <CircularProgress size={18} color="inherit" /> : <Send size={18} aria-hidden />}
                >
                  {sending
                    ? "Đang gửi…"
                    : chosen.length
                      ? `Gửi bếp ${portionCount ?? 0} suất · ${chosen.map(labelOf).join(" + ")}`
                      : "Chọn bữa cần báo"}
                </Button>
              </div>
            </section>
          )}
        </>
      )}

      {!loading && <RecentDays items={history} today={today} />}

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Gửi số suất cho bếp?</DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            <p className="meal-report__confirm-number">{portionCount} suất</p>
            <p>cho {joinMeals(chosen)} hôm nay{absent > 0 ? ` (vắng ${absent} em)` : ""}.</p>
            <p>Sau khi gửi sẽ không tự sửa được, cần thay đổi thì báo Ban giám hiệu.</p>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Kiểm tra lại</Button>
          <Button variant="contained" onClick={send} startIcon={<Send size={16} aria-hidden />}>Gửi bếp</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default DailyMealConfirm
