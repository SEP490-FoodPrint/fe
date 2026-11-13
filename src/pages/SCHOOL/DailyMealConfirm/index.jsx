import React, { useCallback, useEffect, useMemo, useState } from "react"
import FoodPrintLoading from "src/components/FoodPrintLoading"
import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material"
import dayjs from "dayjs"
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Edit3,
  Eye,
  RotateCcw,
  Save,
  Utensils,
} from "lucide-react"
import { useSearchParams } from "react-router-dom"
import notice from "src/components/Notice"
import MealPortionService from "src/services/MealPortionService"
import { getSchoolWeekScheduleFromDate } from "src/services/MenuService/adapter"
import "./style.scss"

const errorMessage = (failure, fallback) => failure?.response?.data?.message || fallback
const statusLabel = status => (status === "FINALIZED" ? "Đã chốt" : "Bản nháp")
const mealLabel = mealType => (mealType === "AFTERNOON" ? "Bữa xế" : "Bữa trưa")
const statusTone = status => {
  if (!status) return "neutral"
  return status === "FINALIZED" ? "success" : "warning"
}

const VN_WEEKDAYS = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"]
const formatVNDate = dateStr => {
  const d = dayjs(dateStr)
  if (!d.isValid()) return ""
  return `${VN_WEEKDAYS[d.day()]}, ${d.format("DD/MM/YYYY")}`
}

const StatusChip = ({ status }) => (
  <Chip
    size="small"
    label={status ? statusLabel(status) : "Chưa khai báo"}
    className={`daily-meal-status-chip daily-meal-status-chip--${statusTone(status)}`}
  />
)

const getInitialDate = param => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(param || "")) return param
  const today = dayjs()
  const dow = today.day()
  if (dow === 0 || dow === 6) {
    const sched = getSchoolWeekScheduleFromDate(today.toDate())
    return sched.schoolDays[0]?.dateISO || today.format("YYYY-MM-DD")
  }
  return today.format("YYYY-MM-DD")
}

