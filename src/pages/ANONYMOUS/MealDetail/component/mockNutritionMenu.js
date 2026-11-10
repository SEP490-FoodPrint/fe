/**
 * Mock Data: Thực đơn học đường chuẩn hóa
 * Tích hợp song song Món ăn tiêu chuẩn & Món ăn thay thế cho nhóm dị ứng
 * Cung cấp dữ liệu chi tiết nguyên liệu, định lượng và nhà cung cấp VietGAP/OCOP
 */

export const MOCK_NUTRITION_DAILY_MENU = {
  lunch: {
    dishes: [
      {
        id: "dish-lunch-01",
        name: "Gà rim gừng",
        portion: "95g/suất",
        category: "Món mặn chính",
        mainIngredientsText: "Thịt đùi gà phi lê CP, gừng tươi non, nước mắm cá cơm, hành tím",
        ingredients: [
          {
            id: "ing-1-1",
            name: "Thịt đùi gà phi lê sạch CP",
            portion: "75g",
            category: "Thịt & Gia cầm",
            supplierName: "CP Foods Việt Nam (Chứng nhận VietGAP)",
          },
          {
            id: "ing-1-2",
            name: "Gừng non tươi",
            portion: "10g",
            category: "Rau thơm & Gia vị",
            supplierName: "Nông sản sạch Mộc Châu",
          },
          {
            id: "ing-1-3",
            name: "Nước mắm cá cơm truyền thống",
            portion: "5ml",
            category: "Gia vị tự nhiên",
            supplierName: "Nước mắm Phú Quốc",
          },
          {
            id: "ing-1-4",
            name: "Hành tím & Tiêu sọ",
            portion: "5g",
            category: "Gia vị tự nhiên",
            supplierName: "HTX Nông nghiệp sạch",
          },
        ],
        alternativeDish: {
          id: "alt-lunch-01",
          name: "Thịt heo rim mật mía",
          portion: "90g/suất",
          allergyGroup: "Dị ứng thịt gà & gia cầm",
          tag: "Thay món gà",
          category: "Món mặn thay thế",
          mainIngredientsText: "Thịt nạc thăn heo CP, mật mía Nghệ An, nước mắm truyền thống",
          ingredients: [
            {
              id: "alt-ing-1-1",
              name: "Thịt nạc thăn heo tươi CP",
              portion: "75g",
              category: "Thịt tươi sống",
              supplierName: "CP Foods Việt Nam (VietGAP)",
            },
            {
              id: "alt-ing-1-2",
              name: "Mật mía Nghệ An nguyên chất",
              portion: "8ml",
              category: "Gia vị tự nhiên",
              supplierName: "Nông sản sạch Nghệ An",
            },
            {
              id: "alt-ing-1-3",
              name: "Nước mắm cá cơm truyền thống",
              portion: "5ml",
              category: "Gia vị tự nhiên",
              supplierName: "Nước mắm Phú Quốc",
            },
            {
              id: "alt-ing-1-4",
              name: "Hành khô & Dầu đậu nành tinh luyện",
              portion: "2g",
              category: "Gia vị tự nhiên",
              supplierName: "Dầu Simply an toàn",
            },
          ],
        },
      },
      {
        id: "dish-lunch-02",
        name: "Canh bí đỏ hầm tôm sú",
        portion: "180ml/suất",
        category: "Canh dinh dưỡng",
        mainIngredientsText: "Bí đỏ hồ lô Mộc Châu, tôm sú biển Vũng Tàu, hành hoa",
        ingredients: [
          {
            id: "ing-2-1",
            name: "Bí đỏ hồ lô Mộc Châu",
            portion: "60g",
            category: "Rau củ quả",
            supplierName: "Nông sản sạch Mộc Châu",
          },
          {
            id: "ing-2-2",
            name: "Tôm sú tươi bóc nõn",
            portion: "30g",
            category: "Thủy hải sản",
            supplierName: "Hải sản Sạch Vũng Tàu (Đánh bắt tự nhiên)",
          },
          {
            id: "ing-2-3",
            name: "Hành hoa & Ngò rí",
            portion: "5g",
            category: "Rau thơm & Gia vị",
            supplierName: "HTX Rau sạch Nam Hà",
          },
        ],
        alternativeDish: {
          id: "alt-lunch-02",
          name: "Canh bí đỏ thịt nạc bằm CP",
          portion: "180ml/suất",
          allergyGroup: "Dị ứng tôm & Thủy hải sản",
          tag: "Thay món tôm",
          category: "Canh thay thế",
          mainIngredientsText: "Bí đỏ hồ lô Mộc Châu, thịt nạc thăn bằm CP, hành hoa",
          ingredients: [
            {
              id: "alt-ing-2-1",
              name: "Bí đỏ hồ lô Mộc Châu",
              portion: "60g",
              category: "Rau củ quả",
              supplierName: "Nông sản sạch Mộc Châu",
            },
            {
              id: "alt-ing-2-2",
              name: "Thịt nạc thăn heo bằm CP",
              portion: "35g",
              category: "Thịt tươi sống",
              supplierName: "CP Foods Việt Nam (VietGAP)",
            },
            {
              id: "alt-ing-2-3",
              name: "Hành hoa & Gia vị thảo mộc",
              portion: "5g",
              category: "Rau thơm & Gia vị",
              supplierName: "HTX Rau sạch Nam Hà",
            },
          ],
        },
      },
      {
        id: "dish-lunch-03",
        name: "Trứng cuộn rau củ Ba Huân",
        portion: "80g/suất",
        category: "Món phụ giàu đạm",
        mainIngredientsText: "Trứng gà tươi sạch Ba Huân, cà rốt Đà Lạt, bắp ngọt non",
        ingredients: [
          {
            id: "ing-3-1",
            name: "Trứng gà tươi sạch Ba Huân",
            portion: "50g (1 quả)",
            category: "Trứng gia cầm",
            supplierName: "Công ty Ba Huân (Kiểm dịch ATTP)",
          },
          {
            id: "ing-3-2",
            name: "Cà rốt Đà Lạt & Bắp ngọt non",
            portion: "30g",
            category: "Rau củ quả",
            supplierName: "Nông sản sạch Đà Lạt (VietGAP)",
          },
        ],
        alternativeDish: {
          id: "alt-lunch-03",
          name: "Đậu hũ non sốt thịt nạc cà chua",
          portion: "95g/suất",
          allergyGroup: "Dị ứng trứng gia cầm",
          tag: "Thay món trứng",
          category: "Món phụ thay thế",
          mainIngredientsText: "Đậu hũ non tươi VietGAP, thịt nạc heo bằm CP, cà chua chín",
          ingredients: [
            {
              id: "alt-ing-3-1",
              name: "Đậu hũ non sạch VietGAP",
              portion: "60g",
              category: "Đạm thực vật",
              supplierName: "HTX Đậu sạch Nam Hà",
            },
            {
              id: "alt-ing-3-2",
              name: "Thịt nạc heo bằm CP",
              portion: "25g",
              category: "Thịt tươi sống",
              supplierName: "CP Foods Việt Nam (VietGAP)",
            },
            {
              id: "alt-ing-3-3",
              name: "Cà chua chín tự nhiên & Hành lá",
              portion: "10g",
              category: "Rau củ quả",
              supplierName: "Nông sản Đà Lạt",
            },
          ],
        },
      },
      {
        id: "dish-lunch-04",
        name: "Rau cải luộc",
        portion: "70g/suất",
        category: "Rau xanh & Chất xơ",
        mainIngredientsText: "Cải ngọt non VietGAP Nam Hà, muối tinh sạch",
        ingredients: [
          {
            id: "ing-4-1",
            name: "Cải ngọt non VietGAP Nam Hà",
            portion: "70g",
            category: "Rau củ quả",
            supplierName: "HTX Rau sạch Nam Hà (VietGAP Organic)",
          },
          {
            id: "ing-4-2",
            name: "Muối tinh sạch",
            portion: "1g",
            category: "Gia vị tự nhiên",
            supplierName: "Muối sạch Bạc Liêu",
          },
        ],
        alternativeDish: null, // Dùng chung cho mọi đối tượng
      },
      {
        id: "dish-lunch-05",
        name: "Cơm trắng ST25",
        portion: "150g/suất",
        category: "Tinh bột & Năng lượng",
        mainIngredientsText: "Gạo thơm ST25 Sóc Trăng, nước tinh khiết",
        ingredients: [
          {
            id: "ing-5-1",
            name: "Gạo thơm ST25 Sóc Trăng",
            portion: "120g",
            category: "Tinh bột & Ngũ cốc",
            supplierName: "Gạo ST25 Sóc Trăng (OCOP 5 sao)",
          },
          {
            id: "ing-5-2",
            name: "Nước lọc tinh khiết",
            portion: "180ml",
            category: "Nước uống & Chế biến",
            supplierName: "Nước sạch thành phố",
          },
        ],
        alternativeDish: null, // Dùng chung cho mọi đối tượng
      },
      {
        id: "dish-lunch-06",
        name: "Cam ngọt tráng miệng",
        portion: "120g/suất",
        category: "Trái cây tráng miệng",
        mainIngredientsText: "Cam sành Hàm Yên mọng nước chín ngọt tự nhiên",
        ingredients: [
          {
            id: "ing-6-1",
            name: "Cam sành Hàm Yên VietGAP",
            portion: "1 quả (120g)",
            category: "Trái cây tươi",
            supplierName: "Nông sản Hàm Yên (Chứng nhận VietGAP)",
          },
        ],
        alternativeDish: null, // Dùng chung cho mọi đối tượng
      },
    ],
  },
  snack: {
    dishes: [
      {
        id: "dish-snack-01",
        name: "Bánh flan caramen mềm mịn",
        portion: "1 hũ 80g/suất",
        category: "Bữa phụ dinh dưỡng",
        mainIngredientsText: "Trứng gà tươi Ba Huân, sữa bò tươi TH True Milk, đường caramen",
        ingredients: [
          {
            id: "ing-sn-1",
            name: "Trứng gà tươi Ba Huân",
            portion: "35g",
            category: "Trứng gia cầm",
            supplierName: "Công ty Ba Huân (Kiểm dịch ATTP)",
          },
          {
            id: "ing-sn-2",
            name: "Sữa bò tươi TH True Milk",
            portion: "40ml",
            category: "Sữa & Chế phẩm sữa",
            supplierName: "Công ty CP Chuỗi Thực Phẩm TH",
          },
          {
            id: "ing-sn-3",
            name: "Đường mía nấu caramen",
            portion: "5g",
            category: "Gia vị tự nhiên",
            supplierName: "Đường Biên Hòa",
          },
        ],
        alternativeDish: {
          id: "alt-snack-01",
          name: "Chè hạt sen long nhãn Huế",
          portion: "150ml/suất",
          allergyGroup: "Dị ứng trứng & Sữa bò",
          tag: "Thay bánh flan",
          category: "Món phụ thay thế",
          mainIngredientsText: "Hạt sen tươi Huế, long nhãn Hưng Yên, đường phèn",
          ingredients: [
            {
              id: "alt-sn-1",
              name: "Hạt sen tươi Huế",
              portion: "35g",
              category: "Hạt & Nông sản khô",
              supplierName: "Đặc sản Huế",
            },
            {
              id: "alt-sn-2",
              name: "Long nhãn Hưng Yên",
              portion: "25g",
              category: "Nông sản",
              supplierName: "Nông sản Hưng Yên",
            },
            {
              id: "alt-sn-3",
              name: "Đường phèn tự nhiên",
              portion: "10g",
              category: "Gia vị tự nhiên",
              supplierName: "Đường Biên Hòa",
            },
          ],
        },
      },
      {
        id: "dish-snack-02",
        name: "Sữa tươi tiệt trùng TH True Milk",
        portion: "1 hộp 180ml/suất",
        category: "Sữa dinh dưỡng học đường",
        mainIngredientsText: "Sữa bò tươi nguyên chất 100% bổ sung Canxi & Vitamin D3",
        ingredients: [
          {
            id: "ing-sn-4",
            name: "Sữa bò tươi nguyên chất TH True Milk",
            portion: "180ml",
            category: "Sữa & Chế phẩm sữa",
            supplierName: "Công ty CP Chuỗi Thực Phẩm TH (Chuẩn Organic)",
          },
        ],
        alternativeDish: {
          id: "alt-snack-02",
          name: "Sữa hạt đậu nành hữu cơ Vinasoy",
          portion: "1 hộp 180ml/suất",
          allergyGroup: "Dị ứng đạm sữa bò (Lactose)",
          tag: "Thay thế sữa bò",
          category: "Sữa hạt thay thế",
          mainIngredientsText: "100% hạt đậu nành hữu cơ chọn lọc, không chứa lactose sữa bò",
          ingredients: [
            {
              id: "alt-sn-5",
              name: "Hạt đậu nành hữu cơ nguyên chất",
              portion: "160ml",
              category: "Sữa hạt thực vật",
              supplierName: "Công ty Sữa Đậu Nành Vinasoy",
            },
            {
              id: "alt-sn-6",
              name: "Đường mía tự nhiên & Nước tinh khiết",
              portion: "20ml",
              category: "Nước & Gia vị",
              supplierName: "Vinasoy",
            },
          ],
        },
      },
    ],
  },
};

