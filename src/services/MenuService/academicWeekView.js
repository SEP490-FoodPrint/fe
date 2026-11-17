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
