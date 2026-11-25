/** "0.2000" → "20"; "0.1250" → "12.5" */
export const rateToPercent = rate => {
  const value = Math.round(Number(rate || 0) * 10000) / 100
  return Number.isFinite(value) ? String(value) : "0"
}

/** Kiểm tra % nhập vào: 0 <= p < 100, tối đa 2 chữ số thập phân. Trả về tỷ lệ thập phân hoặc lỗi. */
export const parsePercent = text => {
  const normalized = String(text ?? "")
    .trim()
    .replace(",", ".")
  if (normalized === "") return { error: "Nhập tỷ lệ hoặc 0" }
  if (!/^\d+(\.\d{1,2})?$/.test(normalized))
    return { error: "Chỉ nhập số, tối đa 2 số lẻ" }
  const percent = Number(normalized)
  if (percent >= 100) return { error: "Phải nhỏ hơn 100%" }
  return { rate: Math.round(percent * 100) / 10000 }
}

/** Dòng có nội dung khác giá trị đã lưu (kể cả đang nhập sai). */
export const isDirty = (row, drafts) => {
  if (!(row.id in drafts)) return false
  const parsed = parsePercent(drafts[row.id])
  return (
    Boolean(parsed.error) ||
    Math.abs(parsed.rate - Number(row.wasteRate)) >= 1e-9
  )
}

/** Lượng sống cần cho 1 đơn vị thành phẩm: 1 / (1 − r). */
export const rawPerCooked = rate => (rate > 0 ? 1 / (1 - rate) : 1)
