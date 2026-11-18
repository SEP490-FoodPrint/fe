import http from "../01_axios"
import { adaptTrackingOrder } from "./adapter"

const PAGE_LIMIT = 100
const MAX_PAGES = 50

// Đọc hết các trang của một API danh sách (page/limit, pagination.hasNext); dừng ở MAX_PAGES để tránh lặp vô hạn.
async function fetchAllPages(url, params = {}) {
  const items = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    const response = await http.get(url, { params: { ...params, page, limit: PAGE_LIMIT }, notifyOnError: false })
    const data = response?.data || response
    const rows = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []
    items.push(...rows)
    if (!data?.pagination?.hasNext) break
  }
  return items
}

const TrackingService = {
  /**
   * Lấy danh sách đợt giao hàng 100% từ Database (qua Backend API) để theo dõi tiến trình
   * Kết hợp cả các đợt giao nhận vừa được lập (Đợt 1, Đợt 2, Đồ khô)
   * API: GET /deliveries & GET /supply-requests
   */
  async getTrackingOrders() {
    let deliveriesList = []
    let supplyList = []

    try {
      // Lấy đủ mọi trang (BE giới hạn 100 bản ghi/trang). Yêu cầu nhập lấy kèm mặt hàng, NCC,
      // ngày giao, ghi chú (?include=items) nên không phải gọi chi tiết từng đơn.
      const [delivItems, supplyItems] = await Promise.all([
        fetchAllPages("/deliveries").catch(() => []),
        fetchAllPages("/supply-requests", { include: "items" }).catch(() => []),
      ])

      deliveriesList = delivItems.map(adaptTrackingOrder).filter(Boolean)

      supplyList = supplyItems.map(so => {
        const isDry = so.requestNo?.includes("DRY") || so.requestNo?.includes("dry") || so.requestNo?.includes("PNK")
        const isB2 = so.requestNo?.includes("B2") || so.requestNo?.includes("-D2")
        const orderType = isDry ? "DRY_STOCK" : isB2 ? "FRESH_BATCH_2" : "FRESH_BATCH_1"

        // Giờ hẹn giao: lấy từ ghi chú của đơn, không có thì dùng giờ mặc định theo loại đơn (đồ khô 14:30, đợt 2 07:45, đợt 1 05:30).
        const timeMatch = String(so.note || "").match(/\b(\d{1,2}:\d{2})\b/)
        const deliveryTime = timeMatch ? timeMatch[1] : isDry ? "14:30" : isB2 ? "07:45" : "05:30"
        const dateStr = so.requestedDeliveryDate ? String(so.requestedDeliveryDate).slice(0, 10) : null

        const scheduleMatch = String(so.note || "").match(/Lịch hẹn giao:\s*([^.]+)/i)
        const deliverySchedule = scheduleMatch ? scheduleMatch[1].trim() : null

        const deliveryItems = (Array.isArray(so.items) ? so.items : []).map(it => {
          const q = Number(it.requestedQuantity ?? 0)
          return {
            id: it.id,
            ingredientEntryId: it.ingredientEntryId,
            ingredientName: it.ingredientName,
            name: it.ingredientName,
            qty: q,
            requestedQuantity: q,
            actualQuantity: q,
            orderedQty: q,
            unit: it.unit,
            spec: it.note || null,
            supplierId: so.supplierId,
            supplierName: so.supplierName,
            handlingType: it.handlingType,
          }
        })

        return adaptTrackingOrder({
          id: so.id,
          // Yêu cầu nhập chưa có chuyến giao: không tự ghép mã chuyến giao.
          deliveryNo: null,
          orderNo: so.requestNo,
          requestNo: so.requestNo,
          supplierId: so.supplierId,
          supplierName: so.supplierName,
          supplierPhone: so.supplierPhone || null,
          deliveryDate: dateStr,
          deliveryTime,
          deliverySchedule,
          requestedDeliveryDate: so.requestedDeliveryDate,
          createdAt: so.createdAt,
          batchType: isDry ? "DRY_STOCK" : isB2 ? "BATCH_2" : "BATCH_1",
          orderType,
          status: so.status === "ACCEPTED" ? "CONFIRMED" : (so.status === "DRAFT" || so.status === "SENT") ? "CREATED" : so.status,
          rawStatus: so.status,
          note: so.note || "",
          deliveryItems,
          items: deliveryItems,
        })
      }).filter(Boolean)
    } catch (err) {
      console.warn("Lỗi khi tải dữ liệu theo dõi đơn hàng từ Backend:", err)
    }

    // Gộp supply requests và deliveries, ưu tiên deliveries nếu cùng deliveryNo / orderNo / supplyRequestId
    const existingNos = new Set(deliveriesList.map(d => d.deliveryNo).filter(Boolean))
    const existingOrderNos = new Set(deliveriesList.map(d => d.orderNo).filter(Boolean))
    const existingSupplyRequestIds = new Set(deliveriesList.map(d => d.raw?.supplyRequestId || d.supplyRequestId).filter(Boolean))

    const uniqueSupply = supplyList.filter(
      s => !(s.deliveryNo && existingNos.has(s.deliveryNo)) && !existingOrderNos.has(s.orderNo) && !existingSupplyRequestIds.has(s.id)
    )

    // Hợp nhất sub-orders nếu có (ví dụ PO-DRY-...-1, PO-DRY-...-2)
    const groupedSupply = new Map()
    uniqueSupply.forEach(order => {
      const rawOrderNo = String(order.orderNo || "")
      const isSub = /-\d+$/.test(rawOrderNo)
      const baseOrderNo = isSub ? rawOrderNo.replace(/-\d+$/, "") : rawOrderNo
      const key = `${baseOrderNo}_${order.deliveryDate || ""}_${order.orderType || ""}`
      if (!groupedSupply.has(key)) groupedSupply.set(key, [])
      groupedSupply.get(key).push(order)
    })

    const consolidatedSupply = Array.from(groupedSupply.values()).map(group => {
      if (group.length === 1) return group[0]
      const first = group[0]
      const rawOrderNo = String(first.orderNo || "")
      const baseOrderNo = rawOrderNo.replace(/-\d+$/, "")
      const baseDeliveryNo = String(first.deliveryNo || "").replace(/-\d+$/, "")
      const allItems = []
      const supNames = new Set()
      group.forEach(g => {
        if (g.supplierName && g.supplierName !== "Nhà cung cấp đối tác") supNames.add(g.supplierName)
        if (Array.isArray(g.items)) {
          g.items.forEach(it => allItems.push({ ...it, supplierName: it.supplierName || g.supplierName }))
        }
      })
      const suppliersList = Array.from(supNames)
      return {
        ...first,
        id: first.id,
        groupId: `group-${baseOrderNo}`,
        orderNo: baseOrderNo,
        deliveryNo: baseDeliveryNo,
        supplierName:
          suppliersList.length > 1
            ? `${suppliersList.length} Nhà cung cấp (${suppliersList.join(", ")})`
            : suppliersList[0] || first.supplierName,
        suppliers: suppliersList,
        items: allItems,
        totalItems: allItems.length,
      }
    })

    return [...consolidatedSupply, ...deliveriesList]
  },

  /**
   * Lấy thông tin chi tiết một đợt giao hàng kèm nguyên liệu và biên bản kiểm tra từ Database
   * API: GET /deliveries/:id/inspection & GET /supply-requests/:id
   */
  async getDeliveryDetail(id) {
    if (!id) return null

    const isValidUuid =
      typeof id === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    if (isValidUuid) {
      try {
        const response = await http.get(`/deliveries/${id}/inspection`, {
          notifyOnError: false,
        })
        const data = response?.data || response
        if (data) return adaptTrackingOrder(data)
      } catch {
        // ignore
      }

      try {
        const [response, supRes] = await Promise.all([
          http.get(`/supply-requests/${id}`, { notifyOnError: false }),
          http.get("/suppliers", { notifyOnError: false }).catch(() => null),
        ])
        const data = response?.data || response
        const supData = supRes?.data || supRes
        const supplierMap = new Map((Array.isArray(supData) ? supData : (supData?.items || [])).map(s => [s.id, s.name]))

        if (data) {
          const so = data
          const isDry = so.requestNo?.includes("DRY") || so.requestNo?.includes("dry") || so.requestNo?.includes("PNK")
          const isB2 = so.requestNo?.includes("B2") || so.requestNo?.includes("-D2")
          const orderType = isDry ? "DRY_STOCK" : isB2 ? "FRESH_BATCH_2" : "FRESH_BATCH_1"
          const deliveryNo = isDry
            ? `PNK-${so.requestNo ? so.requestNo.replace("PO-DRY-", "").replace("PO-", "") : so.id}`
            : isB2
            ? `PN-${so.requestNo ? so.requestNo.replace("PO-", "").replace("-B2", "") : so.id}-D2`
            : `PN-${so.requestNo ? so.requestNo.replace("PO-", "") : so.id}-D1`

          const timeMatch = String(so.note || "").match(/\b(\d{1,2}:\d{2})\b/)
          const deliveryTime = timeMatch ? timeMatch[1] : isDry ? "14:30" : isB2 ? "07:45" : "05:30"
          const dateStr = so.requestedDeliveryDate
            ? String(so.requestedDeliveryDate).slice(0, 10)
            : so.createdAt
            ? String(so.createdAt).slice(0, 10)
            : new Date().toISOString().slice(0, 10)
          const scheduleMatch = String(so.note || "").match(/Lịch hẹn giao:\s*([^.]+)/i)
          const deliverySchedule = scheduleMatch ? scheduleMatch[1].trim() : `${deliveryTime} - Ngày ${dateStr}`

          const sName = so.supplierName || supplierMap.get(so.supplierId) || "Nhà cung cấp đối tác"

          const rawItems = Array.isArray(so.items) ? so.items : Array.isArray(so.supplyRequestItems) ? so.supplyRequestItems : []
          const deliveryItems = rawItems.map(it => {
            const q = Number(it.quantity ?? it.requestedQuantity ?? it.qty ?? 0)
            const n = it.ingredientName || it.name || it.IngredientEntry?.Ingredient?.name || "Nguyên liệu"
            return {
              id: it.id,
              ingredientEntryId: it.ingredientEntryId,
              ingredientName: n,
              name: n,
              qty: q,
              requestedQuantity: q,
              actualQuantity: q,
              orderedQty: q,
              unit: it.unit || "kg",
              spec: it.spec || it.note || "Bao bì nguyên đai nguyên kiện, hạn sử dụng rõ ràng",
              supplierId: it.supplierId || so.supplierId,
              supplierName: it.supplierName || sName,
              handlingType: isDry ? "DRY_STOCK" : "DIRECT_USE",
            }
          })

          return adaptTrackingOrder({
            id: so.id,
            deliveryNo,
            orderNo: so.requestNo,
            supplierId: so.supplierId,
            supplierName: sName,
            supplierPhone: so.supplierPhone || "--",
            deliveryDate: dateStr,
            deliveryTime,
            deliverySchedule,
            expectedArrivalAt: so.requestedDeliveryDate,
            batchType: isDry ? "DRY_STOCK" : isB2 ? "BATCH_2" : "BATCH_1",
            orderType,
            status: so.status === "ACCEPTED" ? "CONFIRMED" : (so.status === "DRAFT" || so.status === "SENT") ? "CREATED" : so.status,
            rawStatus: so.status,
            note: so.note || (isDry ? "Đồ khô kho trường" : "Thực phẩm tươi sống dùng trong ngày"),
            deliveryItems,
            items: deliveryItems,
          })
        }
      } catch (err) {
        console.warn(`Lỗi khi tải chi tiết đợt giao ${id}:`, err)
      }
    }

    return null
  },
}

export default TrackingService
