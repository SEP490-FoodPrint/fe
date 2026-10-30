import http from "../01_axios";
import {
  apiGetPublicSchools,
  apiGetSchoolDetail,
  apiGetSchoolDetailByCode,
  apiGetDailyMealMenu,
  apiGetWeeklyMenu,
} from "./urls";

/**
 * Mock Data chuẩn 100% theo schema bảng foodprint.schools trong DB_script.txt
 */
export const MOCK_SCHOOLS = [
  {
    id: "a1b2c3d4-0001-4000-8000-000000000001",
    name: "Trường Tiểu học Ánh Dương",
    code: "SCH_ANH_DUONG",
    short_name: "ÁD",
    address: "Số 18 Phố Nguyễn Phong Sắc, Cầu Giấy, Hà Nội",
    district: "Cầu Giấy",
    city: "Hà Nội",
    email: "tieuhoc.anhduong@foodprint.edu.vn",
    phone: "024 3756 8899",
    cooking_mode: "SEPARATE_BY_LOT",
    lunch_time: "10:45:00",
    afternoon_meal_time: "14:30:00",
    boarding_scale: "1.250 học sinh bán trú",
    safety_standard: "Tiêu chuẩn Y tế học đường",
    logo_url: null,
    cover_image_url: null,
    description:
      "Trường Tiểu học Ánh Dương cam kết minh bạch 100% thực đơn học đường, quy trình dinh dưỡng cân bằng và vệ sinh an toàn thực phẩm, đồng hành cùng phụ huynh chăm sóc sức khỏe toàn diện cho học sinh.",
    website_url: "https://thanhduong.edu.vn",
    status: "ACTIVE",
    badge_color: "emerald",
  },
  {
    id: "a1b2c3d4-0002-4000-8000-000000000002",
    name: "Trường Tiểu học Hoa Sen",
    code: "SCH_HOA_SEN",
    short_name: "HS",
    address: "Số 42 Phố Kim Mã, Q. Ba Đình, Hà Nội",
    district: "Ba Đình",
    city: "Hà Nội",
    email: "ban-tru@hoasen.edu.vn",
    phone: "024 3845 2211",
    cooking_mode: "COMBINE_LOTS",
    lunch_time: "11:00:00",
    afternoon_meal_time: "14:45:00",
    boarding_scale: "980 học sinh bán trú",
    safety_standard: "Chuẩn Vệ sinh An toàn Thực phẩm",
    logo_url: null,
    cover_image_url: null,
    description:
      "Môi trường học tập thân thiện, thực đơn được tính toán năng lượng và dinh dưỡng theo từng độ tuổi, nguồn thực phẩm sạch truy xuất nguồn gốc.",
    website_url: "https://thhoasen.edu.vn",
    status: "ACTIVE",
    badge_color: "amber",
  },
  {
    id: "a1b2c3d4-0003-4000-8000-000000000003",
    name: "Trường Tiểu học Nguyễn Du",
    code: "SCH_NGUYEN_DU",
    short_name: "ND",
    address: "Số 11 Phố Hàng Chuối, Q. Hoàn Kiếm, Hà Nội",
    district: "Hoàn Kiếm",
    city: "Hà Nội",
    email: "bantin.nguyendu@foodprint.edu.vn",
    phone: "024 3971 6633",
    cooking_mode: "SEPARATE_BY_LOT",
    lunch_time: "10:50:00",
    afternoon_meal_time: "14:30:00",
    boarding_scale: "1.100 học sinh bán trú",
    safety_standard: "Kiểm soát an toàn 3 bước",
    logo_url: null,
    cover_image_url: null,
    description:
      "Tiên phong ứng dụng nhật ký số trong quản lý xuất xứ thực phẩm và truy xuất nguồn gốc bữa ăn bán trú của học sinh.",
    website_url: "https://thnguyendu.edu.vn",
    status: "ACTIVE",
    badge_color: "teal",
  },
  {
    id: "a1b2c3d4-0004-4000-8000-000000000004",
    name: "Trường Tiểu học Bình Minh",
    code: "SCH_BINH_MINH",
    short_name: "BM",
    address: "Số 80 Phố Xã Đàn, Q. Đống Đa, Hà Nội",
    district: "Đống Đa",
    city: "Hà Nội",
    email: "info@binhminh.edu.vn",
    phone: "024 3572 4499",
    cooking_mode: "COMBINE_LOTS",
    lunch_time: "11:15:00",
    afternoon_meal_time: "14:30:00",
    boarding_scale: "850 học sinh bán trú",
    safety_standard: "Bếp ăn đạt chuẩn ISO 22000",
    logo_url: null,
    cover_image_url: null,
    description:
      "Cơ sở vật chất bếp ăn đạt chuẩn ISO 22000 về an toàn vệ sinh thực phẩm học đường.",
    website_url: "https://thbinhminh.edu.vn",
    status: "ACTIVE",
    badge_color: "blue",
  },
  {
    id: "a1b2c3d4-0005-4000-8000-000000000005",
    name: "Trường TH Marie Curie",
    code: "SCH_MARIE_CURIE",
    short_name: "MC",
    address: "Phố Trần Văn Lai, Mỹ Đình 1, Nam Từ Liêm, Hà Nội",
    district: "Nam Từ Liêm",
    city: "Hà Nội",
    email: "y-te@mariecurie.edu.vn",
    phone: "024 3943 5588",
    cooking_mode: "SEPARATE_BY_LOT",
    lunch_time: "11:30:00",
    afternoon_meal_time: "15:00:00",
    boarding_scale: "1.800 học sinh bán trú",
    national_standard: "Trường Quốc tế liên cấp",
    safety_standard: "Bếp ăn một chiều chuẩn Quốc tế",
    logo_url: null,
    cover_image_url: null,
    description:
      "Mô hình bếp ăn bán trú hiện đại chuẩn quốc tế, có kiểm tra nguyên liệu 3 bước mỗi ngày.",
    website_url: "https://mariecuriehanoi.com",
    status: "ACTIVE",
    badge_color: "purple",
  },
  {
    id: "a1b2c3d4-0006-4000-8000-000000000006",
    name: "Trường TH Chu Văn An",
    code: "SCH_CHU_VAN_AN",
    short_name: "CA",
    address: "Số 260 Thụy Khuê, Q. Tây Hồ, Hà Nội",
    district: "Tây Hồ",
    city: "Hà Nội",
    email: "chuvanan.c3@hanoiedu.vn",
    phone: "024 3823 2277",
    cooking_mode: "SEPARATE_BY_LOT",
    lunch_time: "11:20:00",
    afternoon_meal_time: "14:30:00",
    boarding_scale: "1.400 học sinh bán trú",
    safety_standard: "Giám sát 3 bên liên tục",
    logo_url: null,
    cover_image_url: null,
    description:
      "Ngôi trường giàu truyền thống với hệ thống dinh dưỡng học sinh được giám sát bởi Ban Y tế và Ban Phụ huynh.",
    website_url: "https://c3chuvanan.edu.vn",
    status: "ACTIVE",
    badge_color: "emerald",
  },
];

