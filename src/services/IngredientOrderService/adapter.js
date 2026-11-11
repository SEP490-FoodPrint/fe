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

  const defaultPrice = handlingType === "DRY_STOCK" ? 45000 : 95000
  const finalPrice = Number(item.unitPrice) || defaultPrice

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
      (handlingType === "DRY_STOCK"
        ? "Kê pallet cách đất 20cm, bảo quản nơi khô ráo thoáng mát"
        : "Bảo quản mát 0 - 4°C, chế biến ngay trong ngày"),
    unitPrice: finalPrice,
    unitPriceFormatted: `${finalPrice.toLocaleString("vi-VN")} đ`,
    supplierId: item.supplierId || "",
    supplierName: item.supplierName || item.Supplier?.name || "Nhà cung cấp đối tác",
    minOrderQty: item.minOrderQty || (handlingType === "DRY_STOCK" ? 10 : 5),
  }
}
