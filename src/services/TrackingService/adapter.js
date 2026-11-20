/**
 * TrackingService Adapter
 * Chuyển đổi dữ liệu từ API /api/deliveries sang cấu trúc chuẩn cho giao diện Theo Dõi Đơn Hàng (OrderTracking)
 */
import { batchTypeOf, BATCH_TYPE } from "../../utils/supplyBatch"

const WEEKDAY_NAMES = [
  "Chủ Nhật",
  "Thứ Hai",
  "Thứ Ba",
  "Thứ Tư",
  "Thứ Năm",
  "Thứ Sáu",
  "Thứ Bảy",
]

const DRY_KEYWORDS = [
  "gạo",
  "dầu ăn",
  "nước mắm",
  "hạt nêm",
  "đường",
  "muối",
  "tiêu",
  "bột canh",
  "bột ngọt",
  "mì chính",
  "tương",
  "xì dầu",
  "ngũ cốc",
  "đỗ",
  "đậu xanh",
  "đậu đen",
  "miến",
  "bún khô",
  "phở khô",
]

/**
 * Định dạng ngày giờ thân thiện theo chuẩn tiếng Việt: 05:30 - Thứ Ba 27/10/2026
 */
export function formatVietnameseDateTime(dateInput) {
  if (!dateInput) return "Chưa ấn định"
  const d = new Date(dateInput)
  if (isNaN(d.getTime())) return String(dateInput)
  const hours = String(d.getHours()).padStart(2, "0")
  const minutes = String(d.getMinutes()).padStart(2, "0")
  const dayName = WEEKDAY_NAMES[d.getDay()]
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()
  return `${hours}:${minutes} - ${dayName} ${day}/${month}/${year}`
}

/**
 * Định dạng Lịch hẹn giao chuẩn xác: 14:30 - Thứ Ba 17/11/2026
 * Tránh lỗi lệch múi giờ (07:00 do UTC 00:00Z) hoặc hardcode ngày
 */
export function formatDeliverySchedule(delivery, orderType) {
  if (!delivery) return "Chưa ấn định"

  const note = String(delivery.note || "")
  const scheduleInput = String(delivery.deliverySchedule || "")

  // 1. Tìm giờ hẹn: từ deliveryTime -> note/deliverySchedule -> expectedArrivalAt -> mặc định theo loại đơn
  let targetTime = ""
  if (delivery.deliveryTime && String(delivery.deliveryTime).includes(":")) {
    targetTime = String(delivery.deliveryTime).trim()
  } else {
    const timeMatch = (scheduleInput + " " + note).match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/)
    if (timeMatch) {
      targetTime = `${timeMatch[1].padStart(2, "0")}:${timeMatch[2]}`
    } else if (delivery.expectedArrivalAt) {
      const expD = new Date(delivery.expectedArrivalAt)
      if (!isNaN(expD.getTime())) {
        const h = expD.getHours()
        const m = expD.getMinutes()
        // Nếu không phải 00:00 UTC (tức 07:00 VN)
        if (h !== 0 && h !== 7) {
          targetTime = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
        }
      }
    }
  }

  // Giờ hẹn mặc định theo loại đơn khi không có dữ liệu: đồ khô 14:30, đợt 2 07:45, đợt 1 05:30.
  if (!targetTime) {
    const type = orderType?.type || delivery.orderType || delivery.batchType
    targetTime = type === "DRY_STOCK" ? "14:30" : type === "FRESH_BATCH_2" ? "07:45" : "05:30"
  }

  // 2. Tìm ngày hẹn
  let y = null
  let m = null
  let d = null

  // Ưu tiên ngày trong chuỗi deliverySchedule hoặc note nếu có dạng YYYY-MM-DD hoặc DD/MM/YYYY
  const isoMatch = (scheduleInput + " " + note).match(/\b(\d{4})-(\d{2})-(\d{2})\b/)
  const dmyMatch = (scheduleInput + " " + note).match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/)

  if (isoMatch) {
    y = Number(isoMatch[1])
    m = Number(isoMatch[2])
    d = Number(isoMatch[3])
  } else if (dmyMatch) {
    d = Number(dmyMatch[1])
    m = Number(dmyMatch[2])
    y = Number(dmyMatch[3])
  } else {
    const rawDateStr =
      delivery.deliveryDate ||
      delivery.requestedDeliveryDate ||
      delivery.expectedArrivalAt ||
      delivery.createdAt

    if (rawDateStr) {
      const rawIso = String(rawDateStr).match(/\b(\d{4})-(\d{2})-(\d{2})\b/)
      if (rawIso) {
        y = Number(rawIso[1])
        m = Number(rawIso[2])
        d = Number(rawIso[3])
      } else {
        const dt = new Date(rawDateStr)
        if (!isNaN(dt.getTime())) {
          y = dt.getFullYear()
          m = dt.getMonth() + 1
          d = dt.getDate()
        }
      }
    }
  }

  // Không có ngày hẹn thật thì không tự lấy ngày hôm nay.
  if (!y || !m || !d) return "Chưa ấn định"

  const [hours, minutes] = (targetTime || "00:00").split(":").map(Number)
  const dateObj = new Date(y, m - 1, d, hours || 0, minutes || 0)
  const dayName = WEEKDAY_NAMES[dateObj.getDay()] || "Thứ"
  const formattedDay = String(d).padStart(2, "0")
  const formattedMonth = String(m).padStart(2, "0")

  const dateText = `${dayName} ${formattedDay}/${formattedMonth}/${y}`
  return targetTime ? `${targetTime} - ${dateText}` : dateText
}

