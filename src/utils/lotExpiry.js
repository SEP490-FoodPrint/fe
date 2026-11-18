import { vietnamTodayISO } from "src/utils/menuDays"

// Lô còn ≤ số ngày này đến hạn dùng thì cảnh báo "Sắp hết hạn".
export const NEAR_EXPIRY_DAYS = 3

// "2027-05-03" (hoặc ISO có giờ) -> "03/05/2027"; không có ngày -> "—".
export function formatLotDate(value) {
  const iso = String(value || "").slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "—"
  const [y, m, d] = iso.split("-")
  return `${d}/${m}/${y}`
}

// Số ngày từ hôm nay (giờ VN) đến hạn dùng; âm nghĩa là đã quá hạn. Không có hạn -> null.
export function daysUntilExpiry(expiryDate, today = vietnamTodayISO()) {
  const iso = String(expiryDate || "").slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null
  return Math.round((Date.parse(iso) - Date.parse(today)) / 86400000)
}

// Mức cảnh báo theo số ngày còn lại: expired | near | ok | none.
export function expiryTone(daysLeft) {
  if (daysLeft === null || daysLeft === undefined) return "none"
  if (daysLeft < 0) return "expired"
  if (daysLeft <= NEAR_EXPIRY_DAYS) return "near"
  return "ok"
}

const IN_STOCK_STATUSES = new Set(["AVAILABLE", "RELEASED", "EXPIRED"])

/**
 * Hạn dùng sớm nhất của các lô còn hàng trong kho (kể cả lô đã quá hạn nhưng còn tồn, để cảnh báo đỏ).
 * Lô chưa nhập kho (BLOCKED) không tính vào tồn, chỉ báo lại hạn sớm nhất của chúng ở `pendingExpiry`.
 */
export function nearestLotExpiry(lots = []) {
  const earliest = rows =>
    rows
      .map(lot => String(lot.expiryDate || "").slice(0, 10))
      .filter(Boolean)
      .sort()[0] || null
  const inStock = lots.filter(lot => IN_STOCK_STATUSES.has(lot.status) && Number(lot.availableQuantity) > 0)
  const pending = lots.filter(lot => lot.status === "BLOCKED")
  return { expiry: earliest(inStock), pendingExpiry: earliest(pending) }
}
