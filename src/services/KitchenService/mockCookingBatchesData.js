/**
 * Mock data phong phú cho Lô chế biến (Cooking Batches) & Chi tiết lô
 * Hỗ trợ demo toàn diện mọi trạng thái trong vòng đời mẻ nấu:
 * 1. UNCONFIRMED (Chưa xác nhận)
 * 2. CONFIRMED (Chờ nấu)
 * 3. COMPLETED - Chưa lưu mẫu (Để nhân viên bếp bấm Lưu mẫu)
 * 4. COMPLETED - Đang lưu mẫu 24h
 * 5. COMPLETED - Đã tiêu hủy mẫu
 */

const today = new Date();
const pad = (n) => String(n).padStart(2, "0");
const todayISO = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
const todayCode = `${today.getFullYear()}${pad(today.getMonth() + 1)}${pad(today.getDate())}`;
const yesterdayISO = new Date(today.getTime() - 86400000)
  .toISOString()
  .slice(0, 10);
const yesterdayCode = yesterdayISO.replace(/-/g, "");

const ms = (hours) => hours * 3600000;

export let IN_MEMORY_MOCK_BATCHES = [
  // LÔ 1: UNCONFIRMED - Chưa xác nhận (Ca trưa hôm nay)
  {
    id: "b0000001-0000-0000-0000-000000000001",
    legacyId: "cb-20261108-001",
    batchCode: "CB-20261108-001",
    mealType: "LUNCH",
    cookingModeApplied: "COMBINE_LOTS",
    status: "UNCONFIRMED",
    plannedPortions: 420,
    preparedPortions: null,
    note: "Lô canh rau củ thịt băm dự kiến ca trưa, chờ bếp trưởng đối soát định lượng nguyên liệu.",
    createdAt: new Date(today.getTime() - ms(3)).toISOString(),
    confirmedAt: null,
    completedAt: null,
    MenuDay: {
      id: "md-today-01",
      menuDate: `${todayISO}T00:00:00.000Z`,
    },
    Dish: {
      id: "dish-canh-01",
      name: "Canh cải bẹ xanh thịt băm",
      category: "Món canh",
    },
    cookingBatchLots: [
      {
        ingredientLotId: "lot-thit-01",
        ingredientName: "Thịt nạc vai heo xay VietGAP",
        lotCode: "LOT-NVH-20261108-01",
        quantityUsed: 18.5,
        unit: "kg",
        expirationDate: "10/11/2026",
      },
      {
        ingredientLotId: "lot-cai-02",
        ingredientName: "Cải bẹ xanh Đà Lạt Green",
        lotCode: "LOT-CBX-20261108-02",
        quantityUsed: 35.0,
        unit: "kg",
        expirationDate: "09/11/2026",
      },
      {
        ingredientLotId: "lot-hanh-03",
        ingredientName: "Hành hoa & ngò rí",
        lotCode: "LOT-HNG-20261108-03",
        quantityUsed: 2.0,
        unit: "kg",
        expirationDate: "09/11/2026",
      },
    ],
    retainedFoodSample: null,
  },

  // LÔ 2: CONFIRMED - Chờ nấu (Ca trưa hôm nay)
  {
    id: "b0000001-0000-0000-0000-000000000002",
    legacyId: "cb-20261108-002",
    batchCode: "CB-20261108-002",
    mealType: "LUNCH",
    cookingModeApplied: "SEPARATE_BY_LOT",
    status: "CONFIRMED",
    plannedPortions: 420,
    preparedPortions: null,
    note: "Đã phân tách 2 chảo xào riêng biệt theo nguồn thịt gà đồi Chí Linh.",
    createdAt: new Date(today.getTime() - ms(4)).toISOString(),
    confirmedAt: new Date(today.getTime() - ms(1.5)).toISOString(),
    completedAt: null,
    MenuDay: {
      id: "md-today-01",
      menuDate: `${todayISO}T00:00:00.000Z`,
    },
    Dish: {
      id: "dish-ga-02",
      name: "Thịt gà xào nấm đông cô",
      category: "Món mặn chính",
    },
    cookingBatchLots: [
      {
        ingredientLotId: "lot-ga-01",
        ingredientName: "Đùi gà góc tư rút xương Chí Linh",
        lotCode: "LOT-GCL-20261108-01",
        quantityUsed: 42.0,
        unit: "kg",
        expirationDate: "10/11/2026",
      },
      {
        ingredientLotId: "lot-nam-02",
        ingredientName: "Nấm đông cô tươi chọn lọc",
        lotCode: "LOT-NDC-20261108-02",
        quantityUsed: 15.0,
        unit: "kg",
        expirationDate: "10/11/2026",
      },
      {
        ingredientLotId: "lot-dauhao-03",
        ingredientName: "Dầu hào Maggi chuyên dụng bếp ăn",
        lotCode: "LOT-DH-202610-01",
        quantityUsed: 1.5,
        unit: "lít",
        expirationDate: "30/05/2027",
      },
    ],
    retainedFoodSample: null,
  },

  // LÔ 3: COMPLETED - Đã nấu xong, CHƯA LƯU MẪU (Sẵn sàng để thử nghiệm bấm Lưu Mẫu!)
  {
    id: "b0000001-0000-0000-0000-000000000003",
    legacyId: "cb-20261108-003",
    batchCode: "CB-20261108-003",
    mealType: "LUNCH",
    cookingModeApplied: "COMBINE_LOTS",
    status: "COMPLETED",
    plannedPortions: 420,
    preparedPortions: 420,
    note: "Nấu hoàn tất lúc 10:30, món mặn màu cánh gián tự nhiên, nhiệt độ lõi đạt 88°C. CẦN LƯU MẪU 24H NGAY.",
    createdAt: new Date(today.getTime() - ms(5)).toISOString(),
    confirmedAt: new Date(today.getTime() - ms(3.5)).toISOString(),
    completedAt: new Date(today.getTime() - ms(0.8)).toISOString(),
    MenuDay: {
      id: "md-today-01",
      menuDate: `${todayISO}T00:00:00.000Z`,
    },
    Dish: {
      id: "dish-thit-03",
      name: "Thịt heo kho cút nước dừa",
      category: "Món mặn chính",
    },
    cookingBatchLots: [
      {
        ingredientLotId: "lot-thitba-01",
        ingredientName: "Thịt ba chỉ heo tươi sạch Ba Vì",
        lotCode: "LOT-TBV-20261108-01",
        quantityUsed: 38.0,
        unit: "kg",
        expirationDate: "10/11/2026",
      },
      {
        ingredientLotId: "lot-trung-02",
        ingredientName: "Trứng cút luộc bóc vỏ tiệt trùng",
        lotCode: "LOT-TC-20261108-02",
        quantityUsed: 1260,
        unit: "quả",
        expirationDate: "11/11/2026",
      },
      {
        ingredientLotId: "lot-nuocdua-03",
        ingredientName: "Nước dừa xiêm tươi Bến Tre",
        lotCode: "LOT-NDX-20261108-03",
        quantityUsed: 12.0,
        unit: "lít",
        expirationDate: "10/11/2026",
      },
    ],
    retainedFoodSample: null, // Chưa lưu mẫu!
  },

  // LÔ 4: COMPLETED - Đã nấu xong và ĐANG LƯU MẪU (24h)
  {
    id: "b0000001-0000-0000-0000-000000000004",
    legacyId: "cb-20261108-004",
    batchCode: "CB-20261108-004",
    mealType: "AFTERNOON",
    cookingModeApplied: "COMBINE_LOTS",
    status: "COMPLETED",
    plannedPortions: 380,
    preparedPortions: 380,
    note: "Tráng miệng xế chuẩn bị xong lúc 14:00, đã lưu mẫu và cất tủ mát B1.",
    createdAt: new Date(today.getTime() - ms(6)).toISOString(),
    confirmedAt: new Date(today.getTime() - ms(5)).toISOString(),
    completedAt: new Date(today.getTime() - ms(2)).toISOString(),
    MenuDay: {
      id: "md-today-01",
      menuDate: `${todayISO}T00:00:00.000Z`,
    },
    Dish: {
      id: "dish-suachua-04",
      name: "Sữa chua hoa quả dầm hạt chia",
      category: "Bữa xế dinh dưỡng",
    },
    cookingBatchLots: [
      {
        ingredientLotId: "lot-suachua-01",
        ingredientName: "Sữa chua tiệt trùng không đường Ba Vì",
        lotCode: "LOT-SC-20261108-01",
        quantityUsed: 380,
        unit: "hộp",
        expirationDate: "25/11/2026",
      },
      {
        ingredientLotId: "lot-hoaqua-02",
        ingredientName: "Dưa hấu & xoài cát thái hạt lựu",
        lotCode: "LOT-HQ-20261108-02",
        quantityUsed: 25.0,
        unit: "kg",
        expirationDate: "09/11/2026",
      },
    ],
    retainedFoodSample: {
      id: "smp-005",
      sampledAt: new Date(today.getTime() - ms(2)).toISOString(),
      quantity: "100",
      unit: "ml",
      storageLocation: "Tủ B1 - Ngăn 01",
      status: "STORED",
      packaging: "Hộp thủy tinh có nắp kín",
    },
  },

  // LÔ 5: COMPLETED - Đã nấu hôm qua và ĐÃ TIÊU HỦY MẪU
  {
    id: "cb-20261107-005",
    batchCode: "CB-20261107-005",
    mealType: "LUNCH",
    cookingModeApplied: "SEPARATE_BY_LOT",
    status: "COMPLETED",
    plannedPortions: 410,
    preparedPortions: 410,
    note: "Mẻ nấu hôm qua, bảo quản tủ A2 đủ 24h và đã hủy mẫu an toàn.",
    createdAt: new Date(today.getTime() - ms(28)).toISOString(),
    confirmedAt: new Date(today.getTime() - ms(27)).toISOString(),
    completedAt: new Date(today.getTime() - ms(25)).toISOString(),
    MenuDay: {
      id: "md-yesterday-01",
      menuDate: `${yesterdayISO}T00:00:00.000Z`,
    },
    Dish: {
      id: "dish-gacam-05",
      name: "Gà áp chảo sốt cam",
      category: "Món mặn",
    },
    cookingBatchLots: [
      {
        ingredientLotId: "lot-gacam-01",
        ingredientName: "Ức gà phi lê tươi sạch",
        lotCode: "LOT-UG-20261107-01",
        quantityUsed: 40.0,
        unit: "kg",
        expirationDate: "09/11/2026",
      },
      {
        ingredientLotId: "lot-cam-02",
        ingredientName: "Nước cam sành vắt tươi",
        lotCode: "LOT-NC-20261107-02",
        quantityUsed: 8.0,
        unit: "lít",
        expirationDate: "09/11/2026",
      },
    ],
    retainedFoodSample: {
      id: "smp-004",
      sampledAt: new Date(today.getTime() - ms(25)).toISOString(),
      quantity: "120",
      unit: "g",
      storageLocation: "Tủ A2 - Ngăn 02 (Đã giải phóng)",
      status: "DISPOSED",
      disposedAt: new Date(today.getTime() - ms(1)).toISOString(),
      disposalNote: "Hết hạn 24h, mẫu cảm quan bình thường, khử khuẩn lọ lưu.",
    },
  },

  // LÔ 6: CONFIRMED - Bữa xế chiều hôm nay
  {
    id: "b0000001-0000-0000-0000-000000000006",
    legacyId: "cb-20261108-006",
    batchCode: "CB-20261108-006",
    mealType: "AFTERNOON",
    cookingModeApplied: "COMBINE_LOTS",
    status: "CONFIRMED",
    plannedPortions: 380,
    preparedPortions: null,
    note: "Chuẩn bị nướng chè bắp thơm lúc 14:15 phục vụ học sinh ăn xế.",
    createdAt: new Date(today.getTime() - ms(4.5)).toISOString(),
    confirmedAt: new Date(today.getTime() - ms(2)).toISOString(),
    completedAt: null,
    MenuDay: {
      id: "md-today-01",
      menuDate: `${todayISO}T00:00:00.000Z`,
    },
    Dish: {
      id: "dish-chebap-06",
      name: "Chè bắp lá dứa nước cốt dừa",
      category: "Bữa xế dinh dưỡng",
    },
    cookingBatchLots: [
      {
        ingredientLotId: "lot-bap-01",
        ingredientName: "Bắp ngọt hạt tươi Đà Lạt",
        lotCode: "LOT-BN-20261108-01",
        quantityUsed: 30.0,
        unit: "kg",
        expirationDate: "12/11/2026",
      },
      {
        ingredientLotId: "lot-cotdua-02",
        ingredientName: "Nước cốt dừa nguyên chất",
        lotCode: "LOT-CD-20261108-02",
        quantityUsed: 6.0,
        unit: "lít",
        expirationDate: "15/11/2026",
      },
    ],
    retainedFoodSample: null,
  },
];

