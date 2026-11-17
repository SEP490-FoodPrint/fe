import http from "../01_axios"
import { adaptIngredientLot, buildWarehouseInventory } from "./adapter"

/**
 * Tải toàn bộ các trang dữ liệu từ API có phân trang (tuân thủ giới hạn limit <= 100 của Backend)
 */
const fetchAllPages = async (url, params = {}) => {
  let page = 1
  let allItems = []
  while (page <= 20) {
    const res = await http
      .get(url, {
        params: { ...params, page, limit: 100 },
        notifyOnError: false,
        skipAuthRedirect: true,
      })
      .catch(() => null)
    const data = res?.data || res
    const items = Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data)
        ? data
        : []
    allItems = allItems.concat(items)
    if (!data?.pagination?.hasNext || items.length < 100) {
      break
    }
    page++
  }
  return allItems
}

const getTodayStr = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())

const WarehouseService = {
  /**
   * Lấy danh sách các lô hàng lưu kho từ Database
   * API: GET /api/ingredient-lots
   */
  async getIngredientLots(params = {}) {
    try {
      const items = await fetchAllPages("/ingredient-lots", params)
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
      return await fetchAllPages("/ingredients")
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
      return await fetchAllPages("/ingredient-entries")
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

      // 1. Tải danh mục ingredient-entries, ingredients và active partnerships của trường từ Backend
      const [entries, partnerships, allIngredients] = await Promise.all([
        fetchAllPages("/ingredient-entries"),
        fetchAllPages("/supplier-partnerships", { status: "ACTIVE" }),
        fetchAllPages("/ingredients"),
      ])

      // Xây dựng danh bạ các IngredientEntry HỢP LỆ THẬT SỰ của trường trong DB
      const schoolActiveEntries = entries
        .filter((e) => e.status === "ACTIVE" || !e.status)
        .map((e) => {
          const ing = allIngredients.find((i) => i.id === e.ingredientId)
          return {
            entryId: e.id,
            ingredientId: e.ingredientId,
            supplierId: ing?.supplierId || ing?.Supplier?.id || "",
            supplierName: ing?.Supplier?.name || "Tổng kho Lương thực & Gia vị",
            name: ing?.name || "",
            normName: String(ing?.name || "").trim().toLowerCase(),
            unit: ing?.defaultUnit || "kg",
            handlingType: e.handlingType || "DRY_STOCK",
          }
        })
        .filter((e) => e.supplierId)

      const todayStr = getTodayStr()

      for (const order of orders) {
        const itemsList = order.items || []
        if (itemsList.length === 0) continue

        // Chuẩn hóa và ánh xạ từng mặt hàng với đúng IngredientEntry và SupplierId thực tế trong DB
        const resolvedItems = itemsList.map(it => {
          const itNorm = String(it.name || it.ingredientName || "").trim().toLowerCase()

          // Tìm entry hợp lệ trong DB của trường
          let targetEntry = schoolActiveEntries.find(
            e =>
              e.entryId === it.ingredientEntryId ||
              e.entryId === it.id ||
              e.ingredientId === it.ingredientId ||
              e.ingredientId === it.id
          )

          // Nếu chưa khớp ID, khớp qua tên và nhà cung cấp
          if (!targetEntry && itNorm) {
            if (it.supplierId) {
              targetEntry = schoolActiveEntries.find(
                e =>
                  e.supplierId === it.supplierId &&
                  (e.normName === itNorm || e.normName.includes(itNorm) || itNorm.includes(e.normName))
              )
            }
            if (!targetEntry) {
              targetEntry = schoolActiveEntries.find(
                e => e.normName === itNorm || e.normName.includes(itNorm) || itNorm.includes(e.normName)
              )
            }
          }

          // Fallback an toàn: chọn 1 entry đồ khô ACTIVE thật của trường
          if (!targetEntry) {
            targetEntry =
              schoolActiveEntries.find(e => e.handlingType === "DRY_STOCK" && e.supplierId === it.supplierId) ||
              schoolActiveEntries.find(e => e.handlingType === "DRY_STOCK") ||
              schoolActiveEntries[0]
          }

          const sId = targetEntry?.supplierId || it.supplierId || partnerships[0]?.supplier?.id || partnerships[0]?.supplierId || ""
          const sName = targetEntry?.supplierName || it.supplierName || "Nhà cung cấp đối tác"
          const entryId = targetEntry?.entryId || it.ingredientEntryId || it.id

          return {
            ...it,
            ingredientEntryId: entryId,
            supplierId: sId,
            supplierName: sName,
          }
        })

        // Gom mặt hàng theo từng nhà cung cấp (supplierId) thực tế
        const itemsBySupplier = {}
        resolvedItems.forEach(it => {
          const sId = it.supplierId
          if (!sId) return
          if (!itemsBySupplier[sId]) itemsBySupplier[sId] = []
          itemsBySupplier[sId].push(it)
        })

        const supplierEntries = Object.entries(itemsBySupplier)
        for (let i = 0; i < supplierEntries.length; i++) {
          const [sId, sItems] = supplierEntries[i]
          const baseOrderNo = order.orderNo || `PO-DRY-${todayStr.replace(/-/g, "")}`
          const uniqueSuffix = `${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`
          const reqNo =
            supplierEntries.length > 1
              ? `${baseOrderNo}-${uniqueSuffix}-${i + 1}`
              : `${baseOrderNo}-${uniqueSuffix}`

          const requestedDeliveryDate =
            order.deliveryDate ||
            String(order.deliverySchedule || "").match(/\d{4}-\d{2}-\d{2}/)?.[0] ||
            todayStr

          const noteText = order.deliverySchedule
            ? `Lịch hẹn giao: ${order.deliverySchedule}. ${order.note || ""}`.trim()
            : order.note || "Phiếu nhập đồ khô kho trường"

          // Loại bỏ các entryId trùng nhau trong cùng 1 request (cộng dồn số lượng)
          const mergedItemsMap = new Map()
          sItems.forEach(it => {
            const eId = it.ingredientEntryId
            const q = Math.max(0.001, Number(Number(it.qty || it.quantity || 1).toFixed(3)))
            if (mergedItemsMap.has(eId)) {
              mergedItemsMap.set(eId, Number((mergedItemsMap.get(eId) + q).toFixed(3)))
            } else {
              mergedItemsMap.set(eId, q)
            }
          })

          const payload = {
            supplierId: sId,
            requestNo: reqNo,
            requestedDeliveryDate,
            note: noteText,
            items: Array.from(mergedItemsMap.entries()).map(([ingredientEntryId, quantity]) => ({
              ingredientEntryId,
              quantity,
            })),
          }

          console.log(`[WarehouseService] Đang gửi POST /supply-requests cho NCC ${sId}:`, payload)
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
              ).catch((err) => {
                console.warn("[WarehouseService] Không thể gửi đơn sang NCC:", err?.response?.data?.message || err?.message)
              })
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