/**
 * Định dạng ngày giờ rút gọn: 27/10 05:30
 */
export function formatTimeShort(dateInput) {
  if (!dateInput) return ""
  const d = new Date(dateInput)
  if (isNaN(d.getTime())) return String(dateInput)
  const hours = String(d.getHours()).padStart(2, "0")
  const minutes = String(d.getMinutes()).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  return `${day}/${month} ${hours}:${minutes}`
}

/**
 * Xác định loại đơn hàng (Đồ tươi đợt 1 / đợt 2 / Đồ khô)
 */
export function determineOrderType(delivery) {
  // Nguồn sự thật: orderType + batchNo từ API; không đoán theo mã/ghi chú/giờ.
  switch (batchTypeOf(delivery)) {
    case BATCH_TYPE.DRY_STOCK:
      return { type: "DRY_STOCK", label: "Đồ khô & Gia vị" }
    case BATCH_TYPE.BATCH_2:
      return { type: "FRESH_BATCH_2", label: "Đồ tươi (Đợt 2 - Bù sĩ số)" }
    case BATCH_TYPE.BATCH_1:
      return { type: "FRESH_BATCH_1", label: "Đồ tươi (Đợt 1 - 05:30)" }
    default:
      return { type: "UNKNOWN", label: "Chưa xác định đợt" }
  }
}

/**
 * Ánh xạ trạng thái từ DB sang FE
 */
export function mapDeliveryStatus(dbStatus) {
  switch (dbStatus) {
    case "CREATED":
    case "PENDING":
      return {
        status: "CREATED",
        statusLabel: "Chờ NCC xác nhận",
      }
    case "ACCEPTED":
    case "CONFIRMED":
      return {
        status: "ACCEPTED",
        statusLabel: "NCC đã xác nhận",
      }
    case "IN_TRANSIT":
      return {
        status: "IN_TRANSIT",
        statusLabel: "Đang giao",
      }
    case "ARRIVED":
      return {
        status: "ARRIVED",
        statusLabel: "Đã tới trường (Chờ kiểm duyệt)",
      }
    case "RECEIVED":
      return {
        status: "COMPLETED",
        statusLabel: "Đã hoàn tất (Đã nhập kho)",
      }
    case "COMPLETED":
      return {
        status: "COMPLETED",
        statusLabel: "Đã hoàn tất",
      }
    case "REJECTED":
      return {
        status: "REJECTED",
        statusLabel: "Bị từ chối",
      }
    case "CANCELLED":
      return {
        status: "CANCELLED",
        statusLabel: "Đã hủy đơn",
      }
    default:
      return {
        status: "CREATED",
        statusLabel: "Chờ NCC xác nhận",
      }
  }
}

