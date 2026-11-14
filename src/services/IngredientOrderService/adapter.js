/**
 * Adapter chuẩn hóa dữ liệu Danh mục nguyên liệu và Phân hệ Đơn hàng
 */

export const HANDLING_TYPES = {
  DRY_STOCK: {
    label: "Kho khô",
    color: "#b45309",
    bg: "#fef3c7",
    note: "Lưu kho dài ngày (gạo, muối, gia vị...)",
  },
  DIRECT_USE: {
    label: "Tươi sống (dùng trong ngày)",
    color: "#047857",
    bg: "#d1fae5",
    note: "Nhập dùng ngay trong ngày (thịt, cá, rau củ...)",
  },
}

/**
 * Tự động nhận diện phân loại kho khô (DRY_STOCK) vs tươi sống (DIRECT_USE)
 * dựa theo handlingType hoặc từ khóa tên / nhóm mặt hàng khi dữ liệu DB chưa gắn tag
 */
export function inferHandlingType(item) {
  if (item?.handlingType === "DRY_STOCK" || item?.handlingType === "DIRECT_USE") {
    return item.handlingType
  }

  const category = (item?.category || "").toLowerCase()
  const name = (item?.name || "").toLowerCase()

  const dryKeywords = [
    "khô",
    "kho khô",
    "gạo",
    "gia vị",
    "muối",
    "đường",
    "dầu",
    "mắm",
    "hạt nêm",
    "tiêu",
    "bột ngọt",
    "bột canh",
    "bột nêm",
    "nước tương",
    "ngũ cốc",
    "lương thực",
    "seasoning",
    "dry",
    "nước mắm",
    "dầu ăn",
  ]

  if (dryKeywords.some(kw => category.includes(kw) || name.includes(kw))) {
    return "DRY_STOCK"
  }
  return "DIRECT_USE"
}

export function adaptCatalogItem(item) {
  if (!item) return null

  const handlingType = inferHandlingType(item)
  const handling = HANDLING_TYPES[handlingType] || HANDLING_TYPES.DIRECT_USE

  return {
    id: item.id,
    name: item.name || "Nguyên liệu",
    category:
      item.category ||
      (handlingType === "DRY_STOCK" ? "Kho khô & Gia vị" : "Thực phẩm tươi sống"),
    handlingType: handlingType,
    handlingMeta: handling,
    defaultUnit: item.defaultUnit || (handlingType === "DRY_STOCK" ? "kg" : "kg"),
    shelfLifeDays:
      item.shelfLifeDays || (handlingType === "DRY_STOCK" ? 180 : 2),
    storageRequirements:
      item.storageRequirements ||
      item.description ||
      (handlingType === "DRY_STOCK"
        ? "Kê pallet cách đất 20cm, bảo quản nơi khô ráo thoáng mát"
        : "Bảo quản mát 0 - 4°C, chế biến ngay trong ngày"),
    supplierId: item.supplierId || "",
    supplierName: item.supplierName || item.Supplier?.name || item.supplier?.name || "Nhà cung cấp đối tác",
    minOrderQty: item.minOrderQty || (handlingType === "DRY_STOCK" ? 10 : 5),
  }
}

/**
 * Chuẩn hóa đối tượng Phiếu giao nhận (Delivery) từ API Backend thành format
 * phù hợp với giao diện DeliveryTable, DeliveryDetailView, DeliveryStatsRail.
 */
