import http from "../01_axios"

const unwrap = response => response?.data ?? response
export async function getDeliveryInspections(query = {}, signal) {
  const response = unwrap(await http.get("/deliveries/inspections", { params: query, signal, notifyOnError: false }))
  if (!Array.isArray(response?.items) || !response.pagination || !response.stats) throw new Error("Dữ liệu kiểm tra giao hàng không hợp lệ.")
  return response
}
export async function getDeliveryInspection(id) {
  const response = unwrap(await http.get(`/deliveries/${id}/inspection`, { notifyOnError: false }))
  if (!response?.id || !Array.isArray(response.deliveryItems) || !Array.isArray(response.requiredRoles)) throw new Error("Không tải được chi tiết đợt giao.")
  return response
}
export async function decideDeliveryInspection(id, decision, reason) {
  return unwrap(await http.post(`/deliveries/${id}/inspection`, { decision, reason: reason?.trim() || null }, { notifyOnError: false }))
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
