import http from "../01_axios"
import { adaptTrackingOrder } from "./adapter"

const PAGE_LIMIT = 100
const MAX_PAGES = 50

const getTodayStr = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())

const formatDateVN = (dateInput) => {
  if (!dateInput) return ""
  const str = String(dateInput).trim()
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`
  }
  return str
}

const formatTimeStr = (isoString) => {
  if (!isoString) return ""
  try {
    const d = new Date(isoString)
    if (!isNaN(d.getTime())) {
      const hours = String(d.getHours()).padStart(2, "0")
      const minutes = String(d.getMinutes()).padStart(2, "0")
      return `${hours}:${minutes}`
    }
  } catch {
    // ignore
  }
  return ""
}

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

    // -------------------------------------------------------------
    // GOM NHÓM ĐỒNG BỘ: HỢP NHẤT SUPPLY REQUESTS & DELIVERIES THÀNH 1 PHIẾU NHẬP HÀNG TỔNG
    // Mỗi đợt nhập đồ khô cho 1 ngày chỉ có DUY NHẤT 1 phiếu mang mã chuẩn PN-...
    // Dù các NCC có xác nhận lệch giờ nhau, tất cả các xe đều được gộp chung vào phiếu này.
    // -------------------------------------------------------------
    const getBaseOrderNo = (item) => {
      const candidates = [
        item.orderNo,
        item.requestNo,
        item.deliveryNo,
        item.raw?.supplyRequestId,
        item.raw?.requestNo,
        item.SupplyRequest?.requestNo,
      ]
      for (const c of candidates) {
        if (!c) continue
        const s = String(c).trim()
        if (/^PN-/i.test(s) || /^PNK-/i.test(s) || /^PO-/i.test(s)) {
          return s.replace(/^PO-/i, "PN-").replace(/-\d+$/, "")
        }
      }
      for (const c of candidates) {
        if (!c) continue
        const s = String(c).trim()
        if (!/^FP-/i.test(s)) {
          return s.replace(/^DEL-/, "PN-").replace(/-\d+$/, "")
        }
      }
      return ""
    }

    const masterGroups = new Map()

    const addToGroup = (item, isDeliveryRecord) => {
      if (!item) return
      const baseNo = getBaseOrderNo(item)
      const date = item.deliveryDate || ""
      const orderType = item.orderType || item.batchType || "DRY_STOCK"
      const key = baseNo ? `${baseNo}_${orderType}` : `${date}_${orderType}`

      if (!masterGroups.has(key)) {
        masterGroups.set(key, {
          baseNo,
          date,
          orderType,
          deliveries: [],
          supplyRequests: [],
        })
      }

      const g = masterGroups.get(key)
      if (isDeliveryRecord) {
        g.deliveries.push(item)
      } else {
        g.supplyRequests.push(item)
      }
    }

    deliveriesList.forEach((d) => addToGroup(d, true))
    supplyList.forEach((s) => addToGroup(s, false))

    const consolidatedDeliveries = Array.from(masterGroups.values()).map(
      (group) => {
        const { baseNo, date, orderType, deliveries, supplyRequests } = group
        const rep = deliveries[0] || supplyRequests[0] || {}
        const finalDeliveryNo =
          baseNo ||
          `PN-DRY-${String(rep.deliveryNo || rep.orderNo || date).replace(/-\d+$/, "").replace(/^PO-|^DEL-|^FP-DE-/, "")}`

        const supplierMap = new Map()

        supplyRequests.forEach((so) => {
          const sName =
            so.supplierName && so.supplierName !== "Nhà cung cấp đối tác"
              ? so.supplierName
              : "Nhà cung cấp đối tác"
          const norm = sName.toLowerCase().trim()
          if (!supplierMap.has(norm)) {
            supplierMap.set(norm, {
              name: sName,
              id: so.supplierId,
              supplyItem: so,
              deliveryItem: null,
            })
          } else {
            const entry = supplierMap.get(norm)
            if (!entry.supplyItem) entry.supplyItem = so
            if (!entry.id && so.supplierId) entry.id = so.supplierId
          }
        })

        deliveries.forEach((deliv) => {
          const sName =
            deliv.supplierName && deliv.supplierName !== "Nhà cung cấp đối tác"
              ? deliv.supplierName
              : ""
          let matchedKey = null

          if (sName) {
            const norm = sName.toLowerCase().trim()
            if (supplierMap.has(norm)) {
              matchedKey = norm
            } else {
              for (const [k, v] of supplierMap.entries()) {
                if (
                  (deliv.supplierId && v.id === deliv.supplierId) ||
                  norm.includes(k) ||
                  k.includes(norm)
                ) {
                  matchedKey = k
                  break
                }
              }
            }
          }

          if (matchedKey) {
            const entry = supplierMap.get(matchedKey)
            entry.deliveryItem = deliv
          } else {
            const norm = (sName || `NCC-${deliv.supplierId || deliveries.indexOf(deliv) + 1}`).toLowerCase().trim()
            supplierMap.set(norm, {
              name: sName || "Nhà cung cấp đối tác",
              id: deliv.supplierId,
              supplyItem: null,
              deliveryItem: deliv,
            })
          }
        })

        const allItems = []
        const supNames = []
        const transportsBySupplier = {}
        const subOrderIds = []
        const deliveryIds = []

        let vehicleIdx = 0
        let anyInTransit = false
        let anyArrived = false
        let allApproved = true
        let anyConfirmed = false

        const entries = Array.from(supplierMap.values())
        if (entries.length === 0) {
          allApproved = false
        }

        entries.forEach((entry) => {
          vehicleIdx++
          const sName = entry.name
          supNames.push(sName)

          if (entry.supplyItem?.id) subOrderIds.push(entry.supplyItem.id)
          if (entry.deliveryItem?.id) deliveryIds.push(entry.deliveryItem.id)

          const srcItems =
            entry.deliveryItem?.items && entry.deliveryItem.items.length > 0
              ? entry.deliveryItem.items
              : entry.supplyItem?.items || []

          srcItems.forEach((it) => {
            allItems.push({
              ...it,
              supplierName: it.supplierName || sName,
              supplierId: it.supplierId || entry.id,
            })
          })

          if (entry.deliveryItem) {
            const d = entry.deliveryItem
            anyConfirmed = true
            if (d.status === "IN_TRANSIT") anyInTransit = true
            if (d.status === "ARRIVED" || d.status === "INSPECTING") anyArrived = true
            if (
              d.status !== "APPROVED" &&
              d.status !== "RECEIVED" &&
              d.status !== "COMPLETED"
            ) {
              allApproved = false
            }

            const expectedTimeStr = d.expectedArrivalAt
              ? `${formatTimeStr(d.expectedArrivalAt)} — Ngày ${formatDateVN(d.expectedArrivalAt)}`
              : d.deliverySchedule || (d.deliveryTime ? `${d.deliveryTime} — Ngày ${formatDateVN(d.deliveryDate || date)}` : "Chờ NCC cập nhật")

            transportsBySupplier[sName] = {
              supplierId: entry.id,
              supplierName: sName,
              driver:
                d.driverName && !d.driverName.includes("Chờ")
                  ? `${d.driverName}${d.driverPhone && d.driverPhone !== "--" && !d.driverName.includes("(") ? ` (${d.driverPhone})` : ""}`
                  : d.vehiclePlate ? "Tài xế NCC" : "Chưa phân công (Chờ NCC điều xe)",
              phone: d.driverPhone || "--",
              vehicle: d.vehiclePlate || "Chưa phân công (Chờ NCC điều xe)",
              expectedTime: expectedTimeStr,
              qrCode:
                d.supplierDeliveryNo ||
                d.deliveryQr ||
                d.deliveryNo ||
                `QR-LOT-${finalDeliveryNo}-${String(vehicleIdx).padStart(2, "0")}`,
              status: d.status,
              hasDispatched: Boolean(
                d.vehiclePlate ||
                d.status === "IN_TRANSIT" ||
                d.status === "ARRIVED" ||
                d.status === "APPROVED",
              ),
              note: d.note || "",
            }
          } else {
            allApproved = false
            transportsBySupplier[sName] = {
              supplierId: entry.id,
              supplierName: sName,
              driver: "Chưa phân công (Chờ NCC điều xe)",
              phone: "--",
              vehicle: "Chưa phân công (Chờ NCC điều xe)",
              expectedTime: entry.supplyItem?.deliverySchedule || "Chờ NCC cập nhật",
              qrCode: `QR-PENDING-${finalDeliveryNo}-${String(vehicleIdx).padStart(2, "0")}`,
              status: entry.supplyItem?.status || "CREATED",
              hasDispatched: false,
              note: "",
            }
          }
        })

        let masterStatus = "CREATED"
        let masterStatusLabel = "Chờ NCC xác nhận"

        if (allApproved && entries.length > 0) {
          masterStatus = "COMPLETED"
          masterStatusLabel = "Đã hoàn tất"
        } else if (anyArrived) {
          masterStatus = "ARRIVED"
          masterStatusLabel = "Đã tới trường (Chờ kiểm duyệt)"
        } else if (anyInTransit) {
          masterStatus = "IN_TRANSIT"
          masterStatusLabel = "Đang giao"
        } else if (anyConfirmed) {
          masterStatus = "CONFIRMED"
          masterStatusLabel = "NCC đã xác nhận"
        }

        return {
          ...rep,
          id: deliveries[0]?.id || supplyRequests[0]?.id || finalDeliveryNo,
          deliveryNo: finalDeliveryNo,
          orderNo: finalDeliveryNo,
          deliveryDate: date || rep.deliveryDate || getTodayStr(),
          deliverySchedule: rep.deliverySchedule || "Chờ NCC cập nhật",
          batchType: orderType,
          orderType: orderType,
          supplierName:
            supNames.length > 1
              ? `${supNames.length} Nhà cung cấp (${supNames.join(", ")})`
              : supNames[0] || rep.supplierName || "Nhà cung cấp đối tác",
          suppliers: supNames,
          items: allItems,
          deliveryItems: allItems,
          totalItems: allItems.length,
          transportsBySupplier,
          status: masterStatus,
          statusLabel: masterStatusLabel,
          subOrderIds,
          deliveryIds,
        }
      },
    )

    return consolidatedDeliveries
  },

  /**
   * Lấy thông tin chi tiết một đợt giao hàng kèm nguyên liệu và biên bản kiểm tra từ Database
   * API: GET /deliveries/:id/inspection & GET /supply-requests/:id
   */
  async getDeliveryDetail(id) {
    if (!id) return null

    // 1. Tìm trong danh sách master tracking orders đã gộp chuẩn
    try {
      const allOrders = await this.getTrackingOrders()
      const matched = (allOrders || []).find(
        m =>
          m.id === id ||
          m.deliveryNo === id ||
          m.orderNo === id ||
          m.subOrderIds?.includes(id) ||
          m.deliveryIds?.includes(id)
      )
      if (matched) return matched
    } catch {
      // fallback
    }
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