/**
 * Tính toán thời gian dự kiến (ETA)
 */
export function computeEta(dbStatus, expectedArrivalAt) {
  if (dbStatus === "ARRIVED") {
    return {
      etaMinutes: 0,
      etaText: "Xe đã tới trường (Chờ kiểm duyệt)",
    }
  }
  if (dbStatus === "RECEIVED" || dbStatus === "COMPLETED") {
    return {
      etaMinutes: 0,
      etaText: "Đã hoàn tất kiểm tra & nhập kho",
    }
  }
  if (dbStatus === "REJECTED") {
    return {
      etaMinutes: 0,
      etaText: "Đợt giao đã bị từ chối tiếp nhận",
    }
  }
  if (dbStatus === "CANCELLED") {
    return {
      etaMinutes: 0,
      etaText: "Đợt giao đã bị hủy",
    }
  }
  if (dbStatus === "IN_TRANSIT") {
    if (expectedArrivalAt) {
      const expDate = new Date(expectedArrivalAt)
      const now = new Date()
      const diffMs = expDate.getTime() - now.getTime()
      const diffMin = Math.round(diffMs / 60000)
      const timeStr = `${String(expDate.getHours()).padStart(2, "0")}:${String(
        expDate.getMinutes()
      ).padStart(2, "0")}`

      if (diffMin > 0) {
        return {
          etaMinutes: diffMin,
          etaText: `Dự kiến tới trường lúc ${timeStr} (còn ~${diffMin} phút)`,
        }
      } else {
        return {
          etaMinutes: 0,
          etaText: `Dự kiến tới trường lúc ${timeStr} (xe sắp tới)`,
        }
      }
    }
    return {
      etaMinutes: 15,
      etaText: "Xe đang trên đường đến trường (còn ~15 phút)",
    }
  }

  return {
    etaMinutes: 60,
    etaText: "NCC đang đóng gói & chuẩn bị xuất xe tại kho",
  }
}

/**
 * Xây dựng timeline tiến trình 4 bước dựa theo mốc thời gian thực tế
 */
export function buildTimeline(delivery, mappedStatus) {
  const createdTime = formatTimeShort(delivery?.createdAt)
  const expectedTime = delivery?.expectedArrivalAt
    ? formatTimeShort(delivery.expectedArrivalAt)
    : "Hẹn giờ"
  const arrivedTime = delivery?.arrivedAt
    ? formatTimeShort(delivery.arrivedAt)
    : expectedTime
  const receivedTime = delivery?.receivedAt
    ? formatTimeShort(delivery.receivedAt)
    : arrivedTime

  const rawStatus = delivery?.status || ""
  const isAccepted = [
    "ACCEPTED",
    "CONFIRMED",
    "IN_TRANSIT",
    "ARRIVED",
    "COMPLETED",
    "RECEIVED",
  ].includes(rawStatus)
  const isInTransit = ["IN_TRANSIT", "ARRIVED", "COMPLETED", "RECEIVED"].includes(
    rawStatus
  )
  const isArrived = ["ARRIVED", "COMPLETED", "RECEIVED"].includes(rawStatus)

  return [
    {
      step: 1,
      title: "Tạo phiếu",
      time: createdTime || "Đã tạo",
      done: true,
      current: rawStatus === "CREATED" || rawStatus === "PENDING",
    },
    {
      step: 2,
      title: "NCC xác nhận",
      time: isAccepted ? createdTime || "Đã xác nhận" : "Chờ xác nhận",
      done: isAccepted,
      current: rawStatus === "ACCEPTED" || rawStatus === "CONFIRMED",
    },
    {
      step: 3,
      title: "Xuất xe giao",
      time: isInTransit ? expectedTime || "Đang giao" : "Chờ xuất xe",
      done: isInTransit,
      current: rawStatus === "IN_TRANSIT",
    },
    {
      step: 4,
      title: "Tới trường & Nhận",
      time: isArrived ? receivedTime || arrivedTime : `Hẹn ${expectedTime}`,
      done: isArrived,
      current:
        rawStatus === "ARRIVED" ||
        rawStatus === "RECEIVED" ||
        mappedStatus === "COMPLETED",
    },
  ]
}

