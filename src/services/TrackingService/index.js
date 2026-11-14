import http from "../01_axios"
import { adaptTrackingOrder } from "./adapter"

const TrackingService = {
  /**
   * Lấy danh sách đợt giao hàng từ Database để theo dõi tiến trình
   * API: GET /api/deliveries
   */
  async getTrackingOrders(params = {}) {
    try {
      const response = await http.get("/deliveries", {
        params: { limit: 100, ...params },
        notifyOnError: false,
      })
      const data = response?.data || response
      const items = Array.isArray(data) ? data : data?.items || []
      return items.map(adaptTrackingOrder).filter(Boolean)
    } catch (err) {
      console.warn("Lỗi khi tải dữ liệu theo dõi đơn hàng:", err)
      return []
    }
  },

  /**
   * Lấy thông tin chi tiết một đợt giao hàng kèm nguyên liệu và biên bản kiểm tra
   * API: GET /api/deliveries/:id/inspection
   */
  async getDeliveryDetail(id) {
    if (!id) return null
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
