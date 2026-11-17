export const defaultAcademicWeek = (year) =>
  year?.weeks?.find((week) => week.isCurrentWeek) || year?.weeks?.[0]

export function resolveAcademicWeekView(years, search) {
  const params = new URLSearchParams(search)
  const requestedYear = params.get("academicYear") || ""
  const requestedWeek = params.get("week") || ""
  const matchingYear = years.find((year) => year.academicYear === requestedYear)
  const year = matchingYear ||
    (!requestedYear && requestedWeek && years.find((item) => item.weeks?.some((week) => week.weekStartDate === requestedWeek))) ||
    years.find((item) => item.isCurrent) || years[0]
  const matchingWeek = year?.weeks?.find((week) => week.weekStartDate === requestedWeek)
  const invalidSelection = Boolean((requestedYear && !matchingYear) || (requestedWeek && !matchingWeek))
  return {
    year,
    week: matchingWeek || defaultAcademicWeek(year),
    showWeek: Boolean(matchingWeek && !invalidSelection),
    invalidSelection,
  }
}

export function academicWeekSearch(search, academicYear, weekStartDate = "") {
  const params = new URLSearchParams(search)
  if (academicYear) params.set("academicYear", academicYear)
  else params.delete("academicYear")
  if (weekStartDate) params.set("week", weekStartDate)
  else params.delete("week")
  return params
}

// Thứ Hai của tuần chứa ngày ISO (yyyy-mm-dd), khớp weekStartDate do BE cấp.
export function mondayOfIsoDate(iso) {
  if (!iso) return ""
  const date = new Date(`${String(iso).slice(0, 10)}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return ""
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7))
  return date.toISOString().slice(0, 10)
}

// Tuần hiện tại lên đầu, các tuần còn lại giảm dần (tuần mới nhất trước).
export function sortWeeksCurrentFirst(weeks = []) {
  return [...weeks].sort((a, b) => {
    if (a.isCurrentWeek !== b.isCurrentWeek) return a.isCurrentWeek ? -1 : 1
    return String(b.weekStartDate).localeCompare(String(a.weekStartDate))
  })
}

// Chỉ hiện các tuần đã tới: không liệt kê tuần tương lai (tuần 11 thì dừng ở tuần 11).
export function visibleAcademicWeeks(year, today = new Date()) {
  const weeks = year?.weeks || []
  const current = weeks.find((week) => week.isCurrentWeek)
  if (current) return weeks.filter((week) => week.weekStartDate <= current.weekStartDate)
  const iso = new Date(today.getTime() + 7 * 3600 * 1000).toISOString().slice(0, 10)
  if (year?.endDate && year.endDate < iso) return weeks
  return weeks.slice(0, 1)
}

// Một tuần có thể có nhiều thực đơn (mỗi nhóm khối một thực đơn tuần riêng).
export function weekMenuGroups(menus = [], schoolDates = []) {
  const groups = new Map()
  for (const menu of menus) {
    const id = menu.weeklyMenuId || menu.id
    if (!groups.has(id)) groups.set(id, [])
    groups.get(id).push(menu)
  }
  return [...groups.entries()].map(([id, rows]) => ({ id, ...weekMenuSummary(rows, schoolDates) }))
    .sort((a, b) => String(a.scope).localeCompare(String(b.scope), "vi", { numeric: true }))
}

// Số ngày học (T2–T6, trừ ngày nghỉ do BGH cấu hình) của một tuần.
export function weekSchoolDates(week, holidays = []) {
  const off = new Set(holidays.map((holiday) => holiday.date))
  const start = new Date(`${week.weekStartDate}T00:00:00Z`)
  const dates = []
  for (let i = 0; i < 5; i += 1) {
    const day = new Date(start)
    day.setUTCDate(start.getUTCDate() + i)
    const iso = day.toISOString().slice(0, 10)
    if (!off.has(iso)) dates.push(iso)
  }
  return dates
}

export function weekMenuSummary(menus = [], schoolDates = []) {
  const menuIds = new Set(menus.map((menu) => menu.weeklyMenuId || menu.id).filter(Boolean))
  const statuses = new Set(menus.map((menu) => menu.weeklyStatus || menu.status).filter(Boolean))
  const status = statuses.has("REVISION_REQUESTED") ? "REVISION_REQUESTED"
    : statuses.has("REVISION_REQUIRED") ? "REVISION_REQUESTED"
      : statuses.has("PENDING_APPROVAL") ? "PENDING_APPROVAL"
        : statuses.has("DRAFT") ? "DRAFT"
          : statuses.has("APPROVED") && statuses.size === 1 ? "APPROVED"
            : menus.length ? "INCOMPLETE" : "EMPTY"
  return {
    status,
    label: ({ APPROVED: "Đã duyệt", PENDING_APPROVAL: "Chờ duyệt", DRAFT: "Bản nháp", REVISION_REQUESTED: "Cần chỉnh sửa", INCOMPLETE: "Chưa đủ thực đơn", EMPTY: "Chưa tạo" })[status],
    dishCount: menus.reduce((total, menu) => total + (Array.isArray(menu.dishes) ? menu.dishes.length : 0), 0),
    menuCount: menuIds.size,
    plannedDays: new Set(schoolDates.filter((date) => menus.some((menu) => menu.rawDate === date && menu.dishes?.length))).size,
    schoolDays: schoolDates.length,
    scope: [...new Set(menus.map((menu) => menu.targetScope).filter(Boolean))].join("; "),
  }
}

export function statusTone(status) {
  return ({ APPROVED: "approved", PENDING_APPROVAL: "pending", DRAFT: "draft", REVISION_REQUESTED: "revision", INCOMPLETE: "incomplete", EMPTY: "empty" })[status] || "empty"
}