/**
 * Phân tích thông tin phương tiện, tài xế từ DB và ghi chú
 */
export function parseTransportInfo(delivery, orderType) {
  const note = delivery?.note || ""
  const rawStatus = delivery?.status || ""
  const isPendingConfirmation = rawStatus === "CREATED" || rawStatus === "PENDING"

  // 1. Khi NCC chưa xác nhận đơn: Chưa có tài xế hay phương tiện được điều phối
  if (isPendingConfirmation) {
    return {
      driverName: "Chưa phân công",
      driverPhone: "--",
      vehiclePlate: "Chưa điều xe",
      refrigerationTemp: "Chưa đo (Chờ xuất xe)",
      currentLocation: "Kho NCC (Chờ xác nhận đơn)",
      isAssigned: false,
    }
  }

  // 2. Khi NCC đã xác nhận (ACCEPTED / CONFIRMED) nhưng chưa xuất xe giao hàng
  if (rawStatus === "ACCEPTED" || rawStatus === "CONFIRMED") {
    return {
      driverName: "Đang phân công",
      driverPhone: "--",
      vehiclePlate: "Đang điều phối xe",
      refrigerationTemp: "Chưa đo (Chờ xuất xe)",
      currentLocation: "Kho NCC (Đang chuẩn bị hàng)",
      isAssigned: false,
    }
  }

  // 3. Khi đã xuất xe giao hàng (IN_TRANSIT, ARRIVED, COMPLETED, RECEIVED)
  let driverName = delivery?.driverName
  if (!driverName || driverName.includes("Chờ") || driverName === "--") {
    const driverMatch = note.match(/(?:tài xế|lái xe|driver)\s*[:\-]?\s*([^,;\n\(\)]+)/i)
    if (driverMatch && driverMatch[1]?.trim()) {
      driverName = driverMatch[1].trim()
    } else {
      driverName = "Chưa có thông tin tài xế"
    }
  }

  let driverPhone = delivery?.driverPhone || delivery?.supplierPhone || "—"
  const phoneMatch = note.match(/(?:sđt|điện thoại|phone|hotline)\s*[:\-]?\s*([0-9\.\s]{10,12})/i)
  if (phoneMatch && phoneMatch[1]?.trim()) {
    driverPhone = phoneMatch[1].trim()
  }

  // Chỉ hiển thị dữ liệu thật; hệ thống chưa ghi nhiệt độ xe nên không tự điền số đo.
  const vehiclePlate = delivery?.vehiclePlate || "Chưa có biển số"

  const refrigerationTemp =
    orderType.type === "DRY_STOCK" ? "Không yêu cầu bảo quản lạnh" : "Chưa có dữ liệu nhiệt độ"

  let currentLocation = "Chưa xuất xe"
  if (rawStatus === "ARRIVED") {
    currentLocation = "Đã đến trường"
  } else if (rawStatus === "RECEIVED" || rawStatus === "COMPLETED") {
    currentLocation = "Đã nhập kho trường"
  } else if (rawStatus === "IN_TRANSIT") {
    currentLocation = "Đang trên đường đến trường"
  }

  return {
    driverName,
    driverPhone,
    vehiclePlate,
    refrigerationTemp,
    currentLocation,
    isAssigned: true,
  }
}

/**
 * Chuẩn hóa danh sách mặt hàng nguyên liệu bàn giao
 */
