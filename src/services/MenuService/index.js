import http from "../01_axios";
import STORAGE, { getStorage } from "src/lib/storage";
import {
  apiMenus,
  apiMenuDetail,
  apiSubmitMenu,
  apiReviewMenu,
  apiAllergyCheck,
  apiIngredientOptions,
  apiPortionGroups,
  apiGetMenuApprovalDetail,
} from "./urls";
import {
  adaptWeeklyMenuToCardList,
  adaptBackendMenuDetailToView,
  adaptFormToBackendWrite,
  mergeMenuMealWrite,
  menuWeekMeals,
  SCHOOL_DAY_LABELS,
  parseDateVNToISO,
} from "./adapter";

const weekScheduleCache = new Map();
const weekScheduleRequests = new Map();
const WEEK_SCHEDULE_CACHE_MS = 15000;
let weekScheduleGeneration = 0;
export const invalidateWeekScheduleCache = () => {
  weekScheduleGeneration += 1;
  weekScheduleCache.clear();
  weekScheduleRequests.clear();
};

const menuListCache = new Map();
const menuListRequests = new Map();
const MENU_LIST_CACHE_MS = 30000;
let menuListGeneration = 0;
export const invalidateMenuListCache = () => {
  menuListGeneration += 1;
  menuListCache.clear();
  menuListRequests.clear();
};

let academicCalendarCache = null;
let academicCalendarCacheTime = 0;
const ACADEMIC_CALENDAR_CACHE_MS = 600000; // 10 phút cache bộ nhớ

let menuContextCache = null;
let menuContextCacheTime = 0;
const MENU_CONTEXT_CACHE_MS = 300000; // 5 phút cache cấu hình trường

/**
 * MenuService: Kết nối Frontend với Backend API (/api/v1/menus)
 * Gọi 100% API thực từ Backend, không dùng Mock Data fallback.
 */
