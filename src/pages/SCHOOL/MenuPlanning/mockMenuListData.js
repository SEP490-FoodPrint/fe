/**
 * Dữ liệu giả lập Danh sách Thực đơn Học đường (Ban Y tế)
 * Hỗ trợ mô hình 2 cấp:
 * 1. Cấp Tuần (Trạng thái phê duyệt với BGH): APPROVED, PENDING_APPROVAL, DRAFT, REVISION_REQUESTED
 * 2. Cấp Ngày (Tiến độ nhập liệu của Y tế): COMPLETED (Đủ 2 ca), PARTIAL (Thiếu ca), EMPTY (Chưa tạo), REVISION_REQUIRED
 */

export const MOCK_MENU_LIST = [
  // ========================================================
  // TUẦN 45 (02/11/2026 – 06/11/2026) — TUẦN HIỆN TẠI: TOÀN BỘ ĐÃ DUYỆT (APPROVED)
  // Đủ 5 ngày x 2 ca = 10 thực đơn
  // ========================================================
  {
    id: "m-01",
    code: "TD-20261102-01",
    name: "Thực đơn Tiêu chuẩn Tuần 45 — Bữa trưa Thứ Hai",
    date: "02/11/2026",
    rawDate: "2026-11-02",
    week: "current",
    mealType: "LUNCH",
    mealTypeLabel: "Trưa",
    targetScope: "Khối 6 & Khối 7 (Độ tuổi 11-12)",
    portionCount: 1250,
    hasAllergyMenu: true,
    allergyNote: "Dành cho HS dị ứng hải sản, lạc (12 học sinh)",
    status: "APPROVED",
    statusLabel: "Đã duyệt",
    feedback: "Ban Giám Hiệu: Thực đơn tuần 45 đạt chuẩn cân đối dinh dưỡng và khẩu phần học đường.",
    dishes: [
      { name: "Tôm sú xào măng tây sả ớt", qty: "65g", ingredients: ["Tôm sú biển tươi", "Măng tây xanh"] },
      { name: "Thịt ba chỉ rang cháy cạnh", qty: "50g", ingredients: ["Thịt ba chỉ heo sạch"] },
      { name: "Canh ngao nấu chua thì là", qty: "60g", ingredients: ["Ngao biển tươi", "Cà chua, thì là"] },
      { name: "Cơm tám thơm Hải Hậu", qty: "120g", ingredients: ["Gạo tám thơm"] }
    ],
    substituteDish: {
      name: "Thịt bò xào rau củ thập cẩm",
      qty: "45g",
      ingredients: ["Thịt bò nạc loại 1", "Cà rốt, đậu cô ve, ngô non"]
    },
    seasonings: ["Dầu ăn Neptune", "Nước mắm Phú Quốc", "Muối tinh I-ốt", "Hạt nêm Knorr"]
  },
  {
    id: "m-02",
    code: "TD-20261102-02",
    name: "Thực đơn Cải thiện Năng lượng — Bữa xế Thứ Hai",
    date: "02/11/2026",
    rawDate: "2026-11-02",
    week: "current",
    mealType: "AFTERNOON",
    mealTypeLabel: "Chiều",
    targetScope: "Toàn trường (Khối 6 - 9)",
    portionCount: 1250,
    hasAllergyMenu: false,
    allergyNote: "Không có",
    status: "APPROVED",
    statusLabel: "Đã duyệt",
    feedback: "Ban Giám Hiệu: Đã phê duyệt.",
    dishes: [
      { name: "Bánh bông lan trứng muối chà bông", qty: "80g", ingredients: ["Bột mì cao cấp", "Trứng cút Ba Huân", "Chà bông heo sạch"] },
      { name: "Sữa hạt ngũ cốc hạnh nhân óc chó", qty: "180ml", ingredients: ["Sữa chua uống men sống TH True Milk"] }
    ],
    substituteDish: null,
    seasonings: ["Đường cát trắng Biên Hòa"]
  },

  {
    id: "m-03",
    code: "TD-20261103-01",
    name: "Thực đơn Dinh dưỡng Tuần 45 — Bữa trưa Thứ Ba",
    date: "03/11/2026",
    rawDate: "2026-11-03",
    week: "current",
    mealType: "LUNCH",
    mealTypeLabel: "Trưa",
    targetScope: "Khối 6 & Khối 7",
    portionCount: 1250,
    hasAllergyMenu: false,
    allergyNote: "Không có",
    status: "APPROVED",
    statusLabel: "Đã duyệt",
    feedback: "Ban Giám Hiệu: Đã phê duyệt.",
    dishes: [
      { name: "Thịt gà rang gừng thơm", qty: "70g", ingredients: ["Thịt đùi gà CP Foods", "Gừng củ ta"] },
      { name: "Trứng đúc thịt nạc xay", qty: "45g", ingredients: ["Trứng gà Ba Huân", "Thịt nạc vai xay"] },
      { name: "Canh bí xanh nấu tôm khô", qty: "50g", ingredients: ["Bí xanh", "Tôm nõn khô loại 1"] },
      { name: "Cơm trắng dẻo thơm", qty: "120g", ingredients: ["Gạo tám xoan"] }
    ],
    substituteDish: null,
    seasonings: ["Dầu thực vật Neptune", "Nước mắm 40N", "Muối I-ốt"]
  },
  {
    id: "m-13",
    code: "TD-20261103-02",
    name: "Thực đơn Bữa xế Trái cây Sữa chua — Thứ Ba",
    date: "03/11/2026",
    rawDate: "2026-11-03",
    week: "current",
    mealType: "AFTERNOON",
    mealTypeLabel: "Chiều",
    targetScope: "Toàn trường",
    portionCount: 1250,
    hasAllergyMenu: false,
    allergyNote: "Không có",
    status: "APPROVED",
    statusLabel: "Đã duyệt",
    feedback: "Ban Giám Hiệu: Đã duyệt.",
    dishes: [
      { name: "Sữa chua hoa quả dầm hạt granola", qty: "140g", ingredients: ["Sữa chua có đường Ba Vì", "Dưa hấu, thanh long", "Granola yến mạch"] }
    ],
    substituteDish: null,
    seasonings: []
  },

  {
    id: "m-04",
    code: "TD-20261104-01",
    name: "Thực đơn Bổ sung Khoáng chất — Bữa trưa Thứ Tư",
    date: "04/11/2026",
    rawDate: "2026-11-04",
    week: "current",
    mealType: "LUNCH",
    mealTypeLabel: "Trưa",
    targetScope: "Khối 8 & Khối 9",
    portionCount: 1250,
    hasAllergyMenu: true,
    allergyNote: "Tránh trứng gà cho lớp 8B3 (04 học sinh)",
    status: "APPROVED",
    statusLabel: "Đã duyệt",
    feedback: "Ban Giám Hiệu: Đã phê duyệt.",
    dishes: [
      { name: "Thịt heo kho cút nước dừa", qty: "60g", ingredients: ["Thịt ba chỉ heo", "Trứng cút tươi"] },
      { name: "Đậu phụ sốt cà chua hành hoa", qty: "50g", ingredients: ["Đậu phụ mơ sạch", "Cà chua VietGAP"] },
      { name: "Canh mồng tơi mướp nấu cua đồng", qty: "60g", ingredients: ["Cua đồng xay", "Mồng tơi, mướp hương"] },
      { name: "Cơm trắng tám thơm", qty: "130g", ingredients: ["Gạo tám thơm"] }
    ],
    substituteDish: {
      name: "Thịt heo kho đậu hũ non (Không dùng trứng)",
      qty: "55g",
      ingredients: ["Thịt nạc vai heo sạch", "Đậu hũ non"]
    },
    seasonings: ["Dầu ăn Neptune", "Nước mắm Phú Quốc", "Hạt tiêu đen xay", "Muối tinh I-ốt"]
  },
  {
    id: "m-12",
    code: "TD-20261104-02",
    name: "Thực đơn Bữa xế Dinh dưỡng — Thứ Tư",
    date: "04/11/2026",
    rawDate: "2026-11-04",
    week: "current",
    mealType: "AFTERNOON",
    mealTypeLabel: "Chiều",
    targetScope: "Toàn trường",
    portionCount: 1250,
    hasAllergyMenu: false,
    allergyNote: "Không có",
    status: "APPROVED",
    statusLabel: "Đã duyệt",
    feedback: "Ban Giám Hiệu: Đã duyệt.",
    dishes: [
      { name: "Chè sen long nhãn hạt chia", qty: "150g", ingredients: ["Hạt sen tươi", "Long nhãn Hưng Yên", "Hạt chia hữu cơ"] }
    ],
    substituteDish: null,
    seasonings: ["Đường phèn Quảng Ngãi"]
  },

  {
    id: "m-14",
    code: "TD-20261105-01",
    name: "Thực đơn Dinh dưỡng — Bữa trưa Thứ Năm",
    date: "05/11/2026",
    rawDate: "2026-11-05",
    week: "current",
    mealType: "LUNCH",
    mealTypeLabel: "Trưa",
    targetScope: "Toàn trường",
    portionCount: 1250,
    hasAllergyMenu: false,
    allergyNote: "Không có",
    status: "APPROVED",
    statusLabel: "Đã duyệt",
    feedback: "Ban Giám Hiệu: Đã duyệt.",
    dishes: [
      { name: "Bò sốt vang chấm bánh mì", qty: "75g", ingredients: ["Thịt bắp bò Vissan", "Cà rốt, khoai tây", "Ngũ vị hương"] },
      { name: "Salad rau củ sốt mè rang", qty: "45g", ingredients: ["Xà lách thủy canh", "Cà chua bi", "Sốt mè Kewpie"] },
      { name: "Bánh mì baguette giòn", qty: "80g", ingredients: ["Bánh mì que giòn"] }
    ],
    substituteDish: null,
    seasonings: ["Bơ thực vật", "Hạt nêm", "Tiêu"]
  },
  {
    id: "m-16",
    code: "TD-20261105-02",
    name: "Thực đơn Bữa xế Dễ tiêu hóa — Thứ Năm",
    date: "05/11/2026",
    rawDate: "2026-11-05",
    week: "current",
    mealType: "AFTERNOON",
    mealTypeLabel: "Chiều",
    targetScope: "Toàn trường",
    portionCount: 1250,
    hasAllergyMenu: false,
    allergyNote: "Không có",
    status: "APPROVED",
    statusLabel: "Đã duyệt",
    feedback: "Ban Giám Hiệu: Đã duyệt.",
    dishes: [
      { name: "Thịt lợn hầm củ sen bùi ngậy", qty: "65g", ingredients: ["Thịt nạc thăn heo", "Củ sen tươi"] },
      { name: "Trứng chiên hành thơm", qty: "45g", ingredients: ["Trứng gà tươi Ba Huân", "Hành hoa"] },
      { name: "Canh mướp đắng nhồi thịt", qty: "55g", ingredients: ["Mướp đắng VietGAP", "Thịt nạc heo băm"] },
      { name: "Cơm tám Hải Hậu", qty: "120g", ingredients: ["Gạo tám thơm"] }
    ],
    substituteDish: null,
    seasonings: ["Dầu ăn", "Nước mắm", "Muối I-ốt"]
  },

  {
    id: "m-15",
    code: "TD-20261106-01",
    name: "Thực đơn Dinh dưỡng Mùa thu — Bữa trưa Thứ Sáu",
    date: "06/11/2026",
    rawDate: "2026-11-06",
    week: "current",
    mealType: "LUNCH",
    mealTypeLabel: "Trưa",
    targetScope: "Toàn trường",
    portionCount: 1250,
    hasAllergyMenu: true,
    allergyNote: "Dị ứng hải sản (08 học sinh)",
    status: "APPROVED",
    statusLabel: "Đã duyệt",
    feedback: "Ban Giám Hiệu: Đã duyệt.",
    dishes: [
      { name: "Chả tôm mực giòn rụm", qty: "60g", ingredients: ["Tôm nõn tươi", "Mực ống sạch"] },
      { name: "Thịt heo luộc chấm sốt tỏi", qty: "50g", ingredients: ["Thịt ba chỉ heo sạch"] },
      { name: "Canh cải xoong nấu thịt nạc", qty: "50g", ingredients: ["Cải xoong tươi", "Thịt nạc băm"] },
      { name: "Cơm thơm", qty: "120g", ingredients: ["Gạo tám"] }
    ],
    substituteDish: {
      name: "Chả lụa heo chiên giòn (Thay cho chả hải sản)",
      qty: "60g",
      ingredients: ["Giò sống nạc heo sạch Vissan"]
    },
    seasonings: ["Dầu ăn Neptune", "Nước mắm", "Hạt nêm"]
  },
  {
    id: "m-17",
    code: "TD-20261106-02",
    name: "Thực đơn Đạm Thực vật & Cá hồi — Bữa xế Thứ Sáu",
    date: "06/11/2026",
    rawDate: "2026-11-06",
    week: "current",
    mealType: "AFTERNOON",
    mealTypeLabel: "Chiều",
    targetScope: "Toàn trường",
    portionCount: 1250,
    hasAllergyMenu: false,
    allergyNote: "Không có",
    status: "APPROVED",
    statusLabel: "Đã duyệt",
    feedback: "Ban Giám Hiệu: Đã duyệt.",
    dishes: [
      { name: "Cá hồi áp chảo sốt cam mật ong", qty: "65g", ingredients: ["Phi lê cá hồi tươi", "Nước cam tươi, mật ong"] },
      { name: "Đậu ve xào nấm đùi gà", qty: "45g", ingredients: ["Đậu cô ve sạch", "Nấm đùi gà tươi"] },
      { name: "Canh súp bí đỏ hạt sen", qty: "50g", ingredients: ["Bí đỏ", "Hạt sen"] },
      { name: "Cơm tám", qty: "120g", ingredients: ["Gạo tám"] }
    ],
    substituteDish: null,
    seasonings: ["Dầu ô liu", "Nước tương Maggi", "Mật ong"]
  },

  // ========================================================
  // TUẦN 47 (16/11/2026 – 20/11/2026) — MINH HỌA TRƯỜNG HỢP 1: BẢN NHÁP (DRAFT)
  // Đang soạn thảo: Thứ 2 & 3 đủ 2 ca; Thứ 4 thiếu bữa xế; Thứ 5 & 6 CHƯA TẠO (bị khuyết)
  // ========================================================
  {
    id: "m-47-01",
    code: "TD-20261116-01",
    name: "Thực đơn Bữa trưa Thứ Hai (Tuần 47)",
    date: "16/11/2026",
    rawDate: "2026-11-16",
    week: "future",
    mealType: "LUNCH",
    mealTypeLabel: "Trưa",
    targetScope: "Toàn trường",
    portionCount: 1250,
    hasAllergyMenu: true,
    allergyNote: "Tránh trứng gà (04 học sinh)",
    status: "DRAFT",
    statusLabel: "Bản nháp",
    feedback: "Bản nháp do Cán bộ Y tế khởi tạo.",
    dishes: [
      { name: "Thịt heo kho cút nước dừa", qty: "60g", ingredients: ["Thịt ba chỉ heo", "Trứng cút"] },
      { name: "Rau cải thìa sốt dầu hào", qty: "45g", ingredients: ["Cải thìa", "Dầu hào"] },
      { name: "Canh mồng tơi mướp nấu cua đồng", qty: "60g", ingredients: ["Cua đồng", "Mồng tơi"] },
      { name: "Cơm trắng tám thơm", qty: "130g", ingredients: ["Gạo tám thơm"] }
    ],
    substituteDish: {
      name: "Thịt heo kho đậu non (Không trứng)",
      qty: "55g",
      ingredients: ["Thịt heo", "Đậu hũ non"]
    },
    seasonings: ["Dầu ăn", "Nước mắm", "Muối I-ốt"]
  },
  {
    id: "m-47-02",
    code: "TD-20261116-02",
    name: "Thực đơn Bữa xế Thứ Hai (Tuần 47)",
    date: "16/11/2026",
    rawDate: "2026-11-16",
    week: "future",
    mealType: "AFTERNOON",
    mealTypeLabel: "Chiều",
    targetScope: "Toàn trường",
    portionCount: 1250,
    hasAllergyMenu: false,
    allergyNote: "Không có",
    status: "DRAFT",
    statusLabel: "Bản nháp",
    feedback: "Bản nháp do Cán bộ Y tế khởi tạo.",
    dishes: [
      { name: "Bánh su kem vani sữa tươi", qty: "75g", ingredients: ["Bột mì", "Trứng gà", "Sữa tươi TH"] }
    ],
    substituteDish: null,
    seasonings: ["Đường cát"]
  },

  {
    id: "m-47-03",
    code: "TD-20261117-01",
    name: "Thực đơn Bữa trưa Thứ Ba (Tuần 47)",
    date: "17/11/2026",
    rawDate: "2026-11-17",
    week: "future",
    mealType: "LUNCH",
    mealTypeLabel: "Trưa",
    targetScope: "Toàn trường",
    portionCount: 1250,
    hasAllergyMenu: false,
    allergyNote: "Không có",
    status: "DRAFT",
    statusLabel: "Bản nháp",
    feedback: "Bản nháp do Cán bộ Y tế khởi tạo.",
    dishes: [
      { name: "Gà sốt me chua ngọt", qty: "70g", ingredients: ["Thịt gà sạch", "Nước cốt me"] },
      { name: "Đậu bắp luộc chấm chao", qty: "45g", ingredients: ["Đậu bắp non"] },
      { name: "Canh bí đỏ hầm đậu phộng", qty: "55g", ingredients: ["Bí đỏ", "Đậu phộng"] },
      { name: "Cơm tám thơm", qty: "120g", ingredients: ["Gạo tám"] }
    ],
    substituteDish: null,
    seasonings: ["Dầu thực vật", "Hạt nêm"]
  },
  {
    id: "m-47-04",
    code: "TD-20261117-02",
    name: "Thực đơn Bữa xế Thứ Ba (Tuần 47)",
    date: "17/11/2026",
    rawDate: "2026-11-17",
    week: "future",
    mealType: "AFTERNOON",
    mealTypeLabel: "Chiều",
    targetScope: "Toàn trường",
    portionCount: 1250,
    hasAllergyMenu: false,
    allergyNote: "Không có",
    status: "DRAFT",
    statusLabel: "Bản nháp",
    feedback: "Bản nháp do Cán bộ Y tế khởi tạo.",
    dishes: [
      { name: "Chè bắp nếp nước cốt dừa", qty: "140g", ingredients: ["Bắp nếp", "Nước cốt dừa"] }
    ],
    substituteDish: null,
    seasonings: ["Đường phèn"]
  },

  {
    id: "m-47-05",
    code: "TD-20261118-01",
    name: "Thực đơn Bữa trưa Thứ Tư (Tuần 47) — Mới lên món trưa",
    date: "18/11/2026",
    rawDate: "2026-11-18",
    week: "future",
    mealType: "LUNCH",
    mealTypeLabel: "Trưa",
    targetScope: "Toàn trường",
    portionCount: 1250,
    hasAllergyMenu: false,
    allergyNote: "Không có",
    status: "DRAFT",
    statusLabel: "Bản nháp",
    feedback: "Đã xong bữa trưa, chưa lên bữa xế.",
    dishes: [
      { name: "Cá basa chiên xù sốt tarta", qty: "65g", ingredients: ["Cá basa phi lê", "Bột chiên xù"] },
      { name: "Bắp cải xào cà chua", qty: "45g", ingredients: ["Bắp cải trắng", "Cà chua"] },
      { name: "Canh rau cải cúc thịt băm", qty: "50g", ingredients: ["Cải cúc", "Thịt băm"] },
      { name: "Cơm thơm", qty: "120g", ingredients: ["Gạo tám"] }
    ],
    substituteDish: null,
    seasonings: ["Dầu ăn", "Muối", "Nước mắm"]
  },
  // Lưu ý: Thứ Tư 18/11 KHÔNG có bữa xế -> PARTIAL (Thiếu bữa xế)
  // Thứ Năm 19/11 và Thứ Sáu 20/11 KHÔNG có menu nào -> EMPTY (Chưa tạo)

  // ========================================================
  // TUẦN 44 (26/10/2026 – 30/10/2026) — MINH HỌA TRƯỜNG HỢP 2: YÊU CẦU CHỈNH SỬA (REVISION_REQUESTED)
  // Cả tuần REVISION_REQUESTED, nhưng Thứ 2, 3, 5, 6 đạt chuẩn, RIÊNG Thứ 4 bị bắt lỗi cần sửa!
  // ========================================================
  {
    id: "m-44-01",
    code: "TD-20261026-01",
    name: "Thực đơn Thứ Hai Tuần 44 — Trưa",
    date: "26/10/2026",
    rawDate: "2026-10-26",
    week: "prev",
    mealType: "LUNCH",
    mealTypeLabel: "Trưa",
    targetScope: "Khối 6 & Khối 7",
    portionCount: 1250,
    hasAllergyMenu: false,
    allergyNote: "Không có",
    status: "APPROVED",
    statusLabel: "Đạt chuẩn",
    feedback: "Ban Giám Hiệu: Đạt chuẩn.",
    dishes: [
      { name: "Sườn heo rim mặn ngọt", qty: "65g", ingredients: ["Sườn heo non VietGAP"] },
      { name: "Rau muống xào tỏi thơm", qty: "50g", ingredients: ["Rau muống sạch", "Tỏi Kinh Môn"] },
      { name: "Canh rau ngót nấu tôm sú", qty: "50g", ingredients: ["Rau ngót búp non", "Tôm nõn tươi"] },
      { name: "Cơm tám Hải Hậu", qty: "120g", ingredients: ["Gạo tám thơm"] }
    ],
    substituteDish: null,
    seasonings: ["Dầu đậu nành", "Nước mắm"]
  },
  {
    id: "m-44-02",
    code: "TD-20261026-02",
    name: "Thực đơn Thứ Hai Tuần 44 — Xế",
    date: "26/10/2026",
    rawDate: "2026-10-26",
    week: "prev",
    mealType: "AFTERNOON",
    mealTypeLabel: "Chiều",
    targetScope: "Toàn trường",
    portionCount: 1250,
    hasAllergyMenu: false,
    allergyNote: "Không có",
    status: "APPROVED",
    statusLabel: "Đạt chuẩn",
    feedback: "Ban Giám Hiệu: Đạt chuẩn.",
    dishes: [
      { name: "Bánh bông lan cuộn phô mai", qty: "80g", ingredients: ["Bột mì", "Phô mai"] },
      { name: "Sữa đậu nành hữu cơ Fami", qty: "180ml", ingredients: ["Đậu nành sạch"] }
    ],
    substituteDish: null,
    seasonings: ["Đường phèn"]
  },

  {
    id: "m-44-03",
    code: "TD-20261027-01",
    name: "Thực đơn Thứ Ba Tuần 44 — Trưa",
    date: "27/10/2026",
    rawDate: "2026-10-27",
    week: "prev",
    mealType: "LUNCH",
    mealTypeLabel: "Trưa",
    targetScope: "Toàn trường",
    portionCount: 1250,
    hasAllergyMenu: false,
    allergyNote: "Không có",
    status: "APPROVED",
    statusLabel: "Đạt chuẩn",
    feedback: "Ban Giám Hiệu: Đạt chuẩn.",
    dishes: [
      { name: "Thịt đùi gà chiên nước mắm", qty: "70g", ingredients: ["Đùi gà tươi CP", "Nước mắm"] },
      { name: "Chả lụa hấp lá chuối", qty: "35g", ingredients: ["Giò nạc sạch Vissan"] },
      { name: "Canh mướp hương nấu nấm kim châm", qty: "50g", ingredients: ["Mướp hương", "Nấm kim châm"] },
      { name: "Cơm dẻo", qty: "120g", ingredients: ["Gạo tám thơm"] }
    ],
    substituteDish: null,
    seasonings: ["Dầu ăn", "Nước mắm"]
  },
  {
    id: "m-44-04",
    code: "TD-20261027-02",
    name: "Thực đơn Thứ Ba Tuần 44 — Xế",
    date: "27/10/2026",
    rawDate: "2026-10-27",
    week: "prev",
    mealType: "AFTERNOON",
    mealTypeLabel: "Chiều",
    targetScope: "Toàn trường",
    portionCount: 1250,
    hasAllergyMenu: false,
    allergyNote: "Không có",
    status: "APPROVED",
    statusLabel: "Đạt chuẩn",
    feedback: "Ban Giám Hiệu: Đạt chuẩn.",
    dishes: [
      { name: "Sữa chua hạt sen long nhãn", qty: "140g", ingredients: ["Sữa chua Ba Vì", "Hạt sen"] }
    ],
    substituteDish: null,
    seasonings: []
  },

  // THỨ TƯ TUẦN 44: BỊ BGH BẮT LỖI YÊU CẦU CHỈNH SỬA
  {
    id: "m-44-05",
    code: "TD-20261028-01",
    name: "Thực đơn Thứ Tư Tuần 44 — Bữa trưa (Cần sửa)",
    date: "28/10/2026",
    rawDate: "2026-10-28",
    week: "prev",
    mealType: "LUNCH",
    mealTypeLabel: "Trưa",
    targetScope: "Khối 6 & Khối 7",
    portionCount: 1250,
    hasAllergyMenu: true,
    allergyNote: "Có 12 học sinh dị ứng tôm sú tại lớp 6A, 7B",
    status: "REVISION_REQUESTED",
    statusLabel: "Yêu cầu chỉnh sửa",
    feedback: "BGH yêu cầu: Món tôm xào quá nhiều dầu mỡ, cần giảm dầu mỡ, bổ sung rau xanh luộc và thay thế tôm sú bằng thịt bò cho 12 em học sinh dị ứng.",
    dishes: [
      { name: "Tôm sú xào măng tây sả ớt (Quá nhiều dầu)", qty: "65g", ingredients: ["Tôm sú tươi", "Măng tây"] },
      { name: "Thịt ba chỉ rang cháy cạnh", qty: "50g", ingredients: ["Thịt ba chỉ heo sạch"] },
      { name: "Canh ngao nấu chua thì là", qty: "60g", ingredients: ["Ngao biển", "Cà chua"] },
      { name: "Cơm tám thơm Hải Hậu", qty: "120g", ingredients: ["Gạo tám thơm"] }
    ],
    substituteDish: {
      name: "Thịt bò xào rau củ thập cẩm (Phương án thay thế đề xuất)",
      qty: "45g",
      ingredients: ["Thịt bò nạc loại 1", "Cà rốt, đậu non"]
    },
    seasonings: ["Dầu ăn", "Nước mắm"]
  },
  {
    id: "m-44-06",
    code: "TD-20261028-02",
    name: "Thực đơn Thứ Tư Tuần 44 — Xế",
    date: "28/10/2026",
    rawDate: "2026-10-28",
    week: "prev",
    mealType: "AFTERNOON",
    mealTypeLabel: "Chiều",
    targetScope: "Toàn trường",
    portionCount: 1250,
    hasAllergyMenu: false,
    allergyNote: "Không có",
    status: "APPROVED",
    statusLabel: "Đạt chuẩn",
    feedback: "Ban Giám Hiệu: Bữa xế đạt chuẩn.",
    dishes: [
      { name: "Chè đậu đỏ nước cốt dừa", qty: "150g", ingredients: ["Đậu đỏ sạch", "Nước cốt dừa"] }
    ],
    substituteDish: null,
    seasonings: ["Đường phèn"]
  },

  {
    id: "m-44-07",
    code: "TD-20261029-01",
    name: "Thực đơn Thứ Năm Tuần 44 — Trưa",
    date: "29/10/2026",
    rawDate: "2026-10-29",
    week: "prev",
    mealType: "LUNCH",
    mealTypeLabel: "Trưa",
    targetScope: "Toàn trường",
    portionCount: 1250,
    hasAllergyMenu: false,
    allergyNote: "Không có",
    status: "APPROVED",
    statusLabel: "Đạt chuẩn",
    feedback: "Ban Giám Hiệu: Đạt chuẩn.",
    dishes: [
      { name: "Thịt heo xá xíu mật ong", qty: "60g", ingredients: ["Thịt mông heo", "Mật ong"] },
      { name: "Trứng cút sốt chua ngọt", qty: "40g", ingredients: ["Trứng cút", "Sốt me"] },
      { name: "Canh chua cá bông lau", qty: "55g", ingredients: ["Cá bông lau", "Dọc mùng"] },
      { name: "Cơm trắng", qty: "120g", ingredients: ["Gạo tám"] }
    ],
    substituteDish: null,
    seasonings: ["Dầu ăn", "Đường", "Nước mắm"]
  },
  {
    id: "m-44-08",
    code: "TD-20261029-02",
    name: "Thực đơn Thứ Năm Tuần 44 — Xế",
    date: "29/10/2026",
    rawDate: "2026-10-29",
    week: "prev",
    mealType: "AFTERNOON",
    mealTypeLabel: "Chiều",
    targetScope: "Toàn trường",
    portionCount: 1250,
    hasAllergyMenu: false,
    allergyNote: "Không có",
    status: "APPROVED",
    statusLabel: "Đạt chuẩn",
    feedback: "Ban Giám Hiệu: Đạt chuẩn.",
    dishes: [
      { name: "Bánh bông lan chuối nướng", qty: "80g", ingredients: ["Bột mì", "Chuối sứ"] }
    ],
    substituteDish: null,
    seasonings: ["Bơ"]
  },

  {
    id: "m-44-09",
    code: "TD-20261030-01",
    name: "Thực đơn Thứ Sáu Tuần 44 — Trưa",
    date: "30/10/2026",
    rawDate: "2026-10-30",
    week: "prev",
    mealType: "LUNCH",
    mealTypeLabel: "Trưa",
    targetScope: "Toàn trường",
    portionCount: 1250,
    hasAllergyMenu: false,
    allergyNote: "Không có",
    status: "APPROVED",
    statusLabel: "Đạt chuẩn",
    feedback: "Ban Giám Hiệu: Đạt chuẩn.",
    dishes: [
      { name: "Gà sốt chua ngọt hạt điều", qty: "70g", ingredients: ["Thịt gà sạch", "Hạt điều"] },
      { name: "Su su xào thịt bò", qty: "45g", ingredients: ["Su su", "Thịt bò"] },
      { name: "Canh cải cúc nấu thịt băm", qty: "50g", ingredients: ["Cải cúc", "Thịt băm"] },
      { name: "Cơm thơm", qty: "120g", ingredients: ["Gạo tám"] }
    ],
    substituteDish: null,
    seasonings: ["Dầu ăn", "Muối", "Đường"]
  },
  {
    id: "m-44-10",
    code: "TD-20261030-02",
    name: "Thực đơn Thứ Sáu Tuần 44 — Xế",
    date: "30/10/2026",
    rawDate: "2026-10-30",
    week: "prev",
    mealType: "AFTERNOON",
    mealTypeLabel: "Chiều",
    targetScope: "Toàn trường",
    portionCount: 1250,
    hasAllergyMenu: false,
    allergyNote: "Không có",
    status: "APPROVED",
    statusLabel: "Đạt chuẩn",
    feedback: "Ban Giám Hiệu: Đạt chuẩn.",
    dishes: [
      { name: "Chè khoai môn hạt sen", qty: "140g", ingredients: ["Khoai môn", "Hạt sen"] }
    ],
    substituteDish: null,
    seasonings: ["Nước cốt dừa"]
  },

  // ========================================================
  // TUẦN 46 (09/11/2026 – 13/11/2026) — CHỜ BGH DUYỆT (PENDING_APPROVAL)
  // ========================================================
  {
    id: "m-46-01",
    code: "TD-20261109-01",
    name: "Thực đơn Đổi mới Tuần 46 — Bữa trưa Thứ Hai",
    date: "09/11/2026",
    rawDate: "2026-11-09",
    week: "next",
    mealType: "LUNCH",
    mealTypeLabel: "Trưa",
    targetScope: "Khối 6 & 7",
    portionCount: 1250,
    hasAllergyMenu: false,
    allergyNote: "Không có",
    status: "PENDING_APPROVAL",
    statusLabel: "Chờ BGH duyệt",
    feedback: "Hồ sơ đã gửi tới Ban Giám Hiệu lúc 08:30 ngày 06/11/2026. Đang chờ phiên phê duyệt trực tuyến.",
    dishes: [
      { name: "Gà hấp lá chanh truyền thống", qty: "70g", ingredients: ["Thịt gà tươi sạch", "Lá chanh"] },
      { name: "Đậu phụ sốt thịt băm cà chua", qty: "45g", ingredients: ["Đậu phụ mơ", "Thịt heo nạc băm"] },
      { name: "Canh bí đỏ hầm xương ống", qty: "60g", ingredients: ["Bí đỏ tươi", "Xương heo"] },
      { name: "Cơm tám thơm Hải Hậu", qty: "120g", ingredients: ["Gạo tám thơm"] }
    ],
    substituteDish: null,
    seasonings: ["Dầu thực vật", "Nước mắm 40N", "Muối I-ốt"]
  },
  {
    id: "m-46-02",
    code: "TD-20261109-02",
    name: "Thực đơn Năng lượng Tuần 46 — Bữa xế Thứ Hai",
    date: "09/11/2026",
    rawDate: "2026-11-09",
    week: "next",
    mealType: "AFTERNOON",
    mealTypeLabel: "Chiều",
    targetScope: "Toàn trường",
    portionCount: 1250,
    hasAllergyMenu: false,
    allergyNote: "Không có",
    status: "PENDING_APPROVAL",
    statusLabel: "Chờ BGH duyệt",
    feedback: "Hồ sơ đã gửi tới Ban Giám Hiệu lúc 08:30 ngày 06/11/2026. Đang chờ phiên phê duyệt trực tuyến.",
    dishes: [
      { name: "Chè hạt sen long nhãn táo đỏ", qty: "140g", ingredients: ["Hạt sen", "Long nhãn", "Táo đỏ"] }
    ],
    substituteDish: null,
    seasonings: ["Đường phèn Quảng Ngãi"]
  }
];

