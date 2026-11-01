import http from "../01_axios";
import {
  apiGetPublicSchools,
  apiGetSchoolDetail,
  apiGetSchoolDetailByCode,
  apiGetDailyMealMenu,
  apiGetWeeklyMenu,
} from "./urls";

/**
 * 1. Hàm gọi API danh sách trường học công khai
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
  const res = await http.get(apiGetDailyMealMenu(schoolCode, date), { skipAuthRedirect: true });
  return res;
};

/**
 * 4. Thực đơn tuần của trường học
 */
const getWeeklyMenuApi = async (schoolCode, weekStart, grade) => {
  const res = await http.get(apiGetWeeklyMenu(schoolCode, weekStart, grade), { skipAuthRedirect: true });
  return res;
};

const SchoolService = {
  getPublicSchools: getPublicSchoolsApi,
  getSchoolDetailByCode: getSchoolDetailByCodeApi,
  getDailyMealMenu: getDailyMealMenuApi,
  getWeeklyMenu: getWeeklyMenuApi,
};

export default SchoolService;