/**
 * Mock Data: Thực đơn ngày hôm nay (Bữa trưa + Bữa xế)
 */
export const MOCK_DAILY_MEAL_MENUS = {
  SCH_ANH_DUONG: {
    date_label: "Hôm nay, Thứ Ba - Ngày 20/10/2026",
    menu_date: "2026-10-20",
    updated_at: "07:15 sáng nay",
    lunch: {
      meal_type: "LUNCH",
      title: "Bữa trưa chính",
      serving_window: "10:45 – 11:30",
      tray_image_url:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCBwNjlhj0HUaFnMG7FVIvzeS-bxQ1dje3G-wVHO79zJkeLyzUMCgpZSQzRVHcxhKW7Cb2tHe69YwcmuaRlixreDNij6Y7ZsBdObiD37TuNldd3XoHeBvD4XoRomsHeDxHj4efUNf-C-jg0ypW5A6nZJDJvBciK-fBx5x48bzgFeitOb2tFLjisidUVeRlKQpSBnE60I8S7O5_XcWObq0d4q_U5jFCkeFfl3D-1i2uppSrVB0G8zJXkAg",
      tray_type: "Khay chia 5 ngăn",
      dishes: [
        { id: "d1", name: "Cơm tám Điện Biên", portion: "150g" },
        { id: "d2", name: "Bò xào nấm hương rau củ", portion: "75g" },
        { id: "d3", name: "Trứng cuộn ngũ sắc hấp mềm", portion: "50g" },
        {
          id: "d4",
          name: "Canh bí đỏ nấu tôm đồng tươi",
          portion: "1 bát con",
        },
        {
          id: "d5",
          name: "Tráng miệng: Thanh long ruột đỏ",
          portion: "2 miếng",
        },
      ],
      standards_note: "Đạt chuẩn 4 nhóm chất (Tinh bột, Đạm, Xơ, Khoáng)",
      allergy_warning:
        "Lưu ý: Không chứa lạc (đậu phộng), không hải sản vỏ cứng.",
    },
    snack: {
      meal_type: "AFTERNOON",
      title: "Bữa phụ chiều",
      serving_window: "14:30 – 15:00",
      image_url:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDB8VwonYSD-vP1vILXdnxkBR1h3ACxIY6kok371v4s0kGt-K3kgtpdAfnp-r6KncqWukrxhaH0tnLCn7_bb62mhjZxyMHthWz3m60PgtMGFRTc-GpJB55WjsuL2zqDpHaE6_TXDuXXulExFrjBwPAgnk2U-tMkoaMoGV6ZcI2dBbM1KFrsujYjBNx5taqKdy7534TMSoGN_4K5OLUN8Z92zLUeHYGNf4sV2o31gTQ9J8i6Zd57Absd8A",
      items: [
        {
          id: "s1",
          name: "Sữa tươi tiệt trùng Vinamilk ít đường",
          desc: "Hộp 180ml · Giàu Canxi & Vitamin D3",
          icon: "local_cafe",
        },
        {
          id: "s2",
          name: "Bánh flan caramel tươi",
          desc: "Chế biến trong ngày tại bếp ăn bán trú",
          icon: "cake",
        },
      ],
      note: "Cung cấp năng lượng kịp thời cho học sinh tham gia các hoạt động ngoại khóa buổi chiều.",
    },
  },
};

