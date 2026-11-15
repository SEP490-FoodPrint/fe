/**
 * Delivery Storage Service
 * Lưu trữ và đồng bộ các phiếu giao nhận được tạo trên hệ thống vào localStorage
 * Đảm bảo các phiếu giao nhận (Đợt 1, Đợt 2, Đồ khô) vừa tạo hiển thị ngay lập tức
 * trên cả bảng Phiếu giao nhận và Bảng Theo dõi đơn hàng & Vận chuyển.
 */

const STORAGE_KEY = "foodprint_created_deliveries"

export function getStoredDeliveries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map(item => {
      // Chuẩn hóa các đơn mới tạo ở FE về đúng trạng thái khởi tạo
      if (item.batchType === "DRY_STOCK" && item.status === "IN_TRANSIT") {
        return {
          ...item,
          status: "CREATED",
          statusLabel: "Chờ NCC xác nhận",
        }
      }
      return item
    })
  } catch (err) {
    console.warn("Lỗi đọc created deliveries từ localStorage:", err)
    return []
  }
}

export function saveStoredDelivery(delivery) {
  try {
    if (!delivery || (!delivery.id && !delivery.deliveryNo)) return []
    const current = getStoredDeliveries()
    // Lọc bỏ record cũ có cùng id hoặc deliveryNo
    const filtered = current.filter(d => {
      if (delivery.id && d.id === delivery.id) return false
      if (delivery.deliveryNo && d.deliveryNo === delivery.deliveryNo) return false
      return true
    })
    const next = [delivery, ...filtered]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    return next
  } catch (err) {
    console.warn("Lỗi lưu delivery vào localStorage:", err)
    return []
  }
}

export function clearStoredDeliveries() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (err) {
    console.warn("Lỗi xóa created deliveries trong localStorage:", err)
  }
}