/**
 * Lọc danh sách lô theo các tiêu chí (search, status, mealType, date)
 */
export function getMockBatchesPage(filters = {}) {
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;
  const search = (filters.search || "").trim().toLowerCase();
  const mealType = filters.mealType;
  const status = filters.status;
  const cookingMode = filters.cookingModeApplied;

  let list = [...IN_MEMORY_MOCK_BATCHES];

  if (search) {
    list = list.filter((b) => {
      const code = (b.batchCode || "").toLowerCase();
      const dish = (b.Dish?.name || "").toLowerCase();
      return code.includes(search) || dish.includes(search);
    });
  }

  if (mealType) {
    list = list.filter((b) => b.mealType === mealType);
  }

  if (status) {
    list = list.filter((b) => b.status === status);
  }

  if (cookingMode) {
    list = list.filter((b) => b.cookingModeApplied === cookingMode);
  }

  const totalItems = list.length;
  const startIndex = (page - 1) * limit;
  const items = list.slice(startIndex, startIndex + limit);

  return {
    items,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / limit)),
    },
  };
}

/**
 * Thống kê KPI lô chế biến
 */
export function getMockBatchStats(filters = {}) {
  const list = IN_MEMORY_MOCK_BATCHES;

  let total = list.length;
  let unconfirmed = 0;
  let confirmed = 0;
  let completed = 0;
  let storedSamples = 0;
  let disposedSamples = 0;
  let pendingSamples = 0;

  list.forEach((b) => {
    if (b.status === "UNCONFIRMED" || b.status === "DRAFT") unconfirmed++;
    if (b.status === "CONFIRMED") confirmed++;
    if (b.status === "COMPLETED") {
      completed++;
      if (b.retainedFoodSample) {
        if (b.retainedFoodSample.status === "STORED") storedSamples++;
        if (b.retainedFoodSample.status === "DISPOSED") disposedSamples++;
      } else {
        pendingSamples++;
      }
    }
  });

  return {
    total,
    unconfirmed,
    confirmed,
    completed,
    storedSamples,
    disposedSamples,
    pendingSamples,
  };
}

