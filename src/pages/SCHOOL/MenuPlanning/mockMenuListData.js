/**
 * Dữ liệu giả lập Danh sách Thực đơn Học đường (Ban Y tế)
 * Tổng cộng 18 thực đơn:
 * - 15 Đã duyệt (APPROVED)
 * - 01 Chờ BGH duyệt (PENDING_APPROVAL)
 * - 02 Cần xử lý: 01 Yêu cầu chỉnh sửa (REVISION_REQUESTED) + 01 Bản nháp (DRAFT)
 * Khớp 100% với Stats Rail và các dòng trong mẫu HTML tiêu chuẩn.
 */

export const MOCK_MENU_LIST = [
  // ========================================================
  // TUẦN 45 (02/11/2026 – 06/11/2026) — TUẦN NÀY: TOÀN BỘ ĐÃ DUYỆT (APPROVED)
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
      { name: "Tôm sú xào măng tây sả ớt", qty: "65g", ingredients: ["Tôm sú biển tươi (Hải sản Sạch Vũng Tàu)", "Măng tây xanh"] },
      { name: "Thịt ba chỉ rang cháy cạnh", qty: "50g", ingredients: ["Thịt ba chỉ heo sạch VietGAP (CP Foods)"] },
      { name: "Canh ngao nấu chua thì là", qty: "60g", ingredients: ["Ngao biển tươi sống", "Cà chua, thì là"] },
      { name: "Cơm tám thơm Hải Hậu", qty: "120g", ingredients: ["Gạo tám thơm Hải Hậu"] }
    ],
    substituteDish: {
      name: "Thịt bò xào rau củ thập cẩm",
      qty: "45g",
      ingredients: ["Thịt bò nạc loại 1 (Vissan)", "Cà rốt, đậu cô ve, ngô non"]
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
      { name: "Thịt gà rang gừng thơm", qty: "70g", ingredients: ["Thịt đùi gà tươi sạch CP Foods", "Gừng củ ta Kinh Môn"] },
      { name: "Trứng đúc thịt nạc xay", qty: "45g", ingredients: ["Trứng gà Ba Huân", "Thịt nạc vai xay"] },
      { name: "Canh bí xanh nấu tôm khô", qty: "50g", ingredients: ["Bí xanh Hưng Yên", "Tôm nõn khô loại 1"] },
      { name: "Cơm trắng dẻo thơm", qty: "120g", ingredients: ["Gạo tám xoan"] }
    ],
    substituteDish: null,
    seasonings: ["Dầu thực vật Neptune", "Nước mắm 40N", "Muối I-ốt"]
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
    targetScope: "Khối 8 & Khối 9 (Độ tuổi 13-14)",
    portionCount: 1250,
    hasAllergyMenu: true,
    allergyNote: "Tránh trứng gà cho lớp 8B3 (04 học sinh)",
    status: "APPROVED",
    statusLabel: "Đã duyệt",
    feedback: "Ban Giám Hiệu: Đã phê duyệt.",
    dishes: [
      { name: "Thịt heo kho cút nước dừa", qty: "60g", ingredients: ["Thịt ba chỉ heo CP Foods", "Trứng cút tươi Ba Huân"] },
      { name: "Đậu phụ sốt cà chua hành hoa", qty: "50g", ingredients: ["Đậu phụ mơ sạch", "Cà chua VietGAP Nam Hà"] },
      { name: "Canh mồng tơi mướp nấu cua đồng", qty: "60g", ingredients: ["Cua đồng xay nguyên chất", "Mồng tơi, mướp hương"] },
      { name: "Cơm trắng tám thơm", qty: "130g", ingredients: ["Gạo tám thơm Hải Hậu"] }
    ],
    substituteDish: {
      name: "Thịt heo kho đậu hũ non (Không dùng trứng)",
      qty: "55g",
      ingredients: ["Thịt nạc vai heo sạch", "Đậu hũ non"]
    },
    seasonings: ["Dầu ăn Neptune", "Nước mắm Phú Quốc", "Hạt tiêu đen xay", "Muối tinh I-ốt"]
  },

  // ========================================================
  // TUẦN 44 (26/10/2026 – 30/10/2026): TOÀN BỘ YÊU CẦU CHỈNH SỬA (REVISION_REQUESTED)
  // ========================================================
  {
    id: "m-44-01",
    code: "TD-20261026-01",
    name: "Thực đơn Tiêu chuẩn Tuần 44 — Bữa trưa Thứ Hai",
    date: "26/10/2026",
    rawDate: "2026-10-26",
    week: "prev",
    mealType: "LUNCH",
    mealTypeLabel: "Trưa",
    targetScope: "Khối 6 & Khối 7",
    portionCount: 1250,
    hasAllergyMenu: true,
    allergyNote: "Dành cho HS dị ứng hải sản (12 học sinh)",
    status: "REVISION_REQUESTED",
    statusLabel: "Yêu cầu chỉnh sửa",
    feedback: "Ban Giám Hiệu: Cần giảm lượng dầu mỡ trong món xào, bổ sung thêm rau xanh luộc thanh đạm và thay thế tôm sú bằng thịt bò cho 12 em học sinh dị ứng nặng tại lớp 6A, 7B.",
    dishes: [
      { name: "Tôm sú xào măng tây sả ớt", qty: "65g", ingredients: ["Tôm sú biển tươi", "Măng tây"] },
      { name: "Thịt ba chỉ rang cháy cạnh", qty: "50g", ingredients: ["Thịt ba chỉ heo sạch"] },
      { name: "Canh ngao nấu chua thì là", qty: "60g", ingredients: ["Ngao biển", "Cà chua"] },
      { name: "Cơm tám thơm Hải Hậu", qty: "120g", ingredients: ["Gạo tám thơm"] }
    ],
    substituteDish: {
      name: "Thịt bò xào rau củ thập cẩm",
      qty: "45g",
      ingredients: ["Thịt bò nạc loại 1", "Cà rốt, ngô non"]
    },
    seasonings: ["Dầu ăn", "Nước mắm", "Hạt nêm"]
  },
  {
    id: "m-44-02",
    code: "TD-20261026-02",
    name: "Thực đơn Bữa xế Tuần 44 — Thứ Hai",
    date: "26/10/2026",
    rawDate: "2026-10-26",
    week: "prev",
    mealType: "AFTERNOON",
    mealTypeLabel: "Chiều",
    targetScope: "Toàn trường",
    portionCount: 1250,
    hasAllergyMenu: false,
    allergyNote: "Không có",
    status: "REVISION_REQUESTED",
    statusLabel: "Yêu cầu chỉnh sửa",
    feedback: "Ban Giám Hiệu: Cần giảm lượng dầu mỡ trong món xào, bổ sung thêm rau xanh luộc thanh đạm và thay thế tôm sú bằng thịt bò cho 12 em học sinh dị ứng nặng tại lớp 6A, 7B.",
    dishes: [
      { name: "Bánh bông lan cuộn phô mai", qty: "80g", ingredients: ["Bột mì", "Phô mai"] },
      { name: "Sữa đậu nành hữu cơ Fami", qty: "180ml", ingredients: ["Đậu nành sạch"] }
    ],
    substituteDish: null,
    seasonings: ["Đường phèn"]
  },

  // ========================================================
  // TUẦN 46 (09/11/2026 – 13/11/2026): TOÀN BỘ CHỜ BGH DUYỆT (PENDING_APPROVAL)
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
  },

  // ========================================================
  // TUẦN 47 (16/11/2026 – 20/11/2026): TOÀN BỘ BẢN NHÁP (DRAFT)
  // ========================================================
  {
    id: "m-47-01",
    code: "TD-20261116-01",
    name: "Thực đơn Khởi tạo Tuần 47 — Bữa trưa Thứ Hai",
    date: "16/11/2026",
    rawDate: "2026-11-16",
    week: "future",
    mealType: "LUNCH",
    mealTypeLabel: "Trưa",
    targetScope: "Toàn trường",
    portionCount: 1250,
    hasAllergyMenu: true,
    allergyNote: "Tránh trứng gà cho khối 8 (04 học sinh)",
    status: "DRAFT",
    statusLabel: "Bản nháp",
    feedback: "Bản nháp do Cán bộ Y tế khởi tạo. Đang hoàn thiện định lượng nguyên liệu trước khi gửi BGH.",
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
    name: "Thực đơn Bữa xế Tuần 47 — Thứ Hai",
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
    feedback: "Bản nháp do Cán bộ Y tế khởi tạo. Đang hoàn thiện định lượng nguyên liệu trước khi gửi BGH.",
    dishes: [
      { name: "Bánh su kem vani sữa tươi", qty: "75g", ingredients: ["Bột mì", "Trứng gà", "Sữa tươi TH"] }
    ],
    substituteDish: null,
    seasonings: ["Đường cát"]
  },

  // ========================================================
  // CÁC TUẦN TRƯỚC (TUẦN 43 & 42): ĐÃ DUYỆT (APPROVED)
  // ========================================================
  {
    id: "m-05",
    code: "TD-20261019-01",
    name: "Thực đơn Tiêu chuẩn Tuần 43 — Thực đơn mẫu",
    date: "19/10/2026",
    rawDate: "2026-10-19",
    week: "prev",
    mealType: "LUNCH",
    mealTypeLabel: "Trưa",
    targetScope: "Toàn trường",
    portionCount: 850,
    hasAllergyMenu: false,
    allergyNote: "Không có",
    status: "APPROVED",
    statusLabel: "Đã duyệt",
    feedback: "Ban Giám Hiệu: Đã duyệt thực đơn tuần 43.",
    dishes: [
      { name: "Cá basa phi lê sốt chua ngọt", qty: "65g", ingredients: ["Cá basa phi lê sạch", "Cà chua, dứa chín"] },
      { name: "Thịt bò xào đậu Hà Lan", qty: "45g", ingredients: ["Thịt bò nạc Vissan", "Đậu Hà Lan tươi"] },
      { name: "Canh bắp cải nấu sườn băm", qty: "55g", ingredients: ["Bắp cải trắng Đà Lạt", "Sườn heo xay"] },
      { name: "Cơm tám thơm", qty: "120g", ingredients: ["Gạo tám thơm Hải Hậu"] }
    ],
    substituteDish: null,
    seasonings: ["Dầu thực vật", "Nước mắm Phú Quốc", "Hạt nêm Knorr"]
  },

  // 6. Đã duyệt
  {
    id: "m-06",
    code: "TD-20261018-01",
    name: "Thực đơn Giàu Canxi & Vitamin Tuần 44",
    date: "18/10/2026",
    rawDate: "2026-10-18",
    week: "prev",
    mealType: "LUNCH",
    mealTypeLabel: "Trưa",
    targetScope: "Toàn trường",
    portionCount: 850,
    hasAllergyMenu: true,
    allergyNote: "Dị ứng đậu phộng (03 học sinh)",
    status: "APPROVED",
    statusLabel: "Đã duyệt",
    feedback: "Ban Giám Hiệu: Đã duyệt.",
    dishes: [
      { name: "Sườn heo rim mặn ngọt", qty: "65g", ingredients: ["Sườn heo non sạch VietGAP"] },
      { name: "Rau muống xào tỏi thơm", qty: "50g", ingredients: ["Rau muống sạch VietGAP", "Tỏi Kinh Môn"] },
      { name: "Canh rau ngót nấu tôm sú", qty: "50g", ingredients: ["Rau ngót búp non", "Tôm nõn tươi"] },
      { name: "Cơm tám Hải Hậu", qty: "120g", ingredients: ["Gạo tám thơm"] }
    ],
    substituteDish: {
      name: "Sườn rim mặn ngọt riêng (Không dùng dầu mè/lạc)",
      qty: "65g",
      ingredients: ["Sườn heo non sạch", "Dầu đậu nành tinh luyện"]
    },
    seasonings: ["Dầu đậu nành", "Nước mắm", "Đường", "Tỏi ta"]
  },

  // 7. Đã duyệt
  {
    id: "m-07",
    code: "TD-20261019-01",
    name: "Thực đơn Phát triển Thể chất Tuần 44",
    date: "19/10/2026",
    rawDate: "2026-10-19",
    week: "prev",
    mealType: "LUNCH",
    mealTypeLabel: "Trưa",
    targetScope: "Toàn trường",
    portionCount: 850,
    hasAllergyMenu: false,
    allergyNote: "Không có",
    status: "APPROVED",
    statusLabel: "Đã duyệt",
    feedback: "Ban Giám Hiệu: Đã duyệt.",
    dishes: [
      { name: "Thịt bò hầm khoai tây cà rốt", qty: "70g", ingredients: ["Thịt bắp bò Vissan", "Khoai tây Đà Lạt", "Cà rốt"] },
      { name: "Rau cải thìa sốt dầu hào", qty: "45g", ingredients: ["Cải thìa tươi", "Dầu hào Maggi"] },
      { name: "Canh súp bí đỏ hạt sen", qty: "50g", ingredients: ["Bí đỏ hồ lô", "Hạt sen tươi"] },
      { name: "Cơm trắng", qty: "120g", ingredients: ["Gạo tám thơm"] }
    ],
    substituteDish: null,
    seasonings: ["Dầu hào Maggi", "Nước mắm", "Gia vị tổng hợp"]
  },

  // 8. Đã duyệt
  {
    id: "m-08",
    code: "TD-20261020-01",
    name: "Thực đơn Năng lượng Bền bỉ Tuần 44",
    date: "20/10/2026",
    rawDate: "2026-10-20",
    week: "prev",
    mealType: "LUNCH",
    mealTypeLabel: "Trưa",
    targetScope: "Toàn trường",
    portionCount: 850,
    hasAllergyMenu: true,
    allergyNote: "Dị ứng sữa bò (02 học sinh)",
    status: "APPROVED",
    statusLabel: "Đã duyệt",
    feedback: "Ban Giám Hiệu: Đã duyệt.",
    dishes: [
      { name: "Thịt đùi gà chiên nước mắm", qty: "70g", ingredients: ["Đùi gà tươi CP Foods", "Nước mắm Phú Quốc"] },
      { name: "Chả lụa hấp lá chuối", qty: "35g", ingredients: ["Giò nạc heo sạch Vissan"] },
      { name: "Canh mướp hương nấu nấm kim châm", qty: "50g", ingredients: ["Mướp hương", "Nấm kim châm sạch"] },
      { name: "Cơm dẻo", qty: "120g", ingredients: ["Gạo tám thơm"] }
    ],
    substituteDish: {
      name: "Gà kho gừng riêng biệt",
      qty: "70g",
      ingredients: ["Thịt gà sạch", "Gừng ta tươi"]
    },
    seasonings: ["Dầu ăn Neptune", "Nước mắm", "Hạt nêm"]
  },

  // 9. Đã duyệt
  {
    id: "m-09",
    code: "TD-20261021-01",
    name: "Thực đơn Cuối tuần Phong phú Tuần 44",
    date: "21/10/2026",
    rawDate: "2026-10-21",
    week: "prev",
    mealType: "LUNCH",
    mealTypeLabel: "Trưa",
    targetScope: "Toàn trường",
    portionCount: 850,
    hasAllergyMenu: false,
    allergyNote: "Không có",
    status: "APPROVED",
    statusLabel: "Đã duyệt",
    feedback: "Ban Giám Hiệu: Đã duyệt.",
    dishes: [
      { name: "Thịt heo xá xíu mật ong", qty: "60g", ingredients: ["Thịt mông heo VietGAP", "Mật ong nguyên chất"] },
      { name: "Trứng cút sốt chua ngọt", qty: "40g", ingredients: ["Trứng cút Ba Huân", "Sốt me, cà chua"] },
      { name: "Canh chua cá bông lau", qty: "55g", ingredients: ["Cá bông lau cắt khúc", "Dọc mùng, cà chua"] },
      { name: "Cơm trắng", qty: "120g", ingredients: ["Gạo tám"] }
    ],
    substituteDish: null,
    seasonings: ["Dầu thực vật", "Đường", "Nước mắm", "Sốt cà"]
  },

  // 10. Đã duyệt
  {
    id: "m-10",
    code: "TD-20261022-01",
    name: "Thực đơn Dinh dưỡng Khối Tiểu học",
    date: "22/10/2026",
    rawDate: "2026-10-22",
    week: "prev",
    mealType: "LUNCH",
    mealTypeLabel: "Trưa",
    targetScope: "Khối 6 & 7",
    portionCount: 420,
    hasAllergyMenu: true,
    allergyNote: "Dị ứng tôm cua (05 học sinh)",
    status: "APPROVED",
    statusLabel: "Đã duyệt",
    feedback: "Ban Giám Hiệu: Đã duyệt.",
    dishes: [
      { name: "Thịt lợn băm xào ngô ngọt", qty: "55g", ingredients: ["Thịt lợn sạch CP", "Ngô ngọt tách hạt"] },
      { name: "Cá thu nhật kho đậm vị", qty: "50g", ingredients: ["Cá thu nhật tươi sạch"] },
      { name: "Canh rau dền nấu thịt nạc", qty: "50g", ingredients: ["Rau dền đỏ sạch", "Thịt nạc vai băm"] },
      { name: "Cơm thơm", qty: "120g", ingredients: ["Gạo tám"] }
    ],
    substituteDish: {
      name: "Thịt nạc băm xào ngô ngọt (Suất riêng)",
      qty: "60g",
      ingredients: ["Thịt nạc sạch", "Ngô ngọt"]
    },
    seasonings: ["Dầu ăn", "Muối I-ốt", "Hạt nêm"]
  },

  // 11. Đã duyệt
  {
    id: "m-11",
    code: "TD-20261023-01",
    name: "Thực đơn Tăng cường Rau xanh",
    date: "23/10/2026",
    rawDate: "2026-10-23",
    week: "prev",
    mealType: "LUNCH",
    mealTypeLabel: "Trưa",
    targetScope: "Toàn trường",
    portionCount: 850,
    hasAllergyMenu: false,
    allergyNote: "Không có",
    status: "APPROVED",
    statusLabel: "Đã duyệt",
    feedback: "Ban Giám Hiệu: Đã duyệt.",
    dishes: [
      { name: "Gà hấp lá chanh truyền thống", qty: "70g", ingredients: ["Thịt gà sạch CP", "Lá chanh tươi"] },
      { name: "Khoai tây chiên bơ tỏi", qty: "40g", ingredients: ["Khoai tây Đà Lạt", "Bơ thực vật"] },
      { name: "Canh bí đỏ hầm xương ống", qty: "60g", ingredients: ["Bí đỏ tươi", "Xương ống heo"] },
      { name: "Cơm tám thơm", qty: "120g", ingredients: ["Gạo tám Hải Hậu"] }
    ],
    substituteDish: null,
    seasonings: ["Dầu ăn", "Muối", "Tiêu", "Hạt nêm"]
  },

  // 12. Đã duyệt (Bữa chiều)
  {
    id: "m-12",
    code: "TD-20261024-03",
    name: "Thực đơn Bữa xế Dinh dưỡng Chiều",
    date: "04/11/2026",
    rawDate: "2026-11-04",
    week: "current",
    mealType: "AFTERNOON",
    mealTypeLabel: "Chiều",
    targetScope: "Toàn trường",
    portionCount: 850,
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

  // 13. Đã duyệt (Bữa chiều)
  {
    id: "m-13",
    code: "TD-20261025-02",
    name: "Thực đơn Bữa xế Trái cây Sữa chua",
    date: "03/11/2026",
    rawDate: "2026-11-03",
    week: "current",
    mealType: "AFTERNOON",
    mealTypeLabel: "Chiều",
    targetScope: "Toàn trường",
    portionCount: 850,
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

  // 14. Đã duyệt
  {
    id: "m-14",
    code: "TD-20261026-02",
    name: "Thực đơn Bữa trưa Tuần 46 — Khối 3-5",
    date: "05/11/2026",
    rawDate: "2026-11-05",
    week: "current",
    mealType: "LUNCH",
    mealTypeLabel: "Trưa",
    targetScope: "Khối 3, 4, 5",
    portionCount: 540,
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

  // 15. Đã duyệt
  {
    id: "m-15",
    code: "TD-20261027-01",
    name: "Thực đơn Dinh dưỡng Mùa thu",
    date: "06/11/2026",
    rawDate: "2026-11-06",
    week: "current",
    mealType: "LUNCH",
    mealTypeLabel: "Trưa",
    targetScope: "Toàn trường",
    portionCount: 850,
    hasAllergyMenu: true,
    allergyNote: "Dị ứng hải sản (08 học sinh)",
    status: "APPROVED",
    statusLabel: "Đã duyệt",
    feedback: "Ban Giám Hiệu: Đã duyệt.",
    dishes: [
      { name: "Chả tôm mực giòn rụm", qty: "60g", ingredients: ["Tôm nõn tươi Vũng Tàu", "Mực ống sạch"] },
      { name: "Thịt heo luộc chấm sốt tỏi", qty: "50g", ingredients: ["Thịt ba chỉ heo sạch CP"] },
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

  // 16. Đã duyệt (Tuần tới)
  {
    id: "m-16",
    code: "TD-20261028-01",
    name: "Thực đơn Thân thiện Tiêu hóa",
    date: "05/11/2026",
    rawDate: "2026-11-05",
    week: "current",
    mealType: "AFTERNOON",
    mealTypeLabel: "Chiều",
    targetScope: "Toàn trường",
    portionCount: 850,
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

  // 17. Đã duyệt (Tuần tới)
  {
    id: "m-17",
    code: "TD-20261029-01",
    name: "Thực đơn Đạm Thực vật & Cá hồi",
    date: "06/11/2026",
    rawDate: "2026-11-06",
    week: "current",
    mealType: "AFTERNOON",
    mealTypeLabel: "Chiều",
    targetScope: "Toàn trường",
    portionCount: 850,
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

  // 18. Đã duyệt (Tuần tới)
  {
    id: "m-18",
    code: "TD-20261030-01",
    name: "Thực đơn Dự thảo Tháng 11",
    date: "30/10/2026",
    rawDate: "2026-10-30",
    week: "next",
    mealType: "LUNCH",
    mealTypeLabel: "Trưa",
    targetScope: "Toàn trường",
    portionCount: 850,
    hasAllergyMenu: true,
    allergyNote: "Dị ứng hạt điều (02 học sinh)",
    status: "APPROVED",
    statusLabel: "Đã duyệt",
    feedback: "Ban Giám Hiệu: Đã duyệt dự thảo.",
    dishes: [
      { name: "Gà sốt chua ngọt hạt điều", qty: "70g", ingredients: ["Thịt gà sạch CP", "Hạt điều rang", "Sốt chua ngọt"] },
      { name: "Su su xào thịt bò", qty: "45g", ingredients: ["Su su Tam Đảo", "Thịt bò Vissan"] },
      { name: "Canh cải cúc nấu thịt băm", qty: "50g", ingredients: ["Rau cải cúc non", "Thịt nạc băm"] },
      { name: "Cơm thơm", qty: "120g", ingredients: ["Gạo tám thơm"] }
    ],
    substituteDish: {
      name: "Gà sốt chua ngọt (Không hạt điều)",
      qty: "70g",
      ingredients: ["Thịt gà sạch CP", "Sốt chua ngọt"]
    },
    seasonings: ["Dầu ăn", "Muối", "Đường", "Nước mắm"]
  }
]



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
    feedback: "Ban Giám Hiệu: Cần giảm lượng dầu mỡ trong món xào, bổ sung thêm rau xanh luộc thanh đạm và thay thế tôm sú bằng thịt bò cho 12 em học sinh dị ứng nặng tại lớp 6A, 7B.",
  },
  45: { status: "APPROVED", statusLabel: "Đã duyệt BGH", feedback: "Ban Giám Hiệu: Thực đơn tuần 45 đạt chuẩn cân đối dinh dưỡng và khẩu phần học đường." },
  46: { status: "PENDING_APPROVAL", statusLabel: "Chờ BGH duyệt", feedback: "Hồ sơ đã gửi tới Ban Giám Hiệu lúc 08:30 ngày 06/11/2026. Đang chờ phê duyệt trực tuyến." },
  47: { status: "DRAFT", statusLabel: "Bản nháp", feedback: "Bản nháp do Cán bộ Y tế khởi tạo. Đang hoàn thiện định lượng nguyên liệu trước khi gửi BGH." },
}

export function getWeeklyMenuStatus(weekNumber, year = 2026, menus = []) {
  const w = Number(weekNumber)
  const y = Number(year)

  // 1. Kiểm tra từ menus truyền vào nếu có
  if (Array.isArray(menus) && menus.length > 0) {
    const weekMenus = menus.filter((m) => {
      if (m.rawDate) {
        const parts = m.rawDate.split("-")
        if (parts.length === 3 && Number(parts[0]) === y) {
          const d = new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])))
          const dNum = (d.getUTCDay() + 6) % 7
          d.setUTCDate(d.getUTCDate() - dNum + 3)
          const firstThu = d.valueOf()
          d.setUTCMonth(0, 1)
          if (d.getUTCDay() !== 4) {
            d.setUTCMonth(0, 1 + ((4 - d.getUTCDay() + 7) % 7))
          }
          const isoWeek = 1 + Math.ceil((firstThu - d) / 604800000)
          return isoWeek === w
        }
      }
      return false
    })

    if (weekMenus.length > 0) {
      if (weekMenus.some((m) => m.status === "REVISION_REQUESTED")) {
        const rev = weekMenus.find((m) => m.status === "REVISION_REQUESTED")
        return {
          status: "REVISION_REQUESTED",
          statusLabel: "Yêu cầu chỉnh sửa",
          feedback: rev?.feedback || "",
        }
      }
      if (weekMenus.some((m) => m.status === "PENDING_APPROVAL")) {
        return { status: "PENDING_APPROVAL", statusLabel: "Chờ BGH duyệt", feedback: "" }
      }
      if (weekMenus.some((m) => m.status === "DRAFT")) {
        return { status: "DRAFT", statusLabel: "Bản nháp", feedback: "" }
      }
      return { status: "APPROVED", statusLabel: "Đã duyệt BGH", feedback: "" }
    }
  }

  // 2. Tra cứu từ Map chuẩn 2026
  if (y === 2026 && WEEK_STATUS_MAP_2026[w]) {
    return WEEK_STATUS_MAP_2026[w]
  }

  // 3. Quy ước mặc định theo tuần
  if (w <= 45) {
    return { status: "APPROVED", statusLabel: "Đã duyệt BGH", feedback: "" }
  } else if (w === 46) {
    return { status: "PENDING_APPROVAL", statusLabel: "Chờ BGH duyệt", feedback: "" }
  } else {
    return { status: "DRAFT", statusLabel: "Bản nháp", feedback: "" }
  }
}
