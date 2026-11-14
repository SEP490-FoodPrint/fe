/**
 * Adapter chuẩn hóa dữ liệu Kho nguyên liệu & Hàng khô (Warehouse & Lots)
 */

/**
 * Kiểm tra xem một mặt hàng có phải là Đồ khô lưu kho (DRY_STOCK) hay không.
 * Loại trừ tuyệt đối các mặt hàng tươi sống (thịt, cá, tôm, rau, củ, quả, trứng...).
 */
export function isDryIngredient(item = {}, entries = []) {
  // 1. Kiểm tra đối chiếu với danh sách ingredient_entries cấu hình của trường
  if (entries && entries.length > 0) {
    const entry = entries.find(
      e => e.ingredientId === item.id || e.id === item.ingredientEntryId
    )
    if (entry) {
      if (entry.handlingType === "DRY_STOCK") return true
      if (entry.handlingType === "DIRECT_USE") return false
    }
  }

  // 2. Kiểm tra thuộc tính handlingType nếu đã có sẵn
  if (item.handlingType === "DRY_STOCK") return true
  if (item.handlingType === "DIRECT_USE") return false

  const name = String(item.name || "").toLowerCase()
  const cat = String(item.category || item.categoryName || "").toLowerCase()

  // 3. Loại trừ dứt khoát các mặt hàng tươi sống (dùng ngay trong ngày)
  const freshKeywords = [
    "thịt", "heo", "lợn", "bò", "gà", "vịt", "chim",
    "cá", "tôm", "cua", "mực", "nghêu", "sò", "ốc", "hải sản",
    "rau", "cải", "muống", "ngót", "mồng tơi", "bắp cải", "xà lách", "súp lơ",
    "củ", "cà rốt", "khoai tây", "khoai lang", "su hào", "củ cải", "cà chua", "dưa chuột",
    "bí đỏ", "bí xanh", "mướp", "đậu phụ", "tàu hũ",
    "trứng", "trứng gà", "trứng vịt", "trứng cút",
    "trái cây", "chuối", "dưa hấu", "táo", "lê", "xoài", "thanh long", "quít", "cam",
    "sữa tươi", "sữa chua"
  ]

  if (freshKeywords.some(kw => name.includes(kw) || cat.includes(kw))) {
    return false
  }

  // 4. Các từ khóa đặc trưng xác định đồ khô / lương thực / gia vị lưu kho
  const dryKeywords = [
    "gạo", "lương thực", "gia vị", "muối", "đường", "dầu ăn", "dầu thực vật",
    "nước mắm", "nước tương", "hạt nêm", "bột ngọt", "tiêu", "bột canh", "bột nêm",
    "đồ khô", "hàng khô", "ngũ cốc", "bột mì", "bột năng", "bột bắp",
    "miến", "bún khô", "mì sợi", "mộc nhĩ", "nấm hương khô", "đậu xanh", "đậu đỏ", "đậu đen", "lạc", "vừng", "mè"
  ]

  if (dryKeywords.some(kw => name.includes(kw) || cat.includes(kw))) {
    return true
  }

  return false
}

export const adaptIngredientLot = (raw = {}) => {
  const deliveryItem = raw.DeliveryItem || {}
  const requestItem = deliveryItem.SupplyRequestItem || {}
  const entry = requestItem.IngredientEntry || {}
  const ingredient = entry.Ingredient || {}
  const supplier = ingredient.Supplier || {}
  const category = ingredient.ingredientCategory || {}
  const delivery = deliveryItem.Delivery || {}
  const facility = raw.SourceFacility || {}

  return {
    id: raw.id,
    lotCode: raw.lotCode || "LÔ-CHƯA-MÃ",
    manufactureDate: raw.manufactureDate ? String(raw.manufactureDate).slice(0, 10) : null,
    expiryDate: raw.expiryDate ? String(raw.expiryDate).slice(0, 10) : null,
    receivedQuantity: Number(raw.receivedQuantity) || 0,
    availableQuantity: Number(raw.availableQuantity) || 0,
    unit: raw.unit || ingredient.defaultUnit || "kg",
    status: raw.status || "AVAILABLE",
    sourceFacilityName: facility.name || null,
    deliveryNo: delivery.deliveryNo || "—",
    deliveryStatus: delivery.status || null,
    arrivedAt: delivery.arrivedAt || null,
    ingredientId: ingredient.id || entry.ingredientId || null,
    ingredientName: ingredient.name || "Nguyên liệu",
    category: category.categoryName || "Lương thực & Gia vị",
    handlingType: entry.handlingType || "DRY_STOCK",
    supplierId: supplier.id || ingredient.supplierId || null,
    supplierName: supplier.name || "Nhà cung cấp đối tác",
    supplierPhone: supplier.phone || "",
  }
}

/**
 * Ngưỡng định mức an toàn tối thiểu phù hợp cho từng loại mặt hàng đồ khô
 */
const getDefaultSafetyStock = (unit = "kg", name = "") => {
  const u = String(unit).toLowerCase().trim()
  const n = String(name).toLowerCase().trim()

  if (n.includes("gạo")) return 200 // Gạo cần định mức an toàn cao (200kg)
  if (u.includes("kg")) return 20
  if (u.includes("can") || u.includes("thùng")) return 5
  if (u.includes("chai") || u.includes("lít") || u.includes("lit")) return 15
  if (u.includes("gói") || u.includes("hộp") || u.includes("túi")) return 15
  return 15
}