/**
 * Mock Data: Thực đơn tuần (Thứ 2 đến Thứ 6)
 */
export const MOCK_WEEKLY_MENUS = {
  SCH_ANH_DUONG: {
    week_number: 42,
    week_range: "19/10/2026 – 23/10/2026",
    is_current_week: true,
    grade_groups: [
      { key: "GRADE_1_2", label: "Khối 1 – 2" },
      { key: "GRADE_3_5", label: "Khối 3 – 5" },
    ],
    days: [
      {
        day_of_week: "Thứ Hai",
        date: "19/10/2026",
        status: "SERVED",
        status_label: "Đã phục vụ",
        is_today: false,
        lunch_dishes: [
          "Cơm trắng tám thơm",
          "Gà kho gừng sả",
          "Cải thìa sốt nấm dầu hào",
          "Canh mồng tơi nấu ngao thịt",
          "Tráng miệng: Dưa hấu",
        ],
        snack_summary: "Sữa chua uống tiệt trùng Yomost & Bánh quy mè nướng",
        calories: 680,
        protein_g: 24,
        fat_g: 18,
      },
      {
        day_of_week: "Thứ Ba",
        date: "20/10/2026",
        status: "TODAY",
        status_label: "Hôm nay",
        is_today: true,
        lunch_dishes: [
          "Cơm tám Điện Biên",
          "Bò xào nấm hương rau củ",
          "Trứng cuộn ngũ sắc",
          "Canh bí đỏ nấu tôm đồng",
          "Tráng miệng: Thanh long đỏ",
        ],
        snack_summary: "Sữa tươi Vinamilk 180ml & Bánh flan caramel tươi",
        calories: 695,
        protein_g: 26,
        fat_g: 19,
      },
      {
        day_of_week: "Thứ Tư",
        date: "21/10/2026",
        status: "UPCOMING",
        status_label: "Sắp diễn ra",
        is_today: false,
        lunch_dishes: [
          "Cơm tấm lá dứa thơm",
          "Thịt lợn rim mật ong hạt sen",
          "Su su cà rốt xào thịt nạc",
          "Canh chua cá lăng nấu dọc mùng",
          "Tráng miệng: Chuối tiêu chín",
        ],
        snack_summary: "Chè đậu đỏ nước cốt dừa hạt sen thanh mát",
        calories: 675,
        protein_g: 23,
        fat_g: 17,
      },
      {
        day_of_week: "Thứ Năm",
        date: "22/10/2026",
        status: "UPCOMING",
        status_label: "Sắp diễn ra",
        is_today: false,
        lunch_dishes: [
          "Cơm gạo lứt huyết rồng trộn",
          "Tôm biển rim thịt ba chỉ",
          "Bí xanh luộc chấm muối vừng",
          "Canh sườn hầm ngô ngọt",
          "Tráng miệng: Quýt đường",
        ],
        snack_summary: "Bánh bao nhân thịt nạc trứng cút & Sữa hạt đậu nành",
        calories: 710,
        protein_g: 28,
        fat_g: 20,
      },
      {
        day_of_week: "Thứ Sáu",
        date: "23/10/2026",
        status: "UPCOMING",
        status_label: "Sắp diễn ra",
        is_today: false,
        lunch_dishes: [
          "Cơm trắng hạt ngọc trời",
          "Chả lợn cuốn lá lốt sốt cà chua",
          "Đậu đũa xào nấm đùi gà",
          "Canh rau ngót nấu giò sống",
          "Tráng miệng: Táo gala nhập khẩu",
        ],
        snack_summary: "Bánh bông lan trứng muối tươi & Nước ép ổi hồng",
        calories: 685,
        protein_g: 25,
        fat_g: 18,
      },
    ],
  },
};

