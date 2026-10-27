const commonStaples = [
  {
    name: "Cơm trắng dẻo ST25",
    description: "Gạo sạch ST An Giang",
    kind: "staple",
  },
]

export const MOCK_MENU_APPROVAL = {
  id: "menu-week-43-2026",
  code: "TĐ-2026-T43",
  title: "Thực đơn Bán trú Tiêu chuẩn Mùa Thu - Tuần 43",
  description:
    "Thực đơn bán trú tuần 43 (26/10/2026 - 30/10/2026) do Bộ phận Bếp và Cán bộ Bán trú phụ trách trường đề xuất.",
  status: "PENDING_APPROVAL",
  submittedAt: "20/10/2026 - 14:30",
  summary: {
    audience: "Toàn trường (Khối 1 - Khối 5)",
    audienceDetail: "44 lớp học · 1.520 học sinh",
    servingPeriod: "26/10 - 30/10/2026",
    servingDetail: "5 ngày học bán trú",
    proposer: "Tổ Dinh dưỡng Bán trú",
    proposerDetail: "Bếp trưởng: Trần Văn Quý",
    supplier: "Công ty CP Thực phẩm Xanh Sông Hồng",
    supplierDetail: "HĐ-2026/SH-08 · VSATTP: 0422/2025/ATTP-HN",
  },
  compliance: [
    {
      id: "three-step",
      title: "Kiểm thực 3 bước",
      detail: "Quy trình nhập kho và lưu mẫu 24 giờ sẵn sàng",
      tone: "success",
    },
    {
      id: "medical",
      title: "Thẩm định Y tế Trường học",
      detail: "Đã kiểm duyệt cân đối khẩu phần và dinh dưỡng",
      tone: "success",
    },
    {
      id: "allergy",
      title: "Hồ sơ dị ứng tuần 43",
      detail: "14 học sinh có tiền sử dị ứng hải sản hoặc đậu phộng",
      tone: "warning",
    },
  ],
  days: [
    {
      id: "t2",
      shortLabel: "Thứ Hai",
      dayNumber: "2",
      date: "26/10/2026",
      portions: 1520,
      lunch: [
        {
          name: "Thịt nạc heo kho trứng cút sốt caramel dừa",
          description: "Thịt nạc thăn, trứng cút sạch Tiên Viên và nước dừa tươi Bến Tre",
          supplier: "CP Foods Việt Nam",
          tag: "Trứng",
          tone: "warning",
        },
        {
          name: "Bí ngòi xanh xào cà rốt nấm đông cô",
          description: "Bí ngòi hữu cơ, cà rốt Đà Lạt và nấm hương khô loại 1",
          supplier: "HTX Rau sạch Vân Nội",
          tag: "Ăn lành",
          tone: "success",
        },
        {
          name: "Canh bí đỏ hầm sườn thịt bằm hành hoa",
          description: "Bí đỏ hồ lô, thịt nạc dăm và nước xương ống hầm tự nhiên",
          supplier: "Thực phẩm Xanh Sông Hồng",
        },
        ...commonStaples,
        {
          name: "Tráng miệng: Quýt đường Hàm Yên",
          description: "Đã rửa ozon khử khuẩn",
          kind: "dessert",
        },
      ],
      snack: [
        {
          name: "Súp bắp ngô non thịt gà xé tơ",
          description: "Ức gà tươi, bắp ngọt, nấm hương và trứng gà",
          supplier: "Tổ Bếp tự chế biến",
          tag: "Chứa trứng",
          tone: "warning",
        },
        {
          name: "Sữa chua uống men sống Probi 65ml",
          description: "Bổ sung vi sinh đường ruột cho học sinh bán trú",
          supplier: "Công ty CP Sữa Vinamilk",
          tag: "Sữa bò",
        },
      ],
    },
    {
      id: "t3",
      shortLabel: "Thứ Ba",
      dayNumber: "3",
      date: "27/10/2026",
      portions: 1520,
      lunch: [
        {
          name: "Bò Úc sốt tiêu nhẹ xào ớt chuông ngọt và hành tây",
          description: "Thịt bò bắp mềm, ớt chuông Đà Lạt và tiêu Phú Quốc vị dịu",
          supplier: "Thực phẩm Xanh Sông Hồng",
          tag: "Giàu sắt",
          tone: "success",
        },
        {
          name: "Cải chíp hấp dầu hào tỏi phi thơm",
          description: "Cải thìa non VietGAP, dầu hào và tỏi ta Kinh Môn",
          supplier: "HTX Rau sạch Vân Nội",
          tag: "Gluten nhẹ",
          tone: "warning",
        },
        {
          name: "Canh mồng tơi nấu thịt cua đồng tinh khiết",
          description: "Cua đồng sơ chế tiệt trùng, rau mồng tơi và mướp hương",
          supplier: "Hải sản Hải Phòng Co.",
          tag: "Cảnh báo hải sản",
          tone: "error",
        },
        ...commonStaples,
        {
          name: "Tráng miệng: Chuối tiêu hồng Hưng Yên",
          description: "Chứng nhận OCOP 4 sao",
          kind: "dessert",
        },
      ],
      snack: [
        {
          name: "Bánh bao sữa hấp nhân thịt xá xíu mộc nhĩ",
          description: "Bột mì cao cấp, thịt nạc dăm, mộc nhĩ và sữa tươi",
          supplier: "Bánh bao Thọ Phát",
          tag: "Gluten",
          tone: "warning",
        },
        {
          name: "Sữa hạt sen Nam Đàn ít đường 180ml",
          description: "Thức uống thanh nhẹ, bổ dưỡng tự nhiên cho học sinh",
          supplier: "Công ty Dinh dưỡng Nutifood",
          tag: "Thảo mộc",
        },
      ],
    },
    {
      id: "t4",
      shortLabel: "Thứ Tư",
      dayNumber: "4",
      date: "28/10/2026",
      portions: 1520,
      lunch: [
        {
          name: "Gà ta rim nước mắm cốt nhĩ và mật ong rừng",
          description: "Đùi gà rút xương, mật ong hoa nhãn và nước mắm Phan Thiết",
          supplier: "CP Foods Việt Nam",
          tag: "Đạm cao",
          tone: "success",
        },
        {
          name: "Đậu cô ve xào thịt nạc thăn bằm",
          description: "Đậu cô ve xanh giống Nhật và thịt nạc thăn bằm nhuyễn",
          supplier: "HTX Rau sạch Vân Nội",
        },
        {
          name: "Canh củ cải trắng hầm thịt bò viên đậu Hà Lan",
          description: "Bò viên làm trong ngày, không hàn the và đậu Hà Lan non",
          supplier: "Thực phẩm Xanh Sông Hồng",
        },
        ...commonStaples,
        {
          name: "Tráng miệng: Đu đủ ruột đỏ",
          description: "Trang trại Hòa Bình",
          kind: "dessert",
        },
      ],
      snack: [
        {
          name: "Phở gà truyền thống Hà Nội (bát nhỏ)",
          description: "Bánh phở tươi không formol, ức gà xé và nước hầm xương",
          supplier: "Bếp trường nấu trực tiếp",
          tag: "Nước dùng ấm",
          tone: "success",
        },
        {
          name: "Sữa chua men sống TH true YOGURT 100g",
          description: "Lên men tự nhiên từ sữa tươi trang trại TH",
          supplier: "Tập đoàn TH True Milk",
          tag: "Sữa tươi",
        },
      ],
    },
    {
      id: "t5",
      shortLabel: "Thứ Năm",
      dayNumber: "5",
      date: "29/10/2026",
      portions: 1520,
      lunch: [
        {
          name: "Cá ba sa phi lê lăn bột hoàng kim sốt cà chua",
          description: "Phi lê cá chiên ráo dầu và sốt cà chua bi Đà Lạt",
          supplier: "Thủy sản Hùng Vương",
          tag: "Thủy sản & Gluten",
          tone: "error",
        },
        {
          name: "Su su xào tôm nõn khô băm và mộc nhĩ",
          description: "Su su Tam Đảo thái chỉ và tôm nõn giã dập tạo vị ngọt",
          supplier: "HTX Rau sạch Tam Đảo",
          tag: "Cảnh báo: Tôm",
          tone: "error",
        },
        {
          name: "Canh rau ngót nấu thịt nạc bằm",
          description: "Rau ngót vườn an toàn và thịt nạc mông xay",
          supplier: "Thực phẩm Xanh Sông Hồng",
        },
        ...commonStaples,
        {
          name: "Tráng miệng: Táo ngọt Ninh Thuận",
          description: "Chứng nhận VietGAP",
          kind: "dessert",
        },
      ],
      snack: [
        {
          name: "Chè đậu đỏ hạt sen cốt dừa tươi",
          description: "Đậu đỏ ninh nhừ, hạt sen Huế và đường phèn Quảng Ngãi",
          supplier: "Bếp trường tự nấu",
          tag: "Thanh ngọt",
        },
        {
          name: "Bánh quy bơ hạt chia dinh dưỡng",
          description: "Gói lẻ đảm bảo an toàn vệ sinh cá nhân",
          supplier: "Công ty Bánh kẹo Kinh Đô",
          tag: "Gluten",
          tone: "warning",
        },
      ],
    },
    {
      id: "t6",
      shortLabel: "Thứ Sáu",
      dayNumber: "6",
      date: "30/10/2026",
      portions: 1520,
      lunch: [
        {
          name: "Thịt ba chỉ quay giòn bì ăn kèm dưa leo non",
          description: "Ba chỉ nướng nhiệt đối lưu không cháy và nước sốt tương ngọt",
          supplier: "CP Foods Việt Nam",
          tag: "Được yêu thích",
          tone: "success",
        },
        {
          name: "Đậu hũ non sốt nấm hương tươi và hành lá",
          description: "Đậu phụ làng Mơ kiểm định không chất bảo quản",
          supplier: "HTX Đậu Mơ Hà Nội",
          tag: "Đậu nành",
          tone: "warning",
        },
        {
          name: "Canh chua cá lóc miền Tây nấu dứa và cà chua",
          description: "Cá lóc đồng lọc xương cẩn thận, vị me chua thanh dịu",
          supplier: "Thực phẩm Xanh Sông Hồng",
          tag: "Thủy sản",
          tone: "error",
        },
        ...commonStaples,
        {
          name: "Tráng miệng: Sữa chua dầm dâu tây Mộc Châu",
          description: "Bếp chế biến đóng cốc",
          kind: "dessert",
        },
      ],
      snack: [
        {
          name: "Bánh mì gối tươi kẹp phô mai nướng mềm",
          description: "Phô mai Con Bò Cười và bánh mì mềm cho học sinh tiểu học",
          supplier: "Bếp trường chuẩn bị",
          tag: "Sữa & Gluten",
          tone: "warning",
        },
        {
          name: "Sữa tươi tiệt trùng Vinamilk 100% 180ml",
          description: "Sữa có đường bổ sung Vitamin D3 và Canxi",
          supplier: "Công ty CP Sữa Vinamilk",
          tag: "Sữa bò",
        },
      ],
    },
  ],
  medicalReview: {
    status: "Đạt tiêu chuẩn",
    reviewer: "BS. Lê Thị Hoa",
    role: "Cán bộ Chuyên trách Y tế Học đường",
    reviewedAt: "21/10/2026 - 09:15",
    note:
      "Đã thẩm định cơ cấu nhóm chất cân đối. Các món phù hợp với thời tiết giao mùa cuối thu và không lặp lại dị nguyên có nguy cơ cao đã ghi nhận trong tuần 42.",
    documents: [
      "Kiểm thực 3 bước (QĐ 1246)",
      "Biên bản test hàn the và formol",
    ],
  },
  approval: {
    approver: "Thầy Nguyễn Văn Minh",
    role: "Hiệu trưởng",
  },
}
