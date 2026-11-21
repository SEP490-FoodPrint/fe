// Ngày ISO (YYYY-MM-DD) → dd/mm/yyyy, không phụ thuộc múi giờ trình duyệt
const parts = iso => String(iso).slice(0, 10).split("-")

export const formatDate = iso => {
  const [year, month, day] = parts(iso)
  return `${day}/${month}/${year}`
}

// { weekStartDate, weekEndDate } → "02/11 – 06/11/2026"
export const formatWeekRange = ({ weekStartDate, weekEndDate }) => {
  const [, startMonth, startDay] = parts(weekStartDate)
  return `${startDay}/${startMonth} – ${formatDate(weekEndDate)}`
}

// Nhãn tuần ở bộ lọc: "Tuần 12 (23/11 – 27/11/2026)"; thiếu số tuần thì chỉ hiện khoảng ngày
export const weekLabel = week =>
  week.weekNumber ? `Tuần ${week.weekNumber} (${formatWeekRange(week)})` : `Tuần ${formatWeekRange(week)}`

// Tên phạm vi áp dụng của một thực đơn: các khối hoặc toàn trường
export const menuScopeLabel = menu =>
  menu.isSchoolWide || !menu.grades?.length
    ? "Toàn trường"
    : menu.grades.map(grade => grade.name).join(", ")
