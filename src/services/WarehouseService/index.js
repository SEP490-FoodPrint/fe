import http from "../01_axios"
import { adaptIngredientLot, buildWarehouseInventory } from "./adapter"

const WarehouseService = {
  /**
   * Lấy danh sách các lô hàng lưu kho từ Database
   * API: GET /api/ingredient-lots
   */
  async getIngredientLots(params = {}) {
    try {
      const response = await http.get("/ingredient-lots", {
        params: { limit: 100, ...params },
        notifyOnError: false,
      })
      const data = response?.data || response
      const items = Array.isArray(data) ? data : (data?.items || [])
      return items.map(adaptIngredientLot)
    } catch (err) {
      console.warn("Lỗi khi tải danh sách lô hàng:", err)
      return []
    }
  },

  /**
   * Lấy danh mục nguyên liệu từ Database
   * API: GET /api/ingredients
   */
  async getIngredients() {
    try {
      const response = await http.get("/ingredients", {
        params: { limit: 100 },
        notifyOnError: false,
      })
      const data = response?.data || response
      return Array.isArray(data) ? data : (data?.items || [])
    } catch (err) {
      console.warn("Lỗi khi tải danh mục nguyên liệu:", err)
      return []
    }
  },

  /**
   * Lấy danh sách phân loại nguyên liệu của trường (DRY_STOCK vs DIRECT_USE)
   * API: GET /api/ingredient-entries
   */
  async getIngredientEntries() {
    try {
      const response = await http.get("/ingredient-entries", {
        params: { limit: 100 },
        notifyOnError: false,
      })
      const data = response?.data || response
      return Array.isArray(data) ? data : (data?.items || [])
    } catch (err) {
      console.warn("Lỗi khi tải danh mục phân loại nguyên liệu trường:", err)
      return []
    }
  },

  /**
   * Lấy danh sách nhà cung cấp từ Database
   * API: GET /api/suppliers
   */
  async getSuppliers() {
    try {
      const response = await http.get("/suppliers", { notifyOnError: false })
      const data = response?.data || response
      return Array.isArray(data) ? data : (data?.items || [])
    } catch (err) {
      console.warn("Lỗi khi tải danh sách nhà cung cấp:", err)
      return []
    }
  },

  /**
   * Tải toàn bộ dữ liệu tồn kho HÀNG KHÔ (Chỉ lấy DRY_STOCK, loại trừ đồ tươi sống)
   */
  async getWarehouseInventory() {
    try {
      const [lots, ingredients, suppliers, entries] = await Promise.all([
        this.getIngredientLots(),
        this.getIngredients(),
        this.getSuppliers(),
        this.getIngredientEntries(),
      ])

      const { items, stats } = buildWarehouseInventory(lots, ingredients, suppliers, entries)
      return {
        items,
        stats,
        lots,
        suppliers,
      }
    } catch (err) {
      console.warn("Lỗi khi tổng hợp dữ liệu kho hàng khô:", err)
      return {
        items: [],
        stats: { total: 0, criticalLowCount: 0, warningCount: 0, safeStockCount: 0 },
        lots: [],
        suppliers: [],
      }
    }
  },

  /**
   * Lập phiếu yêu cầu nhập hàng khô gửi tới Nhà cung cấp
   * API: POST /api/supply-requests
   */
  async createDryOrder(payload) {
    try {
      const response = await http.post("/supply-requests", payload, {
        notifyOnError: true,
      })
      return response?.data || response
    } catch (err) {
      console.warn("Lỗi khi tạo đơn nhập hàng khô:", err)
      throw err
    }
  },
}

export default WarehouseService
