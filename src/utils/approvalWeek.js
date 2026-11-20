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

// Tên phạm vi áp dụng của một thực đơn: các khối hoặc toàn trường
export const menuScopeLabel = menu =>
  menu.isSchoolWide || !menu.grades?.length
    ? "Toàn trường"
    : menu.grades.map(grade => grade.name).join(", ")