/**
 * -------------------------------------------------------------
 * MOCK DATA PHỤC VỤ KANBAN 4 CỘT TIẾN ĐỘ CHẾ BIẾN BẾP ĂN:
 * 1. Chờ tạo lô (Món trong thực đơn chưa tạo mẻ)
 * 2. Đã tạo lô (Chờ nấu: UNCONFIRMED / CONFIRMED)
 * 3. Đã nấu xong (COMPLETED - Chưa lưu mẫu: hasSample === false)
 * 4. Đã lưu mẫu (COMPLETED - Đã lưu mẫu 24h: hasSample === true)
 * -------------------------------------------------------------
 */

export function getInitialMockPendingDishes() {
  return [
    {
      id: "pending-dish-01",
      dishId: "d-canh-bido-01",
      menuDayId: "md-today-01",
      mealType: "lunch",
      mealName: "Bữa trưa",
      name: "Canh bí đỏ thịt băm",
      portionStandard: 420,
      ingredients: [
        {
          id: "ing-p-01",
          name: "Bí đỏ hồ lô Đà Lạt",
          code: `LOT-BD-${todayCode}-01`,
          amount: "38.0 kg",
          quantity: 38.0,
          unit: "kg",
        },
        {
          id: "ing-p-02",
          name: "Thịt nạc vai heo xay VietGAP",
          code: `LOT-TH-${todayCode}-02`,
          amount: "18.0 kg",
          quantity: 18.0,
          unit: "kg",
        },
        {
          id: "ing-p-03",
          name: "Hành lá & ngò rí",
          code: `LOT-HL-${todayCode}-03`,
          amount: "2.5 kg",
          quantity: 2.5,
          unit: "kg",
        },
      ],
    },
    {
      id: "pending-dish-02",
      dishId: "d-banhflan-02",
      menuDayId: "md-today-01",
      mealType: "afternoon",
      mealName: "Bữa xế",
      name: "Bánh flan caramen sữa tươi",
      portionStandard: 380,
      ingredients: [
        {
          id: "ing-p-04",
          name: "Trứng gà tươi Ba Huân (Loại 1)",
          code: `LOT-TG-${todayCode}-01`,
          amount: "380 quả",
          quantity: 380,
          unit: "quả",
        },
        {
          id: "ing-p-05",
          name: "Sữa tươi tiệt trùng Vinamilk 100%",
          code: `LOT-ST-${todayCode}-02`,
          amount: "25.0 lít",
          quantity: 25.0,
          unit: "lít",
        },
        {
          id: "ing-p-06",
          name: "Đường kính trắng Biên Hòa",
          code: `LOT-DK-${todayCode}-03`,
          amount: "6.0 kg",
          quantity: 6.0,
          unit: "kg",
        },
      ],
    },
    {
      id: "pending-dish-03",
      dishId: "d-raucuxao-03",
      menuDayId: "md-today-01",
      mealType: "lunch",
      mealName: "Bữa trưa",
      name: "Rau củ xào ngũ sắc (cà rốt, bắp non, đậu cô ve)",
      portionStandard: 420,
      ingredients: [
        {
          id: "ing-p-07",
          name: "Cà rốt Đà Lạt tươi sạch",
          code: `LOT-CR-${todayCode}-01`,
          amount: "15.0 kg",
          quantity: 15.0,
          unit: "kg",
        },
        {
          id: "ing-p-08",
          name: "Đậu cô ve giống Nhật",
          code: `LOT-DCV-${todayCode}-02`,
          amount: "20.0 kg",
          quantity: 20.0,
          unit: "kg",
        },
        {
          id: "ing-p-09",
          name: "Bắp bao tử tươi",
          code: `LOT-BBT-${todayCode}-03`,
          amount: "12.0 kg",
          quantity: 12.0,
          unit: "kg",
        },
      ],
    },
  ];
}

