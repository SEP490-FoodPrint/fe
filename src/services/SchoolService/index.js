import http from "../01_axios";
import {
  apiGetPublicSchools,
  apiGetPublicLocations,
  apiGetSchoolDetail,
  apiGetSchoolDetailByCode,
  apiGetSchoolGrades,
  apiGetDailyMealMenu,
  apiGetWeeklyMenu,
  apiCookingMode,
  apiMealTimes,
  apiSchoolBrand,
  apiSchoolLogo,
  apiDeliveryInspectionRoles,
} from "./urls";
import {
  getMockDailyMealMenu,
  getMockWeeklyMenu,
  getMockSchoolGrades,
} from "./mockData";

const isMockEnabled = () => {
  return (
    import.meta.env.VITE_USE_MOCKDATA === "true" ||
    import.meta.env.USE_MOCKDATA === "true" ||
    import.meta.env.VITE_USE_MOCK === "true"
  );
};

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
  try {
    const res = await http.get(apiGetSchoolDetailByCode(code), {
      skipAuthRedirect: true,
      notifyOnError: false,
    });
    return res;
  } catch (err) {
    // Fallback thông tin trường học cơ bản cho cổng công khai nếu backend chưa có endpoint này
    return {
      data: {
        id: `school-${code || "FP-DEMO-SCHOOL-01"}`,
        code: code || "FP-DEMO-SCHOOL-01",
        name: "Trường Tiểu Học Lê Văn Tám",
        address: "15 Đường Tân Mỹ, Phường Tân Phú, Quận 7, TP. Hồ Chí Minh",
        phone: "028 3775 1234",
        email: "c1levantam.q7@hcm.edu.vn",
      },
    };
  }
};

/**
 * Chi tiết trường học theo ID
 */
const getSchoolDetailByIdApi = async (id) => {
  const res = await http.get(apiGetSchoolDetail(id), { skipAuthRedirect: true });
  return res;
};

/**
 * 3. Thực đơn ngày của trường học
 * Hỗ trợ mock data khi USE_MOCKDATA=true
 */
const getDailyMealMenuApi = async (schoolCode, date, grade) => {
  if (isMockEnabled()) {
    return getMockDailyMealMenu(schoolCode, date, grade);
  }
  try {
    const res = await http.get(apiGetDailyMealMenu(schoolCode, date, grade), {
      skipAuthRedirect: true,
      notifyOnError: false,
    });
    return res;
  } catch (err) {
    // error: true giúp trang phân biệt "lỗi tải" với "không có thực đơn"
    return { data: null, error: true };
  }
};

/**
 * 4. Thực đơn tuần của trường học
 * Hỗ trợ mock data khi USE_MOCKDATA=true
 */
const getWeeklyMenuApi = async (schoolCode, weekStart, grade) => {
  if (isMockEnabled()) {
    return getMockWeeklyMenu(schoolCode, weekStart, grade);
  }
  try {
    const res = await http.get(apiGetWeeklyMenu(schoolCode, weekStart, grade), {
      skipAuthRedirect: true,
      notifyOnError: false,
    });
    return res;
  } catch (err) {
    // error: true giúp trang phân biệt "lỗi tải" với "không có thực đơn"
    return { data: null, error: true };
  }
};

/**
 * Danh sách khối của trường học
 */
const getSchoolGradesApi = async (schoolCode, week) => {
  if (isMockEnabled()) {
    return getMockSchoolGrades(schoolCode);
  }
  try {
    const res = await http.get(apiGetSchoolGrades(schoolCode, week), {
      skipAuthRedirect: true,
      notifyOnError: false,
    });
    return res;
  } catch (err) {
    return { data: [] };
  }
};

/**
 * 5. Danh mục địa giới hành chính công khai (Tỉnh/TP -> Quận/Huyện/Phường)
 */
const getPublicLocationsApi = async () => {
  const res = await http.get(apiGetPublicLocations, { skipAuthRedirect: true });
  return res;
};

const getCookingMode = () => http.get(apiCookingMode);
const updateCookingMode = cookingMode => http.patch(apiCookingMode, { cookingMode });
const getSchoolBrand = async () => {
  const res = await http.get(apiSchoolBrand, { notifyOnError: false });
  return res?.data ?? null;
};
const uploadSchoolLogo = async file => {
  const formData = new FormData();
  formData.append("logo", file);
  const res = await http.put(apiSchoolLogo, formData, {
    timeout: 120000,
    notifyOnError: false,
  });
  return res?.data ?? null;
};
const removeSchoolLogo = async () => {
  const res = await http.delete(apiSchoolLogo, { notifyOnError: false });
  return res?.data ?? null;
};
const getMealTimes = () => http.get(apiMealTimes, { notifyOnError: false });
const updateMealTimes = payload => http.patch(apiMealTimes, payload, { notifyOnError: false });

/**
 * Lấy cấu hình nhóm duyệt kiểm nhận nguyên liệu của trường
 */
export const getDeliveryInspectionRoles = async () => {
  const res = await http.get(apiDeliveryInspectionRoles);
  return res;
};

/**
 * Cập nhật cấu hình nhóm duyệt kiểm nhận nguyên liệu của trường
 */
export const updateDeliveryInspectionRoles = async (roles) => {
  const res = await http.put(apiDeliveryInspectionRoles, { roles });
  return res;
};

const SchoolService = {
  getPublicSchools: getPublicSchoolsApi,
  getPublicLocations: getPublicLocationsApi,
  getSchoolDetailByCode: getSchoolDetailByCodeApi,
  getSchoolDetailById: getSchoolDetailByIdApi,
  getSchoolGrades: getSchoolGradesApi,
  getDailyMealMenu: getDailyMealMenuApi,
  getWeeklyMenu: getWeeklyMenuApi,
  getCookingMode,
  updateCookingMode,
  getMealTimes,
  updateMealTimes,
  getSchoolBrand,
  uploadSchoolLogo,
  removeSchoolLogo,
  getDeliveryInspectionRoles,
  updateDeliveryInspectionRoles,
};

export default SchoolService;
