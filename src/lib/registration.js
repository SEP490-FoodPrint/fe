export const REQUEST_TYPES = { SCHOOL: "Trường học", SUPPLIER: "Nhà cung cấp" }
export const REQUEST_STATUSES = { PENDING: "Chờ duyệt", APPROVED: "Đã duyệt", REJECTED: "Từ chối" }

export const requestCode = id => String(id || "—")
export const organizationName = request => request?.profile_data?.name || request?.profile_data?.organizationName || "Chưa cung cấp"

export function formatRequestDate(value, withTime = false) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  const day = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh",
  }).format(date)
  if (!withTime) return day
  const time = new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Ho_Chi_Minh",
  }).format(date)
  return `${day} · ${time}`
}

export function requestDateKey(value) {
  return formatRequestDate(value).split("/").reverse().join("-")
}

export const normalizeRequestSearch = value => String(value || "")
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replaceAll("đ", "d").replaceAll("Đ", "D").toLowerCase().trim()