export function getInitialMockBatches() {
  return [
    // -------------------------------------------------------------
    // CỘT 2: ĐÃ TẠO LÔ (Chờ nấu: UNCONFIRMED / CONFIRMED)
    // -------------------------------------------------------------
    {
      id: "batch-created-01",
      batchCode: `CB-${todayCode}-001`,
      dishId: "d-gaxaonam-01",
      name: "Thịt gà xào nấm đông cô",
      dishName: "Thịt gà xào nấm đông cô",
      mealType: "lunch",
      mealName: "Bữa trưa",
      status: "CONFIRMED",
      portionStandard: 420,
      plannedPortions: 420,
      cookingModeApplied: "SEPARATE_BY_LOT",
      createdAt: new Date(today.getTime() - ms(3.5)).toISOString(),
      confirmedAt: new Date(today.getTime() - ms(1.5)).toISOString(),
      completedAt: null,
      hasSample: false,
      retainedFoodSamples: [],
      retainedFoodSample: null,
      note: "Đã phân tách chảo xào riêng theo nguồn thịt gà đồi, cân chỉnh gia vị chuẩn bị nấu.",
      ingredients: [
        {
          id: "lot-ga-01",
          name: "Đùi gà góc tư rút xương Chí Linh",
          code: `LOT-GCL-${todayCode}-01`,
          amount: "42.0 kg",
          quantity: 42.0,
          unit: "kg",
        },
        {
          id: "lot-nam-02",
          name: "Nấm đông cô tươi chọn lọc",
          code: `LOT-NDC-${todayCode}-02`,
          amount: "15.0 kg",
          quantity: 15.0,
          unit: "kg",
        },
        {
          id: "lot-dauhao-03",
          name: "Dầu hào Maggi chuyên dụng bếp ăn",
          code: `LOT-DH-${todayCode}-03`,
          amount: "1.5 lít",
          quantity: 1.5,
          unit: "lít",
        },
      ],
      cookingBatchLots: [
        {
          ingredientLotId: "lot-ga-01",
          ingredientName: "Đùi gà góc tư rút xương Chí Linh",
          lotCode: `LOT-GCL-${todayCode}-01`,
          quantityUsed: 42.0,
          unit: "kg",
        },
        {
          ingredientLotId: "lot-nam-02",
          ingredientName: "Nấm đông cô tươi chọn lọc",
          lotCode: `LOT-NDC-${todayCode}-02`,
          quantityUsed: 15.0,
          unit: "kg",
        },
        {
          ingredientLotId: "lot-dauhao-03",
          ingredientName: "Dầu hào Maggi chuyên dụng bếp ăn",
          lotCode: `LOT-DH-${todayCode}-03`,
          quantityUsed: 1.5,
          unit: "lít",
        },
      ],
    },
    {
      id: "batch-created-02",
      batchCode: `CB-${todayCode}-002`,
      dishId: "d-chebap-02",
      name: "Chè bắp lá dứa nước cốt dừa",
      dishName: "Chè bắp lá dứa nước cốt dừa",
      mealType: "afternoon",
      mealName: "Bữa xế",
      status: "UNCONFIRMED",
      portionStandard: 380,
      plannedPortions: 380,
      cookingModeApplied: "COMBINE_LOTS",
      createdAt: new Date(today.getTime() - ms(2.5)).toISOString(),
      confirmedAt: null,
      completedAt: null,
      hasSample: false,
      retainedFoodSamples: [],
      retainedFoodSample: null,
      note: "Phương án mẻ chè xế đã khởi tạo, chờ đối soát nguyên liệu bắp tươi Đà Lạt.",
      ingredients: [
        {
          id: "lot-bap-01",
          name: "Bắp ngọt hạt tươi Đà Lạt",
          code: `LOT-BN-${todayCode}-01`,
          amount: "30.0 kg",
          quantity: 30.0,
          unit: "kg",
        },
        {
          id: "lot-cotdua-02",
          name: "Nước cốt dừa nguyên chất",
          code: `LOT-CD-${todayCode}-02`,
          amount: "6.0 lít",
          quantity: 6.0,
          unit: "lít",
        },
        {
          id: "lot-ladua-03",
          name: "Lá dứa nếp thơm",
          code: `LOT-LD-${todayCode}-03`,
          amount: "1.5 kg",
          quantity: 1.5,
          unit: "kg",
        },
      ],
      cookingBatchLots: [
        {
          ingredientLotId: "lot-bap-01",
          ingredientName: "Bắp ngọt hạt tươi Đà Lạt",
          lotCode: `LOT-BN-${todayCode}-01`,
          quantityUsed: 30.0,
          unit: "kg",
        },
        {
          ingredientLotId: "lot-cotdua-02",
          ingredientName: "Nước cốt dừa nguyên chất",
          lotCode: `LOT-CD-${todayCode}-02`,
          quantityUsed: 6.0,
          unit: "lít",
        },
      ],
    },

    // -------------------------------------------------------------
    // CỘT 3: ĐÃ NẤU XONG (Chờ lưu mẫu: status === "COMPLETED", !hasSample)
    // -------------------------------------------------------------
    {
      id: "batch-cooked-01",
      batchCode: `CB-${todayCode}-003`,
      dishId: "d-heokho-03",
      name: "Thịt heo kho cút nước dừa",
      dishName: "Thịt heo kho cút nước dừa",
      mealType: "lunch",
      mealName: "Bữa trưa",
      status: "COMPLETED",
      portionStandard: 420,
      plannedPortions: 420,
      cookingModeApplied: "COMBINE_LOTS",
      createdAt: new Date(today.getTime() - ms(5)).toISOString(),
      confirmedAt: new Date(today.getTime() - ms(3.5)).toISOString(),
      completedAt: new Date(today.getTime() - ms(0.75)).toISOString(), // Nấu xong ~45 phút trước
      hasSample: false,
      retainedFoodSamples: [],
      retainedFoodSample: null,
      note: "Nấu xong hoàn tất lúc 10:25, thịt mềm thơm ngậy, nhiệt độ lõi 88°C. CẦN LƯU MẪU 24H NGAY.",
      ingredients: [
        {
          id: "lot-thitba-01",
          name: "Thịt ba chỉ heo tươi sạch Ba Vì",
          code: `LOT-TBV-${todayCode}-01`,
          amount: "38.0 kg",
          quantity: 38.0,
          unit: "kg",
        },
        {
          id: "lot-trung-02",
          name: "Trứng cút luộc bóc vỏ tiệt trùng",
          code: `LOT-TC-${todayCode}-02`,
          amount: "1260 quả",
          quantity: 1260,
          unit: "quả",
        },
        {
          id: "lot-nuocdua-03",
          name: "Nước dừa xiêm tươi Bến Tre",
          code: `LOT-NDX-${todayCode}-03`,
          amount: "12.0 lít",
          quantity: 12.0,
          unit: "lít",
        },
      ],
      cookingBatchLots: [
        {
          ingredientLotId: "lot-thitba-01",
          ingredientName: "Thịt ba chỉ heo tươi sạch Ba Vì",
          lotCode: `LOT-TBV-${todayCode}-01`,
          quantityUsed: 38.0,
          unit: "kg",
        },
        {
          ingredientLotId: "lot-trung-02",
          ingredientName: "Trứng cút luộc bóc vỏ tiệt trùng",
          lotCode: `LOT-TC-${todayCode}-02`,
          quantityUsed: 1260,
          unit: "quả",
        },
        {
          ingredientLotId: "lot-nuocdua-03",
          ingredientName: "Nước dừa xiêm tươi Bến Tre",
          lotCode: `LOT-NDX-${todayCode}-03`,
          quantityUsed: 12.0,
          unit: "lít",
        },
      ],
    },
    {
      id: "batch-cooked-02",
      batchCode: `CB-${todayCode}-004`,
      dishId: "d-canhcai-04",
      name: "Canh cải cúc thịt băm",
      dishName: "Canh cải cúc thịt băm",
      mealType: "lunch",
      mealName: "Bữa trưa",
      status: "COMPLETED",
      portionStandard: 420,
      plannedPortions: 420,
      cookingModeApplied: "COMBINE_LOTS",
      createdAt: new Date(today.getTime() - ms(3.8)).toISOString(),
      confirmedAt: new Date(today.getTime() - ms(2.0)).toISOString(),
      completedAt: new Date(today.getTime() - ms(0.4)).toISOString(), // Nấu xong ~25 phút trước
      hasSample: false,
      retainedFoodSamples: [],
      retainedFoodSample: null,
      note: "Nấu xong nước canh trong xanh ngọt đậm vị thịt, đạt 100°C. Chờ nhân viên bếp lấy mẫu lưu.",
      ingredients: [
        {
          id: "lot-caicuc-01",
          name: "Cải cúc nếp tươi Đà Lạt",
          code: `LOT-CC-${todayCode}-01`,
          amount: "32.0 kg",
          quantity: 32.0,
          unit: "kg",
        },
        {
          id: "lot-thitxay-02",
          name: "Thịt nạc vai heo xay VietGAP",
          code: `LOT-TX-${todayCode}-02`,
          amount: "18.0 kg",
          quantity: 18.0,
          unit: "kg",
        },
      ],
      cookingBatchLots: [
        {
          ingredientLotId: "lot-caicuc-01",
          ingredientName: "Cải cúc nếp tươi Đà Lạt",
          lotCode: `LOT-CC-${todayCode}-01`,
          quantityUsed: 32.0,
          unit: "kg",
        },
        {
          ingredientLotId: "lot-thitxay-02",
          ingredientName: "Thịt nạc vai heo xay VietGAP",
          lotCode: `LOT-TX-${todayCode}-02`,
          quantityUsed: 18.0,
          unit: "kg",
        },
      ],
    },

    // -------------------------------------------------------------
    // CỘT 4: ĐÃ LƯU MẪU (Lưu mẫu 24h: status === "COMPLETED", hasSample === true)
    // -------------------------------------------------------------
    {
      id: "batch-sampled-01",
      batchCode: `CB-${todayCode}-005`,
      dishId: "d-suachua-05",
      name: "Sữa chua hoa quả dầm hạt chia",
      dishName: "Sữa chua hoa quả dầm hạt chia",
      mealType: "afternoon",
      mealName: "Bữa xế",
      status: "COMPLETED",
      portionStandard: 380,
      plannedPortions: 380,
      cookingModeApplied: "COMBINE_LOTS",
      createdAt: new Date(today.getTime() - ms(6)).toISOString(),
      confirmedAt: new Date(today.getTime() - ms(4.5)).toISOString(),
      completedAt: new Date(today.getTime() - ms(2.0)).toISOString(),
      hasSample: true,
      retainedFoodSamples: [
        {
          id: "smp-001",
          sampleCode: `LM-${todayCode}-001`,
          storageLocation: "Tủ mát B1 - Ngăn 01",
          sampledAt: new Date(today.getTime() - ms(1.8)).toISOString(),
          quantity: "100",
          unit: "ml",
          status: "STORED",
          packaging: "Hộp thủy tinh có nắp kín tiệt trùng",
          notes: "Mẫu đạt cảm quan màu sắc trắng ngà hoa quả tươi, niêm phong nhiệt độ 4°C theo QĐ 1246/QĐ-BYT",
        },
      ],
      retainedFoodSample: {
        id: "smp-001",
        sampleCode: `LM-${todayCode}-001`,
        storageLocation: "Tủ mát B1 - Ngăn 01",
        sampledAt: new Date(today.getTime() - ms(1.8)).toISOString(),
        quantity: "100",
        unit: "ml",
        status: "STORED",
        packaging: "Hộp thủy tinh có nắp kín tiệt trùng",
        notes: "Mẫu đạt cảm quan màu sắc trắng ngà hoa quả tươi, niêm phong nhiệt độ 4°C theo QĐ 1246/QĐ-BYT",
      },
      note: "Tráng miệng xế chuẩn bị xong lúc 09:30, đã niêm phong lưu mẫu và bảo quản tủ B1 đủ 24h.",
      ingredients: [
        {
          id: "lot-sc-01",
          name: "Sữa chua tiệt trùng không đường Ba Vì",
          code: `LOT-SC-${todayCode}-01`,
          amount: "380 hộp",
          quantity: 380,
          unit: "hộp",
        },
        {
          id: "lot-hq-02",
          name: "Dưa hấu & xoài cát thái hạt lựu",
          code: `LOT-HQ-${todayCode}-02`,
          amount: "25.0 kg",
          quantity: 25.0,
          unit: "kg",
        },
        {
          id: "lot-hc-03",
          name: "Hạt chia hữu cơ Úc",
          code: `LOT-HC-${todayCode}-03`,
          amount: "1.2 kg",
          quantity: 1.2,
          unit: "kg",
        },
      ],
      cookingBatchLots: [
        {
          ingredientLotId: "lot-sc-01",
          ingredientName: "Sữa chua tiệt trùng không đường Ba Vì",
          lotCode: `LOT-SC-${todayCode}-01`,
          quantityUsed: 380,
          unit: "hộp",
        },
        {
          ingredientLotId: "lot-hq-02",
          ingredientName: "Dưa hấu & xoài cát thái hạt lựu",
          lotCode: `LOT-HQ-${todayCode}-02`,
          quantityUsed: 25.0,
          unit: "kg",
        },
      ],
    },
    {
      id: "batch-sampled-02",
      batchCode: `CB-${todayCode}-006`,
      dishId: "d-comtrang-06",
      name: "Cơm tám thơm Điện Biên",
      dishName: "Cơm tám thơm Điện Biên",
      mealType: "lunch",
      mealName: "Bữa trưa",
      status: "COMPLETED",
      portionStandard: 420,
      plannedPortions: 420,
      cookingModeApplied: "COMBINE_LOTS",
      createdAt: new Date(today.getTime() - ms(4.0)).toISOString(),
      confirmedAt: new Date(today.getTime() - ms(3.0)).toISOString(),
      completedAt: new Date(today.getTime() - ms(1.5)).toISOString(),
      hasSample: true,
      retainedFoodSamples: [
        {
          id: "smp-002",
          sampleCode: `LM-${todayCode}-002`,
          storageLocation: "Tủ A1 - Ngăn 03",
          sampledAt: new Date(today.getTime() - ms(1.3)).toISOString(),
          quantity: "150",
          unit: "g",
          status: "STORED",
          packaging: "Hộp inox niêm phong tem chống bóc",
          notes: "Cơm chín dẻo ráo hạt, nhiệt độ lưu trữ 4°C theo đúng quy trình kiểm thực 3 bước",
        },
      ],
      retainedFoodSample: {
        id: "smp-002",
        sampleCode: `LM-${todayCode}-002`,
        storageLocation: "Tủ A1 - Ngăn 03",
        sampledAt: new Date(today.getTime() - ms(1.3)).toISOString(),
        quantity: "150",
        unit: "g",
        status: "STORED",
        packaging: "Hộp inox niêm phong tem chống bóc",
        notes: "Cơm chín dẻo ráo hạt, nhiệt độ lưu trữ 4°C theo đúng quy trình kiểm thực 3 bước",
      },
      note: "Cơm trưa nấu hoàn tất, hạt dẻo thơm đều, đã lưu mẫu và dán nhãn niêm phong.",
      ingredients: [
        {
          id: "lot-gao-01",
          name: "Gạo tám thơm Điện Biên vụ mùa mới",
          code: `LOT-GDB-${todayCode}-01`,
          amount: "65.0 kg",
          quantity: 65.0,
          unit: "kg",
        },
      ],
      cookingBatchLots: [
        {
          ingredientLotId: "lot-gao-01",
          ingredientName: "Gạo tám thơm Điện Biên vụ mùa mới",
          lotCode: `LOT-GDB-${todayCode}-01`,
          quantityUsed: 65.0,
          unit: "kg",
        },
      ],
    },
  ];
}

