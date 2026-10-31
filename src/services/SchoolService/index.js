import http from "../01_axios";
import {
  MOCK_DAILY_MEAL_MENUS,
  MOCK_SCHOOLS,
  MOCK_WEEKLY_MENUS,
} from "./mockData";
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

export { MOCK_SCHOOLS };
export default SchoolService;