export function adaptDeliveryItem(item) {
  if (!item) return null

  // 1. Phân tích thời gian và ngày
  const rawDate =
    item.arrivedAt ||
    item.expectedArrivalAt ||
    item.receivedAt ||
    item.deliveryDate ||
    item.createdAt ||
    new Date().toISOString()

  let deliveryDate = ""
  let deliveryTime = ""

  try {
    const d = new Date(rawDate)
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, "0")
      const day = String(d.getDate()).padStart(2, "0")
      deliveryDate = `${year}-${month}-${day}`

      const hours = String(d.getHours()).padStart(2, "0")
      const minutes = String(d.getMinutes()).padStart(2, "0")
      deliveryTime = `${hours}:${minutes}`
    }
  } catch {
    deliveryDate = "2026-11-14"
    deliveryTime = "05:30"
  }

  // 2. Nhận diện Đợt 1 / Đợt 2 / Đồ khô
  const noteText = `${item.note || ""} ${item.deliveryNo || ""} ${item.orderNo || ""} ${item.requestNo || ""}`.toLowerCase()
  let batchType = item.batchType
  if (!batchType) {
    if (noteText.includes("đợt 1") || noteText.includes("d1") || noteText.includes("batch_1") || noteText.includes("sáng")) {
      batchType = "BATCH_1"
    } else if (noteText.includes("đợt 2") || noteText.includes("d2") || noteText.includes("batch_2") || noteText.includes("sĩ số")) {
      batchType = "BATCH_2"
    } else if (noteText.includes("khô") || noteText.includes("dry")) {
      batchType = "DRY_STOCK"
    } else {
      // Nếu giờ giao trước 7h sáng -> Đợt 1, sau 7h -> Đợt 2
      const hourNum = parseInt(deliveryTime.split(":")[0], 10) || 5
      batchType = hourNum < 7 ? "BATCH_1" : "BATCH_2"
    }
  }

  const batchLabel =
    batchType === "BATCH_1"
      ? "Đợt 1 (50% Suất tối đa)"
      : batchType === "BATCH_2"
      ? "Đợt 2 (Cân đối sĩ số)"
      : "Kho đồ khô"

  // 3. Chuẩn hóa Hội đồng nghiệm thu 4 bên
  const approvals = {
    ingredientManagement: { approved: null, name: "Ban QL NL", time: "" },
    healthOfficer: { approved: null, name: "Cán bộ Y tế", time: "" },
    parentsCommittee: { approved: null, name: "Ban Phụ huynh", time: "" },
    kitchenStaff: { approved: null, name: "Bếp trưởng", time: "" },
  }

  if (item.approvals && typeof item.approvals === "object") {
    Object.assign(approvals, item.approvals)
  } else if (Array.isArray(item.deliveryApprovals) && item.deliveryApprovals.length > 0) {
    for (const app of item.deliveryApprovals) {
      const code = (app.roleCode || "").toUpperCase()
      const isApproved = app.decision === "APPROVE"
      const timeStr = app.decidedAt
        ? new Date(app.decidedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
        : ""

      if (code.includes("INGREDIENT")) {
        approvals.ingredientManagement = { approved: isApproved, name: app.userName || "Ban QL NL", time: timeStr }
      } else if (code.includes("NUTRITION") || code.includes("HEALTH")) {
        approvals.healthOfficer = { approved: isApproved, name: app.userName || "Cán bộ Y tế", time: timeStr }
      } else if (code.includes("PARENTS")) {
        approvals.parentsCommittee = { approved: isApproved, name: app.userName || "Ban Phụ huynh", time: timeStr }
      } else if (code.includes("KITCHEN")) {
        approvals.kitchenStaff = { approved: isApproved, name: app.userName || "Bếp trưởng", time: timeStr }
      }
    }
  } else if (item.status === "RECEIVED" || item.status === "APPROVED" || item.status === "COMPLETED") {
    // Nếu đơn hàng đã duyệt/hoàn tất trong DB, 4 bên hiển thị đã duyệt đạt
    approvals.ingredientManagement = { approved: true, name: "Ban QL NL", time: deliveryTime }
    approvals.healthOfficer = { approved: true, name: "Cán bộ Y tế", time: deliveryTime }
    approvals.parentsCommittee = { approved: true, name: "Ban Phụ huynh", time: deliveryTime }
    approvals.kitchenStaff = { approved: true, name: "Bếp trưởng", time: deliveryTime }
  }

  // 4. Nhãn trạng thái tiếng Việt
  const statusLabels = {
    RECEIVED: "Đã nhận hàng & Vào bếp",
    COMPLETED: "4/4 Đã duyệt & Bàn giao bếp",
    APPROVED: "4/4 Đã duyệt & Bàn giao bếp",
    ARRIVED: "Đã đến cổng - Chờ kiểm tra",
    PENDING_APPROVAL: "Đang kiểm tra 4 bên",
    INSPECTING: "Đang kiểm tra 4 bên",
    IN_TRANSIT: "NCC đang vận chuyển",
    CREATED: "NCC chuẩn bị giao",
    CONFIRMED: "NCC đã xác nhận",
    REJECTED: "Không đạt yêu cầu",
    CANCELLED: "Đã hủy",
  }

  // 5. Chuẩn hóa danh sách mặt hàng
  const items =
    Array.isArray(item.deliveryItems) && item.deliveryItems.length > 0
      ? item.deliveryItems.map(di => ({
          ingredientId: di.id,
          ingredientName: di.ingredientName || di.note || "Nguyên liệu",
          handlingType: di.handlingType || "DIRECT_USE",
          unit: di.unit || "kg",
          orderedQty: Number(di.requestedQuantity) || Number(di.actualQuantity) || 0,
          deliveredQty: Number(di.actualQuantity) || 0,
          status: "ACCEPTED",
        }))
      : Array.isArray(item.items)
      ? item.items
      : []

  return {
    id: item.id,
    deliveryNo: item.deliveryNo || "PN-UNKNOWN",
    orderNo:
      item.orderNo ||
      item.requestNo ||
      item.SupplyRequest?.requestNo ||
      (item.deliveryNo ? `PO-${item.deliveryNo.replace(/^DEL-|^PN-/, "")}` : "PO-UNKNOWN"),
    menuId: item.menuId || "menu-live",
    menuName:
      item.menuName ||
      item.note ||
      (batchType === "BATCH_1"
        ? "Thực đơn dinh dưỡng học đường (Đợt 1)"
        : "Thực đơn bổ sung (Đợt 2)"),
    deliveryDate,
    deliveryTime,
    batchType,
    batchLabel,
    maxPortions: item.maxPortions || 850,
    plannedPortions: item.plannedPortions || (batchType === "BATCH_1" ? 425 : 820),
    actualAttendance: item.actualAttendance || 820,
    supplierId: item.supplierId || item.Supplier?.id || "",
    supplierName: item.supplierName || item.Supplier?.name || "HTX Thực phẩm sạch Ba Vì",
    driverName:
      item.driverName ||
      (item.vehiclePlate ? `Lái xe (${item.vehiclePlate})` : "Lái xe giao hàng"),
    vehiclePlate: item.vehiclePlate || "",
    deliveryQr: item.deliveryQr || `QR-${item.deliveryNo || item.id}`,
    refrigerationTemp: item.refrigerationTemp || "3.5°C",
    status: item.status || "ARRIVED",
    statusLabel: item.statusLabel || statusLabels[item.status] || item.status,
    approvals,
    items,
  }
}