// 1. Kiểm tra cờ môi trường (mặc định là false, chỉ bật mock khi VITE_USE_MOCK === "true")
const isUseMock = import.meta.env.VITE_USE_MOCK === "true";

/**
 * 2. Hàm gọi API thật (Hàm thường)
 */
const getPublicSchoolsApi = async (params = {}) => {
  const res = await http.get(apiGetPublicSchools, { params });
  return res;
};

const getSchoolDetailByCodeApi = async (code) => {
  const res = await http.get(apiGetSchoolDetailByCode(code));
  return res;
};

const getDailyMealMenuApi = async (schoolCode, date) => {
  const res = await http.get(apiGetDailyMealMenu(schoolCode, date));
  return res;
};

const getWeeklyMenuApi = async (schoolCode, weekStart, grade) => {
  const res = await http.get(apiGetWeeklyMenu(schoolCode, weekStart, grade));
  return res;
};

/**
 * 3. Hàm Mock Data chuẩn 100% schema bảng foodprint.schools
 */
const getPublicSchoolsMock = async (params = {}) => {
  const search = (params?.search || "").toLowerCase().trim();
  let list = [...MOCK_SCHOOLS];

  if (search) {
    list = list.filter(
      (item) =>
        item.name.toLowerCase().includes(search) ||
        item.address?.toLowerCase().includes(search) ||
        item.district?.toLowerCase().includes(search) ||
        item.code?.toLowerCase().includes(search),
    );
  }

  return {
    isOk: true,
    success: true,
    data: list,
    total: list.length,
    message: "Lấy danh sách trường học thành công (Mock Data)",
  };
};

const getSchoolDetailByCodeMock = async (code) => {
  const found =
    MOCK_SCHOOLS.find(
      (s) => s.code.toLowerCase() === (code || "").toLowerCase(),
    ) || MOCK_SCHOOLS[0];
  return {
    isOk: true,
    success: true,
    data: found,
    message: "Lấy chi tiết trường học thành công (Mock Data)",
  };
};

const getDailyMealMenuMock = async (schoolCode) => {
  const upperCode = (schoolCode || "SCH_ANH_DUONG").toUpperCase();
  const data =
    MOCK_DAILY_MEAL_MENUS[upperCode] || MOCK_DAILY_MEAL_MENUS.SCH_ANH_DUONG;
  return {
    isOk: true,
    success: true,
    data,
    message: "Lấy thực đơn ngày thành công (Mock Data)",
  };
};

const getWeeklyMenuMock = async (schoolCode, weekStart, grade) => {
  const upperCode = (schoolCode || "SCH_ANH_DUONG").toUpperCase();
  const baseWeekly =
    MOCK_WEEKLY_MENUS[upperCode] || MOCK_WEEKLY_MENUS.SCH_ANH_DUONG;
  return {
    isOk: true,
    success: true,
    data: {
      ...baseWeekly,
      selected_grade: grade || "GRADE_1_2",
    },
    message: "Lấy thực đơn tuần thành công (Mock Data)",
  };
};

const getDailyMealMenuSafe = async (schoolCode, date) => {
  try {
    const res = await getDailyMealMenuApi(schoolCode, date);
    if (res?.data) return res;
    return getDailyMealMenuMock(schoolCode);
  } catch {
    return getDailyMealMenuMock(schoolCode);
  }
};

const getWeeklyMenuSafe = async (schoolCode, weekStart, grade) => {
  try {
    const res = await getWeeklyMenuApi(schoolCode, weekStart, grade);
    if (res?.data) return res;
    return getWeeklyMenuMock(schoolCode, weekStart, grade);
  } catch {
    return getWeeklyMenuMock(schoolCode, weekStart, grade);
  }
};

/**
 * 4. Dựa vào biến môi trường để gán hàm tương ứng cho Service (Strategy Switcher)
 */
const SchoolService = {
  getPublicSchools: isUseMock ? getPublicSchoolsMock : getPublicSchoolsApi,
  getSchoolDetailByCode: isUseMock
    ? getSchoolDetailByCodeMock
    : getSchoolDetailByCodeApi,
  getDailyMealMenu: isUseMock ? getDailyMealMenuMock : getDailyMealMenuSafe,
  getWeeklyMenu: isUseMock ? getWeeklyMenuMock : getWeeklyMenuSafe,
};

export default SchoolService;