/**
 * Biến lưu trữ tiến độ hiện hành trong bộ nhớ (hỗ trợ thao tác thêm/sửa/chuyển trạng thái)
 */
let CURRENT_MOCK_PENDING = getInitialMockPendingDishes();
let CURRENT_MOCK_BATCHES = getInitialMockBatches();

/**
 * Lấy toàn bộ tiến độ chế biến hôm nay (gồm 4 trạng thái Kanban)
 */
export function getMockTodayProgressData() {
  return {
    pendingDishes: CURRENT_MOCK_PENDING.map((d) => ({ ...d })),
    batches: CURRENT_MOCK_BATCHES.map((b) => ({ ...b })),
  };
}

/**
 * Khôi phục lại dữ liệu mẫu 4 trạng thái ban đầu
 */
export function resetMockTodayProgressData() {
  CURRENT_MOCK_PENDING = getInitialMockPendingDishes();
  CURRENT_MOCK_BATCHES = getInitialMockBatches();
  return getMockTodayProgressData();
}

/**
 * Tạo nhanh một lô mới từ món ăn chờ tạo lô (dành cho chế độ giả lập)
 */
export function createMockBatchFromDish(dishToCreate, cookingMode = "COMBINE_LOTS") {
  if (!dishToCreate) return null;

  const randSuffix = String(Math.floor(100 + Math.random() * 900));
  const newBatchCode = `CB-${todayCode}-${randSuffix}`;
  const nowISO = new Date().toISOString();

  const newBatch = {
    id: `mock-batch-${Date.now()}-${randSuffix}`,
    batchCode: newBatchCode,
    dishId: dishToCreate.dishId || dishToCreate.id,
    name: dishToCreate.name,
    dishName: dishToCreate.name,
    mealType: dishToCreate.mealType || "lunch",
    mealName: dishToCreate.mealName || "Bữa trưa",
    portionStandard: dishToCreate.portionStandard || 420,
    plannedPortions: dishToCreate.portionStandard || 420,
    status: "CONFIRMED", // Mới tạo lô xong -> chuyển sang cột Đã tạo lô (Chờ nấu)
    cookingModeApplied: cookingMode,
    createdAt: nowISO,
    confirmedAt: nowISO,
    completedAt: null,
    hasSample: false,
    retainedFoodSamples: [],
    retainedFoodSample: null,
    note: `Lô ${dishToCreate.name} tạo mới thành công, chuẩn bị nguyên liệu nấu.`,
    ingredients: (dishToCreate.ingredients || []).map((ing, idx) => ({
      id: ing.id || `lot-${idx}`,
      name: ing.name,
      code: ing.code || `LOT-${idx + 1}`,
      amount: ing.amount || `${ing.quantity || 15} ${ing.unit || "kg"}`,
      quantity: ing.quantity || 15,
      unit: ing.unit || "kg",
    })),
    cookingBatchLots: (dishToCreate.ingredients || []).map((ing, idx) => ({
      ingredientLotId: ing.id || `lot-${idx}`,
      ingredientName: ing.name,
      lotCode: ing.code || `LOT-${idx + 1}`,
      quantityUsed: ing.quantity || 15,
      unit: ing.unit || "kg",
    })),
  };

  // Cập nhật bộ nhớ giả lập
  CURRENT_MOCK_PENDING = CURRENT_MOCK_PENDING.filter(
    (d) => d.id !== dishToCreate.id && d.dishId !== dishToCreate.dishId
  );
  CURRENT_MOCK_BATCHES = [newBatch, ...CURRENT_MOCK_BATCHES];

  return newBatch;
}

