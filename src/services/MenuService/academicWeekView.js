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

export function weekMenuSummary(menus = []) {
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
  }
}

export function statusTone(status) {
  return ({ APPROVED: "approved", PENDING_APPROVAL: "pending", DRAFT: "draft", REVISION_REQUESTED: "revision", INCOMPLETE: "incomplete", EMPTY: "empty" })[status] || "empty"
}
