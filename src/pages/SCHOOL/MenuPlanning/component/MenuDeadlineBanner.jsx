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
// Trạng thái cần hoàn thành và gửi duyệt (khác "chưa tạo")
const missingDaysOf = group => Math.max(0, (group.schoolDays || 0) - (group.plannedDays || 0))
const COMPLETION_TEXT = {
  DRAFT: group => missingDaysOf(group)
    ? `bản nháp còn thiếu ${missingDaysOf(group)} ngày, chưa gửi duyệt`
    : "bản nháp chưa gửi duyệt",
  INCOMPLETE: group => missingDaysOf(group)
    ? `còn thiếu ${missingDaysOf(group)} ngày, chưa gửi duyệt`
    : "chưa đủ thực đơn, chưa gửi duyệt",
  REVISION_REQUESTED: () => "cần chỉnh sửa theo yêu cầu BGH rồi gửi duyệt lại",
}

// Hạn chót (BE: assertMenuWeekOpen): thực đơn tuần tới phải tạo và gửi duyệt trước hết Chủ nhật.
// Báo theo từng khối: khối nào chưa có thực đơn (nhắc tạo), thực đơn nào chưa hoàn thành / chưa gửi duyệt (nhắc hoàn thành).
export function nextWeekDeadline(academicYears = [], weekMenus = {}, grades = [], today = vietnamTodayISO()) {
  const weekday = new Date(`${today}T00:00:00Z`).getUTCDay()
  const nextMonday = shiftISO(today, ((8 - weekday) % 7) || 7)
  const year = academicYears.find(item => item.weeks?.some(week => week.weekStartDate === nextMonday))
  const week = year?.weeks.find(item => item.weekStartDate === nextMonday)
  if (!week) return null
  const schoolDates = weekSchoolDates(week, year.holidays || [])
  if (!schoolDates.length) return null
  const rows = weekMenus[nextMonday] || []

  // Nhắc tạo: khối chưa có thực đơn
  const createItems = []
  if (!rows.length) {
    createItems.push(grades.length ? `${grades.map(grade => grade.name).join(", ")}: chưa tạo thực đơn` : "Chưa tạo thực đơn nào")
  } else if (!rows.some(row => row.isSchoolWide)) {
    const covered = new Set(rows.flatMap(row => row.gradeIds || []))
    grades.filter(grade => !covered.has(grade.id)).forEach(grade => createItems.push(`${grade.name}: chưa tạo thực đơn`))
  }

  // Nhắc hoàn thành: thực đơn đã tạo nhưng còn nháp / thiếu ngày / cần chỉnh sửa
  const completeItems = weekMenuGroups(rows, schoolDates)
    .filter(group => COMPLETION_TEXT[group.status])
    .map(group => `${group.scope || "Thực đơn"}: ${COMPLETION_TEXT[group.status](group)}`)

  if (!createItems.length && !completeItems.length) return null
  const deadline = shiftISO(nextMonday, -1)
  const daysLeft = Math.round((Date.parse(deadline) - Date.parse(today)) / DAY_MS)
  return {
    weekStartDate: nextMonday,
    weekLabel: week.weekLabel || `Tuần ${week.weekNumber}`,
    range: `${ddmm(nextMonday)}–${ddmm(shiftISO(nextMonday, 4))}`,
    createItems,
    completeItems,
    missingGrades: createItems.length > 0,
    needsCompletion: completeItems.length > 0,
    deadline,
    daysLeft,
  }
}

function MenuDeadlineBanner({ academicYears, weekMenus, grades, onCreate }) {
  const info = useMemo(() => nextWeekDeadline(academicYears, weekMenus, grades), [academicYears, weekMenus, grades])
  if (!info) return null
  const urgent = info.daysLeft <= 1
  const remaining = info.daysLeft <= 0 ? "hôm nay là hạn chót" : `còn ${info.daysLeft} ngày`
  const heading = info.missingGrades && info.needsCompletion
    ? "chưa tạo đủ và chưa gửi duyệt"
    : info.missingGrades ? "chưa tạo đủ" : "chưa hoàn thành và gửi duyệt"
  return (
    <div className={`${styles.banner} ${urgent ? styles.urgent : ""}`} role="status">
      <AlarmClock size={18} className={styles.icon} aria-hidden="true" />
      <div className={styles.body}>
        <p className={styles.text}>
          Thực đơn <strong>{info.weekLabel} ({info.range})</strong> {heading}.
        </p>
        <ul className={styles.items}>
          {info.createItems.map(item => <li key={`c-${item}`} className={styles.itemCreate}>{item}</li>)}
          {info.completeItems.map(item => <li key={`d-${item}`} className={styles.itemComplete}>{item}</li>)}
        </ul>
        <p className={styles.deadline}>
          Hoàn thành và gửi duyệt trước <strong>hết Chủ nhật {ddmm(info.deadline)}</strong> ({remaining}).
        </p>
      </div>
      {onCreate && (
        <div className={styles.actions}>
          {info.missingGrades && (
            <button type="button" className={styles.action} onClick={() => onCreate(info.weekStartDate)}>
              Tạo ngay
            </button>
          )}
          {info.needsCompletion && (
            <button
              type="button"
              className={info.missingGrades ? styles.actionSecondary : styles.action}
              onClick={() => onCreate(info.weekStartDate)}
            >
              Hoàn thành ngay
            </button>
          )}
        </div>
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
