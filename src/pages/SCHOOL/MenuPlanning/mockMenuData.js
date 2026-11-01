// Danh mục Nhà cung cấp đang liên kết hợp lệ (ACTIVE) với trường học
export const LINKED_SUPPLIERS = [
  {
    id: "sup-cp",
    name: "CP Foods Việt Nam",
    category: "Thịt gia súc, gia cầm tươi sạch",
    badge: "Thịt sạch VietGAP",
    ingredients: [
      { id: "ing-cp-1", name: "Thịt ba chỉ heo sạch", defaultQty: 45, unit: "g", allergen: null },
      { id: "ing-cp-2", name: "Thịt nạc vai xay", defaultQty: 20, unit: "g", allergen: null },
      { id: "ing-cp-3", name: "Thịt đùi gà phi lê", defaultQty: 60, unit: "g", allergen: null },
      { id: "ing-cp-4", name: "Thịt heo nạc thăn", defaultQty: 50, unit: "g", allergen: null }
    ]
  },
  {
    id: "sup-sea",
    name: "Hải sản Sạch Vũng Tàu",
    category: "Thủy hải sản tươi sống",
    badge: "Hải sản đánh bắt",
    ingredients: [
      {
        id: "ing-sea-1",
        name: "Tôm sú biển tươi",
        defaultQty: 65,
        unit: "g",
        allergen: "Giáp xác",
        allergyWarning: "12 học sinh dị ứng Giáp xác (Lớp 1A: 4, 2B: 5, 3C: 3)"
      },
      {
        id: "ing-sea-2",
        name: "Cá điêu hồng phi lê",
        defaultQty: 60,
        unit: "g",
        allergen: "Cá / Thủy sản",
        allergyWarning: "8 học sinh dị ứng Cá (Lớp 2A: 3, 4B: 5)"
      },
      {
        id: "ing-sea-3",
        name: "Mực nang tươi",
        defaultQty: 50,
        unit: "g",
        allergen: "Hải sản thân mềm",
        allergyWarning: "6 học sinh dị ứng Mực (Lớp 3A: 2, 5B: 4)"
      }
    ]
  },
  {
    id: "sup-veg",
    name: "HTX Rau sạch Nam Hà",
    category: "Rau củ quả sạch VietGAP",
    badge: "VietGAP Organic",
    ingredients: [
      { id: "ing-veg-1", name: "Cải ngọt VietGAP", defaultQty: 50, unit: "g", allergen: null },
      { id: "ing-veg-2", name: "Bí đỏ hồ lô", defaultQty: 60, unit: "g", allergen: null },
      { id: "ing-veg-3", name: "Cà rốt Đà Lạt", defaultQty: 30, unit: "g", allergen: null },
      { id: "ing-veg-4", name: "Cần tây sạch", defaultQty: 25, unit: "g", allergen: null },
      { id: "ing-veg-5", name: "Bắp cải trắng", defaultQty: 50, unit: "g", allergen: null }
    ]
  },
  {
    id: "sup-egg",
    name: "Công ty Ba Huân",
    category: "Trứng gia cầm kiểm dịch",
    badge: "Kiểm dịch ATTP",
    ingredients: [
      { id: "ing-egg-1", name: "Trứng cút tươi", defaultQty: 2, unit: "quả", allergen: null },
      {
        id: "ing-egg-2",
        name: "Trứng gà tươi loại 1",
        defaultQty: 1,
        unit: "quả",
        allergen: "Trứng gà",
        allergyWarning: "5 học sinh dị ứng Trứng gà (Lớp 1B: 2, 4A: 3)"
      }
    ]
  },
  {
    id: "sup-vis",
    name: "Thực phẩm Vissan",
    category: "Thịt bò nạc & đạm tươi",
    badge: "ISO 22000",
    ingredients: [
      { id: "ing-vis-1", name: "Thịt bò nạc loại 1", defaultQty: 40, unit: "g", allergen: null },
      { id: "ing-vis-2", name: "Thịt bê mềm", defaultQty: 45, unit: "g", allergen: null }
    ]
  },
  {
    id: "sup-rice",
    name: "Gạo Sạch Hải Hậu",
    category: "Tinh bột & ngũ cốc học đường",
    badge: "Gạo OCOP 4 sao",
    ingredients: [
      { id: "ing-rice-1", name: "Gạo tám thơm Hải Hậu", defaultQty: 120, unit: "g", allergen: null },
      { id: "ing-rice-2", name: "Gạo lứt đỏ huyết rồng", defaultQty: 110, unit: "g", allergen: null }
    ]
  }
]

// Món ăn ban đầu trong thực đơn
export const INITIAL_DISHES = [
  {
    id: "dish-1",
    name: "Tôm sú hấp sả",
    category: "Món mặn",
    ingredientId: "ing-sea-1",
    portionQty: 65,
    unit: "g"
  },
  {
    id: "dish-2",
    name: "Thịt heo kho trứng cút",
    category: "Món mặn phụ",
    ingredientId: "ing-cp-1",
    portionQty: 45,
    unit: "g"
  },
  {
    id: "dish-3",
    name: "Canh cải ngọt nấu thịt bằm",
    category: "Món canh",
    ingredientId: "ing-veg-1",
    portionQty: 50,
    unit: "g"
  },
  {
    id: "dish-4",
    name: "Cơm trắng tám thơm",
    category: "Cơm / Tinh bột",
    ingredientId: "ing-rice-1",
    portionQty: 120,
    unit: "g"
  }
]

// Gia vị dùng chung từ kho trường (giữ nguyên)
export const INITIAL_SEASONINGS = [
  {
    id: "seas-1",
    name: "Dầu ăn thực vật Neptune",
    portionQty: 5,
    unit: "ml",
    stockAvailable: 15,
    stockUnit: "lít",
    warehouseLocation: "Kệ gia vị A1 - Kho Trường"
  },
  {
    id: "seas-2",
    name: "Nước mắm Phú Quốc 40°N",
    portionQty: 3,
    unit: "ml",
    stockAvailable: 6,
    stockUnit: "lít",
    warehouseLocation: "Kệ gia vị A2 - Kho Trường"
  },
  {
    id: "seas-3",
    name: "Muối tinh I-ốt Bạc Liêu",
    portionQty: 2,
    unit: "g",
    stockAvailable: 8,
    stockUnit: "kg",
    warehouseLocation: "Kệ đồ khô B1 - Kho Trường"
  },
  {
    id: "seas-4",
    name: "Đường cát trắng Biên Hòa",
    portionQty: 2,
    unit: "g",
    stockAvailable: 10,
    stockUnit: "kg",
    warehouseLocation: "Kệ đồ khô B2 - Kho Trường"
  }
]

// Dữ liệu học sinh dị ứng đã khai báo theo Lớp (tổng hợp cấp lớp)
export const ALLERGY_PROFILES_BY_CLASS = [
  {
    allergen: "Giáp xác",
    affectedCount: 12,
    classes: [
      { className: "Lớp 1A", count: 4 },
      { className: "Lớp 2B", count: 5 },
      { className: "Lớp 3C", count: 3 }
    ]
  },
  {
    allergen: "Cá / Thủy sản",
    affectedCount: 8,
    classes: [
      { className: "Lớp 2A", count: 3 },
      { className: "Lớp 4B", count: 5 }
    ]
  },
  {
    allergen: "Trứng gà",
    affectedCount: 5,
    classes: [
      { className: "Lớp 1B", count: 2 },
      { className: "Lớp 4A", count: 3 }
    ]
  }
]
