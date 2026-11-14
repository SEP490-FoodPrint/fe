function offsetIsoDate(daysOffset) {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + daysOffset)
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

export const DEMO_DATA_NOTICE =
  "Dữ liệu minh họa cục bộ — dự án chưa có API Source Facility nên các thay đổi được lưu tạm trong phiên làm việc."

export const FACILITY_TYPES = [
  { value: "FARM", label: "Trang trại trồng trọt" },
  { value: "LIVESTOCK", label: "Trang trại chăn nuôi" },
  { value: "PROCESSING", label: "Cơ sở sơ chế & chế biến" },
  { value: "COLD_STORAGE", label: "Kho bảo quản lạnh" },
  { value: "COOPERATIVE", label: "Hợp tác xã nông sản" },
]

export const COOPERATION_STATUSES = [
  { value: "ACTIVE", label: "Đang hợp tác" },
  { value: "PAUSED", label: "Tạm ngừng" },
]

export const COMMON_CERTIFICATION_NAMES = [
  "VietGAP",
  "VietGAHP",
  "GlobalG.A.P.",
  "ISO 22000:2018",
  "HACCP",
  "Giấy CN cơ sở đủ điều kiện ATTP",
  "Chứng nhận Kiểm dịch thú y",
  "OCOP 4 sao",
]

export const SUGGESTED_INGREDIENTS = [
  { name: "Cải ngọt hữu cơ", group: "Rau ăn lá", unit: "kg" },
  { name: "Cà chua bi", group: "Rau củ quả", unit: "kg" },
  { name: "Xà lách mỡ", group: "Rau ăn lá", unit: "kg" },
  { name: "Thịt heo sinh học", group: "Thịt tươi", unit: "kg" },
  { name: "Xương ống heo", group: "Thịt tươi", unit: "kg" },
  { name: "Thịt ức gà sơ chế", group: "Thịt gia cầm", unit: "kg" },
  { name: "Phi lê cá basa tươi", group: "Thủy hải sản", unit: "kg" },
  { name: "Tôm sú cấp đông", group: "Thủy hải sản", unit: "kg" },
  { name: "Đậu phụ non đóng hộp", group: "Đậu & chế phẩm", unit: "hộp" },
  { name: "Gạo ST25", group: "Lương thực khô", unit: "kg" },
  { name: "Đậu xanh tách vỏ", group: "Đậu & hạt", unit: "kg" },
  { name: "Bưởi da xanh", group: "Trái cây", unit: "quả" },
]