/**
 * Tìm chi tiết một lô chế biến theo ID hoặc batchCode
 */
const matchId = (b, targetId) => {
  if (!b || !targetId) return false;
  const t = String(targetId).toLowerCase().trim();
  return (
    String(b.id).toLowerCase().trim() === t ||
    String(b.batchCode).toLowerCase().trim() === t ||
    String(b.legacyId || "").toLowerCase().trim() === t
  );
};

export function findMockBatchDetail(id) {
  if (!id) return null;
  // Ưu tiên tìm trong CURRENT_MOCK_BATCHES trước, sau đó IN_MEMORY_MOCK_BATCHES
  return (
    CURRENT_MOCK_BATCHES.find((b) => matchId(b, id)) ||
    IN_MEMORY_MOCK_BATCHES.find((b) => matchId(b, id)) ||
    CURRENT_MOCK_BATCHES[0] ||
    IN_MEMORY_MOCK_BATCHES[0]
  );
}

/**
 * Cập nhật trạng thái lô trong bộ nhớ (ví dụ Xác nhận hoặc Hoàn thành)
 */
export function updateMockBatchStatus(id, newStatus) {
  const allBatches = [...CURRENT_MOCK_BATCHES, ...IN_MEMORY_MOCK_BATCHES];
  const found = allBatches.find((b) => matchId(b, id));
  if (found) {
    found.status = newStatus;
    if (newStatus === "CONFIRMED") {
      found.confirmedAt = new Date().toISOString();
    } else if (newStatus === "COMPLETED") {
      found.completedAt = new Date().toISOString();
      found.preparedPortions = found.plannedPortions;
    }
    return { ...found };
  }
  return null;
}

