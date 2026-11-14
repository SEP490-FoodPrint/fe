import http from "../01_axios"
import { adaptTrackingOrder } from "./adapter"
import { getStoredDeliveries } from "../deliveryStorage"

const TrackingService = {
  /**
   * Lấy danh sách đợt giao hàng từ Database để theo dõi tiến trình
   * Kết hợp cả các đợt giao nhận vừa được lập (Đợt 1, Đợt 2, Đồ khô)
   * API: GET /api/deliveries
   */
  async getTrackingOrders(params = {}) {
    // 1. Lấy các phiếu đã tạo từ storage
    const stored = getStoredDeliveries().map(adaptTrackingOrder).filter(Boolean)

    let apiAdapted = []
    try {
      const response = await http.get("/deliveries", {
        params: { limit: 100, ...params },
        notifyOnError: false,
      })
      const data = response?.data || response
      const items = Array.isArray(data) ? data : data?.items || []
      apiAdapted = items.map(adaptTrackingOrder).filter(Boolean)
    } catch (err) {
      console.warn("Lỗi khi tải dữ liệu theo dõi đơn hàng:", err)
    }

    // 2. Hợp nhất: Các phiếu vừa tạo lên đầu, tránh trùng lặp
    const existingIds = new Set(stored.map(d => d.id))
    const existingNos = new Set(stored.map(d => d.deliveryNo))
    return [
      ...stored,
      ...apiAdapted.filter(d => !existingIds.has(d.id) && !existingNos.has(d.deliveryNo)),
    ]
  },

  /**
   * Lấy thông tin chi tiết một đợt giao hàng kèm nguyên liệu và biên bản kiểm tra
   * API: GET /api/deliveries/:id/inspection
   */
  async getDeliveryDetail(id) {
    if (!id) return null

    // Kiểm tra trong local storage trước
    const storedItem = getStoredDeliveries().find(
      d => d.id === id || d.deliveryNo === id
    )
    if (storedItem) {
      return adaptTrackingOrder(storedItem)
    }

    try {
      const response = await http.get(`/deliveries/${id}/inspection`, {
        notifyOnError: false,
      })
      const data = response?.data || response
      return adaptTrackingOrder(data)
    } catch (err) {
      console.warn(`Lỗi khi tải chi tiết đợt giao ${id}:`, err)
      return null
    }
  },
}

export default TrackingService
