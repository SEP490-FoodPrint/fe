import { ORG_TYPES, ROLES } from "src/constants/roles";

/**
 * Mock Data chuẩn 100% theo schema và DTO camelCase
 */
export const MOCK_SCHOOLS = [
  {
    id: "a1b2c3d4-0001-4000-8000-000000000001",
    name: "Trường Tiểu học Ánh Dương",
    code: "SCH_ANH_DUONG",
    shortName: "ÁD",
    address: "Số 18 Phố Nguyễn Phong Sắc, Cầu Giấy, Hà Nội",
    district: "Cầu Giấy",
    city: "Hà Nội",
    email: "tieuhoc.anhduong@foodprint.edu.vn",
    phone: "024 3756 8899",
    cookingMode: "SEPARATE_BY_LOT",
    lunchTime: "10:45:00",
    afternoonMealTime: "14:30:00",
    boardingScale: "1.250 học sinh bán trú",
    safetyStandard: "Tiêu chuẩn Y tế học đường",
    logoUrl: null,
    coverImageUrl: null,
    description:
      "Trường Tiểu học Ánh Dương cam kết minh bạch 100% thực đơn học đường, quy trình dinh dưỡng cân bằng và vệ sinh an toàn thực phẩm, đồng hành cùng phụ huynh chăm sóc sức khỏe toàn diện cho học sinh.",
    websiteUrl: "https://thanhduong.edu.vn",
    status: "ACTIVE",
    badgeColor: "emerald",
  },
  {
    id: "a1b2c3d4-0002-4000-8000-000000000002",
    name: "Trường Tiểu học Hoa Sen",
    code: "SCH_HOA_SEN",
    shortName: "HS",
    address: "Số 42 Phố Kim Mã, Q. Ba Đình, Hà Nội",
    district: "Ba Đình",
    city: "Hà Nội",
    email: "ban-tru@hoasen.edu.vn",
    phone: "024 3845 2211",
    cookingMode: "COMBINE_LOTS",
    lunchTime: "11:00:00",
    afternoonMealTime: "14:45:00",
    boardingScale: "980 học sinh bán trú",
    safetyStandard: "Chuẩn Vệ sinh An toàn Thực phẩm",
    logoUrl: null,
    coverImageUrl: null,
    description:
      "Môi trường học tập thân thiện, thực đơn được tính toán năng lượng và dinh dưỡng theo từng độ tuổi, nguồn thực phẩm sạch truy xuất nguồn gốc.",
    websiteUrl: "https://thhoasen.edu.vn",
    status: "ACTIVE",
    badgeColor: "amber",
  },
  {
    id: "a1b2c3d4-0003-4000-8000-000000000003",
    name: "Trường Tiểu học Nguyễn Du",
    code: "SCH_NGUYEN_DU",
    shortName: "ND",
    address: "Số 11 Phố Hàng Chuối, Q. Hoàn Kiếm, Hà Nội",
    district: "Hoàn Kiếm",
    city: "Hà Nội",
    email: "bantin.nguyendu@foodprint.edu.vn",
    phone: "024 3971 6633",
    cookingMode: "SEPARATE_BY_LOT",
    lunchTime: "10:50:00",
    afternoonMealTime: "14:30:00",
    boardingScale: "1.100 học sinh bán trú",
    safetyStandard: "Kiểm soát an toàn 3 bước",
    logoUrl: null,
    coverImageUrl: null,
    description:
      "Tiên phong ứng dụng nhật ký số trong quản lý xuất xứ thực phẩm và truy xuất nguồn gốc bữa ăn bán trú của học sinh.",
    websiteUrl: "https://thnguyendu.edu.vn",
    status: "ACTIVE",
    badgeColor: "teal",
  },
  {
    id: "a1b2c3d4-0004-4000-8000-000000000004",
    name: "Trường Tiểu học Bình Minh",
    code: "SCH_BINH_MINH",
    shortName: "BM",
    address: "Số 80 Phố Thụy Khuê, Q. Tây Hồ, Hà Nội",
    district: "Tây Hồ",
    city: "Hà Nội",
    email: "c1binhminh@foodprint.edu.vn",
    phone: "024 3829 4455",
    cookingMode: "COMBINE_LOTS",
    lunchTime: "11:15:00",
    afternoonMealTime: "14:30:00",
    boardingScale: "850 học sinh bán trú",
    safetyStandard: "Quy chuẩn bếp ăn 1 chiều",
    logoUrl: null,
    coverImageUrl: null,
    description:
      "Đảm bảo an toàn vệ sinh thực phẩm với hệ thống camera giám sát bếp ăn bán trú và lưu mẫu thức ăn 24h nghiêm ngặt.",
    websiteUrl: "https://thbinhminh.edu.vn",
    status: "ACTIVE",
    badgeColor: "cyan",
  },
  {
    id: "a1b2c3d4-0005-4000-8000-000000000005",
    name: "Trường Marie Curie Hà Nội",
    code: "SCH_MARIE_CURIE",
    shortName: "MC",
    address: "Phố Trần Văn Lai, KĐT Mỹ Đình 1, Nam Từ Liêm, Hà Nội",
    district: "Nam Từ Liêm",
    city: "Hà Nội",
    email: "tieuhoc.mariecurie@foodprint.edu.vn",
    phone: "024 3556 8595",
    cookingMode: "SEPARATE_BY_LOT",
    lunchTime: "11:30:00",
    afternoonMealTime: "15:00:00",
    boardingScale: "1.800 học sinh bán trú",
    safetyStandard: "Chuẩn Quốc tế ISO 22000",
    logoUrl: null,
    coverImageUrl: null,
    description:
      "Mô hình bán trú cao cấp với thực đơn phong phú Á - Âu, nguyên liệu hữu cơ có chứng nhận VietGAP và GlobalGAP.",
    websiteUrl: "https://mariecuriehanoi.com",
    status: "ACTIVE",
    badgeColor: "rose",
  },
  {
    id: "a1b2c3d4-0006-4000-8000-000000000006",
    name: "Trường Chu Văn An",
    code: "SCH_CHU_VAN_AN",
    shortName: "CVA",
    address: "Số 10 Phố Thụy Khuê, Q. Tây Hồ, Hà Nội",
    district: "Tây Hồ",
    city: "Hà Nội",
    email: "c3chuvanan@foodprint.edu.vn",
    phone: "024 3823 3164",
    cookingMode: "SEPARATE_BY_LOT",
    lunchTime: "11:20:00",
    afternoonMealTime: "14:30:00",
    boardingScale: "1.400 học sinh bán trú",
    safetyStandard: "Kiểm định định kỳ Bộ Y tế",
    logoUrl: null,
    coverImageUrl: null,
    description:
      "Ngôi trường trăm tuổi với truyền thống hiếu học, đặc biệt chú trọng chất lượng dinh dưỡng và thể chất cho thế hệ trẻ.",
    websiteUrl: "https://c3chuvanan.edu.vn",
    status: "ACTIVE",
    badgeColor: "indigo",
  },
];