function DailyMealConfirm() {
  const [searchParams] = useSearchParams()
  const initialMealType = searchParams.get("mealType") === "AFTERNOON" ? "AFTERNOON" : "LUNCH"
  const [date, setDate] = useState(() => getInitialDate(searchParams.get("date")))
  const [mealType, setMealType] = useState(initialMealType)
  const [historyMealFilter, setHistoryMealFilter] = useState("ALL")
  const [context, setContext] = useState(null)
  const [history, setHistory] = useState([])
  const [totalPortions, setTotalPortions] = useState("")
  const [allergyNotes, setAllergyNotes] = useState("")
  const [allergyCounts, setAllergyCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)

  const weekSchedule = useMemo(() => getSchoolWeekScheduleFromDate(date), [date])

  const isCurrentWeekSelected = useMemo(() => {
    const nowSched = getSchoolWeekScheduleFromDate(new Date())
    return nowSched.weekNumber === weekSchedule.weekNumber
  }, [weekSchedule.weekNumber])

  const handlePrevWeek = () => {
    setDate(curr => dayjs(curr).subtract(1, "week").format("YYYY-MM-DD"))
  }

  const handleNextWeek = () => {
    setDate(curr => dayjs(curr).add(1, "week").format("YYYY-MM-DD"))
  }

  const handleCurrentWeek = () => {
    const today = dayjs()
    const dow = today.day()
    if (dow === 0 || dow === 6) {
      const sched = getSchoolWeekScheduleFromDate(today.toDate())
      setDate(sched.schoolDays[0].dateISO)
    } else {
      setDate(today.format("YYYY-MM-DD"))
    }
  }

  const load = useCallback(async () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return
    setLoading(true)
    setError("")
    try {
      const [contextResponse, historyResponse] = await Promise.all([
        MealPortionService.getMyClassMeal({ date, mealType }),
        MealPortionService.getHistory({ page: 1, limit: 100 }),
      ])
      const next = contextResponse.data
      const sub = next.submission
      setContext(next)
      setHistory(historyResponse.data.items || [])
      setTotalPortions(sub ? String(sub.totalPortions) : "")
      setAllergyNotes(sub?.allergyNotes || "")
      setAllergyCounts(
        Object.fromEntries(
          (sub?.dailyAllergyPortions || []).map(item => [item.ingredientEntryId, item.portionCount]),
        ),
      )
    } catch (failure) {
      setContext(null)
      setHistory([])
      setError(errorMessage(failure, "Không thể tải thông tin suất ăn của lớp."))
    } finally {
      setLoading(false)
    }
  }, [date, mealType])

  useEffect(() => {
    load()
  }, [load])

  const submission = context?.submission
  const finalized = submission?.status === "FINALIZED"
  const allergies = context?.class?.classAllergies || []

  const payload = useMemo(
    () => ({
      date,
      mealType,
      totalPortions: Number(totalPortions),
      allergyNotes: allergyNotes || null,
      allergies: allergies.map(item => ({
        ingredientEntryId: item.ingredientEntryId,
        portionCount: Number(allergyCounts[item.ingredientEntryId] || 0),
      })),
    }),
    [allergies, allergyCounts, allergyNotes, date, mealType, totalPortions],
  )

  const valid =
    totalPortions !== "" &&
    Number.isInteger(Number(totalPortions)) &&
    Number(totalPortions) >= 0 &&
    allergies.every(item => {
      const count = Number(allergyCounts[item.ingredientEntryId] || 0)
      return (
        Number.isInteger(count) &&
        count >= 0 &&
        count <= item.affectedCount &&
        count <= Number(totalPortions)
      )
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

  const selectedMondayISO = weekSchedule.schoolDays[0]?.dateISO

  const filteredHistoryItems = useMemo(() => {
    if (!history || !history.length || !selectedMondayISO) return []
    return history
      .filter(item => {
        const itemSched = getSchoolWeekScheduleFromDate(item.mealDate)
        const itemMonday = itemSched.schoolDays[0]?.dateISO
        if (itemMonday !== selectedMondayISO) return false
        if (historyMealFilter === "LUNCH") return item.mealType === "LUNCH"
        if (historyMealFilter === "AFTERNOON") return item.mealType === "AFTERNOON"
        return true
      })
      .sort((a, b) => {
        const dateComp = dayjs(b.mealDate).diff(dayjs(a.mealDate))
        if (dateComp !== 0) return dateComp
        return a.mealType === "LUNCH" ? -1 : 1
      })
  }, [history, selectedMondayISO, historyMealFilter])

  const weekHistoryStats = useMemo(() => {
    const totalPortions = filteredHistoryItems.reduce(
      (sum, it) => sum + Number(it.totalPortions || 0),
      0,
    )
    const finalizedCount = filteredHistoryItems.filter(it => it.status === "FINALIZED").length
    return {
      totalPortions,
      finalizedCount,
      count: filteredHistoryItems.length,
    }
  }, [filteredHistoryItems])

  const handleSelectHistoryItem = item => {
    const itemDate = dayjs(item.mealDate).format("YYYY-MM-DD")
    setDate(itemDate)
    setMealType(item.mealType)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="daily-meal-page">
      {/* 1. HÀNG TIÊU ĐỀ & THANH ĐIỀU HƯỚNG ĐỒNG BỘ CHUẨN FOODPRINT */}
      <div className="daily-meal-header">
        <h1 className="daily-meal-header__title">Chốt số suất ăn của lớp</h1>

        <div className="daily-meal-header__controls">
          {/* Cụm điều hướng tuần gộp chuẩn KitchenMenu: [<] Tuần W (DD/MM - DD/MM) [>] */}
          <div className="daily-meal-week-box">
            <button
              type="button"
              className="daily-meal-week-box__arrow"
              onClick={handlePrevWeek}
              title="Tuần trước"
              aria-label="Tuần trước"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="daily-meal-week-box__label">
              <CalendarDays size={14} className="daily-meal-week-box__icon" />
              <span>{weekSchedule.weekRangeLabel}</span>
            </div>

            <button
              type="button"
              className="daily-meal-week-box__arrow"
              onClick={handleNextWeek}
              title="Tuần sau"
              aria-label="Tuần sau"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Nút Tuần này */}
          <button
            type="button"
            className={`daily-meal-current-week-btn ${isCurrentWeekSelected ? "daily-meal-current-week-btn--active" : ""}`}
            onClick={handleCurrentWeek}
            title="Nhảy nhanh về tuần hiện tại"
          >
            <RotateCcw size={13} />
            <span>Tuần này</span>
          </button>

          {/* Bộ lọc ca ăn chuẩn Segmented Control */}
          <div className="daily-meal-shift-segment" role="group" aria-label="Chọn ca ăn">
            <button
              type="button"
              className={`daily-meal-shift-segment__btn ${mealType === "LUNCH" ? "daily-meal-shift-segment__btn--lunch-active" : ""}`}
              onClick={() => setMealType("LUNCH")}
            >
              Bữa trưa
            </button>
            <button
              type="button"
              className={`daily-meal-shift-segment__btn ${mealType === "AFTERNOON" ? "daily-meal-shift-segment__btn--afternoon-active" : ""}`}
              onClick={() => setMealType("AFTERNOON")}
            >
              Bữa xế
            </button>
          </div>
        </div>
      </div>

      {/* 2. DẢI 5 NGÀY HỌC TRONG TUẦN (THỨ HAI -> THỨ SÁU) CHUẨN GRID FOODPRINT */}
      <div className="daily-meal-day-strip">
        {weekSchedule.schoolDays.map(day => {
          const isSelected = day.dateISO === date
          const isToday = day.dateISO === dayjs().format("YYYY-MM-DD")

          return (
            <button
              type="button"
              key={day.dateISO}
              className={`daily-meal-day-pill ${isSelected ? "daily-meal-day-pill--active" : ""} ${isToday ? "daily-meal-day-pill--today" : ""}`}
              onClick={() => setDate(day.dateISO)}
            >
              <div className="daily-meal-day-pill__top">
                <span className="daily-meal-day-pill__name">{day.dayIndexLabel}</span>
                {isToday && <span className="daily-meal-day-pill__today-pill">Hôm nay</span>}
              </div>
              <span className="daily-meal-day-pill__date">{day.dateVN?.slice(0, 5)}</span>
            </button>
          )
        })}
      </div>

      {loading && (
        <div className="daily-meal-loading" role="status" aria-live="polite">
          <FoodPrintLoading size="medium" />
        </div>
      )}

      {!loading && error && (
        <Alert severity="warning" action={<Button color="inherit" onClick={load}>Thử lại</Button>}>
          {error}
        </Alert>
      )}

      {!loading && context && (
        <>
          {/* 3. CARD KHAI BÁO SUẤT ĂN */}
          <Paper variant="outlined" className="daily-meal-card" aria-busy={saving}>
            <div className="daily-meal-card__header">
              <div className="daily-meal-card__info">
                <ClipboardList size={18} className="daily-meal-card__icon" />
                <div className="daily-meal-card__title-group">
                  <h2>{context.class.name}</h2>
                  <span className="daily-meal-card__subtitle">
                    {mealLabel(mealType)} · {formatVNDate(date)}
                  </span>
                </div>
              </div>
              <StatusChip status={submission?.status} />
            </div>

            {finalized && (
              <Alert severity="success">
                Số suất ngày này đã được chốt và giữ nguyên để bếp lập kế hoạch.
              </Alert>
            )}

            <div className="daily-meal-card__body">
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Tổng số suất"
                placeholder="Nhập tổng số suất ăn..."
                value={totalPortions}
                disabled={finalized || saving}
                onChange={event => setTotalPortions(event.target.value)}
                inputProps={{ min: 0, step: 1, inputMode: "numeric" }}
              />

              <div className="daily-meal-card__allergies">
                <h3>Suất cần tránh nguyên liệu</h3>
                {!allergies.length && (
                  <Alert severity="info">Lớp chưa có thông tin dị ứng tổng hợp.</Alert>
                )}
                {allergies.map(item => (
                  <div className="daily-meal-allergy-row" key={item.ingredientEntryId}>
                    <div>
                      <strong>{item.IngredientEntry.Ingredient.name}</strong>
                      <span>Tối đa {item.affectedCount} suất theo hồ sơ lớp</span>
                    </div>
                    <TextField
                      size="small"
                      type="number"
                      label="Số suất"
                      value={allergyCounts[item.ingredientEntryId] ?? ""}
                      disabled={finalized || saving}
                      onChange={event =>
                        setAllergyCounts(current => ({
                          ...current,
                          [item.ingredientEntryId]: event.target.value,
                        }))
                      }
                      inputProps={{ min: 0, max: item.affectedCount, step: 1, inputMode: "numeric" }}
                    />
                  </div>
                ))}
              </div>

              <TextField
                fullWidth
                multiline
                size="small"
                minRows={2}
                label="Ghi chú (không bắt buộc)"
                value={allergyNotes}
                disabled={finalized || saving}
                placeholder="Ghi chú cho bếp nếu có yêu cầu đặc biệt..."
                onChange={event => setAllergyNotes(event.target.value)}
                inputProps={{ maxLength: 1000 }}
              />
            </div>

            {!finalized && (
              <div className="daily-meal-card__actions">
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Save size={16} />}
                  disabled={!valid || saving}
                  onClick={() => submit(false)}
                  className="daily-meal-btn"
                >
                  Lưu nháp
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<CheckCircle2 size={16} />}
                  disabled={!valid || saving}
                  onClick={() => setConfirmOpen(true)}
                  className="daily-meal-btn daily-meal-btn--primary"
                >
                  {saving ? "Đang xử lý..." : "Chốt số suất"}
                </Button>
              </div>
            )}
          </Paper>

          {/* 4. LỊCH SỬ KHAI BÁO THEO TUẦN ĐANG CHỌN */}
          <section className="daily-meal-history">
            <div className="daily-meal-history__header">
              <div className="daily-meal-history__title-group">
                <h2>Lịch sử khai báo ({weekSchedule.weekRangeLabel})</h2>
                {filteredHistoryItems.length > 0 && (
                  <div className="daily-meal-history__stats">
                    <Chip
                      size="small"
                      icon={<Utensils size={13} />}
                      label={`Tổng ${weekHistoryStats.totalPortions} suất`}
                      variant="outlined"
                      className="daily-meal-stats-chip"
                    />
                    <Chip
                      size="small"
                      icon={<CheckCircle2 size={13} />}
                      label={`${weekHistoryStats.finalizedCount}/${weekHistoryStats.count} ca đã chốt`}
                      className="daily-meal-stats-chip daily-meal-stats-chip--success"
                    />
                  </div>
                )}
              </div>

              {/* Bộ lọc ca ăn cho lịch sử: Tất cả | Bữa trưa | Bữa xế */}
              <div className="daily-meal-shift-segment" role="group" aria-label="Lọc ca ăn lịch sử">
                <button
                  type="button"
                  className={`daily-meal-shift-segment__btn ${historyMealFilter === "ALL" ? "daily-meal-shift-segment__btn--neutral-active" : ""}`}
                  onClick={() => setHistoryMealFilter("ALL")}
                >
                  Tất cả ca
                </button>
                <button
                  type="button"
                  className={`daily-meal-shift-segment__btn ${historyMealFilter === "LUNCH" ? "daily-meal-shift-segment__btn--lunch-active" : ""}`}
                  onClick={() => setHistoryMealFilter("LUNCH")}
                >
                  Bữa trưa
                </button>
                <button
                  type="button"
                  className={`daily-meal-shift-segment__btn ${historyMealFilter === "AFTERNOON" ? "daily-meal-shift-segment__btn--afternoon-active" : ""}`}
                  onClick={() => setHistoryMealFilter("AFTERNOON")}
                >
                  Bữa xế
                </button>
              </div>
            </div>

            <div className="daily-meal-history__list">
              {filteredHistoryItems.length > 0 ? (
                <Paper variant="outlined" className="daily-meal-week-card">
                  {/* DESKTOP TABLE */}
                  <div className="daily-meal-history-desktop">
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Ngày</TableCell>
                            <TableCell>Ca ăn</TableCell>
                            <TableCell>Lớp</TableCell>
                            <TableCell align="right">Số suất</TableCell>
                            <TableCell>Trạng thái</TableCell>
                            <TableCell align="center">Thao tác</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredHistoryItems.map(item => (
                            <TableRow key={item.id} hover>
                              <TableCell>
                                <strong>{formatVNDate(item.mealDate)}</strong>
                              </TableCell>
                              <TableCell>{mealLabel(item.mealType)}</TableCell>
                              <TableCell>{item.Class?.name || context.class.name}</TableCell>
                              <TableCell align="right">
                                <strong>{item.totalPortions}</strong>
                              </TableCell>
                              <TableCell>
                                <StatusChip status={item.status} />
                              </TableCell>
                              <TableCell align="center">
                                <Button
                                  size="small"
                                  variant="text"
                                  startIcon={item.status === "FINALIZED" ? <Eye size={14} /> : <Edit3 size={14} />}
                                  onClick={() => handleSelectHistoryItem(item)}
                                >
                                  {item.status === "FINALIZED" ? "Xem" : "Sửa"}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </div>

                  {/* MOBILE CARD LIST */}
                  <div className="daily-meal-history-mobile">
                    {filteredHistoryItems.map(item => (
                      <div key={item.id} className="daily-meal-history-card-item">
                        <div className="daily-meal-history-card-item__row">
                          <span className="daily-meal-history-card-item__date">
                            {formatVNDate(item.mealDate)}
                          </span>
                          <span className="daily-meal-history-card-item__meal">
                            {mealLabel(item.mealType)}
                          </span>
                        </div>
                        <div className="daily-meal-history-card-item__row">
                          <div className="daily-meal-history-card-item__portions">
                            <strong>{item.totalPortions}</strong> suất
                          </div>
                          <div className="daily-meal-history-card-item__actions">
                            <StatusChip status={item.status} />
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleSelectHistoryItem(item)}
                              className="daily-meal-history-card-item__btn"
                            >
                              {item.status === "FINALIZED" ? "Xem" : "Sửa"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Paper>
              ) : (
                <Paper variant="outlined" className="daily-meal-empty-history">
                  Chưa có lịch sử khai báo nào trong tuần này{historyMealFilter !== "ALL" ? ` cho ${mealLabel(historyMealFilter).toLowerCase()}` : ""}.
                </Paper>
              )}
            </div>
          </section>

          <Dialog open={confirmOpen} onClose={() => !saving && setConfirmOpen(false)} maxWidth="xs" fullWidth>
            <DialogTitle>Chốt số suất ăn?</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Sau khi chốt, số suất ngày <strong>{formatVNDate(date)}</strong> ({mealLabel(mealType).toLowerCase()}) sẽ được giữ nguyên để bếp lập kế hoạch và không thể sửa trực tiếp.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button disabled={saving} onClick={() => setConfirmOpen(false)}>
                Quay lại
              </Button>
              <Button
                variant="contained"
                disabled={saving}
                onClick={async () => {
                  setConfirmOpen(false)
                  await submit(true)
                }}
              >
                Xác nhận chốt
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </div>
  )
}

export default DailyMealConfirm
