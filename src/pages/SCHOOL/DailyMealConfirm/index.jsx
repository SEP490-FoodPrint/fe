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
  IconButton,
  MenuItem,
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
  CalendarRange,
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
const mealLabel = mealType => (mealType === "AFTERNOON" ? "Bữa phụ" : "Bữa trưa")
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
    className={`daily-meal-page__status daily-meal-page__status--${statusTone(status)}`}
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
  const [historyWeekFilter, setHistoryWeekFilter] = useState("ALL")
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

  const historyByWeek = useMemo(() => {
    if (!history || !history.length) return []
    const map = new Map()

    for (const item of history) {
      const sched = getSchoolWeekScheduleFromDate(item.mealDate)
      const mondayISO = sched.schoolDays[0]?.dateISO || dayjs(item.mealDate).startOf("isoWeek").format("YYYY-MM-DD")

      if (!map.has(mondayISO)) {
        map.set(mondayISO, {
          weekNumber: sched.weekNumber,
          weekRangeLabel: sched.weekRangeLabel,
          mondayISO,
          items: [],
          totalPortions: 0,
          finalizedCount: 0,
        })
      }
      const group = map.get(mondayISO)
      group.items.push(item)
      group.totalPortions += Number(item.totalPortions || 0)
      if (item.status === "FINALIZED") group.finalizedCount += 1
    }

    return Array.from(map.values()).sort((a, b) => b.mondayISO.localeCompare(a.mondayISO))
  }, [history])

  const displayedWeekGroups = useMemo(() => {
    if (historyWeekFilter === "CURRENT_WEEK") {
      const curMonday = weekSchedule.schoolDays[0]?.dateISO
      return historyByWeek.filter(w => w.mondayISO === curMonday)
    }
    return historyByWeek
  }, [historyByWeek, historyWeekFilter, weekSchedule])

  const handleSelectHistoryItem = item => {
    const itemDate = dayjs(item.mealDate).format("YYYY-MM-DD")
    setDate(itemDate)
    setMealType(item.mealType)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const getDayMealStatus = dayIso => {
    const record = history.find(
      h => dayjs(h.mealDate).format("YYYY-MM-DD") === dayIso && h.mealType === mealType,
    )
    return record?.status || null
  }

  return (
    <div className="daily-meal-page">
      <header className="daily-meal-page__header">
        <h1>Chốt số suất ăn của lớp</h1>
      </header>

      {/* ĐIỀU HƯỚNG TUẦN VÀ CHỌN THỨ TRONG TUẦN */}
      <Paper variant="outlined" className="daily-meal-page__week-panel">
        <div className="daily-meal-page__week-nav-bar">
          <div className="daily-meal-page__week-nav-controls">
            <IconButton
              size="small"
              onClick={handlePrevWeek}
              title="Tuần trước"
              aria-label="Tuần trước"
              className="daily-meal-page__week-nav-btn"
            >
              <ChevronLeft size={18} />
            </IconButton>

            <div className="daily-meal-page__week-nav-info">
              <CalendarRange size={18} className="daily-meal-page__week-icon" />
              <span>{weekSchedule.weekRangeLabel}</span>
            </div>

            <IconButton
              size="small"
              onClick={handleNextWeek}
              title="Tuần sau"
              aria-label="Tuần sau"
              className="daily-meal-page__week-nav-btn"
            >
              <ChevronRight size={18} />
            </IconButton>

            <Button
              size="small"
              variant={isCurrentWeekSelected ? "contained" : "outlined"}
              color="primary"
              startIcon={<RotateCcw size={13} />}
              onClick={handleCurrentWeek}
              className="daily-meal-page__current-week-btn"
            >
              Tuần này
            </Button>
          </div>

          <div className="daily-meal-page__week-nav-filters">
            <TextField
              size="small"
              type="date"
              label="Chọn ngày"
              value={date}
              onChange={event => setDate(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              className="daily-meal-page__date-input"
            />
            <TextField
              select
              size="small"
              label="Ca ăn"
              value={mealType}
              onChange={event => setMealType(event.target.value)}
              className="daily-meal-page__meal-select"
            >
              <MenuItem value="LUNCH">Bữa trưa</MenuItem>
              <MenuItem value="AFTERNOON">Bữa phụ</MenuItem>
            </TextField>
          </div>
        </div>

        {/* 5 THẺ NGÀY TRONG TUẦN (T2 - T6) */}
        <div className="daily-meal-page__day-strip">
          {weekSchedule.schoolDays.map(day => {
            const isSelected = day.dateISO === date
            const isToday = day.dateISO === dayjs().format("YYYY-MM-DD")
            const dayStatus = getDayMealStatus(day.dateISO)

            return (
              <button
                type="button"
                key={day.dateISO}
                className={`daily-meal-page__day-card ${isSelected ? "daily-meal-page__day-card--active" : ""}`}
                onClick={() => setDate(day.dateISO)}
              >
                <div className="daily-meal-page__day-card-top">
                  <span className="daily-meal-page__day-name">{day.dayIndexLabel}</span>
                  {isToday && <span className="daily-meal-page__day-today-tag">Hôm nay</span>}
                </div>
                <div className="daily-meal-page__day-date">{day.dateVN.slice(0, 5)}</div>
                <div className="daily-meal-page__day-status-pill-wrap">
                  {dayStatus === "FINALIZED" && (
                    <span className="daily-meal-page__status-dot daily-meal-page__status-dot--success" title="Đã chốt" />
                  )}
                  {dayStatus === "DRAFT" && (
                    <span className="daily-meal-page__status-dot daily-meal-page__status-dot--warning" title="Bản nháp" />
                  )}
                  {!dayStatus && (
                    <span className="daily-meal-page__status-dot daily-meal-page__status-dot--empty" title="Chưa khai báo" />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </Paper>

      {loading && (
        <div className="daily-meal-page__loading" role="status" aria-live="polite">
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
          {/* THÔNG TIN LỚP & TRẠNG THÁI CA ĂN GỌN GÀNG */}
          <Paper variant="outlined" className="daily-meal-page__class-banner">
            <div className="daily-meal-page__class-banner-left">
              <strong>{context.class.name}</strong>
              <span>Niên khóa {context.class.academicYear}</span>
            </div>
            <div className="daily-meal-page__class-banner-right">
              <span className="daily-meal-page__class-banner-meal">
                {mealLabel(mealType)} · {formatVNDate(date)}
              </span>
              <StatusChip status={submission?.status} />
            </div>
          </Paper>

          {/* FORM NHẬP SUẤT ĂN */}
          <Paper variant="outlined" className="daily-meal-page__form" aria-busy={saving}>
            <div className="daily-meal-page__form-title">
              <ClipboardList size={20} />
              <h2>
                Số suất {mealLabel(mealType).toLowerCase()} ({formatVNDate(date)})
              </h2>
            </div>

            {finalized && (
              <Alert severity="success">
                Số suất ngày này đã được chốt và giữ nguyên để bếp lập kế hoạch.
              </Alert>
            )}

            <TextField
              fullWidth
              type="number"
              label="Tổng số suất"
              placeholder="Nhập tổng số suất ăn..."
              value={totalPortions}
              disabled={finalized || saving}
              onChange={event => setTotalPortions(event.target.value)}
              inputProps={{ min: 0, step: 1, inputMode: "numeric" }}
            />

            <div className="daily-meal-page__allergies">
              <h3>Suất cần tránh nguyên liệu</h3>
              {!allergies.length && (
                <Alert severity="info">Lớp chưa có thông tin dị ứng tổng hợp.</Alert>
              )}
              {allergies.map(item => (
                <div className="daily-meal-page__allergy-row" key={item.ingredientEntryId}>
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
              minRows={2}
              label="Ghi chú (không bắt buộc)"
              value={allergyNotes}
              disabled={finalized || saving}
              placeholder="Ghi chú thêm cho bếp nếu có yêu cầu đặc biệt..."
              onChange={event => setAllergyNotes(event.target.value)}
              inputProps={{ maxLength: 1000 }}
            />

            {!finalized && (
              <div className="daily-meal-page__actions">
                <Button
                  variant="outlined"
                  startIcon={<Save size={18} />}
                  disabled={!valid || saving}
                  onClick={() => submit(false)}
                  className="daily-meal-page__btn-action"
                >
                  Lưu nháp
                </Button>
                <Button
                  variant="contained"
                  startIcon={<CheckCircle2 size={18} />}
                  disabled={!valid || saving}
                  onClick={() => setConfirmOpen(true)}
                  className="daily-meal-page__btn-action"
                >
                  {saving ? "Đang xử lý..." : "Chốt số suất"}
                </Button>
              </div>
            )}
          </Paper>

          {/* LỊCH SỬ KHAI BÁO THEO TUẦN */}
          <section className="daily-meal-page__history">
            <div className="daily-meal-page__history-header">
              <h2>Lịch sử khai báo theo tuần</h2>
              <div className="daily-meal-page__history-filter-strip">
                <Button
                  size="small"
                  variant={historyWeekFilter === "ALL" ? "contained" : "outlined"}
                  onClick={() => setHistoryWeekFilter("ALL")}
                >
                  Tất cả ({historyByWeek.length} tuần)
                </Button>
                <Button
                  size="small"
                  variant={historyWeekFilter === "CURRENT_WEEK" ? "contained" : "outlined"}
                  onClick={() => setHistoryWeekFilter("CURRENT_WEEK")}
                >
                  Tuần {weekSchedule.weekNumber}
                </Button>
              </div>
            </div>

            <div className="daily-meal-page__history-weeks">
              {displayedWeekGroups.map(week => (
                <Paper variant="outlined" key={week.mondayISO} className="daily-meal-page__week-history-card">
                  <div className="daily-meal-page__week-history-card-header">
                    <div className="daily-meal-page__week-history-title">
                      <CalendarDays size={18} />
                      <strong>{week.weekRangeLabel}</strong>
                    </div>
                    <div className="daily-meal-page__week-history-stats">
                      <Chip
                        size="small"
                        icon={<Utensils size={14} />}
                        label={`Tổng ${week.totalPortions} suất`}
                        variant="outlined"
                      />
                      <Chip
                        size="small"
                        icon={<CheckCircle2 size={14} />}
                        label={`${week.finalizedCount}/${week.items.length} ca đã chốt`}
                        className="daily-meal-page__chip-success"
                      />
                    </div>
                  </div>

                  {/* DESKTOP TABLE */}
                  <div className="daily-meal-page__desktop-history-table">
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
                          {week.items.map(item => (
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

                  {/* MOBILE CARDS LIST */}
                  <div className="daily-meal-page__mobile-history-list">
                    {week.items.map(item => (
                      <div key={item.id} className="daily-meal-page__mobile-history-item">
                        <div className="daily-meal-page__mobile-history-row">
                          <span className="daily-meal-page__mobile-history-date">
                            {formatVNDate(item.mealDate)}
                          </span>
                          <span className="daily-meal-page__mobile-history-meal">
                            {mealLabel(item.mealType)}
                          </span>
                        </div>
                        <div className="daily-meal-page__mobile-history-row">
                          <div className="daily-meal-page__mobile-history-portions">
                            <strong>{item.totalPortions}</strong> suất
                          </div>
                          <div className="daily-meal-page__mobile-history-actions">
                            <StatusChip status={item.status} />
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleSelectHistoryItem(item)}
                              className="daily-meal-page__mobile-btn-view"
                            >
                              {item.status === "FINALIZED" ? "Xem" : "Sửa"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Paper>
              ))}

              {!displayedWeekGroups.length && (
                <Paper variant="outlined" className="daily-meal-page__empty-history">
                  Chưa có lịch sử khai báo nào cho tuần này.
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