const MenuService = {
  getContext: async ({ forceRefresh = false } = {}) => {
    if (!forceRefresh && menuContextCache && (Date.now() - menuContextCacheTime < MENU_CONTEXT_CACHE_MS)) {
      return menuContextCache;
    }
    const response = await http.get(`${apiMenus}/context`, { notifyOnError: false });
    if (!response?.data?.id) throw new Error("Không tải được cấu hình trường.");
    menuContextCache = response.data;
    menuContextCacheTime = Date.now();
    return response.data;
  },
  getMealRequirements: async (menuDayId, mealType) => {
    const response = await http.get(`${apiMenus}/days/${menuDayId}/meals/${mealType}/requirements`, { notifyOnError: false });
    if (!response?.data) throw new Error("Không tải được nhu cầu suất ăn đã chốt.");
    return response.data;
  },
  invalidateMenuCache: () => {
    academicCalendarCache = null;
    menuContextCache = null;
    invalidateWeekScheduleCache();
    invalidateMenuListCache();
  },

  getAcademicCalendar: async ({ forceRefresh = false } = {}) => {
    if (!forceRefresh && academicCalendarCache && (Date.now() - academicCalendarCacheTime < ACADEMIC_CALENDAR_CACHE_MS)) {
      return academicCalendarCache;
    }
    const response = await http.get(`${apiMenus}/academic-calendar`, {
      notifyOnError: false,
    });
    if (!Array.isArray(response?.data?.academicYears)) {
      throw new Error("Không tải được cấu hình năm học từ hệ thống.");
    }
    academicCalendarCache = response.data;
    academicCalendarCacheTime = Date.now();
    return response.data;
  },

  /**
   * Lấy danh sách thực đơn tuần từ Backend API
   */
  getMenus: async (params = {}) => {
    const identity = getStorage(STORAGE.USER_INFO);
    const status = params.status === "REVISION_REQUESTED" ? "REVISION_REQUIRED" : params.status;
    const cacheKey = JSON.stringify({
      userId: identity?.id || identity?._id || "",
      schoolId: identity?.schoolId || identity?.orgId || "",
      status:
        status && status !== "all"
          ? status
          : "all",
      weekStartDate: params.weekStartDate || "all",
      date: params.date || "",
      search: params.search?.trim() || "",
      page: params.page || 1,
      limit: params.limit || 50,
      gen: menuListGeneration,
    });

    const cached = menuListCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < MENU_LIST_CACHE_MS) {
      return cached.data;
    }

    if (menuListRequests.has(cacheKey)) {
      return menuListRequests.get(cacheKey);
    }

    const requestPromise = (async () => {
      try {
        const response = await http.get(apiMenus, {
          params: {
            limit: params.limit || 50,
            page: params.page || 1,
            status:
              status && status !== "all"
                ? status
                : undefined,
            weekStartDate: params.weekStartDate || undefined,
            date: params.date || undefined,
            search: params.search?.trim() || undefined,
          },
          notifyOnError: false,
        });

        const rawItems =
          response?.data?.items || response?.items || response?.data || [];

        const cardList = Array.isArray(rawItems)
          ? rawItems.flatMap(adaptWeeklyMenuToCardList)
          : [];

        const result = {
          isOk: true,
          success: true,
          data: cardList,
          total: cardList.length,
          isMock: false,
        };
        menuListCache.set(cacheKey, { timestamp: Date.now(), data: result });
        return result;
      } finally {
        menuListRequests.delete(cacheKey);
      }
    })();

    menuListRequests.set(cacheKey, requestPromise);
    return requestPromise;
  },

  /**
   * Lấy chi tiết 1 thực đơn theo ID (WeeklyMenuId hoặc compound id)
   */
  getMenuDetail: async (id) => {
    if (!id) throw new Error("Thiếu mã định danh thực đơn.");

    let weeklyId = id;
    let targetDayId = null;
    let targetMealType = "LUNCH";

    if (typeof id === "string" && id.includes("_")) {
      const parts = id.split("_");
      weeklyId = parts[0];
      targetDayId = parts[1];
      targetMealType = parts[2] || "LUNCH";
    }

    const response = await http.get(apiMenuDetail(weeklyId), {
      notifyOnError: false,
    });
    const rawMenu = response?.data || response;

    if (rawMenu && rawMenu.id) {
      const viewData = adaptBackendMenuDetailToView(
        rawMenu,
        targetDayId,
        targetMealType,
      );
      return {
        isOk: true,
        success: true,
        data: viewData,
        isMock: false,
      };
    }

    throw new Error("Không tìm thấy dữ liệu chi tiết thực đơn.");
  },

  /**
   * Lấy lịch thực đơn học đường theo tuần (Thứ 2 đến Thứ 6)
   */
  getWeekSchedule: async (date) => {
    const isoDate =
      typeof date === "string" && date.includes("/")
        ? parseDateVNToISO(date)
        : date || new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const targetDate = new Date(`${isoDate}T00:00:00Z`);
    const targetDay = targetDate.getUTCDay();
    const monday = new Date(targetDate);
    monday.setUTCDate(monday.getUTCDate() - ((targetDay + 6) % 7));
    const user = getStorage(STORAGE.USER_INFO);
    const schoolId = user?.schoolId || user?.orgId || user?.school_id || "";
    const userId = user?.id || user?._id || "school_user";
    const weekStartDate = monday.toISOString().slice(0, 10);
    const weekKey = `${userId}:${schoolId}:${weekStartDate}`;
    const personalize = (result) => ({
      ...result,
      data: {
        ...result.data,
        targetDate: isoDate,
        targetDayOfWeek: targetDay || 7,
        targetDayLabel: SCHOOL_DAY_LABELS[targetDay],
        isTargetSchoolDay: targetDay >= 1 && targetDay <= 5,
      },
    });

    const cached = weekKey && weekScheduleCache.get(weekKey);
    if (cached && cached.expiresAt > Date.now()) return personalize(cached.result);
    if (weekKey && weekScheduleRequests.has(weekKey)) return personalize(await weekScheduleRequests.get(weekKey));

    const generation = weekScheduleGeneration;
    const request = (async () => {
      const response = await http.get(`${apiMenus}/week-schedule`, {
        params: { date: isoDate },
        notifyOnError: false,
      });
      if (response?.data) {
        const schedule = response.data;
        let mealDays = [];
        if (schedule.weeklyMenuId) {
          const detail = await http.get(apiMenuDetail(schedule.weeklyMenuId), { notifyOnError: false });
          if (!detail?.data?.id) throw new Error("Không tải được nội dung thực đơn tuần.");
          mealDays = menuWeekMeals(detail.data);
        }
        return { isOk: true, success: true, data: { ...schedule, days: (schedule.days || []).map(day => ({ ...day, ...mealDays.find(mealDay => mealDay.date === day.date) })) }, isMock: false };
      }
      throw new Error("Không tải được lịch thực đơn tuần từ hệ thống.");
    })();

    if (weekKey) weekScheduleRequests.set(weekKey, request);
    try {
      const result = await request;
      if (weekKey && generation === weekScheduleGeneration) {
        weekScheduleCache.set(weekKey, { result, expiresAt: Date.now() + WEEK_SCHEDULE_CACHE_MS });
      }
      return personalize(result);
    } finally {
      if (weekKey && weekScheduleRequests.get(weekKey) === request) weekScheduleRequests.delete(weekKey);
    }
  },

  /**
   * Tạo thực đơn mới (Lưu nháp hoặc tạo để gửi duyệt)
   */
  createMenu: async ({ formState, dishes, substituteDish, seasonings }) => {
    const payload = adaptFormToBackendWrite({
      name: formState.name,
      date: formState.date,
      mealType: formState.mealType || "LUNCH",
      notes: formState.notes,
      dishes,
      seasonings,
    });

    const response = await http.post(apiMenus, payload, { notifyOnError: false });
    const createdMenu = response?.data || response;
    invalidateWeekScheduleCache();
    invalidateMenuListCache();

    // Nếu có món thay thế cho học sinh dị ứng, cập nhật Portion Group
    if (
      createdMenu?.id &&
      createdMenu?.menuDays?.[0]?.id &&
      substituteDish?.name?.trim()
    ) {
      try {
        const menuDayId = createdMenu.menuDays[0].id;
        const mealType = formState.mealType || "LUNCH";
        await MenuService.savePortionGroups(menuDayId, mealType, [
          {
            name: "Suất ăn thường tiêu chuẩn",
            isDefault: true,
            dishIds: dishes.filter((d) => d.dishId).map((d) => d.dishId),
            avoidedIngredientEntryIds: [],
          },
        ]);
      } catch (groupErr) {
        console.warn("Lưu nhóm suất ăn bổ sung:", groupErr.message);
      }
    }

    return {
      isOk: true,
      success: true,
      data: createdMenu,
      message: "Đã tạo thực đơn nháp trên hệ thống thành công",
      isMock: false,
    };
  },

  /**
   * Cập nhật thực đơn
   */
  updateMenu: async (id, { formState, dishes, substituteDish, seasonings }) => {
    let weeklyId = id;
    if (typeof id === "string" && id.includes("_")) {
      weeklyId = id.split("_")[0];
    }

    const edited = adaptFormToBackendWrite({
      name: formState.name,
      date: formState.date,
      mealType: formState.mealType || "LUNCH",
      notes: formState.notes,
      dishes,
      seasonings,
    });

    // PUT replaces the week. Re-read and preserve every untouched day/meal.
    const snapshotResponse = await http.get(apiMenuDetail(weeklyId), { notifyOnError: false });
    const snapshot = snapshotResponse?.data;
    const payload = mergeMenuMealWrite(snapshot, edited, id);
    const response = await http.put(apiMenuDetail(weeklyId), payload, { notifyOnError: false });
    invalidateWeekScheduleCache();
    invalidateMenuListCache();
    return {
      isOk: true,
      success: true,
      data: response?.data || response,
      message: "Đã cập nhật thực đơn thành công",
      isMock: false,
    };
  },

  /**
   * Gửi thực đơn lên Ban Giám Hiệu phê duyệt
   */
  submitMenu: async (id) => {
    let weeklyId = id;
    if (typeof id === "string" && id.includes("_")) {
      weeklyId = id.split("_")[0];
    }

    const response = await http.post(apiSubmitMenu(weeklyId), {}, { notifyOnError: false });
    invalidateWeekScheduleCache();
    invalidateMenuListCache();
    return {
      isOk: true,
      success: true,
      data: response?.data || response,
      message: "Đã gửi thực đơn chờ Ban Giám Hiệu phê duyệt",
      isMock: false,
    };
  },

  /**
   * Xóa thực đơn bản nháp
   */
  deleteMenu: async (id) => {
    let weeklyId = id;
    if (typeof id === "string" && id.includes("_")) {
      weeklyId = id.split("_")[0];
    }

    const response = await http.delete(apiMenuDetail(weeklyId));
    invalidateWeekScheduleCache();
    invalidateMenuListCache();
    return {
      isOk: true,
      success: true,
      data: response?.data || response,
      message: "Đã xóa thực đơn nháp thành công",
      isMock: false,
    };
  },

  /**
   * Kiểm tra dị ứng học đường theo danh sách nguyên liệu đã chọn
   */
  checkAllergies: async (ingredientIds) => {
    if (!ingredientIds || ingredientIds.length === 0) {
      return { isOk: true, data: { hasConflict: false, conflicts: [] } };
    }

    const response = await http.post(
      apiAllergyCheck,
      { ingredientIds },
      { notifyOnError: false },
    );
    const data = response?.data || response;
    if (!Array.isArray(data?.conflicts)) throw new Error("Kết quả đối soát dị ứng không hợp lệ.");
    return { isOk: true, success: true, data, isMock: false };
  },

  /**
   * Lấy danh mục nguyên liệu từ NCC liên kết (main) hoặc kho khô (seasoning)
   */
  getIngredientOptions: async (kind = "main") => {
    const items = [];
    const limit = 100;
    let page = 1;
    let totalItems = 0;
    do {
      const response = await http.get(apiIngredientOptions(kind), {
        params: { page, limit },
        notifyOnError: false,
      });
      const result = response?.data || response;
      if (!Array.isArray(result?.items)) throw new Error("Danh mục nguyên liệu trả về không hợp lệ.");
      items.push(...result.items);
      totalItems = result.pagination?.totalItems ?? items.length;
      if (result.items.length === 0) break;
      page += 1;
    } while (items.length < totalItems);
    return { isOk: true, success: true, data: items, isMock: false };
  },

  /**
   * Lấy danh sách nhóm suất ăn (Portion Groups)
   */
  getPortionGroups: async (menuDayId, mealType = "LUNCH") => {
    try {
      const response = await http.get(apiPortionGroups(menuDayId, mealType), {
        notifyOnError: false,
      });
      return {
        isOk: true,
        success: true,
        data: response?.data || response,
        isMock: false,
      };
    } catch (err) {
      return { isOk: false, data: null, error: err.message };
    }
  },

  /**
   * Lưu nhóm suất ăn và món do Y tế chọn
   */
  savePortionGroups: async (menuDayId, mealType = "LUNCH", groups = []) => {
    try {
      const response = await http.put(
        apiPortionGroups(menuDayId, mealType),
        { groups },
        { notifyOnError: false },
      );
      return {
        isOk: true,
        success: true,
        data: response?.data || response,
        isMock: false,
      };
    } catch (err) {
      return { isOk: false, error: err.message };
    }
  },

  /**
   * Danh sách tuần thực đơn Y tế đã gửi (bỏ bản nháp), mới nhất trước
   */
  getApprovalWeeks: async () => {
    const response = await http.get(apiMenus, { params: { limit: 50 } });
    const items = response?.data?.items || [];
    return items.filter((week) => week.status !== "DRAFT");
  },

  /**
   * Hồ sơ duyệt thực đơn tuần cho Ban Giám Hiệu
   */
  getApprovalDetail: (menuId) => http.get(apiGetMenuApprovalDetail(menuId)),

  /**
   * Quyết định cho cả tuần (body: { decision: "APPROVED" | "REVISION_REQUESTED", feedback? })
   */
  reviewMenu: (menuId, body) => http.post(apiReviewMenu(menuId), body),
};

export default MenuService;
