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

export function adaptCatalogItem(item) {
  if (!item) return null
  const handling = HANDLING_TYPES[item.handlingType] || HANDLING_TYPES.DIRECT_USE

  return {
    id: item.id,
    name: item.name || "Nguyên liệu",
    category: item.category || "Chưa phân loại",
    handlingType: item.handlingType || "DIRECT_USE",
    handlingMeta: handling,
    defaultUnit: item.defaultUnit || "kg",
    shelfLifeDays: item.shelfLifeDays || 1,
    storageRequirements: item.storageRequirements || "Bảo quản nhiệt độ thường",
    unitPrice: Number(item.unitPrice) || 0,
    unitPriceFormatted: item.unitPrice ? `${Number(item.unitPrice).toLocaleString("vi-VN")} đ` : "--",
    supplierId: item.supplierId || "",
    supplierName: item.supplierName || "Nhà cung cấp đối tác",
    minOrderQty: item.minOrderQty || 1,
  }
}