/**
 * Tổng hợp danh mục tồn kho HÀNG KHÔ (Warehouse Inventory Items)
 * Chỉ giữ lại mặt hàng khô (DRY_STOCK), loại trừ toàn bộ đồ tươi sống (DIRECT_USE).
 */
export const buildWarehouseInventory = (
  lots = [],
  catalogIngredients = [],
  suppliers = [],
  entries = []
) => {
  // 1. Lọc chỉ lấy các lô hàng thuộc đồ khô
  const dryLots = lots.filter(lot =>
    isDryIngredient(
      { name: lot.ingredientName, category: lot.category, handlingType: lot.handlingType },
      entries
    )
  )

  const lotMapByIngredientId = new Map()
  const lotMapByName = new Map()

  dryLots.forEach(lot => {
    if (lot.ingredientId) {
      const arr = lotMapByIngredientId.get(lot.ingredientId) || []
      arr.push(lot)
      lotMapByIngredientId.set(lot.ingredientId, arr)
    }
    if (lot.ingredientName) {
      const normName = lot.ingredientName.trim().toLowerCase()
      const arr = lotMapByName.get(normName) || []
      arr.push(lot)
      lotMapByName.set(normName, arr)
    }
  })

  // 2. Lọc danh mục nguyên liệu: CHỈ GIỮ LẠI ĐỒ KHÔ
  const dryCatalog = catalogIngredients.filter(ing => isDryIngredient(ing, entries))

  const processedIngredientIds = new Set()
  const items = []

  dryCatalog.forEach((ing, index) => {
    processedIngredientIds.add(ing.id)

    // Tìm các lô tương ứng của mặt hàng này
    const matchingLots =
      lotMapByIngredientId.get(ing.id) ||
      lotMapByName.get(ing.name?.trim().toLowerCase()) ||
      []

    // Tính tổng số lượng khả dụng từ các lô đang ACTIVE/AVAILABLE
    const currentStock = matchingLots.reduce((sum, l) => {
      if (l.status === "AVAILABLE" || l.status === "RELEASED") {
        return sum + (Number(l.availableQuantity) || 0)
      }
      return sum
    }, 0)

    const unit = ing.defaultUnit || ing.unit || "kg"
    const safetyStock = Number(ing.safetyStock) > 0 ? Number(ing.safetyStock) : getDefaultSafetyStock(unit, ing.name)
    const maxCapacity = Number(ing.maxCapacity) > 0 ? Number(ing.maxCapacity) : safetyStock * 5

    const supplierObj = suppliers.find(s => s.id === ing.supplierId)
    const supplierName = ing.supplierName || supplierObj?.name || "Tổng kho Lương thực & Gia vị"

    const code =
      ing.code ||
      `NLK-${String(index + 1).padStart(3, "0")}`

    items.push({
      id: ing.id,
      code,
      name: ing.name,
      category: ing.category || "Lương thực & Gia vị",
      unit,
      currentStock,
      safetyStock,
      maxCapacity,
      supplierId: ing.supplierId || supplierObj?.id || null,
      supplierName,
      unitPrice: ing.unitPrice || (unit === "kg" ? 28000 : 35000),
      description: ing.description || "",
      lots: matchingLots,
    })
  })

  // 3. Thêm các mặt hàng khô có lô trong kho nhưng chưa nằm trong catalog
  dryLots.forEach(lot => {
    if (lot.ingredientId && !processedIngredientIds.has(lot.ingredientId)) {
      processedIngredientIds.add(lot.ingredientId)
      const matchingLots = dryLots.filter(l => l.ingredientId === lot.ingredientId)
      const currentStock = matchingLots.reduce((sum, l) => {
        if (l.status === "AVAILABLE" || l.status === "RELEASED") {
          return sum + (Number(l.availableQuantity) || 0)
        }
        return sum
      }, 0)

      const safetyStock = getDefaultSafetyStock(lot.unit, lot.ingredientName)
      items.push({
        id: lot.ingredientId,
        code: `NLK-${lot.ingredientId.slice(0, 4).toUpperCase()}`,
        name: lot.ingredientName,
        category: lot.category || "Lương thực & Gia vị",
        unit: lot.unit,
        currentStock,
        safetyStock,
        maxCapacity: safetyStock * 5,
        supplierId: lot.supplierId,
        supplierName: lot.supplierName,
        unitPrice: 28000,
        lots: matchingLots,
      })
    }
  })

  // 4. Thống kê số lượng: Báo động < 30% (Đỏ), Cần nhập 30% - 50% (Vàng), Đủ an toàn >= 50% (Xanh)
  const total = items.length
  const criticalLowCount = items.filter(
    it => it.safetyStock > 0 && it.currentStock / it.safetyStock < 0.3
  ).length
  const warningCount = items.filter(
    it =>
      it.safetyStock > 0 &&
      it.currentStock / it.safetyStock >= 0.3 &&
      it.currentStock / it.safetyStock < 0.5
  ).length
  const safeStockCount = items.filter(
    it => it.safetyStock > 0 && it.currentStock / it.safetyStock >= 0.5
  ).length

  return {
    items,
    stats: {
      total,
      criticalLowCount,
      warningCount,
      safeStockCount,
    },
  }
}
