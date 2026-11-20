// Kiểm tra ngày sản xuất (NSX) / hạn sử dụng (HSD) của lô hàng NCC giao, theo ngày Việt Nam.
export const DRY_MIN_SHELF_DAYS = 7

export const vietnamToday = (now = Date.now()) =>
  new Date(now + 7 * 3600 * 1000).toISOString().slice(0, 10)

export const vietnamDateAfterDays = (days, now = Date.now()) =>
  new Date(Date.parse(`${vietnamToday(now)}T00:00:00Z`) + days * 86400000).toISOString().slice(0, 10)

/**
 * Trả về thông báo lỗi đầu tiên (chuỗi rỗng nếu hợp lệ).
 * - Đồ khô (isDryStock + required): bắt buộc nhập cả NSX và HSD, HSD còn ít nhất 7 ngày.
 * - Mọi lô: NSX không sau hôm nay, HSD không trước NSX, HSD không trước hôm nay.
 */
export function lotDateError({ manufactureDate = "", expiryDate = "", isDryStock = false, required = false } = {}, now = Date.now()) {
  const today = vietnamToday(now)
  if (isDryStock && required && (!manufactureDate || !expiryDate))
    return "Đồ khô cần nhập ngày sản xuất và hạn sử dụng."
  if (manufactureDate && manufactureDate > today) return "Ngày sản xuất không được sau hôm nay."
  if (manufactureDate && expiryDate && expiryDate < manufactureDate)
    return "Hạn sử dụng phải sau hoặc bằng ngày sản xuất."
  if (expiryDate && expiryDate < today) return "Hạn sử dụng không được trước hôm nay."
  if (isDryStock && expiryDate && expiryDate < vietnamDateAfterDays(DRY_MIN_SHELF_DAYS, now))
    return `Đồ khô cần còn hạn sử dụng ít nhất ${DRY_MIN_SHELF_DAYS} ngày kể từ hôm nay.`
  return ""
}
