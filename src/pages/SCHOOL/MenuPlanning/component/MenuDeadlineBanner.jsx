import React, { useMemo } from "react"
import PropTypes from "prop-types"
import { AlarmClock } from "lucide-react"
import { weekMenuGroups, weekSchoolDates } from "src/services/MenuService/academicWeekView"
import { vietnamTodayISO } from "src/utils/menuDays"
import styles from "./MenuDeadlineBanner.module.scss"

const DAY_MS = 86400000
const shiftISO = (iso, days) =>
  new Date(Date.parse(`${iso}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10)
const ddmm = iso => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`
const PENDING_STATUSES = new Set(["DRAFT", "REVISION_REQUESTED", "INCOMPLETE"])

// Hạn chót (BE: assertMenuWeekOpen): thực đơn tuần tới phải tạo và gửi duyệt trước hết Chủ nhật.
// Báo theo từng khối: khối nào chưa có thực đơn, thực đơn nào chưa gửi duyệt.
export function nextWeekDeadline(academicYears = [], weekMenus = {}, grades = [], today = vietnamTodayISO()) {
  const weekday = new Date(`${today}T00:00:00Z`).getUTCDay()
  const nextMonday = shiftISO(today, ((8 - weekday) % 7) || 7)
  const year = academicYears.find(item => item.weeks?.some(week => week.weekStartDate === nextMonday))
  const week = year?.weeks.find(item => item.weekStartDate === nextMonday)
  if (!week) return null
  const schoolDates = weekSchoolDates(week, year.holidays || [])
  if (!schoolDates.length) return null
  const rows = weekMenus[nextMonday] || []
  const issues = []
  let missingGrades = false
  if (!rows.length) {
    issues.push(grades.length ? `${grades.map(grade => grade.name).join(", ")} chưa được tạo` : "chưa được tạo")
    missingGrades = true
  } else if (!rows.some(row => row.isSchoolWide)) {
    const covered = new Set(rows.flatMap(row => row.gradeIds || []))
    const missing = grades.filter(grade => !covered.has(grade.id)).map(grade => grade.name)
    if (missing.length) {
      issues.push(`${missing.join(", ")} chưa được tạo`)
      missingGrades = true
    }
  }
  const pending = weekMenuGroups(rows, schoolDates)
    .filter(group => PENDING_STATUSES.has(group.status))
    .map(group => group.scope || "Thực đơn")
  if (pending.length) issues.push(`${[...new Set(pending)].join(", ")} chưa gửi duyệt`)
  if (!issues.length) return null
  const deadline = shiftISO(nextMonday, -1)
  const daysLeft = Math.round((Date.parse(deadline) - Date.parse(today)) / DAY_MS)
  return {
    weekStartDate: nextMonday,
    weekLabel: week.weekLabel || `Tuần ${week.weekNumber}`,
    range: `${ddmm(nextMonday)}–${ddmm(shiftISO(nextMonday, 4))}`,
    issues,
    missingGrades,
    deadline,
    daysLeft,
  }
}

function MenuDeadlineBanner({ academicYears, weekMenus, grades, onCreate }) {
  const info = useMemo(() => nextWeekDeadline(academicYears, weekMenus, grades), [academicYears, weekMenus, grades])
  if (!info) return null
  const urgent = info.daysLeft <= 1
  const remaining = info.daysLeft <= 0 ? "hôm nay là hạn chót" : `còn ${info.daysLeft} ngày`
  return (
    <div className={`${styles.banner} ${urgent ? styles.urgent : ""}`} role="status">
      <AlarmClock size={18} className={styles.icon} aria-hidden="true" />
      <p className={styles.text}>
        Thực đơn <strong>{info.weekLabel} ({info.range})</strong>: {info.issues.join("; ")}. Hạn chót tạo và gửi duyệt:{" "}
        <strong>hết Chủ nhật {ddmm(info.deadline)}</strong> ({remaining}).
      </p>
      {onCreate && info.missingGrades && (
        <button type="button" className={styles.action} onClick={() => onCreate(info.weekStartDate)}>
          Tạo ngay
        </button>
      )}
    </div>
  )
}

MenuDeadlineBanner.propTypes = {
  academicYears: PropTypes.array,
  weekMenus: PropTypes.object,
  grades: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string, name: PropTypes.string })),
  onCreate: PropTypes.func,
}

export default MenuDeadlineBanner
