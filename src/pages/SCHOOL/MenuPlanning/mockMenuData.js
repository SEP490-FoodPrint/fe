export const INITIAL_DISHES = [
  {
    id: "dish-1",
    name: "Tôm sú hấp sả",
    category: "Món mặn",
    categoryType: "main",
    hasAllergyConflict: true,
    allergenName: "Giáp xác",
    allergyCount: 12,
    allergyClasses: ["Lớp 1A (4 HS)", "Lớp 2B (5 HS)", "Lớp 3C (3 HS)"],
    ingredients: [
      {
        id: "ing-1-1",
        name: "Tôm sú tươi",
        supplier: "Hải sản Vũng Tàu",
        portionQty: 65,
        unit: "g",
        hasAllergen: true
      },
      {
        id: "ing-1-2",
        name: "Sả cây tươi",
        supplier: "Nông sản Đà Lạt",
        portionQty: 10,
        unit: "g",
        hasAllergen: false
      }
    ]
  },
  {
    id: "dish-2",
    name: "Thịt heo kho trứng cút",
    category: "Món mặn phụ",
    categoryType: "side",
    hasAllergyConflict: false,
    ingredients: [
      {
        id: "ing-2-1",
        name: "Thịt ba chỉ sạch",
        supplier: "CP Foods Việt Nam",
        portionQty: 45,
        unit: "g",
        hasAllergen: false
      },
      {
        id: "ing-2-2",
        name: "Trứng cút tươi",
        supplier: "Công ty Ba Huân",
        portionQty: 2,
        unit: "quả",
        hasAllergen: false
      }
    ]
  },
  {
    id: "dish-3",
    name: "Canh cải ngọt nấu thịt bằm",
    category: "Món canh",
    categoryType: "soup",
    hasAllergyConflict: false,
    ingredients: [
      {
        id: "ing-3-1",
        name: "Cải ngọt VietGAP",
        supplier: "HTX Rau Nam Hà",
        portionQty: 50,
        unit: "g",
        hasAllergen: false
      },
      {
        id: "ing-3-2",
        name: "Thịt nạc xay",
        supplier: "CP Foods Việt Nam",
        portionQty: 15,
        unit: "g",
        hasAllergen: false
      }
    ]
  },
  {
    id: "dish-4",
    name: "Cơm trắng tám thơm",
    category: "Cơm / Tinh bột",
    categoryType: "rice",
    hasAllergyConflict: false,
    ingredients: [
      {
        id: "ing-4-1",
        name: "Gạo tám thơm Hải Hậu",
        supplier: "Gạo sạch Hải Hậu",
        portionQty: 120,
        unit: "g",
        hasAllergen: false
      }
    ]
  }
]

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

export const DISH_REPOSITORY = [
  {
    id: "repo-1",
    name: "Thịt bò xào rau củ thập cẩm",
    category: "Món mặn",
    categoryType: "main",
    allergenAlert: null,
    supplierName: "Vissan & HTX Rau Nam Hà",
    description: "Thịt bò nạc xào cần tây, cà rốt, ớt chuông. Giàu sắt và protein.",
    ingredientsText: "Thịt bò nạc (40g), Cần tây (25g), Cà rốt (20g)"
  },
  {
    id: "repo-2",
    name: "Gà hấp lá chanh",
    category: "Món mặn",
    categoryType: "main",
    allergenAlert: null,
    supplierName: "CP Foods Việt Nam",
    description: "Thịt gà thả vườn hấp lá chanh thanh đạm, giàu đạm dễ tiêu hóa.",
    ingredientsText: "Thịt đùi gà (70g), Lá chanh (5g)"
  },
  {
    id: "repo-3",
    name: "Cá điêu hồng sốt cà chua",
    category: "Món mặn",
    categoryType: "main",
    allergenAlert: "Dị ứng: Cá / Thủy sản",
    supplierName: "Thủy sản Miền Tây",
    description: "Cá điêu hồng phi lê lọc sạch xương sốt cà chua tươi.",
    ingredientsText: "Cá điêu hồng phi lê (60g), Cà chua (30g)"
  },
  {
    id: "repo-4",
    name: "Canh bí đỏ nấu tôm khô",
    category: "Món canh",
    categoryType: "soup",
    allergenAlert: "Dị ứng: Giáp xác (Tôm khô)",
    supplierName: "Nông sản Đà Lạt",
    description: "Bí đỏ bùi ngọt nấu tôm khô thơm lừng, bổ sung vitamin A.",
    ingredientsText: "Bí đỏ (60g), Tôm khô loại 1 (8g)"
  },
  {
    id: "repo-5",
    name: "Trứng chiên thịt bằm nấm mèo",
    category: "Món mặn phụ",
    categoryType: "side",
    allergenAlert: "Dị ứng: Trứng gà",
    supplierName: "Công ty Ba Huân",
    description: "Trứng gà tươi đánh đều thịt heo bằm và mộc nhĩ giòn dai.",
    ingredientsText: "Trứng gà (1 quả), Thịt heo xay (20g), Nấm mèo (5g)"
  },
  {
    id: "repo-6",
    name: "Chuối tiêu tráng miệng VietGAP",
    category: "Tráng miệng",
    categoryType: "dessert",
    allergenAlert: null,
    supplierName: "HTX Nông nghiệp Tân Dân",
    description: "Chuối tiêu chín tự nhiên, giàu kali và vitamin tốt cho tiêu hóa học sinh.",
    ingredientsText: "Chuối tiêu (1 quả ~ 100g)"
  }
]

