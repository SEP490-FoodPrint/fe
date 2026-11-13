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
  Coffee,
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

  // Gom nhóm lịch sử theo từng ngày trong tuần học
  const groupedHistoryByDay = useMemo(() => {
    if (!history || !history.length || !selectedMondayISO) return []

    const weekItems = history.filter(item => {
      const itemSched = getSchoolWeekScheduleFromDate(item.mealDate)
      const itemMonday = itemSched.schoolDays[0]?.dateISO
      if (itemMonday !== selectedMondayISO) return false
      if (historyMealFilter === "LUNCH") return item.mealType === "LUNCH"
      if (historyMealFilter === "AFTERNOON") return item.mealType === "AFTERNOON"
      return true
    })

    const map = new Map()
    for (const item of weekItems) {
      const d = dayjs(item.mealDate).format("YYYY-MM-DD")
      if (!map.has(d)) {
        map.set(d, {
          dateISO: d,
          dateFormatted: formatVNDate(item.mealDate),
          items: [],
        })
      }
      map.get(d).items.push(item)
    }

    return Array.from(map.values())
      .sort((a, b) => b.dateISO.localeCompare(a.dateISO))
      .map(dayGroup => ({
        ...dayGroup,
        items: dayGroup.items.sort((a, b) => (a.mealType === "LUNCH" ? -1 : 1)),
      }))
  }, [history, selectedMondayISO, historyMealFilter])

  const filteredHistoryItems = useMemo(() => {
    return groupedHistoryByDay.flatMap(g => g.items)
  }, [groupedHistoryByDay])

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

  const weekLabelShort = `Tuần ${weekSchedule.weekNumber} (${weekSchedule.schoolDays[0]?.dateVN?.slice(0, 5)} – ${weekSchedule.schoolDays[4]?.dateVN?.slice(0, 5)})`

  return (
    <div className="daily-meal-page">
      {/* 1. HÀNG TIÊU ĐỀ & ĐIỀU HƯỚNG TUẦN TINH GỌN */}
      <div className="daily-meal-header">
        <h1 className="daily-meal-header__title">Chốt số suất ăn của lớp</h1>

        <div className="daily-meal-week-nav">
          <div className="daily-meal-week-nav__box">
            <button
              type="button"
              className="daily-meal-week-nav__arrow"
              onClick={handlePrevWeek}
              title="Tuần trước"
              aria-label="Tuần trước"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="daily-meal-week-nav__label">
              <CalendarDays size={14} className="daily-meal-week-nav__icon" />
              <span>{weekLabelShort}</span>
            </div>

            <button
              type="button"
              className="daily-meal-week-nav__arrow"
              onClick={handleNextWeek}
              title="Tuần sau"
              aria-label="Tuần sau"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            type="button"
            className={`daily-meal-week-nav__today-btn ${isCurrentWeekSelected ? "daily-meal-week-nav__today-btn--active" : ""}`}
            onClick={handleCurrentWeek}
            title="Nhảy nhanh về tuần hiện tại"
          >
            <RotateCcw size={12} />
            <span>Tuần này</span>
          </button>
        </div>
      </div>

      {/* 2. DẢI 5 NGÀY HỌC ĐỐI XỨNG CÂN BẰNG (T2 -> T6) */}
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
              title={isToday ? "Hôm nay" : undefined}
            >
              <span className="daily-meal-day-pill__day">{day.dayIndexLabel}</span>
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
            {/* Header: Thông tin lớp & Ngày chọn & Trạng thái */}
            <div className="daily-meal-card__header">
              <div className="daily-meal-card__title-row">
                <div className="daily-meal-card__class-tag">
                  <ClipboardList size={16} />
                  <strong>{context.class.name}</strong>
                </div>
                <span className="daily-meal-card__date-text">
                  {formatVNDate(date)}
                </span>
              </div>
              <StatusChip status={submission?.status} />
            </div>

            {/* Tab chuyển ca ăn nằm ngay trong Card khai báo */}
            <div className="daily-meal-card__shift-tabs" role="tablist" aria-label="Chọn ca ăn">
              <button
                type="button"
                role="tab"
                aria-selected={mealType === "LUNCH"}
                className={`daily-meal-card__shift-tab ${mealType === "LUNCH" ? "daily-meal-card__shift-tab--lunch-active" : ""}`}
                onClick={() => setMealType("LUNCH")}
              >
                <Utensils size={14} />
                <span>Bữa trưa</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mealType === "AFTERNOON"}
                className={`daily-meal-card__shift-tab ${mealType === "AFTERNOON" ? "daily-meal-card__shift-tab--afternoon-active" : ""}`}
                onClick={() => setMealType("AFTERNOON")}
              >
                <Coffee size={14} />
                <span>Bữa xế</span>
              </button>
            </div>

            {finalized && (
              <div className="daily-meal-card__finalized-banner">
                <CheckCircle2 size={16} />
                <span>
                  Số suất {mealLabel(mealType).toLowerCase()} ngày {formatVNDate(date)} đã được chốt và giữ nguyên để bếp lập kế hoạch.
                </span>
              </div>
            )}

            <div className="daily-meal-card__body">
              <TextField
                fullWidth
                size="small"
                type="number"
                label={`Tổng số suất ${mealLabel(mealType).toLowerCase()}`}
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
                label="Ghi chú cho bếp (không bắt buộc)"
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
              <div className="daily-meal-history__title-block">
                <h2>Lịch sử tuần {weekSchedule.weekNumber}</h2>
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

              {/* Bộ lọc ca ăn dạng Filter Pills nhỏ gọn */}
              <div className="daily-meal-filter-pills" role="group" aria-label="Lọc ca ăn lịch sử">
                <button
                  type="button"
                  className={`daily-meal-filter-pill ${historyMealFilter === "ALL" ? "daily-meal-filter-pill--active" : ""}`}
                  onClick={() => setHistoryMealFilter("ALL")}
                >
                  Tất cả ca
                </button>
                <button
                  type="button"
                  className={`daily-meal-filter-pill ${historyMealFilter === "LUNCH" ? "daily-meal-filter-pill--active" : ""}`}
                  onClick={() => setHistoryMealFilter("LUNCH")}
                >
                  Bữa trưa
                </button>
                <button
                  type="button"
                  className={`daily-meal-filter-pill ${historyMealFilter === "AFTERNOON" ? "daily-meal-filter-pill--active" : ""}`}
                  onClick={() => setHistoryMealFilter("AFTERNOON")}
                >
                  Bữa xế
                </button>
              </div>
            </div>

            <div className="daily-meal-history__content">
              {groupedHistoryByDay.length > 0 ? (
                <>
                  {/* DESKTOP TABLE */}
                  <div className="daily-meal-history-desktop">
                    <TableContainer component={Paper} variant="outlined" className="daily-meal-history-table">
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

                  {/* MOBILE GROUPED DAY CARDS (Gom theo từng ngày, không lặp ngày) */}
                  <div className="daily-meal-history-mobile">
                    {groupedHistoryByDay.map(dayGroup => (
                      <div key={dayGroup.dateISO} className="daily-meal-history-day-card">
                        <div className="daily-meal-history-day-card__header">
                          <span className="daily-meal-history-day-card__date-label">
                            {dayGroup.dateFormatted}
                          </span>
                        </div>
                        <div className="daily-meal-history-day-card__rows">
                          {dayGroup.items.map(item => (
                            <div key={item.id} className="daily-meal-history-day-card__row">
                              <div className="daily-meal-history-day-card__meal-info">
                                <span className={`daily-meal-history-day-card__meal-badge daily-meal-history-day-card__meal-badge--${item.mealType.toLowerCase()}`}>
                                  {mealLabel(item.mealType)}
                                </span>
                                <span className="daily-meal-history-day-card__portions">
                                  <strong>{item.totalPortions}</strong> suất
                                </span>
                              </div>
                              <div className="daily-meal-history-day-card__actions">
                                <StatusChip status={item.status} />
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleSelectHistoryItem(item)}
                                  className="daily-meal-history-day-card__btn"
                                >
                                  {item.status === "FINALIZED" ? "Xem" : "Sửa"}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
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