export function mapDeliveryItems(deliveryItems = [], defaultSupplierName = "") {
  if (!Array.isArray(deliveryItems) || deliveryItems.length === 0) {
    return []
  }

  return deliveryItems.map(item => {
    const qty = Number(
      item.qty ?? item.actualQuantity ?? item.requestedQuantity ?? item.orderedQty ?? item.quantity ?? 0
    )
    const unit = item.unit || ""
    const name = item.name || item.ingredientName || "—"
    const nameLower = String(name).toLowerCase().trim()

    let supplierName = item.supplierName || item.supplier?.name || defaultSupplierName || "—"
    const supplierId = item.supplierId || item.supplier?.id || ""
    const spec = item.spec || item.note || "—"

    return {
      name,
      ingredientName: name,
      qty,
      unit,
      spec,
      supplierName,
      supplierId,
      handlingType: item.handlingType,
      raw: item,
    }
  })
}

/**
 * Adapter chính: Chuyển đổi 1 bản ghi Delivery sang định dạng của OrderTracking
 */
export function adaptTrackingOrder(delivery) {
  if (!delivery) return null

  const orderType = determineOrderType(delivery)
  const statusInfo = mapDeliveryStatus(delivery.status)
  const etaInfo = computeEta(delivery.status, delivery.expectedArrivalAt)
  const transportInfo = parseTransportInfo(delivery, orderType)
  const timeline = buildTimeline(delivery, statusInfo.status)
  
  const rawItems = delivery.deliveryItems || delivery.items || []
  const items = mapDeliveryItems(rawItems, delivery.supplierName)

  const uniqueSuppliers = Array.from(
    new Set(
      [
        ...(Array.isArray(delivery.suppliers) ? delivery.suppliers : []),
        ...items.map(it => it.supplierName),
      ].filter(Boolean)
    )
  )

  const deliverySchedule = formatDeliverySchedule(delivery, orderType)

  // Chuẩn hóa mã phiếu: Ưu tiên tuyệt đối mã chuẩn PN-... của trường học, không để mã FP- của NCC đè lên
  const findPnCode = (...codes) => {
    for (const c of codes) {
      if (!c) continue
      const s = String(c).trim()
      if (/^PN-/i.test(s) || /^PNK-/i.test(s)) return s
      if (/^PO-/i.test(s)) return s.replace(/^PO-/i, "PN-")
    }
    for (const c of codes) {
      if (!c) continue
      const s = String(c).trim()
      if (!/^FP-/i.test(s)) return s.replace(/^PO-|^DEL-/, "PN-")
    }
    return ""
  }

  const rawPn = findPnCode(
    delivery.orderNo,
    delivery.requestNo,
    delivery.SupplyRequest?.requestNo,
    delivery.deliveryNo
  )

  const cleanDeliveryNo =
    rawPn ||
    (delivery.deliveryNo
      ? `PN-${String(delivery.deliveryNo).replace(/^FP-DE-|^FP-|^DEL-/, "")}`
      : "PN-UNKNOWN")
  const baseOrderNo = cleanDeliveryNo.replace(/-\d+$/, "")

  return {
    id: delivery.id,
    orderNo: baseOrderNo,
    deliveryNo: cleanDeliveryNo,
    supplierDeliveryNo: delivery.deliveryNo,
    deliveryQr: delivery.deliveryQr || delivery.deliveryNo || `QR-${cleanDeliveryNo}`,
    orderType: orderType.type,
    batchType: orderType.type,
    orderTypeLabel: orderType.label,
    supplierName: delivery.supplierName || "—",
    supplierPhone: delivery.supplierPhone || "—",
    suppliers:
      uniqueSuppliers.length > 0
        ? uniqueSuppliers
        : delivery.supplierName
        ? [delivery.supplierName]
        : [],
    deliverySchedule,
    deliveryDate: delivery.deliveryDate,
    deliveryTime: delivery.deliveryTime,
    status: statusInfo.status,
    rawStatus: delivery.status,
    statusLabel: statusInfo.statusLabel,
    etaMinutes: etaInfo.etaMinutes,
    etaText: etaInfo.etaText,
    driverName: transportInfo.driverName,
    driverPhone: transportInfo.driverPhone,
    vehiclePlate: transportInfo.vehiclePlate,
    refrigerationTemp: transportInfo.refrigerationTemp,
    currentLocation: transportInfo.currentLocation,
    isAssigned: transportInfo.isAssigned,
    timeline,
    items,
    note: delivery.note || "",
    raw: delivery,
  }
}
