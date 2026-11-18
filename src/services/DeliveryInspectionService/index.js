import http from "../01_axios"

const unwrap = response => response?.data ?? response
export async function getDeliveryInspections(query = {}, signal) {
  const response = unwrap(await http.get("/deliveries/inspections", { params: query, signal, notifyOnError: false }))
  if (!Array.isArray(response?.items) || !response.pagination || !response.stats) throw new Error("Dữ liệu kiểm tra giao hàng không hợp lệ.")
  return response
}
// Tìm xe giao của trường từ nội dung tem QR (link truy xuất / mã QR lô) hoặc mã đợt giao.
export async function lookupDeliveryByCode(code) {
  const response = unwrap(await http.get("/deliveries/inspections/lookup", { params: { code }, notifyOnError: false }))
  if (!response?.id) throw new Error("Không tìm thấy xe giao với mã này.")
  return response
}
export async function getDeliveryInspection(id) {
  const response = unwrap(await http.get(`/deliveries/${id}/inspection`, { notifyOnError: false }))
  if (!response?.id || !Array.isArray(response.deliveryItems) || !Array.isArray(response.requiredRoles)) throw new Error("Không tải được chi tiết đợt giao.")
  return response
}
// Trường xác nhận xe đã đến (IN_TRANSIT → ARRIVED). Trả về chi tiết đợt giao kèm receiptIssue.
export async function confirmDeliveryArrival(id) {
  const response = unwrap(await http.post(`/deliveries/${id}/arrival`, {}, { notifyOnError: false }))
  if (!response?.id) throw new Error("Không xác nhận được xe đến.")
  return response
}
export async function decideDeliveryInspection(id, decision, reason, photo) {
  let payload = { decision, reason: reason?.trim() || null }
  if (photo) {
    payload = new FormData()
    payload.append("decision", decision)
    if (reason?.trim()) payload.append("reason", reason.trim())
    payload.append("photo", photo)
  }
  return unwrap(await http.post(`/deliveries/${id}/inspection`, payload, { notifyOnError: false }))
}

const neutral = { bg: "#f1f5f9", color: "#64748b", border: "#cbd5e1", dot: "#94a3b8" }
const green = { bg: "#eaf7f0", color: "#0a8066", border: "#bbf0da", dot: "#00654f" }
const warning = { bg: "#fef3c7", color: "#b45309", border: "#fde68a", dot: "#d97706" }
const danger = { bg: "#fee2e2", color: "#b91c1c", border: "#fecaca", dot: "#dc2626" }
export const DELIVERY_STATUS_CONFIG = {
  CREATED: { ...neutral, label: "Đã tạo" },
  IN_TRANSIT: { bg: "#e0f2fe", color: "#0369a1", border: "#bae6fd", dot: "#0284c7", label: "Đang vận chuyển", pulse: true },
  ARRIVED: { ...warning, label: "Đã đến trường" },
  PENDING_APPROVAL: { ...warning, label: "Chờ đủ 4 bên kiểm tra" },
  APPROVED: { ...green, label: "Đã phê duyệt" },
  REJECTED: { ...danger, label: "Bị từ chối" },
  RECEIVED: { ...green, label: "Đã tiếp nhận" },
  CANCELLED: { ...neutral, label: "Đã hủy" },
  CANCELLED_MEAL: { ...neutral, label: "Đã hủy theo quy trình" },
}
export const LOT_STATUS_CONFIG = {
  AVAILABLE: { ...green, label: "Có sẵn" },
  DEPLETED: { ...neutral, label: "Đã dùng hết" },
  BLOCKED: { ...danger, label: "Chưa được phép sử dụng" },
  EXPIRED: { ...danger, label: "Hết hạn" },
  DISPOSED: { ...neutral, label: "Đã tiêu hủy" },
}