/**
 * Mock Data: Thực đơn ngày hôm nay dành riêng cho Trường Tiểu học FoodPrint
 * Ngày: 15/11/2026 (Hôm nay)
 */
export const MOCK_FOODPRINT_DAILY_MENU = {
  date: "2026-11-15",
  dateLabel: "Chủ Nhật, 15/11/2026",
  menuDate: "2026-11-15",
  updatedAt: "07:15 - 15/11/2026 (Đã duyệt bởi BGH)",
  schoolName: "Trường Tiểu học FoodPrint",
  schoolCode: "FP-DEMO-SCHOOL-01",

  lunch: {
    mealType: "LUNCH",
    title: "Bữa trưa chính dinh dưỡng",
    servingWindow: "10:45 – 11:30",
    trayImageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCBwNjlhj0HUaFnMG7FVIvzeS-bxQ1dje3G-wVHO79zJkeLyzUMCgpZSQzRVHcxhKW7Cb2tHe69YwcmuaRlixreDNij6Y7ZsBdObiD37TuNldd3XoHeBvD4XoRomsHeDxHj4efUNf-C-jg0ypW5A6nZJDJvBciK-fBx5x48bzgFeitOb2tFLjisidUVeRlKQpSBnE60I8S7O5_XcWObq0d4q_U5jFCkeFfl3D-1i2uppSrVB0G8zJXkAg",
    trayType: "Khay Inox 5 ngăn kháng khuẩn",
    standardsNote: "Đáp ứng 4 nhóm dinh dưỡng cân đối theo khuyến nghị Viện Dinh Dưỡng Quốc Gia",
    allergyWarning:
      "Lưu ý: Thực đơn tiêu chuẩn có tôm đồng và thịt bò. Lớp 3A có học sinh dị ứng được bếp cấp món thay thế riêng.",
    dishes: [
      {
        id: "fp-dish-01",
        name: "Cơm gạo tám Điện Biên",
        portion: "150g",
        portionSize: 150,
        portionUnit: "g",
        category: "Món cung cấp Tinh bột",
        description: "Gạo tám thơm Điện Biên mùa mới, dẻo ngọt tự nhiên",
        ingredients: [
          {
            id: "ing-01",
            name: "Gạo tám Điện Biên",
            portion: "150g",
            category: "Lương thực",
            supplierName: "Nhà cung cấp Nông Sản Xanh",
            note: "Chứng nhận VietGAP số 45/2026, xuất xứ Điện Biên",
          },
        ],
      },
      {
        id: "fp-dish-02",
        name: "Thịt bò Úc xào nấm hương & su hào",
        portion: "75g",
        portionSize: 75,
        portionUnit: "g",
        category: "Món chính giàu Đạm & Khoáng",
        description: "Thăn bò mềm xào cùng nấm hương tươi và củ quả giòn ngọt",
        ingredients: [
          {
            id: "ing-02",
            name: "Thịt thăn bò tươi",
            portion: "50g",
            category: "Thịt tươi sống",
            supplierName: "Nhà cung cấp Nông Sản Xanh",
            note: "Kiểm dịch thú y số KD-8899, kiểm thực bước 1 đạt lúc 05:45",
          },
          {
            id: "ing-03",
            name: "Nấm hương tươi & su hào",
            portion: "25g",
            category: "Rau củ quả",
            supplierName: "HTX Nông nghiệp Công nghệ cao Ba Vì",
            note: "Chứng nhận VietGAP trồng trong nhà màng",
          },
        ],
        alternativeDish: {
          id: "fp-dish-02-alt",
          name: "Thịt lợn nạc rim hạt sen & nấm",
          portion: "75g",
          allergyGroup: "Dị ứng thịt bò",
          category: "Món thay thế dị ứng",
          ingredients: [
            {
              id: "ing-02-alt",
              name: "Thịt nạc vai heo sinh học",
              portion: "50g",
              category: "Thịt tươi sống",
              supplierName: "Nhà cung cấp Nông Sản Xanh",
              note: "Heo thảo mộc truy xuất mã QR On-chain",
            },
          ],
        },
      },
      {
        id: "fp-dish-03",
        name: "Trứng cuộn ngũ sắc hấp mềm",
        portion: "50g",
        portionSize: 50,
        portionUnit: "g",
        category: "Món phụ giàu Đạm & Vitamin",
        description: "Trứng gà tươi kết hợp cà rốt, bắp ngọt và đậu hà lan",
        ingredients: [
          {
            id: "ing-04",
            name: "Trứng gà tươi sạch OCOP",
            portion: "40g",
            category: "Trứng & Sản phẩm gia cầm",
            supplierName: "Nhà cung cấp Nông Sản Xanh",
            note: "Trứng gà thảo dược đạt chuẩn OCOP 4 sao",
          },
        ],
      },
      {
        id: "fp-dish-04",
        name: "Canh bí đỏ nấu tôm đồng tươi",
        portion: "1 bát (180ml)",
        portionSize: 180,
        portionUnit: "ml",
        category: "Món canh giàu Vitamin A",
        description: "Bí đỏ ngọt bùi nấu cùng tôm đồng băm tươi",
        ingredients: [
          {
            id: "ing-05",
            name: "Tôm đồng tươi sống",
            portion: "30g",
            category: "Thủy hải sản",
            supplierName: "Nhà cung cấp Nông Sản Xanh",
            note: "Kiểm thực tươi sống 100%",
          },
          {
            id: "ing-06",
            name: "Bí đỏ sạch Mộc Châu",
            portion: "70g",
            category: "Rau củ quả",
            supplierName: "Nhà cung cấp Nông Sản Xanh",
            note: "VietGAP số 12/2026",
          },
        ],
        alternativeDish: {
          id: "fp-dish-04-alt",
          name: "Canh bí đỏ nấu thịt nạc băm",
          portion: "1 bát (180ml)",
          allergyGroup: "Dị ứng Tôm / Hải sản (Lớp 3A)",
          category: "Món thay thế dị ứng",
          ingredients: [
            {
              id: "ing-05-alt",
              name: "Thịt nạc mông heo xay",
              portion: "30g",
              category: "Thịt tươi sống",
              supplierName: "Nhà cung cấp Nông Sản Xanh",
              note: "Kiểm dịch thú y đạt chuẩn",
            },
          ],
        },
      },
      {
        id: "fp-dish-05",
        name: "Tráng miệng: Thanh long ruột đỏ Organic",
        portion: "2 miếng (80g)",
        portionSize: 80,
        portionUnit: "g",
        category: "Trái cây tráng miệng",
        description: "Thanh long hữu cơ ngọt mát, giàu chất chống oxy hóa",
        ingredients: [
          {
            id: "ing-07",
            name: "Thanh long ruột đỏ Bình Thuận",
            portion: "80g",
            category: "Trái cây",
            supplierName: "Nhà cung cấp Nông Sản Xanh",
            note: "Tiêu chuẩn GlobalGAP xuất khẩu",
          },
        ],
      },
    ],
  },

  snack: {
    mealType: "AFTERNOON",
    title: "Bữa phụ chiều bổ sung năng lượng",
    servingWindow: "14:30 – 15:00",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDB8VwonYSD-vP1vILXdnxkBR1h3ACxIY6kok371v4s0kGt-K3kgtpdAfnp-r6KncqWukrxhaH0tnLCn7_bb62mhjZxyMHthWz3m60PgtMGFRTc-GpJB55WjsuL2zqDpHaE6_TXDuXXulExFrjBwPAgnk2U-tMkoaMoGV6ZcI2dBbM1KFrsujYjBNx5taqKdy7534TMSoGN_4K5OLUN8Z92zLUeHYGNf4sV2o31gTQ9J8i6Zd57Absd8A",
    items: [
      {
        id: "snack-01",
        name: "Sữa tươi tiệt trùng TH true MILK ít đường",
        desc: "Hộp 180ml · 100% sữa tươi sạch từ trang trại TH",
        icon: "coffee",
      },
      {
        id: "snack-02",
        name: "Bánh bông lan trứng tươi phô mai",
        desc: "Bếp trường FoodPrint nướng tươi trong ngày lúc 13:00",
        icon: "cake",
      },
    ],
    dishes: [
      {
        id: "fp-snack-01",
        name: "Sữa tươi tiệt trùng 180ml",
        portion: "1 hộp",
        mealType: "AFTERNOON",
      },
      {
        id: "fp-snack-02",
        name: "Bánh bông lan phô mai",
        portion: "1 cái (60g)",
        mealType: "AFTERNOON",
      },
    ],
  },
};