export function createInitialMockFacilities() {
  return [
    {
      id: "sf-001",
      code: "CS-RAU-01",
      name: "Hợp tác xã Rau sạch Đơn Dương",
      facilityType: "FARM",
      address: "Thôn Nghĩa Lập, xã Ka Đô, huyện Đơn Dương, Lâm Đồng",
      contactName: "Nguyễn Minh Tuấn",
      contactPhone: "0912345678",
      contactEmail: "tuan.nm@htxdonduong.example",
      cooperationStatus: "ACTIVE",
      operationalNotes:
        "Thu hoạch buổi sáng 04:30, đóng gói thùng xốp giữ mát giao chuyến đầu ngày.",
      suppliedIngredients: [
        {
          id: "ing-1",
          name: "Cải ngọt hữu cơ",
          group: "Rau ăn lá",
          unit: "kg",
          standard: "VietGAP · thu hoạch trong ngày",
        },
        {
          id: "ing-2",
          name: "Cà chua bi",
          group: "Rau củ quả",
          unit: "kg",
          standard: "VietGAP · loại 1",
        },
        {
          id: "ing-3",
          name: "Xà lách mỡ",
          group: "Rau ăn lá",
          unit: "kg",
          standard: "Rửa sơ, giữ lạnh 4–6°C",
        },
      ],
      certifications: [
        {
          id: "cert-101",
          name: "VietGAP",
          certificateNumber: "VG-LD-2024-0188",
          issuer: "Trung tâm Kiểm nghiệm & Chứng nhận Chất lượng Nông nghiệp",
          issuedDate: offsetIsoDate(-320),
          expiryDate: offsetIsoDate(410),
          note: "Áp dụng cho vùng trồng rau ăn lá khu A1–A4.",
        },
        {
          id: "cert-102",
          name: "Giấy CN cơ sở đủ điều kiện ATTP",
          certificateNumber: "ATTP-LD-2025-042",
          issuer: "Chi cục Quản lý Chất lượng Nông lâm sản & Thủy sản Lâm Đồng",
          issuedDate: offsetIsoDate(-180),
          expiryDate: offsetIsoDate(550),
          note: "Hồ sơ công bố định kỳ đầy đủ.",
        },
      ],
      updatedAt: offsetIsoDate(-2),
      isMock: true,
    },
    {
      id: "sf-002",
      code: "CS-THIT-02",
      name: "Trang trại Chăn nuôi Sinh học Ba Vì",
      facilityType: "LIVESTOCK",
      address: "Thôn Yên Thành, xã Tản Lĩnh, huyện Ba Vì, Hà Nội",
      contactName: "Trần Thị Thu Hà",
      contactPhone: "0987654321",
      contactEmail: "ha.ttt@traiheobavi.example",
      cooperationStatus: "ACTIVE",
      operationalNotes:
        "Giết mổ tập trung theo lô có dấu kiểm soát thú y trước khi xuất kho.",
      suppliedIngredients: [
        {
          id: "ing-4",
          name: "Thịt heo sinh học",
          group: "Thịt tươi",
          unit: "kg",
          standard: "VietGAHP · xe lạnh 0–4°C",
        },
        {
          id: "ing-5",
          name: "Xương ống heo",
          group: "Thịt tươi",
          unit: "kg",
          standard: "Đóng khay hút chân không",
        },
      ],
      certifications: [
        {
          id: "cert-201",
          name: "VietGAHP",
          certificateNumber: "VGH-HN-2024-0912",
          issuer: "Viện Chăn nuôi Quốc gia",
          issuedDate: offsetIsoDate(-347),
          expiryDate: offsetIsoDate(18),
          note: "Đang lập hồ sơ tái đánh giá định kỳ.",
        },
        {
          id: "cert-202",
          name: "Chứng nhận Kiểm dịch thú y",
          certificateNumber: "KD-HN-2025-311",
          issuer: "Chi cục Chăn nuôi và Thú y Hà Nội",
          issuedDate: offsetIsoDate(-120),
          expiryDate: offsetIsoDate(245),
          note: "Kiểm tra theo từng đợt xuất chuồng.",
        },
      ],
      updatedAt: offsetIsoDate(-1),
      isMock: true,
    },
    {
      id: "sf-003",
      code: "CS-SC-03",
      name: "Xưởng Sơ chế & Đóng gói An Phú",
      facilityType: "PROCESSING",
      address: "Lô CN-04, Cụm công nghiệp Khắc Niệm, TP. Bắc Ninh, Bắc Ninh",
      contactName: "Lê Hoàng Nam",
      contactPhone: "0904556789",
      contactEmail: "nam.lh@socheanphu.example",
      cooperationStatus: "ACTIVE",
      operationalNotes:
        "Sơ chế tách xương, chia định lượng theo suất bếp ăn bán trú.",
      suppliedIngredients: [
        {
          id: "ing-6",
          name: "Phi lê cá basa tươi",
          group: "Thủy hải sản",
          unit: "kg",
          standard: "Cắt khúc không xương, cấp mát 0–2°C",
        },
        {
          id: "ing-7",
          name: "Thịt ức gà sơ chế",
          group: "Thịt gia cầm",
          unit: "kg",
          standard: "Đóng túi PA 2kg/lô",
        },
        {
          id: "ing-8",
          name: "Đậu phụ non đóng hộp",
          group: "Đậu & chế phẩm",
          unit: "hộp",
          standard: "Không chất bảo quản",
        },
      ],
      certifications: [
        {
          id: "cert-301",
          name: "ISO 22000:2018",
          certificateNumber: "ISO-BN-2024-114",
          issuer: "Tổ chức Chứng nhận Quacert",
          issuedDate: offsetIsoDate(-380),
          expiryDate: offsetIsoDate(-14),
          note: "Đã quá hạn đánh giá giám sát, cần bổ sung bản gia hạn.",
        },
        {
          id: "cert-302",
          name: "HACCP",
          certificateNumber: "HACCP-BN-2025-076",
          issuer: "Trung tâm Chứng nhận Phù hợp QUACERT",
          issuedDate: offsetIsoDate(-90),
          expiryDate: offsetIsoDate(275),
          note: "Áp dụng cho dây chuyền sơ chế thủy sản & gia cầm.",
        },
      ],
      updatedAt: offsetIsoDate(-4),
      isMock: true,
    },
    {
      id: "sf-004",
      code: "CS-KHO-04",
      name: "Kho Lạnh Bảo quản Đông Anh",
      facilityType: "COLD_STORAGE",
      address: "Đường Võ Văn Kiệt, xã Kim Chung, huyện Đông Anh, Hà Nội",
      contactName: "Phạm Quang Dũng",
      contactPhone: "0978112233",
      contactEmail: "dung.pq@kholanhdonganh.example",
      cooperationStatus: "ACTIVE",
      operationalNotes:
        "Kho âm -18°C và kho mát 2–4°C có cảm biến ghi nhận nhiệt độ tự động.",
      suppliedIngredients: [
        {
          id: "ing-9",
          name: "Tôm sú cấp đông",
          group: "Thủy hải sản",
          unit: "kg",
          standard: "Bảo quản liên tục -18°C",
        },
      ],
      certifications: [
        {
          id: "cert-401",
          name: "Giấy CN cơ sở đủ điều kiện ATTP",
          certificateNumber: "ATTP-HN-2025-889",
          issuer: "Sở Công Thương Hà Nội",
          issuedDate: offsetIsoDate(-150),
          expiryDate: offsetIsoDate(580),
          note: "Đạt kiểm tra định kỳ chuỗi cung ứng lạnh quý III.",
        },
      ],
      updatedAt: offsetIsoDate(-6),
      isMock: true,
    },
    {
      id: "sf-005",
      code: "CS-GAO-05",
      name: "Nhà máy Xay xát Lương thực Sóc Trăng",
      facilityType: "PROCESSING",
      address: "Ấp Trà Quýt, thị trấn Châu Thành, huyện Châu Thành, Sóc Trăng",
      contactName: "Võ Thanh Bình",
      contactPhone: "0939224466",
      contactEmail: "binh.vt@luongthucst.example",
      cooperationStatus: "ACTIVE",
      operationalNotes:
        "Đóng bao 25kg có tem truy xuất lô xay xát, giao định kỳ đầu tháng.",
      suppliedIngredients: [
        {
          id: "ing-10",
          name: "Gạo ST25",
          group: "Lương thực khô",
          unit: "kg",
          standard: "Bao 25kg hút ẩm, không tẩy trắng",
        },
        {
          id: "ing-11",
          name: "Đậu xanh tách vỏ",
          group: "Đậu & hạt",
          unit: "kg",
          standard: "Độ ẩm <= 12%",
        },
      ],
      certifications: [
        {
          id: "cert-501",
          name: "GlobalG.A.P.",
          certificateNumber: "GG-ST-2024-502",
          issuer: "Control Union Việt Nam",
          issuedDate: offsetIsoDate(-200),
          expiryDate: offsetIsoDate(165),
          note: "Bao gồm vùng nguyên liệu liên kết Sóc Trăng.",
        },
        {
          id: "cert-502",
          name: "OCOP 4 sao",
          certificateNumber: "OCOP-ST-2025-119",
          issuer: "UBND tỉnh Sóc Trăng",
          issuedDate: offsetIsoDate(-110),
          expiryDate: offsetIsoDate(620),
          note: "Sản phẩm gạo đặc sản đạt chuẩn OCOP.",
        },
      ],
      updatedAt: offsetIsoDate(-9),
      isMock: true,
    },
    {
      id: "sf-006",
      code: "CS-HTX-06",
      name: "Hợp tác xã Trái cây Giồng Trôm",
      facilityType: "COOPERATIVE",
      address: "Ấp Bình Tiên, xã Bình Thành, huyện Giồng Trôm, Bến Tre",
      contactName: "Đặng Ngọc Mai",
      contactPhone: "0945667788",
      contactEmail: "mai.dn@htxgiongtrom.example",
      cooperationStatus: "PAUSED",
      operationalNotes:
        "Tạm ngừng tiếp nhận đơn mới trong thời gian rà soát lại vùng trồng và bổ sung chứng nhận VietGAP.",
      suppliedIngredients: [
        {
          id: "ing-12",
          name: "Bưởi da xanh",
          group: "Trái cây",
          unit: "quả",
          standard: "Trái loại 1 từ 1.2–1.5kg",
        },
      ],
      certifications: [],
      updatedAt: offsetIsoDate(-12),
      isMock: true,
    },
  ]
}
