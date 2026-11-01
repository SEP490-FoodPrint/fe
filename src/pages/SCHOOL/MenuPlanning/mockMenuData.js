// 1. Phân loại nguyên liệu chuẩn theo CSDL (cột category trong bảng ingredients)
export const INGREDIENT_CATEGORIES = [
  "Thịt & Gia cầm",
  "Thủy hải sản",
  "Rau củ quả",
  "Trứng gia cầm",
  "Tinh bột & Ngũ cốc"
]

// 2. Danh sách Nhà cung cấp đang liên kết hợp lệ (ACTIVE) với trường
export const LINKED_SUPPLIERS = [
  {
    id: "sup-cp",
    name: "CP Foods Việt Nam",
    badge: "VietGAP",
    categories: ["Thịt & Gia cầm"]
  },
  {
    id: "sup-vis",
    name: "Thực phẩm Vissan",
    badge: "ISO 22000",
    categories: ["Thịt & Gia cầm"]
  },
  {
    id: "sup-sea",
    name: "Hải sản Sạch Vũng Tàu",
    badge: "Đánh bắt tự nhiên",
    categories: ["Thủy hải sản"]
  },
  {
    id: "sup-veg",
    name: "HTX Rau sạch Nam Hà",
    badge: "VietGAP Organic",
    categories: ["Rau củ quả"]
  },
  {
    id: "sup-egg",
    name: "Công ty Ba Huân",
    badge: "Kiểm dịch ATTP",
    categories: ["Trứng gia cầm"]
  },
  {
    id: "sup-rice",
    name: "Gạo Sạch Hải Hậu",
    badge: "OCOP 4 sao",
    categories: ["Tinh bột & Ngũ cốc"]
  }
]

// 3. Danh mục nguyên liệu cụ thể từ các NCC liên kết
// Lưu ý: Thông tin dị nguyên được đối soát ngầm sau khi chọn, KHÔNG hiển thị trước trong popup danh sách nguyên liệu
export const ALL_INGREDIENTS = [
  // Thịt & Gia cầm - CP Foods
  {
    id: "ing-cp-1",
    name: "Thịt ba chỉ heo sạch",
    category: "Thịt & Gia cầm",
    supplierId: "sup-cp",
    defaultQty: 45,
    unit: "g",
    allergen: null
  },
  {
    id: "ing-cp-2",
    name: "Thịt nạc vai xay",
    category: "Thịt & Gia cầm",
    supplierId: "sup-cp",
    defaultQty: 20,
    unit: "g",
    allergen: null
  },
  {
    id: "ing-cp-3",
    name: "Thịt đùi gà phi lê",
    category: "Thịt & Gia cầm",
    supplierId: "sup-cp",
    defaultQty: 60,
    unit: "g",
    allergen: null
  },
  {
    id: "ing-cp-4",
    name: "Thịt heo nạc thăn",
    category: "Thịt & Gia cầm",
    supplierId: "sup-cp",
    defaultQty: 50,
    unit: "g",
    allergen: null
  },

  // Thịt & Gia cầm - Vissan
  {
    id: "ing-vis-1",
    name: "Thịt bò nạc loại 1",
    category: "Thịt & Gia cầm",
    supplierId: "sup-vis",
    defaultQty: 40,
    unit: "g",
    allergen: null
  },
  {
    id: "ing-vis-2",
    name: "Thịt bê mềm phi lê",
    category: "Thịt & Gia cầm",
    supplierId: "sup-vis",
    defaultQty: 45,
    unit: "g",
    allergen: null
  },

  // Thủy hải sản - Hải sản Vũng Tàu
  {
    id: "ing-sea-1",
    name: "Tôm sú biển tươi",
    category: "Thủy hải sản",
    supplierId: "sup-sea",
    defaultQty: 65,
    unit: "g",
    allergen: "Giáp xác",
    allergyWarning: "12 học sinh dị ứng Giáp xác (Lớp 1A: 4, 2B: 5, 3C: 3)"
  },
  {
    id: "ing-sea-2",
    name: "Cá điêu hồng phi lê",
    category: "Thủy hải sản",
    supplierId: "sup-sea",
    defaultQty: 60,
    unit: "g",
    allergen: "Cá / Thủy sản",
    allergyWarning: "8 học sinh dị ứng Cá (Lớp 2A: 3, 4B: 5)"
  },
  {
    id: "ing-sea-3",
    name: "Mực nang tươi",
    category: "Thủy hải sản",
    supplierId: "sup-sea",
    defaultQty: 50,
    unit: "g",
    allergen: "Hải sản thân mềm",
    allergyWarning: "6 học sinh dị ứng Mực (Lớp 3A: 2, 5B: 4)"
  },

  // Rau củ quả - HTX Nam Hà
  {
    id: "ing-veg-1",
    name: "Cải ngọt VietGAP",
    category: "Rau củ quả",
    supplierId: "sup-veg",
    defaultQty: 50,
    unit: "g",
    allergen: null
  },
  {
    id: "ing-veg-2",
    name: "Bí đỏ hồ lô",
    category: "Rau củ quả",
    supplierId: "sup-veg",
    defaultQty: 60,
    unit: "g",
    allergen: null
  },
  {
    id: "ing-veg-3",
    name: "Cà rốt Đà Lạt",
    category: "Rau củ quả",
    supplierId: "sup-veg",
    defaultQty: 30,
    unit: "g",
    allergen: null
  },
  {
    id: "ing-veg-4",
    name: "Cần tây sạch",
    category: "Rau củ quả",
    supplierId: "sup-veg",
    defaultQty: 25,
    unit: "g",
    allergen: null
  },

  // Trứng gia cầm - Ba Huân
  {
    id: "ing-egg-1",
    name: "Trứng cút tươi",
    category: "Trứng gia cầm",
    supplierId: "sup-egg",
    defaultQty: 2,
    unit: "quả",
    allergen: null
  },
  {
    id: "ing-egg-2",
    name: "Trứng gà tươi loại 1",
    category: "Trứng gia cầm",
    supplierId: "sup-egg",
    defaultQty: 1,
    unit: "quả",
    allergen: "Trứng gà",
    allergyWarning: "5 học sinh dị ứng Trứng gà (Lớp 1B: 2, 4A: 3)"
  },

  // Tinh bột & Ngũ cốc - Gạo Hải Hậu
  {
    id: "ing-rice-1",
    name: "Gạo tám thơm Hải Hậu",
    category: "Tinh bột & Ngũ cốc",
    supplierId: "sup-rice",
    defaultQty: 120,
    unit: "g",
    allergen: null
  },
  {
    id: "ing-rice-2",
    name: "Gạo lứt đỏ huyết rồng",
    category: "Tinh bột & Ngũ cốc",
    supplierId: "sup-rice",
    defaultQty: 110,
    unit: "g",
    allergen: null
  }
]

