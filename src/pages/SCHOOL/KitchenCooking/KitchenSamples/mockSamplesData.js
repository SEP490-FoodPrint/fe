/**
 * Mock data và helper chuẩn nghiệp vụ cho Sổ lưu mẫu thức ăn 24 giờ (UC-25)
 * Dựa trên PostgreSQL FoodPrint v5.4: bảng `retained_food_samples` & `cooking_batches`
 */

const now = new Date()
const ms = (hours) => hours * 60 * 60 * 1000

export const MOCK_RETAINED_SAMPLES = [
  {
    id: "smp-001",
    cookingBatchId: "cb-20261108-001",
    batchCode: "CB-20261108-001",
    dishName: "Thịt heo kho cút nước dừa",
    dishCategory: "Món mặn chính",
    mealType: "LUNCH",
    mealLabel: "Bữa trưa",
    portions: 420,
    // Lấy mẫu lúc 18.5 giờ trước -> Còn 5h 30m
    sampledAt: new Date(now.getTime() - ms(18.5)).toISOString(),
    quantity: "150",
    unit: "g",
    storageLocation: "Tủ A1 - Ngăn 02",
    status: "STORED",
    packaging: "Lọ thủy tinh tiệt trùng",
    recordedByName: "Nguyễn Văn Vận (Bếp trưởng)",
    recordedByUserId: "usr-chef-01",
    disposedAt: null,
    disposalNote: "",
  },
  {
    id: "smp-002",
    cookingBatchId: "cb-20261108-002",
    dishName: "Canh sườn hầm rau củ quả",
    dishCategory: "Món canh",
    mealType: "LUNCH",
    mealLabel: "Bữa trưa",
    portions: 420,
    // Lấy mẫu lúc 18 giờ 15 phút trước -> Còn 5h 45m
    sampledAt: new Date(now.getTime() - ms(18.25)).toISOString(),
    quantity: "150",
    unit: "g",
    storageLocation: "Tủ A1 - Ngăn 03",
    status: "STORED",
    packaging: "Lọ thủy tinh tiệt trùng",
    recordedByName: "Nguyễn Văn Vận (Bếp trưởng)",
    recordedByUserId: "usr-chef-01",
    disposedAt: null,
    disposalNote: "",
  },
  {
    id: "smp-003",
    cookingBatchId: "cb-20261107-003",
    batchCode: "CB-20261107-003",
    dishName: "Cải thìa xào nấm đông cô",
    dishCategory: "Món rau xào",
    mealType: "LUNCH",
    mealLabel: "Bữa trưa",
    portions: 410,
    // Lấy mẫu từ hôm qua lúc 25.5 giờ trước -> Đã đủ 24 giờ lưu!
    sampledAt: new Date(now.getTime() - ms(25.5)).toISOString(),
    quantity: "100",
    unit: "g",
    storageLocation: "Tủ A2 - Ngăn 01",
    status: "STORED",
    packaging: "Lọ thủy tinh tiệt trùng",
    recordedByName: "Lê Hoàng Long (Nhân viên bếp)",
    recordedByUserId: "usr-cook-02",
    disposedAt: null,
    disposalNote: "",
  },
  {
    id: "smp-004",
    cookingBatchId: "cb-20261107-001",
    batchCode: "CB-20261107-001",
    dishName: "Gà áp chảo sốt cam",
    dishCategory: "Món mặn",
    mealType: "LUNCH",
    mealLabel: "Bữa trưa",
    portions: 410,
    // Lấy mẫu 28 giờ trước, đã tiêu hủy 3 giờ trước
    sampledAt: new Date(now.getTime() - ms(28)).toISOString(),
    quantity: "120",
    unit: "g",
    storageLocation: "Tủ A2 - Ngăn 02 (Đã giải phóng)",
    status: "DISPOSED",
    packaging: "Lọ thủy tinh tiệt trùng",
    recordedByName: "Nguyễn Văn Vận (Bếp trưởng)",
    recordedByUserId: "usr-chef-01",
    disposedAt: new Date(now.getTime() - ms(3)).toISOString(),
    disposalNote: "Mẫu lưu đã đủ 24 giờ quy định, ngoại quan bình thường không biến chất. Tiêu hủy và khử khuẩn lọ theo quy trình.",
  },
  {
    id: "smp-005",
    cookingBatchId: "cb-20261107-004",
    batchCode: "CB-20261107-004",
    dishName: "Sữa chua hoa quả dầm hạt chia",
    dishCategory: "Bữa xế dinh dưỡng",
    mealType: "AFTERNOON",
    mealLabel: "Bữa xế",
    portions: 380,
    // Lấy mẫu 14 giờ trước -> Còn 10h
    sampledAt: new Date(now.getTime() - ms(14)).toISOString(),
    quantity: "100",
    unit: "ml",
    storageLocation: "Tủ B1 - Ngăn 01",
    status: "STORED",
    packaging: "Hộp thủy tinh có nắp kín",
    recordedByName: "Nguyễn Văn Vận (Bếp trưởng)",
    recordedByUserId: "usr-chef-01",
    disposedAt: null,
    disposalNote: "",
  },
]

