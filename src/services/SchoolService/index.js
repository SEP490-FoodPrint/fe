import http from "../01_axios"
import { apiGetPublicSchools } from "./urls"

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
    lunch_time: "11:15:00",
    afternoon_meal_time: "14:30:00",
    logo_url: null,
    cover_image_url: null,
    description: "Trường chuẩn Quốc gia với hệ thống bán trú an toàn vệ sinh thực phẩm chuẩn FoodPrint Edu.",
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
    lunch_time: "11:30:00",
    afternoon_meal_time: "14:45:00",
    logo_url: null,
    cover_image_url: null,
    description: "Môi trường học tập thân thiện, thực đơn được tính toán năng lượng và dinh dưỡng theo từng độ tuổi.",
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
    lunch_time: "11:20:00",
    afternoon_meal_time: "14:30:00",
    logo_url: null,
    cover_image_url: null,
    description: "Tiên phong ứng dụng nhật ký số trong quản lý xuất xứ thực phẩm và truy xuất nguồn gốc.",
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
    logo_url: null,
    cover_image_url: null,
    description: "Cơ sở vật chất bếp ăn đạt chuẩn ISO 22000 về an toàn vệ sinh thực phẩm học đường.",
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
    logo_url: null,
    cover_image_url: null,
    description: "Mô hình bếp ăn bán trú hiện đại chuẩn quốc tế, có kiểm tra nguyên liệu 3 bước mỗi ngày.",
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
    logo_url: null,
    cover_image_url: null,
    description: "Ngôi trường giàu truyền thống với hệ thống dinh dưỡng học sinh được giám sát bởi Ban Y tế và Ban Phụ huynh.",
    website_url: "https://c3chuvanan.edu.vn",
    status: "ACTIVE",
    badge_color: "emerald",
  },
]

// 1. Kiểm tra cờ môi trường (mặc định là false, chỉ bật mock khi VITE_USE_MOCK === "true")
const isUseMock = import.meta.env.VITE_USE_MOCK === "true"

/**
 * 2. Hàm gọi API thật (Hàm thường)
 */
const getPublicSchoolsApi = async (params = {}) => {
  const res = await http.get(apiGetPublicSchools, { params })
  return res
}

/**
 * 3. Hàm trả về Mock Data chuẩn 100% schema bảng foodprint.schools
 */
const getPublicSchoolsMock = async (params = {}) => {
  const search = (params?.search || "").toLowerCase().trim()
  let list = [...MOCK_SCHOOLS]

  if (search) {
    list = list.filter(
      item =>
        item.name.toLowerCase().includes(search) ||
        item.address?.toLowerCase().includes(search) ||
        item.district?.toLowerCase().includes(search) ||
        item.code?.toLowerCase().includes(search),
    )
  }

  return {
    isOk: true,
    success: true,
    data: list,
    total: list.length,
    message: "Lấy danh sách trường học thành công (Mock Data)",
  }
}

/**
 * 4. Dựa vào biến môi trường để gán hàm tương ứng cho Service
 */
const SchoolService = {
  getPublicSchools: isUseMock ? getPublicSchoolsMock : getPublicSchoolsApi,

  // Export các hàm riêng lẻ phục vụ kiểm thử hoặc gọi trực tiếp khi cần
  getPublicSchoolsApi,
  getPublicSchoolsMock,
}

export default SchoolService
