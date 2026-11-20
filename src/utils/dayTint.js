// Màu nền nhạt cho các ngày học trong tuần, dùng chung cho các màn danh sách thực đơn.
// Ngày hôm nay vẫn giữ viền xanh riêng của từng màn.
// Tất cả các ngày dùng chung một màu vàng nhạt.
const DAY_TINT = "#fefce8"
const DAY_TINTS = { 1: DAY_TINT, 2: DAY_TINT, 3: DAY_TINT, 4: DAY_TINT, 5: DAY_TINT }

const weekdayOf = value => {
  if (typeof value === "number") return value
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    const day = new Date(`${value.slice(0, 10)}T00:00:00Z`).getUTCDay()
    return day === 0 ? 7 : day
  }
  const vn = typeof value === "string" && value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (vn) {
    const day = new Date(Date.UTC(+vn[3], +vn[2] - 1, +vn[1])).getUTCDay()
    return day === 0 ? 7 : day
  }
  return null
}

/** Màu nền của một ngày: số thứ (1 = Thứ Hai), ngày ISO "YYYY-MM-DD" hoặc "DD/MM/YYYY". */
export const dayTint = value => DAY_TINTS[weekdayOf(value)] || null

/** Style inline đặt biến CSS --day-tint cho thẻ ngày (không tô ngày nghỉ). */
export const dayTintStyle = (value, { holiday = false } = {}) => {
  const tint = holiday ? null : dayTint(value)
  return tint ? { "--day-tint": tint } : undefined
}
