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
  Tooltip,
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
  Info,
  RotateCcw,
  Save,
  Sparkles,
  Users,
  Utensils,
} from "lucide-react"
import { useSearchParams } from "react-router-dom"
import notice from "src/components/Notice"
import MealPortionService from "src/services/MealPortionService"
import { getSchoolWeekScheduleFromDate, formatDateVN } from "src/services/MenuService/adapter"
import "./style.scss"

const errorMessage = (failure, fallback) => failure?.response?.data?.message || fallback
const statusLabel = status => (status === "FINALIZED" ? "Đã chốt" : "Bản nháp")
const mealLabel = mealType => (mealType === "AFTERNOON" ? "Bữa phụ" : "Bữa trưa")
const statusTone = status => {
  if (!status) return "neutral"
  return status === "FINALIZED" ? "success" : "warning"
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
  // Nếu là T7 hoặc CN, tự động trỏ về Thứ Hai của tuần học
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

  // Thông tin tuần học từ adapter module tái sử dụng của nhóm
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
      const submission = next.submission
      setContext(next)
      setHistory(historyResponse.data.items || [])
      setTotalPortions(submission ? String(submission.totalPortions) : "")
      setAllergyNotes(submission?.allergyNotes || "")
      setAllergyCounts(
        Object.fromEntries(
          (submission?.dailyAllergyPortions || []).map(item => [item.ingredientEntryId, item.portionCount]),
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

  const registered = context?.class?.registeredMealPortions ?? 0
  const numPortions = Number(totalPortions)
  const isOverRegistered = totalPortions !== "" && numPortions > registered
  const isUnderRegistered = totalPortions !== "" && numPortions < registered
  const extraPortions = Math.max(0, numPortions - registered)

  // Validation: Không giới hạn tối đa theo registeredMealPortions
  // vì có thêm học sinh ăn bán trú phát sinh trong ngày
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

  const portionsHelperText = useMemo(() => {
    if (totalPortions === "") {
      return `Đăng ký đầu năm: ${registered} suất. Có thể điều chỉnh tăng nếu có học sinh ăn bán trú phát sinh.`
    }
    if (isOverRegistered) {
      return `Phát sinh thêm +${extraPortions} suất so với đăng ký đầu năm (${registered} suất).`
    }
    if (isUnderRegistered) {
      return `Giảm ${registered - numPortions} suất so với đăng ký đầu năm (${registered} suất).`
    }
    return `Đúng bằng số suất đăng ký đầu năm (${registered} suất).`
  }, [totalPortions, registered, isOverRegistered, isUnderRegistered, extraPortions, numPortions])

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

  // Nhóm lịch sử khai báo theo tuần học
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

  // Lấy trạng thái bữa ăn của một ngày trong tuần đang xem
  const getDayMealStatus = dayIso => {
    const record = history.find(
      h => dayjs(h.mealDate).format("YYYY-MM-DD") === dayIso && h.mealType === mealType,
    )
    return record?.status || null
  }

  return (
    <div className="daily-meal-page">
      <header className="daily-meal-page__header">
        <div>
          <nav className="daily-meal-page__breadcrumb" aria-label="Đường dẫn trang">
            <span>Giáo viên chủ nhiệm</span>
            <span>/</span>
            <strong>Suất ăn hằng ngày</strong>
          </nav>
          <h1>Chốt số suất ăn của lớp</h1>
          <p>Khai báo tổng số suất và nhu cầu tránh nguyên liệu theo dữ liệu dị ứng của lớp theo từng tuần học.</p>
        </div>
      </header>

      {/* CỤM ĐIỀU HƯỚNG TUẦN VÀ CHỌN THỨ TRONG TUẦN */}
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
              <strong>{weekSchedule.weekRangeLabel}</strong>
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
              startIcon={<RotateCcw size={14} />}
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
              label="Chọn ngày cụ thể"
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

        {/* CÁC THẺ NGÀY TRONG TUẦN (THỨ HAI - THỨ SÁU) */}
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
                <div className="daily-meal-page__day-card-header">
                  <span className="daily-meal-page__day-name">{day.dayLabel}</span>
                  {isToday && <span className="daily-meal-page__day-today-tag">Hôm nay</span>}
                </div>
                <div className="daily-meal-page__day-date">{day.dateVN.slice(0, 5)}</div>
                <div className="daily-meal-page__day-status-indicator">
                  {dayStatus === "FINALIZED" && (
                    <span className="daily-meal-page__day-status-pill daily-meal-page__day-status-pill--finalized">
                      <CheckCircle2 size={12} /> Đã chốt
                    </span>
                  )}
                  {dayStatus === "DRAFT" && (
                    <span className="daily-meal-page__day-status-pill daily-meal-page__day-status-pill--draft">
                      Bản nháp
                    </span>
                  )}
                  {!dayStatus && (
                    <span className="daily-meal-page__day-status-pill daily-meal-page__day-status-pill--empty">
                      Chưa khai báo
                    </span>
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
          <Paper variant="outlined" className="daily-meal-page__summary">
            <div>
              <span>Lớp được phân công</span>
              <strong>{context.class.name}</strong>
              <small>Niên khóa {context.class.academicYear}</small>
            </div>
            <div>
              <span>Số suất đăng ký đầu năm</span>
              <strong>{context.class.registeredMealPortions}</strong>
              <small>Mức đăng ký ban đầu (có thể tăng thêm)</small>
            </div>
            <div className="daily-meal-page__summary-status">
              <div>
                <span>Trạng thái ca ăn</span>
                <small className="daily-meal-page__summary-subtext">
                  {dayjs(date).format("DD/MM/YYYY")} · {mealLabel(mealType)}
                </small>
              </div>
              <StatusChip status={submission?.status} />
            </div>
          </Paper>

          <Paper variant="outlined" className="daily-meal-page__form" aria-busy={saving}>
            <div className="daily-meal-page__section-title">
              <ClipboardList size={20} />
              <div>
                <h2>
                  Số suất {mealLabel(mealType).toLowerCase()} — {dayjs(date).format("dddd, DD/MM/YYYY")}
                </h2>
                <p>Được phép sửa khi còn là bản nháp. Số suất có thể vượt mức đăng ký đầu năm nếu có học sinh ăn thêm.</p>
              </div>
            </div>

            {finalized && (
              <Alert severity="success">
                Số suất ngày này đã được chốt và giữ nguyên để bếp lập kế hoạch.
              </Alert>
            )}

            {isOverRegistered && !finalized && (
              <Alert severity="info" icon={<Sparkles size={18} />}>
                Số suất khai báo ({numPortions}) cao hơn mức đăng ký đầu năm ({registered} suất). Đã ghi nhận thêm{" "}
                <strong>+{extraPortions} suất bán trú phát sinh</strong>.
              </Alert>
            )}

            <TextField
              fullWidth
              type="number"
              label="Tổng số suất"
              value={totalPortions}
              disabled={finalized || saving}
              onChange={event => setTotalPortions(event.target.value)}
              inputProps={{ min: 0, step: 1 }}
              helperText={portionsHelperText}
            />

            <div className="daily-meal-page__allergies">
              <div>
                <h3>Suất cần tránh nguyên liệu</h3>
                <p>Chỉ hiển thị dữ liệu dị ứng tổng hợp đã lưu cho lớp.</p>
              </div>
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
                    inputProps={{ min: 0, max: item.affectedCount, step: 1 }}
                  />
                </div>
              ))}
            </div>

            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Ghi chú chung (không bắt buộc)"
              value={allergyNotes}
              disabled={finalized || saving}
              placeholder="Ghi chú thêm về học sinh ăn bán trú phát sinh hoặc yêu cầu đặc biệt..."
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
                >
                  Lưu nháp
                </Button>
                <Button
                  variant="contained"
                  startIcon={<CheckCircle2 size={18} />}
                  disabled={!valid || saving}
                  onClick={() => setConfirmOpen(true)}
                >
                  {saving ? "Đang xử lý..." : "Chốt số suất"}
                </Button>
              </div>
            )}
          </Paper>

          {/* LỊCH SỬ KHAI BÁO THEO TUẦN */}
          <section className="daily-meal-page__history">
            <div className="daily-meal-page__history-header">
              <div>
                <h2>Lịch sử khai báo theo tuần</h2>
                <p>Dữ liệu của lớp được sắp xếp và thống kê trực quan theo từng tuần học.</p>
              </div>
              <div className="daily-meal-page__history-filter-strip">
                <Button
                  size="small"
                  variant={historyWeekFilter === "ALL" ? "contained" : "outlined"}
                  onClick={() => setHistoryWeekFilter("ALL")}
                >
                  Tất cả các tuần ({historyByWeek.length})
                </Button>
                <Button
                  size="small"
                  variant={historyWeekFilter === "CURRENT_WEEK" ? "contained" : "outlined"}
                  onClick={() => setHistoryWeekFilter("CURRENT_WEEK")}
                >
                  Tuần đang chọn (Tuần {weekSchedule.weekNumber})
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

                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Ngày</TableCell>
                          <TableCell>Ca ăn</TableCell>
                          <TableCell>Lớp</TableCell>
                          <TableCell align="right">Số suất</TableCell>
                          <TableCell>Ghi chú suất</TableCell>
                          <TableCell>Trạng thái</TableCell>
                          <TableCell align="center">Thao tác</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {week.items.map(item => {
                          const isOver = item.totalPortions > registered
                          const diff = item.totalPortions - registered

                          return (
                            <TableRow key={item.id} hover>
                              <TableCell>
                                <strong>{dayjs(item.mealDate).format("dddd, DD/MM/YYYY")}</strong>
                              </TableCell>
                              <TableCell>{mealLabel(item.mealType)}</TableCell>
                              <TableCell>{item.Class?.name || context.class.name}</TableCell>
                              <TableCell align="right">
                                <strong>{item.totalPortions}</strong>
                              </TableCell>
                              <TableCell>
                                {isOver ? (
                                  <span className="daily-meal-page__diff-badge daily-meal-page__diff-badge--plus">
                                    +{diff} phát sinh
                                  </span>
                                ) : diff < 0 ? (
                                  <span className="daily-meal-page__diff-badge daily-meal-page__diff-badge--minus">
                                    {diff} suất
                                  </span>
                                ) : (
                                  <span className="daily-meal-page__diff-badge">Đúng định mức</span>
                                )}
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
                          )
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
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
                Sau khi chốt, số suất ngày <strong>{dayjs(date).format("DD/MM/YYYY")}</strong> ({mealLabel(mealType).toLowerCase()}) sẽ được giữ nguyên để bếp lập kế hoạch và không thể sửa trực tiếp.
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