/**
 * Tạo mẫu lưu cho một lô
 */
export function createMockBatchSample(batchId, sampleData) {
  const allBatches = [...CURRENT_MOCK_BATCHES, ...IN_MEMORY_MOCK_BATCHES];
  const found = allBatches.find((b) => matchId(b, batchId));
  if (found) {
    const sampleObj = {
      id: `smp-${Date.now().toString().slice(-4)}`,
      sampleCode: `LM-${todayCode}-${Date.now().toString().slice(-3)}`,
      cookingBatchId: found.id,
      sampledAt: sampleData.sampledAt || new Date().toISOString(),
      quantity: sampleData.quantity || "150",
      unit: sampleData.unit || "g",
      storageLocation: sampleData.storageLocation || "Tủ lưu mẫu Bếp 01",
      status: "STORED",
      packaging: sampleData.packaging || "Hộp thủy tinh có nắp kín tiệt trùng",
      notes: sampleData.notes || "Lưu mẫu 24h phục vụ đối soát an toàn thực phẩm.",
    };
    found.retainedFoodSample = sampleObj;
    found.retainedFoodSamples = [...(found.retainedFoodSamples || []), sampleObj];
    found.hasSample = true;
    return { ...sampleObj };
  }
  return null;
}

/**
 * Lấy mẫu lưu của một lô
 */
export function getMockBatchSample(batchId) {
  const allBatches = [...CURRENT_MOCK_BATCHES, ...IN_MEMORY_MOCK_BATCHES];
  const found = allBatches.find((b) => matchId(b, batchId));
  return found?.retainedFoodSample || (found?.retainedFoodSamples?.[0]) || null;
}
