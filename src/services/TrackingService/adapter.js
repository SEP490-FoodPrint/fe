/**
 * TrackingService Adapter
 * Chuyển đổi dữ liệu từ API /api/deliveries sang cấu trúc chuẩn cho giao diện Theo Dõi Đơn Hàng (OrderTracking)
 */

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

  if (!y || !m || !d) {
    const now = new Date()
    y = now.getFullYear()
    m = now.getMonth() + 1
    d = now.getDate()
  }

  const [hours, minutes] = targetTime.split(":").map(Number)
  const dateObj = new Date(y, m - 1, d, hours || 0, minutes || 0)
  const dayName = WEEKDAY_NAMES[dateObj.getDay()] || "Thứ"
  const formattedDay = String(d).padStart(2, "0")
  const formattedMonth = String(m).padStart(2, "0")

  return `${targetTime} - ${dayName} ${formattedDay}/${formattedMonth}/${y}`
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
  if (delivery?.orderType === "DRY_STOCK" || delivery?.batchType === "DRY_STOCK") {
    return {
      type: "DRY_STOCK",
      label: "Đồ khô & Gia vị",
    }
  }
  if (delivery?.orderType === "FRESH_BATCH_2" || delivery?.batchType === "BATCH_2") {
    return {
      type: "FRESH_BATCH_2",
      label: "Đồ tươi (Đợt 2 - Bù sĩ số)",
    }
  }
  if (delivery?.orderType === "FRESH_BATCH_1" || delivery?.batchType === "BATCH_1") {
    return {
      type: "FRESH_BATCH_1",
      label: "Đồ tươi (Đợt 1 - 05:30)",
    }
  }

  const note = (delivery?.note || "").toLowerCase()
  const items = delivery?.deliveryItems || []

  // Ưu tiên 1: Ghi chú có nhắc đến Đợt 2 hoặc bù sĩ số
  if (
    note.includes("đợt 2") ||
    note.includes("bù") ||
    note.includes("batch 2") ||
    note.includes("bù sĩ số")
  ) {
    return {
      type: "FRESH_BATCH_2",
      label: "Đồ tươi (Đợt 2 - Bù sĩ số)",
    }
  }

  // Ưu tiên 2: Kiểm tra phân loại handlingType của mặt hàng
  const hasDirectUse = items.some(
    it =>
      it.handlingType === "DIRECT_USE" ||
      (it.ingredientName &&
        !DRY_KEYWORDS.some(k => it.ingredientName.toLowerCase().includes(k)))
  )
  const hasWarehouse = items.some(
    it =>
      it.handlingType === "CENTRAL_WAREHOUSE" ||
      it.handlingType === "PRE_PORTIONED"
  )

  // Kiểm tra giờ hẹn (Đợt 2 thường từ 07:00 đến 09:00 sáng)
  if (delivery?.expectedArrivalAt) {
    const d = new Date(delivery.expectedArrivalAt)
    const h = d.getHours()
    if (h >= 7 && h <= 9 && hasDirectUse) {
      return {
        type: "FRESH_BATCH_2",
        label: "Đồ tươi (Đợt 2 - Bù sĩ số)",
      }
    }
  }

  // Nếu toàn đồ kho/gia vị
  if (hasWarehouse && !hasDirectUse) {
    return {
      type: "DRY_STOCK",
      label: "Đồ khô & Gia vị",
    }
  }

  return {
    type: "FRESH_BATCH_1",
    label: "Đồ tươi (Đợt 1 - 05:30)",
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
      driverName = "Tài xế giao hàng"
    }
  }

  let driverPhone = delivery?.driverPhone || delivery?.supplierPhone || "0987 654 321"
  const phoneMatch = note.match(/(?:sđt|điện thoại|phone|hotline)\s*[:\-]?\s*([0-9\.\s]{10,12})/i)
  if (phoneMatch && phoneMatch[1]?.trim()) {
    driverPhone = phoneMatch[1].trim()
  }

  let vehiclePlate = delivery?.vehiclePlate
  if (!vehiclePlate) {
    vehiclePlate =
      orderType.type === "DRY_STOCK"
        ? "29C-789.12 (Xe tải thùng kín)"
        : "29H-456.78 (Xe tải lạnh chuyên dụng)"
  }

  let refrigerationTemp = "--"
  if (orderType.type === "DRY_STOCK") {
    refrigerationTemp = "Nhiệt độ phòng (Khô ráo)"
  } else {
    refrigerationTemp = "3.5°C (Đạt chuẩn bảo quản lạnh)"
  }

  let currentLocation = "Kho tổng NCC"
  if (rawStatus === "ARRIVED") {
    currentLocation = "Cổng phụ số 2 / Khu tiếp nhận bếp trường"
  } else if (rawStatus === "RECEIVED" || rawStatus === "COMPLETED") {
    currentLocation = "Kho trường / Bếp ăn bán trú"
  } else if (rawStatus === "IN_TRANSIT") {
    currentLocation = "Đang di chuyển trên đường đến trường"
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
      item.qty ?? item.actualQuantity ?? item.requestedQuantity ?? item.orderedQty ?? 0
    )
    const unit = item.unit || "kg"
    const name = item.name || item.ingredientName || "Nguyên liệu"
    const nameLower = String(name).toLowerCase().trim()

    let supplierName = item.supplierName || item.supplier?.name || defaultSupplierName || "Nhà cung cấp đối tác"
    const supplierId = item.supplierId || item.supplier?.id || ""
    const spec =
      item.spec ||
      item.note ||
      (item.handlingType === "DIRECT_USE"
        ? "Đóng gói tiêu chuẩn, tem QR truy xuất, có kiểm dịch"
        : "Bao bì nguyên đai nguyên kiện, hạn sử dụng rõ ràng")

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

  return {
    id: delivery.id,
    orderNo:
      delivery.orderNo ||
      delivery.requestNo ||
      `PO-${delivery.deliveryNo || delivery.id.slice(0, 8)}`,
    deliveryNo: delivery.deliveryNo || `DEL-${delivery.id.slice(0, 8)}`,
    orderType: orderType.type,
    orderTypeLabel: orderType.label,
    supplierName: delivery.supplierName || "Liên minh Hợp tác xã Cung ứng",
    supplierPhone: delivery.supplierPhone || "0987 654 321",
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
