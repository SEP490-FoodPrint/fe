import http from "../01_axios";
import {
  MOCK_DAILY_MEAL_MENUS,
  MOCK_WEEKLY_MENUS,
} from "./mockData";
import {
  apiGetPublicSchools,
  apiGetPublicLocations,
  apiGetSchoolDetail,
  apiGetSchoolDetailByCode,
  apiGetDailyMealMenu,
  apiGetWeeklyMenu,
} from "./urls";

/**
 * 1. Hàm gọi API danh sách trường học công khai
 * Hỗ trợ các query params: page, limit, search, city, district, locationId
 * Tự động bóc tách envelope phân trang { items, pagination } để res.data là mảng trường học,
 * đồng thời giữ lại res.pagination cho component nếu cần.
 * Tuyệt đối không fallback sang mock để lỗi Backend được hiển thị minh bạch.
 */
const getPublicSchoolsApi = async (params = {}) => {
  const res = await http.get(apiGetPublicSchools, { params, skipAuthRedirect: true });
  if (res?.data && !Array.isArray(res.data) && Array.isArray(res.data.items)) {
    return {
      ...res,
      data: res.data.items,
      pagination: res.data.pagination,
      items: res.data.items,
    };
  }
  return res;
};

/**
 * 2. Chi tiết trường học theo mã code
 */
const getSchoolDetailByCodeApi = async (code) => {
  const res = await http.get(apiGetSchoolDetailByCode(code), { skipAuthRedirect: true });
  return res;
};

/**
 * 3. Thực đơn ngày của trường học
 */
const getDailyMealMenuApi = async (schoolCode, date) => {
  try {
    const res = await http.get(apiGetDailyMealMenu(schoolCode, date), {
      skipAuthRedirect: true,
      notifyOnError: false,
    });
    if (res?.data) return res;
  } catch (err) {
    // Endpoint backend chưa sẵn sàng, fallback mock an toàn để không chặn hiển thị trang
  }
  const upperCode = (schoolCode || "SCH_ANH_DUONG").toUpperCase();
  return {
    data: MOCK_DAILY_MEAL_MENUS[upperCode] || MOCK_DAILY_MEAL_MENUS.SCH_ANH_DUONG,
  };
};

/**
 * 4. Thực đơn tuần của trường học
 */
const getWeeklyMenuApi = async (schoolCode, weekStart, grade) => {
  try {
    const res = await http.get(apiGetWeeklyMenu(schoolCode, weekStart, grade), {
      skipAuthRedirect: true,
      notifyOnError: false,
    });
    if (res?.data) return res;
  } catch (err) {
    // Endpoint backend chưa sẵn sàng, fallback mock an toàn để không chặn hiển thị trang
  }
  const upperCode = (schoolCode || "SCH_ANH_DUONG").toUpperCase();
  const baseWeekly = MOCK_WEEKLY_MENUS[upperCode] || MOCK_WEEKLY_MENUS.SCH_ANH_DUONG;
  return {
    data: {
      ...baseWeekly,
      selected_grade: grade || "GRADE_1_2",
    },
  };
};

/**
 * 5. Danh mục địa giới hành chính công khai (Tỉnh/TP -> Quận/Huyện/Phường)
 */
const getPublicLocationsApi = async () => {
  const res = await http.get(apiGetPublicLocations, { skipAuthRedirect: true });
  return res;
};

const SchoolService = {
  getPublicSchools: getPublicSchoolsApi,
  getPublicLocations: getPublicLocationsApi,
  getSchoolDetailByCode: getSchoolDetailByCodeApi,
  getDailyMealMenu: getDailyMealMenuApi,
  getWeeklyMenu: getWeeklyMenuApi,
};

export default SchoolService;
