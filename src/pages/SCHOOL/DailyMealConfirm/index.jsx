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
import { CheckCircle2, MessageSquarePlus, Send, Users } from "lucide-react"
import notice from "src/components/Notice"
import MealPortionService from "src/services/MealPortionService"
import PortionStepper from "./component/PortionStepper"
import RecentDays from "./component/RecentDays"
import { allergyGroupLabel, groupAllergyRows, totalAllergyCount } from "src/utils/allergyGroups"
import "./style.scss"

const MEALS = [
  { type: "LUNCH", label: "Bữa trưa" },
  { type: "AFTERNOON", label: "Bữa xế" },
]
const WEEKDAYS = ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"]

const errorMessage = (failure, fallback) => failure?.response?.data?.message || fallback
const labelOf = type => MEALS.find(meal => meal.type === type)?.label || type
const joinMeals = types => types.map(type => labelOf(type).toLowerCase()).join(" và ")

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
  // Số suất hôm nay của từng nhóm dị ứng của lớp: { [groupNo]: "" | số } (0 khi các em trong nhóm nghỉ)
  const [allergyCounts, setAllergyCounts] = useState({})
  const [notes, setNotes] = useState("")
  const [showNotes, setShowNotes] = useState(false)
  const [sending, setSending] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [sendErrors, setSendErrors] = useState([])

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
      // Bản nháp không ghi dòng 0 suất: nhóm không có dòng nào trong bản nháp nghĩa là đã nhập 0.
      const savedGroups = groupAllergyRows(draft?.dailyAllergyPortions || [], "portionCount")
      const draftAllergy = savedGroups.reduce((sum, group) => sum + group.count, 0)
      const classGroups = groupAllergyRows(next.LUNCH.class.classAllergies || [])
      // Ô chính là suất thường: tổng của bản nháp trừ phần suất dị ứng; chưa có nháp thì đủ suất thường
      // (sĩ số đăng ký trừ tổng số em dị ứng của lớp, các em này không ăn suất thường).
      const classAllergyStudents = classGroups.reduce((sum, group) => sum + group.count, 0)
      setPortions(draft
        ? Math.max(0, draft.totalPortions - draftAllergy)
        : Math.max(0, registered - classAllergyStudents))
      setNotes(draft?.allergyNotes || "")
      setShowNotes(Boolean(draft?.allergyNotes))
      setAllergyCounts(Object.fromEntries(classGroups.map(group => [
        group.groupNo,
        draft ? (savedGroups.find(saved => saved.groupNo === group.groupNo)?.count ?? 0) : "",
      ])))
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
  // Nhóm dị ứng của lớp: ví dụ "Sữa": 1, "Lạc": 1, "Sữa + Lạc": 1 -> 3 em dị ứng
  const allergyGroups = groupAllergyRows(allergies)
  const allergyStudents = totalAllergyCount(allergies)
  // Suất dị ứng hôm nay = tổng các nhóm (nhóm chưa nhập tính 0)
  const allergyPortions = allergyGroups.reduce((sum, group) => sum + (Number(allergyCounts[group.groupNo]) || 0), 0)
  // Ô chính là suất thường: tối đa = sĩ số đăng ký bán trú − tổng số em dị ứng của lớp
  // (em dị ứng đi học thì ăn suất dị ứng, nghỉ thì không ăn; không bao giờ tính vào suất thường)
  const regularMax = Math.max(0, registered - allergyStudents)
  const regularCount = portions === "" ? null : Number(portions)
  // Tổng gửi bếp = suất thường + suất dị ứng
  const portionCount = regularCount === null ? null : regularCount + allergyPortions
  const absent = portionCount === null ? null : registered - portionCount
  // Bắt buộc nhập số suất của mọi nhóm dị ứng (kể cả 0), mỗi nhóm không vượt số em của nhóm
  const allergyValid = allergyGroups.every(group => {
    const value = allergyCounts[group.groupNo]
    return value !== "" && value !== undefined && Number(value) >= 0 && Number(value) <= group.count
  })
  const canSend = chosen.length > 0 && portionCount !== null && allergyValid && !sending

  // Suất thường không được vượt mức tối đa
  useEffect(() => {
    if (portions !== "" && Number(portions) > regularMax) setPortions(regularMax)
  }, [portions, regularMax])

  const send = async () => {
    setConfirmOpen(false)
    setSending(true)
    setSendErrors([])
    const payload = {
      date: today,
      totalPortions: portionCount,
      allergyNotes: notes.trim() || null,
      allergies: allergyGroups.map(group => ({
        groupNo: group.groupNo,
        portionCount: Number(allergyCounts[group.groupNo] || 0),
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
                  const allergyTotal = totalAllergyCount(item.dailyAllergyPortions || [], "portionCount")
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
                <span className="meal-report__label">
                  {allergies.length > 0 ? "Suất thường mỗi bữa (không dị ứng)" : "Số suất ăn mỗi bữa"}
                </span>
                <PortionStepper
                  size="lg"
                  label="số suất thường"
                  value={portions}
                  max={regularMax}
                  disabled={sending}
                  onChange={setPortions}
                />
                <p className="meal-report__absent">
                  Đăng ký {registered} suất
                  {allergyStudents > 0 && <> · tối đa {regularMax} suất thường (trừ {allergyStudents} em dị ứng)</>}
                  {absent !== null && (absent > 0 ? <> · <b>vắng {absent}</b></> : " · đủ sĩ số")}
                </p>
              </div>

              {allergyGroups.length > 0 && (
                <div className="meal-report__allergies">
                  <span className="meal-report__label">Suất tránh dị ứng theo nhóm</span>
                  <small className="meal-report__allergy-hint">
                    Lớp có {allergyStudents} em dị ứng · nhập số em có mặt của từng nhóm (0 nếu cả nhóm nghỉ)
                  </small>
                  {allergyGroups.map(group => (
                    <div className="meal-report__allergy" key={group.groupNo}>
                      <span>
                        <strong>{allergyGroupLabel(group)}</strong>
                        <small>Nhóm {group.groupNo} · {group.count} em</small>
                      </span>
                      <PortionStepper
                        label={`số suất tránh ${allergyGroupLabel(group)}`}
                        value={allergyCounts[group.groupNo] ?? ""}
                        max={group.count}
                        disabled={sending}
                        onChange={value => setAllergyCounts(current => ({ ...current, [group.groupNo]: value }))}
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
            {allergyPortions > 0 && (
              <p>gồm {regularCount} suất thường + {allergyPortions} suất tránh dị ứng</p>
            )}
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
