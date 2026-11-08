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
const yesterdayISO = new Date(today.getTime() - 86400000)
  .toISOString()
  .slice(0, 10);

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
 * Tìm chi tiết một lô chế biến theo ID hoặc batchCode
 */
const matchId = (b, targetId) => {
  if (!b || !targetId) return false;
  const t = String(targetId).toLowerCase().trim();
  return (
    String(b.id).toLowerCase().trim() === t ||
    String(b.batchCode).toLowerCase().trim() === t ||
    String(b.legacyId || '').toLowerCase().trim() === t
  );
};

export function findMockBatchDetail(id) {
  if (!id) return null;
  return (
    IN_MEMORY_MOCK_BATCHES.find((b) => matchId(b, id)) ||
    IN_MEMORY_MOCK_BATCHES[0]
  );
}

/**
 * Cập nhật trạng thái lô trong bộ nhớ (ví dụ Xác nhận hoặc Hoàn thành)
 */
export function updateMockBatchStatus(id, newStatus) {
  const found = IN_MEMORY_MOCK_BATCHES.find((b) => matchId(b, id));
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
  const found = IN_MEMORY_MOCK_BATCHES.find((b) => matchId(b, batchId));
  if (found) {
    found.retainedFoodSample = {
      id: `smp-${Date.now().toString().slice(-4)}`,
      cookingBatchId: found.id,
      sampledAt: sampleData.sampledAt || new Date().toISOString(),
      quantity: sampleData.quantity || "150",
      unit: sampleData.unit || "g",
      storageLocation: sampleData.storageLocation || "Tủ lưu mẫu Bếp 01",
      status: "STORED",
    };
    return { ...found.retainedFoodSample };
  }
  return null;
}

/**
 * Lấy mẫu lưu của một lô
 */
export function getMockBatchSample(batchId) {
  const found = IN_MEMORY_MOCK_BATCHES.find((b) => matchId(b, batchId));
  return found?.retainedFoodSample || null;
}
