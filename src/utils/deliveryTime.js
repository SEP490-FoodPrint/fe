// Giờ giao của xe luôn hiển thị theo giờ Việt Nam, tách rõ giờ dự kiến (NCC hẹn) và giờ xe đến thực tế.
const VN_FORMAT = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Ho_Chi_Minh",
  hour: "2-digit",
  minute: "2-digit",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour12: false,
})

export function formatVnDateTime(value) {
  if (!value) return "--"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "--"
  const parts = Object.fromEntries(VN_FORMAT.formatToParts(d).map((p) => [p.type, p.value]))
  return `${parts.hour}:${parts.minute} • ${parts.day}/${parts.month}/${parts.year}`
}

/** Các dòng thời gian của một xe: "Dự kiến …" và (nếu đã đến) "Đã đến …". */
export function deliveryTimeLines(delivery) {
  const lines = [{ label: "Dự kiến", value: formatVnDateTime(delivery?.expectedArrivalAt) }]
  if (delivery?.arrivedAt) lines.push({ label: "Đã đến", value: formatVnDateTime(delivery.arrivedAt) })
  if (delivery?.receivedAt) lines.push({ label: "Nhập kho", value: formatVnDateTime(delivery.receivedAt) })
  return lines
}