/**
 * Hàm semantic matcher: Khớp món ăn từ API với từ điển dinh dưỡng và cặp món dị ứng thay thế
 * Tuyệt đối không fallback theo số thứ tự mảng (index modulo)
 */
export function resolveDishNutritionInfo(dishName, mealType = "LUNCH") {
  if (!dishName || typeof dishName !== "string") {
    return null;
  }
  const cleanName = dishName.trim().toLowerCase();
  const pool =
    mealType === "AFTERNOON" || mealType === "SNACK"
      ? MOCK_NUTRITION_DAILY_MENU.snack.dishes
      : MOCK_NUTRITION_DAILY_MENU.lunch.dishes;

  // 1. Khớp chính xác tên
  const exact = pool.find(
    (d) => d.name.toLowerCase() === cleanName || cleanName.includes(d.name.toLowerCase())
  );
  if (exact) return exact;

  // 2. Nhận diện từ khóa thông minh
  if (cleanName.includes("gà") || cleanName.includes("ga")) {
    return pool.find((d) => d.id === "dish-lunch-01") || pool[0];
  }
  if (cleanName.includes("canh") || cleanName.includes("bí đỏ")) {
    return pool.find((d) => d.id === "dish-lunch-02") || pool[1];
  }
  if (cleanName.includes("trứng") || cleanName.includes("trung")) {
    return pool.find((d) => d.id === "dish-lunch-03") || pool[2];
  }
  if (cleanName.includes("cải") || cleanName.includes("rau") || cleanName.includes("luộc")) {
    return pool.find((d) => d.id === "dish-lunch-04") || pool[3];
  }
  if (cleanName.includes("cơm") || cleanName.includes("gạo") || cleanName.includes("st25")) {
    return pool.find((d) => d.id === "dish-lunch-05") || pool[4];
  }
  if (cleanName.includes("cam") || cleanName.includes("trái cây") || cleanName.includes("tráng miệng")) {
    return pool.find((d) => d.id === "dish-lunch-06") || pool[5];
  }
  if (cleanName.includes("flan") || cleanName.includes("bánh")) {
    return MOCK_NUTRITION_DAILY_MENU.snack.dishes[0];
  }
  if (cleanName.includes("sữa") || cleanName.includes("sua")) {
    return MOCK_NUTRITION_DAILY_MENU.snack.dishes[1];
  }

  // 3. Fallback an toàn tự sinh theo chính tên món (không tráo món khác)
  return {
    id: `dish-custom-${cleanName.replace(/\s+/g, "-")}`,
    name: dishName,
    portion: mealType === "AFTERNOON" ? "100g/suất" : "120g/suất",
    category: "Món ăn học đường",
    mainIngredientsText: "Nguyên liệu kiểm thực tươi sạch theo chuẩn an toàn thực phẩm học đường",
    ingredients: [
      {
        id: `ing-custom-${cleanName}`,
        name: dishName,
        portion: "100g",
        category: "Món ăn chính",
        supplierName: "Nhà cung cấp thực phẩm học đường VietGAP",
      },
    ],
    alternativeDish: null,
  };
}
