import React, { useState, useEffect, useMemo } from "react"
import { Button } from "@mui/material"
import { useNavigate } from "react-router-dom"
import ROUTER from "src/router/ROUTER"
import FoodPrintLoading from "src/components/FoodPrintLoading"
import MenuService from "src/services/MenuService"
import { getSchoolWeekScheduleFromDate } from "src/services/MenuService/adapter"
import { loadKitchenGradeSchedules } from "src/services/MenuService/gradeSchedule"
import KitchenMenuHeader from "./component/KitchenMenuHeader"
import KitchenMenuWeeklyGrid from "./component/KitchenMenuWeeklyGrid"
import styles from "./index.module.scss"

export default function KitchenMenu() {
  const navigate = useNavigate()
  const [years, setYears] = useState([])
  const [academicYear, setAcademicYear] = useState("")
  const [selectedWeek, setSelectedWeek] = useState(null)
  const [mealTypeFilter, setMealTypeFilter] = useState("ALL")
  const [calendarLoading, setCalendarLoading] = useState(true)
  const [calendarError, setCalendarError] = useState("")
  const [revision, setRevision] = useState(0)
  const [gradeOptions, setGradeOptions] = useState([])
  const [gradeId, setGradeId] = useState("")
  const [gradeLoading, setGradeLoading] = useState(true)
  const [gradeError, setGradeError] = useState("")
  const [scheduleState, setScheduleState] = useState({
    key: "",
    items: [],
    loading: true,
    error: "",
  })

  useEffect(() => {
    let active = true
    setCalendarLoading(true)
    setCalendarError("")
    MenuService.getAcademicCalendar({ forceRefresh: true })
      .then((response) => {
        if (!active) return
        const rows = response.academicYears
        if (!Array.isArray(rows))
          throw new Error("Không tải được cấu hình năm học.")
        setYears(rows)
        const current = rows.find((year) => year.isCurrent) || rows[0]
        setAcademicYear(current?.academicYear || "")
        setSelectedWeek(
          current?.weeks?.find((week) => week.isCurrentWeek)?.weekNumber ||
            current?.weeks?.[0]?.weekNumber ||
            null,
        )
      })
      .catch((error) => {
        if (active) setCalendarError(error.message)
      })
      .finally(() => {
        if (active) setCalendarLoading(false)
      })
    return () => {
      active = false
    }
  }, [revision])

  useEffect(() => {
    let active = true
    setGradeLoading(true)
    setGradeError("")
    MenuService.getContext({ forceRefresh: true })
      .then((context) => {
        if (!active) return
        if (!Array.isArray(context.grades))
          throw new Error("Không tải được danh sách khối của trường.")
        setGradeOptions(context.grades)
        setGradeId((previous) =>
          context.grades.some((grade) => grade.id === previous) ? previous : "",
        )
      })
      .catch((error) => {
        if (active) setGradeError(error.message)
      })
      .finally(() => {
        if (active) setGradeLoading(false)
      })
    return () => {
      active = false
    }
  }, [revision])

  const year = years.find((row) => row.academicYear === academicYear)
  const weeks = useMemo(
    () =>
      (year?.weeks || []).map((week) => ({
        ...week,
        isoWeek: week.weekNumber,
        startDateISO: week.weekStartDate,
        endDateISO: week.weekEndDate,
      })),
    [year],
  )
  const week = weeks.find((row) => row.weekNumber === selectedWeek)
  const requestKey = `${week?.weekStartDate || ""}:${gradeId}:${revision}`
  const schedules = scheduleState.key === requestKey ? scheduleState.items : []
  const loading =
    Boolean(week) && (scheduleState.key !== requestKey || scheduleState.loading)
  const scheduleError =
    scheduleState.key === requestKey ? scheduleState.error : ""

  useEffect(() => {
    if (!week) return undefined
    let active = true
    setScheduleState({ key: requestKey, items: [], loading: true, error: "" })
    loadKitchenGradeSchedules(week.weekStartDate, gradeId)
      .then((items) => {
        if (active)
          setScheduleState({
            key: requestKey,
            items,
            loading: false,
            error: "",
          })
      })
      .catch((error) => {
        if (active)
          setScheduleState({
            key: requestKey,
            items: [],
            loading: false,
            error: error.message,
          })
      })
    return () => {
      active = false
    }
  }, [week, gradeId, requestKey])

  const groups = useMemo(() => {
    if (!week) return []
    return schedules.map((schedule) => ({
      ...schedule,
      schoolDays: getSchoolWeekScheduleFromDate(
        week.weekStartDate,
      ).schoolDays.map((day) => {
        const stored = schedule.days?.find((row) => row.date === day.dateISO)
        return {
          ...day,
          isHoliday: stored?.isHoliday || false,
          holidayReason: stored?.holidayReason || "",
          status: stored?.status,
          meals: stored?.meals || {
            LUNCH: { dishes: [] },
            AFTERNOON: { dishes: [] },
          },
        }
      }),
    }))
  }, [week, schedules])
  const totalDishes = groups.reduce(
    (total, group) =>
      total +
      group.schoolDays.reduce(
        (sum, day) =>
          sum +
          ["LUNCH", "AFTERNOON"]
            .filter(
              (type) => mealTypeFilter === "ALL" || type === mealTypeFilter,
            )
            .reduce(
              (count, type) => count + (day.meals[type]?.dishes?.length || 0),
              0,
            ),
        0,
      ),
    0,
  )
  const existing = schedules
    .flatMap((schedule) => schedule.days || [])
    .filter((day) => day.hasMenu)
  const index = weeks.indexOf(week)
  const changeYear = (value) => {
    setAcademicYear(value)
    const target = years.find((row) => row.academicYear === value)
    setSelectedWeek(
      target?.weeks?.find((row) => row.isCurrentWeek)?.weekNumber ||
        target?.weeks?.[0]?.weekNumber ||
        null,
    )
  }
  const reload = () => {
    MenuService.invalidateMenuCache()
    setRevision((value) => value + 1)
  }
  const todayISO = new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10)

  return (
    <div className={styles.pageContainer}>
      <KitchenMenuHeader
        menuTitle={
          schedules.length === 1
            ? schedules[0].weeklyMenuTitle
            : week
              ? `Thực đơn tuần ${week.weekNumber}`
              : "Thực đơn"
        }
        targetScope={
          schedules.length === 1
            ? schedules[0].targetScope
            : gradeOptions.find((grade) => grade.id === gradeId)?.name || ""
        }
        approved={
          existing.length > 0 &&
          existing.every((day) => day.status === "APPROVED")
        }
        academicYear={academicYear}
        academicYearOptions={years}
        onAcademicYearChange={changeYear}
        week={selectedWeek ?? ""}
        weeks={weeks}
        onWeekChange={(value) => setSelectedWeek(Number(value))}
        onPrevWeek={() => {
          if (index > 0) setSelectedWeek(weeks[index - 1].weekNumber)
        }}
        onNextWeek={() => {
          if (index >= 0 && index < weeks.length - 1)
            setSelectedWeek(weeks[index + 1].weekNumber)
        }}
        isFirstWeek={index <= 0}
        isLastWeek={index < 0 || index >= weeks.length - 1}
        totalDishes={totalDishes}
        mealTypeFilter={mealTypeFilter}
        onMealTypeFilterChange={setMealTypeFilter}
        gradeOptions={gradeOptions}
        gradeId={gradeId}
        onGradeChange={setGradeId}
        gradeLoading={gradeLoading}
        gradeError={gradeError}
        onOpenBatches={() => navigate(ROUTER.SCHOOL_KITCHEN_BATCHES)}
      />
      {gradeError && (
        <div role="alert">
          <span>{gradeError}</span>
          <Button size="small" onClick={reload}>
            Thử lại
          </Button>
        </div>
      )}
      {calendarLoading || loading ? (
        <div role="status" style={{ padding: 80 }}>
          <FoodPrintLoading />
        </div>
      ) : calendarError || scheduleError ? (
        <div role="alert">
          <p>{calendarError || scheduleError}</p>
          <Button onClick={reload}>Thử lại</Button>
        </div>
      ) : !years.length ? (
        <p>Chưa có cấu hình năm học của trường.</p>
      ) : !existing.length ? (
        <p role="status">
          {gradeId
            ? "Khối đã chọn chưa có thực đơn trong tuần này."
            : "Chưa có thực đơn trong tuần này."}
        </p>
      ) : (
        groups.map((group) => (
          <section key={group.weeklyMenuId} aria-label={group.targetScope}>
            {groups.length > 1 && (
              <h2 className={styles.scopeHeading}>{group.targetScope}</h2>
            )}
            <KitchenMenuWeeklyGrid
              schoolDays={group.schoolDays}
              mealTypeFilter={mealTypeFilter}
              todayISO={todayISO}
            />
          </section>
        ))
      )}
    </div>
  )
}
