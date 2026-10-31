import http from "../01_axios";
import {
  apiGetPublicSchools,
  apiGetSchoolDetail,
  apiGetSchoolDetailByCode,
  apiGetDailyMealMenu,
  apiGetWeeklyMenu,
} from "./urls";

// 1. Kiểm tra cờ môi trường (mặc định là false, chỉ bật mock khi VITE_USE_MOCK === "true")
const isUseMock = import.meta.env.VITE_USE_MOCK === "true";

/**
 * 2. Hàm gọi API thật (Hàm thường)
 */
const getPublicSchoolsApi = async (params = {}) => {
  const res = await http.get(apiGetPublicSchools, { params, skipAuthRedirect: true });
  return res;
};

const getSchoolDetailByCodeApi = async (code) => {
  const res = await http.get(apiGetSchoolDetailByCode(code), { skipAuthRedirect: true });
  return res;
};

const getDailyMealMenuApi = async (schoolCode, date) => {
  const res = await http.get(apiGetDailyMealMenu(schoolCode, date), { skipAuthRedirect: true });
  return res;
};

const getWeeklyMenuApi = async (schoolCode, weekStart, grade) => {
  const res = await http.get(apiGetWeeklyMenu(schoolCode, weekStart, grade), { skipAuthRedirect: true });
  return res;
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
  getPublicSchools: getPublicSchoolsApi,
  getSchoolDetailByCode: getSchoolDetailByCodeApi,
  getDailyMealMenu: getDailyMealMenuSafe,
  getWeeklyMenu: getWeeklyMenuSafe,
};

export default SchoolService;