/**
 * Danh sách các mẻ nấu đã hoàn thành nhưng CHƯA lưu mẫu
 * Phục vụ cho Screen 02 (Ghi nhận mẫu lưu mới)
 */
export const MOCK_UNSAMPLED_BATCHES = [
  {
    id: "cb-20261108-005",
    batchCode: "CB-20261108-005",
    dishName: "Tôm rim thịt ba chỉ",
    dishCategory: "Món mặn chính",
    mealType: "LUNCH",
    mealLabel: "Bữa trưa",
    portions: 420,
    completedAt: new Date(now.getTime() - ms(1.5)).toISOString(),
    defaultQuantity: "150",
    defaultUnit: "g",
    defaultStorage: "Tủ A1 - Ngăn 04",
  },
  {
    id: "cb-20261108-006",
    batchCode: "CB-20261108-006",
    dishName: "Rau cải thìa xào dầu hào",
    dishCategory: "Món rau xào",
    mealType: "LUNCH",
    mealLabel: "Bữa trưa",
    portions: 420,
    completedAt: new Date(now.getTime() - ms(1.2)).toISOString(),
    defaultQuantity: "100",
    defaultUnit: "g",
    defaultStorage: "Tủ A2 - Ngăn 03",
  },
  {
    id: "cb-20261108-007",
    batchCode: "CB-20261108-007",
    dishName: "Chè bắp lá dứa cốt dừa",
    dishCategory: "Bữa xế dinh dưỡng",
    mealType: "AFTERNOON",
    mealLabel: "Bữa xế",
    portions: 380,
    completedAt: new Date(now.getTime() - ms(0.5)).toISOString(),
    defaultQuantity: "100",
    defaultUnit: "ml",
    defaultStorage: "Tủ B1 - Ngăn 02",
  },
]

/**
 * Tính toán trạng thái 24 giờ và thời gian còn lại
 */
export function get24hRetainedStatus(sampledAt, status) {
  if (status === "DISPOSED") {
    return {
      statusType: "DISPOSED",
      label: "Đã tiêu hủy",
      badgeClass: "badgeDisposed",
      isReadyToDispose: false,
      isDisposed: true,
      timeText: "Đã tiêu hủy",
      remainingHours: 0,
      remainingMinutes: 0,
      percent: 100,
    }
  }

  const sampledTime = new Date(sampledAt).getTime()
  const expiresTime = sampledTime + 24 * 60 * 60 * 1000
  const currentTime = Date.now()
  const diffMs = expiresTime - currentTime

  if (diffMs <= 0) {
    return {
      statusType: "READY_TO_DISPOSE",
      label: "Đã đủ 24 giờ",
      badgeClass: "badgeReady",
      isReadyToDispose: true,
      isDisposed: false,
      timeText: "Đã lưu 24h00",
      remainingHours: 0,
      remainingMinutes: 0,
      percent: 100,
    }
  }

  const remainingHours = Math.floor(diffMs / (60 * 60 * 1000))
  const remainingMinutes = Math.floor((diffMs % (60 * 60 * 1000)) / (60 * 1000))
  const elapsedMs = 24 * 60 * 60 * 1000 - diffMs
  const percent = Math.min(100, Math.max(0, Math.round((elapsedMs / (24 * 60 * 60 * 1000)) * 100)))

  return {
    statusType: "STORED",
    label: "Đang lưu mẫu",
    badgeClass: "badgeStored",
    isReadyToDispose: false,
    isDisposed: false,
    timeText: `Còn ${String(remainingHours).padStart(2, "0")}h ${String(remainingMinutes).padStart(2, "0")}m`,
    remainingHours,
    remainingMinutes,
    percent,
  }
}

/**
 * Format date & time cho giao diện
 */
export function formatSampleDateTime(val) {
  if (!val) return "—"
  const d = new Date(val)
  if (isNaN(d.getTime())) return String(val)
  const pad = (n) => String(n).padStart(2, "0")
  const dateStr = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
  const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}`
  return {
    full: `${timeStr} · ${dateStr}`,
    date: dateStr,
    time: timeStr,
  }
}
