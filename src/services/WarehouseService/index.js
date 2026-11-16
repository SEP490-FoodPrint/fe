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
   * Lập phiếu yêu cầu nhập hàng khô gửi tới Nhà cung cấp trực tiếp lên Backend Database
   * API: POST /supply-requests & POST /supply-requests/:id/send
   */
  async createDryOrder(orderPayload) {
    try {
      const orders = Array.isArray(orderPayload) ? orderPayload : [orderPayload]
      const results = []

      // 1. Tải danh mục ingredient-entries và active contracts của trường từ Backend
      const [entriesRes, pRes] = await Promise.all([
        http.get("/ingredient-entries", { params: { limit: 100 }, notifyOnError: false }).catch(() => null),
        http.get("/supplier-partnerships", { params: { status: "ACTIVE", page: 1, limit: 100 }, notifyOnError: false }).catch(() => null),
      ])
      const entries = Array.isArray(entriesRes?.data?.items) ? entriesRes.data.items : Array.isArray(entriesRes?.data) ? entriesRes.data : []
      const partnerships = Array.isArray(pRes?.data?.items) ? pRes.data.items : []

      for (const order of orders) {
        const itemsList = order.items || []
        if (itemsList.length === 0) continue

        // Gom mặt hàng theo từng nhà cung cấp (supplierId)
        const itemsBySupplier = {}
        itemsList.forEach(it => {
          const sId = it.supplierId || order.supplierId
          if (!sId) return
          if (!itemsBySupplier[sId]) itemsBySupplier[sId] = []
          itemsBySupplier[sId].push(it)
        })

        const supplierEntries = Object.entries(itemsBySupplier)
        for (let i = 0; i < supplierEntries.length; i++) {
          const [sId, sItems] = supplierEntries[i]
          const reqNo = supplierEntries.length > 1 ? `${order.orderNo}-${i + 1}` : order.orderNo
          const requestedDeliveryDate =
            order.deliveryDate ||
            String(order.deliverySchedule || "").match(/\d{4}-\d{2}-\d{2}/)?.[0] ||
            new Date(Date.now() + 86400000).toISOString().slice(0, 10)

          const noteText = order.deliverySchedule
            ? `Lịch hẹn giao: ${order.deliverySchedule}. ${order.note || ""}`.trim()
            : order.note || "Phiếu nhập đồ khô kho trường"

          const payload = {
            supplierId: sId,
            requestNo: reqNo,
            requestedDeliveryDate,
            note: noteText,
            items: sItems.map(it => {
              // Tìm ingredientEntryId chuẩn từ DB
              let entryId = it.ingredientEntryId || it.id
              const match = entries.find(
                e => e.id === entryId || e.ingredientId === it.id || e.ingredientId === it.ingredientId
              )
              if (match) entryId = match.id
              return {
                ingredientEntryId: entryId,
                quantity: Math.max(0.001, Number(Number(it.qty || it.quantity || 1).toFixed(3))),
              }
            }),
          }

          const res = await http.post("/supply-requests", payload, { notifyOnError: true })
          const draft = res?.data || res

          // Tự động gửi đơn (DRAFT → SENT) để NCC thấy được đơn
          if (draft?.id) {
            const partnership = partnerships.find(p => (p.supplier?.id || p.supplierId) === sId)
            const contracts = partnership?.contracts || []
            const activeContract = contracts.find(c => c.status === "ACTIVE" && c.eligible !== false)
            if (activeContract?.id) {
              await http.post(
                `/supply-requests/${draft.id}/send`,
                { contractId: activeContract.id },
                { notifyOnError: false }
              ).catch(() => null)
            }
          }
          results.push(draft)
        }
      }
      return results
    } catch (err) {
      console.error("[WarehouseService] Lỗi khi tạo đơn nhập hàng khô lên DB:", err)
      throw err
    }
  },
}

export default WarehouseService