export function getMenuById(id) {
  if (!id) return MOCK_MENU_LIST[0];
  const found = MOCK_MENU_LIST.find(m => m.id === id || m.code === id);
  return found || MOCK_MENU_LIST[0];
}

// Ánh xạ trạng thái thực đơn theo tuần của năm 2026 (1 tuần 1 trạng thái duy nhất)
export const WEEK_STATUS_MAP_2026 = {
  42: { status: "APPROVED", statusLabel: "Đã duyệt BGH", feedback: "" },
  43: { status: "APPROVED", statusLabel: "Đã duyệt BGH", feedback: "" },
  44: {
    status: "REVISION_REQUESTED",
    statusLabel: "Yêu cầu chỉnh sửa",
    feedback: "Ban Giám Hiệu yêu cầu: Món tôm xào Thứ Tư quá nhiều dầu mỡ, cần giảm dầu mỡ, bổ sung rau xanh luộc và thay thế tôm sú bằng thịt bò cho 12 em học sinh dị ứng.",
  },
  45: { status: "APPROVED", statusLabel: "Đã duyệt BGH", feedback: "Ban Giám Hiệu: Thực đơn tuần 45 đạt chuẩn cân đối dinh dưỡng và khẩu phần học đường." },
  46: { status: "PENDING_APPROVAL", statusLabel: "Chờ BGH duyệt", feedback: "Hồ sơ đã gửi tới Ban Giám Hiệu lúc 08:30 ngày 06/11/2026. Đang chờ phê duyệt trực tuyến." },
  47: { status: "DRAFT", statusLabel: "Bản nháp", feedback: "Bản nháp do Cán bộ Y tế khởi tạo. Đang hoàn thiện định lượng nguyên liệu trước khi gửi BGH." },
};