/**
 * Mock Data: Thực đơn ngày hôm nay
 */
export const MOCK_DAILY_MEAL_MENUS = {
  "FP-SCHOOL-01": MOCK_FOODPRINT_DAILY_MENU,
  "FP-DEMO-SCHOOL-01": MOCK_FOODPRINT_DAILY_MENU,
  FP_SCHOOL_01: MOCK_FOODPRINT_DAILY_MENU,
  FP_DEMO_SCHOOL_01: MOCK_FOODPRINT_DAILY_MENU,
  SCH_ANH_DUONG: MOCK_FOODPRINT_DAILY_MENU,
};

/**
 * Mock Data: Thực đơn tuần (Thứ 2 đến Thứ 6)
 */
export const MOCK_WEEKLY_MENUS = {
  "FP-DEMO-SCHOOL-01": {
    id: "wm-fp-week-11",
    title: "Thực đơn Tuần 11",
    weekNumber: 11,
    weekStartDate: "2026-11-16",
    weekEndDate: "2026-11-20",
    weekRange: "16/11/2026 – 20/11/2026",
    isCurrentWeek: true,
    status: "APPROVED",
    portionGroups: [
      { id: "GRADE_1_3", name: "Khối lớp 1–3", isDefault: true },
      { id: "GRADE_4_5", name: "Khối lớp 4–5", isDefault: false },
    ],
    gradeGroups: [
      { key: "GRADE_1_3", label: "Khối lớp 1–3" },
      { key: "GRADE_4_5", label: "Khối lớp 4–5" },
    ],
    days: [
      {
        id: "day-fp-1",
        dayOfWeek: "Thứ Hai",
        date: "16/11/2026",
        dateIso: "2026-11-16",
        status: "TODAY",
        statusLabel: "Hôm nay",
        isToday: true,
        lunchDishes: [
          "Cơm gạo tám Điện Biên",
          "Thịt bò Úc xào nấm hương & su hào",
          "Trứng cuộn ngũ sắc hấp mềm",
          "Canh bí đỏ nấu tôm đồng tươi",
          "Tráng miệng: Thanh long ruột đỏ Organic",
        ],
        snackSummary: "Sữa tươi tiệt trùng TH true MILK & Bánh bông lan phô mai",
        dishes: MOCK_FOODPRINT_DAILY_MENU.lunch.dishes,
      },
      {
        id: "day-fp-2",
        dayOfWeek: "Thứ Ba",
        date: "17/11/2026",
        dateIso: "2026-11-17",
        status: "UPCOMING",
        statusLabel: "Sắp diễn ra",
        isToday: false,
        lunchDishes: [
          "Cơm trắng tám thơm mùa mới",
          "Cá hồi Nauy sốt cà chua & thì là",
          "Bắp cải xào nấm đùi gà",
          "Canh sườn non hầm rau củ",
          "Tráng miệng: Chuối tiêu chín",
        ],
        snackSummary: "Sữa chua uống tiệt trùng & Bánh quy yến mạch hạnh nhân",
      },
      {
        id: "day-fp-3",
        dayOfWeek: "Thứ Tư",
        date: "18/11/2026",
        dateIso: "2026-11-18",
        status: "UPCOMING",
        statusLabel: "Sắp diễn ra",
        isToday: false,
        lunchDishes: [
          "Cơm gạo lứt phối tám thơm",
          "Gà ri hấp lá chanh truyền thống",
          "Đậu phụ non sốt thịt băm",
          "Canh mồng tơi nấu ngao tươi",
          "Tráng miệng: Đu đủ ruột đỏ",
        ],
        snackSummary: "Chè hạt sen đậu xanh cốt dừa thanh mát",
      },
      {
        id: "day-fp-4",
        dayOfWeek: "Thứ Năm",
        date: "19/11/2026",
        dateIso: "2026-11-19",
        status: "UPCOMING",
        statusLabel: "Sắp diễn ra",
        isToday: false,
        lunchDishes: [
          "Cơm tám Điện Biên dẻo thơm",
          "Tôm biển rim thịt ba chỉ cháy cạnh",
          "Bí xanh non xào tỏi",
          "Canh cua đồng mùng tơi mướp hương",
          "Tráng miệng: Quýt đường Mộc Châu",
        ],
        snackSummary: "Bánh bao nhân thịt nạc trứng cút & Sữa đậu nành hữu cơ",
      },
      {
        id: "day-fp-5",
        dayOfWeek: "Thứ Sáu",
        date: "20/11/2026",
        dateIso: "2026-11-20",
        status: "UPCOMING",
        statusLabel: "Sắp diễn ra",
        isToday: false,
        lunchDishes: [
          "Cơm chiên Dương Châu học đường",
          "Chả lợn nướng lá lốt thơm lừng",
          "Salad dưa leo cà chua bi sốt mè",
          "Canh rong biển thịt bò dinh dưỡng",
          "Tráng miệng: Táo gala nhập khẩu",
        ],
        snackSummary: "Bánh bông lan trứng muối tươi & Nước ép ổi hồng",
      },
    ],
    availableWeeks: Array.from({ length: 38 }, (_, i) => {
      const wNum = i + 1;
      const start = new Date(Date.UTC(2026, 8, 7 + i * 7));
      const end = new Date(Date.UTC(2026, 8, 7 + i * 7 + 4));
      const startStr = `${String(start.getUTCDate()).padStart(2, "0")}/${String(start.getUTCMonth() + 1).padStart(2, "0")}/${start.getUTCFullYear()}`;
      const endStr = `${String(end.getUTCDate()).padStart(2, "0")}/${String(end.getUTCMonth() + 1).padStart(2, "0")}/${end.getUTCFullYear()}`;
      const startDateIso = start.toISOString().slice(0, 10);
      return {
        id: `week-${wNum}`,
        title: `Thực đơn Tuần ${wNum}`,
        weekNumber: wNum,
        weekStartDate: startDateIso,
        weekEndDate: end.toISOString().slice(0, 10),
        weekRange: `${startStr} – ${endStr}`,
        isCurrentWeek: wNum === 11,
        hasMenu: wNum === 11,
        status: wNum === 11 ? "APPROVED" : null,
      };
    }),
  },
  "FP-SCHOOL-01": null,
  FP_SCHOOL_01: null,
  FP_DEMO_SCHOOL_01: null,
  SCH_ANH_DUONG: null,
};
MOCK_WEEKLY_MENUS["FP-SCHOOL-01"] = MOCK_WEEKLY_MENUS["FP-DEMO-SCHOOL-01"];
MOCK_WEEKLY_MENUS.FP_SCHOOL_01 = MOCK_WEEKLY_MENUS["FP-DEMO-SCHOOL-01"];
MOCK_WEEKLY_MENUS.FP_DEMO_SCHOOL_01 = MOCK_WEEKLY_MENUS["FP-DEMO-SCHOOL-01"];
MOCK_WEEKLY_MENUS.SCH_ANH_DUONG = MOCK_WEEKLY_MENUS["FP-DEMO-SCHOOL-01"];

