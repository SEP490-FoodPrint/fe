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
    case "ACCEPTED":
    case "CREATED":
    default:
      return {
        status: "ACCEPTED",
        statusLabel: "NCC đã xác nhận",
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
      current: rawStatus === "CREATED",
    },
    {
      step: 2,
      title: "NCC xác nhận",
      time: createdTime || "Đã xác nhận",
      done: isAccepted,
      current: rawStatus === "ACCEPTED",
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

  let driverName = "Tài xế giao hàng"
  const driverMatch = note.match(/(?:tài xế|lái xe|driver)\s*[:\-]?\s*([^,;\n\(\)]+)/i)
  if (driverMatch && driverMatch[1]?.trim()) {
    driverName = driverMatch[1].trim()
  }

  let driverPhone = delivery?.supplierPhone || "0987 654 321"
  const phoneMatch = note.match(/(?:sđt|điện thoại|phone|hotline)\s*[:\-]?\s*([0-9\.\s]{10,12})/i)
  if (phoneMatch && phoneMatch[1]?.trim()) {
    driverPhone = phoneMatch[1].trim()
  }

  const vehiclePlate = delivery?.vehiclePlate || "29H-456.78 (Xe tải lạnh chuyên dụng)"

  let refrigerationTemp = "--"
  if (orderType.type === "DRY_STOCK") {
    refrigerationTemp = "Nhiệt độ phòng (Khô ráo)"
  } else {
    refrigerationTemp = "3.5°C (Đạt chuẩn bảo quản lạnh)"
  }

  let currentLocation = "Kho tổng NCC"
  const rawStatus = delivery?.status || ""
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
  }
}

/**
 * Chuẩn hóa danh sách mặt hàng nguyên liệu bàn giao
 */
export function mapDeliveryItems(deliveryItems = []) {
  if (!Array.isArray(deliveryItems) || deliveryItems.length === 0) {
    return []
  }

  return deliveryItems.map(item => {
    const qty = Number(item.actualQuantity || item.requestedQuantity || 0)
    const unit = item.unit || "kg"
    const name = item.ingredientName || "Nguyên liệu"
    const spec =
      item.note ||
      (item.handlingType === "DIRECT_USE"
        ? "Đóng gói tiêu chuẩn, tem QR truy xuất, có kiểm dịch"
        : "Bao bì nguyên đai nguyên kiện, hạn sử dụng rõ ràng")

    return {
      name,
      qty,
      unit,
      spec,
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
  const items = mapDeliveryItems(delivery.deliveryItems)

  const scheduleDate =
    delivery.expectedArrivalAt ||
    delivery.requestedDeliveryDate ||
    delivery.createdAt
  const deliverySchedule = formatVietnameseDateTime(scheduleDate)

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
    deliverySchedule,
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
    timeline,
    items,
    note: delivery.note || "",
    raw: delivery,
  }
}