// 4. Món ăn khởi tạo mặc định trong thực đơn (Tên món nhập text tự do)
export const INITIAL_DISHES = [
  {
    id: "dish-1",
    name: "Tôm sú hấp sả",
    ingredientCategory: "Thủy hải sản",
    supplierId: "sup-sea",
    ingredientId: "ing-sea-1",
    portionQty: 65,
    unit: "g"
  },
  {
    id: "dish-2",
    name: "Thịt heo kho trứng cút",
    ingredientCategory: "Thịt & Gia cầm",
    supplierId: "sup-cp",
    ingredientId: "ing-cp-1",
    portionQty: 45,
    unit: "g"
  },
  {
    id: "dish-3",
    name: "Canh cải ngọt nấu thịt bằm",
    ingredientCategory: "Rau củ quả",
    supplierId: "sup-veg",
    ingredientId: "ing-veg-1",
    portionQty: 50,
    unit: "g"
  },
  {
    id: "dish-4",
    name: "Cơm trắng tám thơm",
    ingredientCategory: "Tinh bột & Ngũ cốc",
    supplierId: "sup-rice",
    ingredientId: "ing-rice-1",
    portionQty: 120,
    unit: "g"
  }
]

// 5. Gia vị dùng chung bữa ăn học đường (Chỉ nhập định lượng, KHÔNG check tồn kho)
export const INITIAL_SEASONINGS = [
  {
    id: "seas-1",
    name: "Dầu ăn thực vật Neptune",
    portionQty: 5,
    unit: "ml"
  },
  {
    id: "seas-2",
    name: "Nước mắm Phú Quốc 40°N",
    portionQty: 3,
    unit: "ml"
  },
  {
    id: "seas-3",
    name: "Muối tinh I-ốt Bạc Liêu",
    portionQty: 2,
    unit: "g"
  },
  {
    id: "seas-4",
    name: "Đường cát trắng Biên Hòa",
    portionQty: 2,
    unit: "g"
  }
]