/**
 * Hàm trả về Mock Thực đơn Ngày cho Trường Tiểu học FoodPrint
 */
export function getMockDailyMealMenu(schoolCode, date) {
  const code = (schoolCode || "FP-SCHOOL-01").toUpperCase();
  const base = MOCK_DAILY_MEAL_MENUS[code] || MOCK_FOODPRINT_DAILY_MENU;
  const menu = JSON.parse(JSON.stringify(base));

  if (date) {
    menu.date = date;
    menu.menuDate = date;
    const parts = date.split("-");
    if (parts.length === 3) {
      menu.dateLabel = `Ngày ${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  }

  return {
    success: true,
    data: menu,
    message: "Lấy thực đơn ngày thành công (Mock Data)",
  };
}

/**
 * Hàm trả về Mock Thực đơn Tuần cho Trường Tiểu học FoodPrint
 */
export function getMockWeeklyMenu(schoolCode, weekStart, grade) {
  const code = (schoolCode || "FP-DEMO-SCHOOL-01").toUpperCase();
  const base = MOCK_WEEKLY_MENUS[code] || MOCK_WEEKLY_MENUS["FP-DEMO-SCHOOL-01"];
  const menu = JSON.parse(JSON.stringify(base));

  if (weekStart) {
    menu.weekStartDate = weekStart;
  }

  return {
    success: true,
    data: menu,
    message: "Lấy thực đơn tuần thành công (Mock Data)",
  };
}

// Danh sách tài khoản Demo kết nối trực tiếp với DB Cloud (Mật khẩu mặc định: 123456)
export const MOCK_ACCOUNTS = [
  {
    userId: "sysadmin",
    username: "sysadmin",
    fullName: "FoodPrint System Admin",
    orgType: ORG_TYPES.SYSTEM,
    orgId: "system_root",
    orgName: "Hệ thống Quản lý FoodPrint Toàn quốc",
    role: ROLES.SYSTEM_ADMIN,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SystemAdmin",
  },
  {
    userId: "fp_bgh",
    username: "fp_bgh",
    fullName: "Ban Giám Hiệu (Hiệu trưởng)",
    orgType: ORG_TYPES.SCHOOL,
    orgId: "sch_cau_giay_01",
    orgName: "Trường Tiểu học FoodPrint",
    role: ROLES.SCHOOL_MANAGEMENT_BOARD,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Principal",
  },
  {
    userId: "fp_health",
    username: "fp_health",
    fullName: "Nguyễn Thu Trang (Nhân viên Dinh dưỡng)",
    orgType: ORG_TYPES.SCHOOL,
    orgId: "sch_cau_giay_01",
    orgName: "Trường Tiểu học FoodPrint",
    role: ROLES.SCHOOL_NUTRITION_OFFICER,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=HealthOfficer",
  },
  {
    userId: "fp_kitchen",
    username: "fp_kitchen",
    fullName: "Nhân viên bếp (Phương án B: Nấu riêng)",
    orgType: ORG_TYPES.SCHOOL,
    orgId: "sch_cau_giay_01",
    orgName: "Trường Tiểu học FoodPrint",
    role: ROLES.SCHOOL_KITCHEN_STAFF,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=KitchenStaff",
  },
  {
    userId: "fp_teacher",
    username: "fp_teacher",
    fullName: "Giáo viên chủ nhiệm",
    orgType: ORG_TYPES.SCHOOL,
    orgId: "sch_cau_giay_01",
    orgName: "Trường Tiểu học FoodPrint",
    role: ROLES.HOMEROOM_TEACHER,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher",
  },
  {
    userId: "fp_parents",
    username: "fp_parents",
    fullName: "Ban đại diện phụ huynh",
    orgType: ORG_TYPES.SCHOOL,
    orgId: "sch_cau_giay_01",
    orgName: "Trường Tiểu học FoodPrint",
    role: ROLES.PARENTS_COMMITTEE,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Parent",
  },
  {
    userId: "fp_ingredients",
    username: "fp_ingredients",
    fullName: "Nhân viên quản lý kho & nguyên liệu",
    orgType: ORG_TYPES.SCHOOL,
    orgId: "sch_cau_giay_01",
    orgName: "Trường Tiểu học FoodPrint",
    role: ROLES.INGREDIENT_MANAGEMENT,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Warehouse",
  },
  {
    userId: "fp_supplier_admin",
    username: "fp_supplier_admin",
    fullName: "Quản trị viên Nhà cung cấp",
    orgType: ORG_TYPES.SUPPLIER,
    orgId: "sup_fresh_food",
    orgName: "Nhà cung cấp Nguyên liệu Sạch",
    role: ROLES.INGREDIENT_SUPPLIER_ADMIN,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SupplierAdmin",
  },
  {
    userId: "fp_supplier_staff",
    username: "fp_supplier_staff",
    fullName: "Nhân viên Nhà cung cấp",
    orgType: ORG_TYPES.SUPPLIER,
    orgId: "sup_fresh_food",
    orgName: "Nhà cung cấp Nguyên liệu Sạch",
    role: ROLES.INGREDIENT_SUPPLIER_STAFF,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SupplierStaff",
  },
  {
    userId: "fp_authority",
    username: "fp_authority",
    fullName: "Cán bộ An toàn Thực phẩm",
    orgType: ORG_TYPES.AUTHORITY,
    orgId: "commune_authority_01",
    orgName: "UBND Xã - Trạm Y tế Cấp Xã",
    role: ROLES.COMMUNE_FOOD_SAFETY_OFFICER,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Officer",
  },
];