export function getWeeklyMenuStatus(weekNumber, year = 2026, menus = []) {
  const w = Number(weekNumber);
  const y = Number(year);

  // 1. Kiểm tra từ menus truyền vào nếu có
  if (Array.isArray(menus) && menus.length > 0) {
    const weekMenus = menus.filter((m) => {
      if (m.rawDate) {
        const parts = m.rawDate.split("-");
        if (parts.length === 3 && Number(parts[0]) === y) {
          const d = new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
          const dNum = (d.getUTCDay() + 6) % 7;
          d.setUTCDate(d.getUTCDate() - dNum + 3);
          const firstThu = d.valueOf();
          d.setUTCMonth(0, 1);
          if (d.getUTCDay() !== 4) {
            d.setUTCMonth(0, 1 + ((4 - d.getUTCDay() + 7) % 7));
          }
          const isoWeek = 1 + Math.ceil((firstThu - d) / 604800000);
          return isoWeek === w;
        }
      }
      return false;
    });

    if (weekMenus.length > 0) {
      if (weekMenus.some((m) => m.status === "REVISION_REQUESTED" || m.status === "REVISION_REQUIRED")) {
        const rev = weekMenus.find((m) => m.status === "REVISION_REQUESTED" || m.status === "REVISION_REQUIRED");
        return {
          status: "REVISION_REQUESTED",
          statusLabel: "Yêu cầu chỉnh sửa",
          feedback: rev?.feedback || "Ban Giám Hiệu yêu cầu chỉnh sửa thực đơn tuần này.",
        };
      }
      if (weekMenus.some((m) => m.status === "PENDING_APPROVAL")) {
        return { status: "PENDING_APPROVAL", statusLabel: "Chờ BGH duyệt", feedback: "" };
      }
      if (weekMenus.some((m) => m.status === "DRAFT")) {
        return { status: "DRAFT", statusLabel: "Bản nháp", feedback: "" };
      }
      return { status: "APPROVED", statusLabel: "Đã duyệt BGH", feedback: "" };
    }
  }

  // 2. Tra cứu từ Map chuẩn 2026
  if (y === 2026 && WEEK_STATUS_MAP_2026[w]) {
    return WEEK_STATUS_MAP_2026[w];
  }

  // 3. Quy ước mặc định theo tuần
  if (w <= 45) {
    return { status: "APPROVED", statusLabel: "Đã duyệt BGH", feedback: "" };
  } else if (w === 46) {
    return { status: "PENDING_APPROVAL", statusLabel: "Chờ BGH duyệt", feedback: "" };
  } else {
    return { status: "DRAFT", statusLabel: "Bản nháp", feedback: "" };
  }
}
