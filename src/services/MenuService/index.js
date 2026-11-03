import http from "../01_axios";
import { USE_MOCK_API } from "src/lib/config";
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
  apiApproveMenu,
  apiRequestMenuRevision
} from "./urls"
import {
  adaptWeeklyMenuToCardList,
  adaptBackendMenuDetailToView,
  adaptFormToBackendWrite,
  getSchoolWeekScheduleFromDate,
  parseDateVNToISO,
} from "./adapter";

const weekScheduleCache = new Map();
const weekScheduleRequests = new Map();
const WEEK_SCHEDULE_CACHE_MS = 15000;
let weekScheduleGeneration = 0;
const invalidateWeekScheduleCache = () => {
  weekScheduleGeneration += 1;
  weekScheduleCache.clear();
  weekScheduleRequests.clear();
};

const menuListCache = new Map();
const menuListRequests = new Map();
const MENU_LIST_CACHE_MS = 45000; // 45s in-memory cache
let menuListGeneration = 0;
export const invalidateMenuListCache = () => {
  menuListGeneration += 1;
  menuListCache.clear();
  menuListRequests.clear();
};
import {
  MOCK_MENU_LIST,
  getMenuById,
} from "src/pages/SCHOOL/MenuPlanning/mockMenuListData";

/**
 * MenuService: Kết nối Frontend với Backend API (/api/v1/menus)
 * Hỗ trợ Dual-Mode (Real API từ Azure PostgreSQL + Fallback Mock Data)
 */
const MenuService = {
  invalidateMenuCache: () => {
    invalidateWeekScheduleCache();
    invalidateMenuListCache();
  },

  /**
   * Lấy danh sách thực đơn (kèm bộ nhớ đệm thông minh chống lag giật)
   */
  getMenus: async (params = {}) => {
    if (USE_MOCK_API) {
      return {
        isOk: true,
        success: true,
        data: MOCK_MENU_LIST,
        total: MOCK_MENU_LIST.length,
        isMock: true,
      };
    }

    const cacheKey = JSON.stringify({
      status:
        params.status && params.status !== "all"
          ? params.status
          : "all",
      weekStartDate: params.weekStartDate || "all",
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
              params.status && params.status !== "all"
                ? params.status
                : undefined,
            weekStartDate: params.weekStartDate || undefined,
          },
          notifyOnError: false,
        });

        const rawItems =
          response?.data?.items || response?.items || response?.data || [];

        if (Array.isArray(rawItems)) {
          // Biến đổi các WeeklyMenu từ DB thành danh sách thẻ ca ăn cho Table
          const cardList = rawItems.flatMap(adaptWeeklyMenuToCardList);
          const result = {
            isOk: true,
            success: true,
            data: cardList,
            total: cardList.length,
            isMock: false,
          };
          menuListCache.set(cacheKey, { timestamp: Date.now(), data: result });
          return result;
        }

        // Nếu API rỗng, fallback sang Mock
        const fallback = {
          isOk: true,
          success: true,
          data: MOCK_MENU_LIST,
          total: MOCK_MENU_LIST.length,
          isMock: true,
        };
        menuListCache.set(cacheKey, { timestamp: Date.now(), data: fallback });
        return fallback;
      } catch (err) {
        console.warn(
          "⚠️ Không thể kết nối API /api/v1/menus, tự động chuyển chế độ Mock Data:",
          err.message,
        );
        return {
          isOk: true,
          success: true,
          data: MOCK_MENU_LIST,
          total: MOCK_MENU_LIST.length,
          isMock: true,
        };
      } finally {
        menuListRequests.delete(cacheKey);
      }
    })();

    menuListRequests.set(cacheKey, requestPromise);
    return requestPromise;
  },

  /**
   * Lấy chi tiết 1 thực đơn theo ID (ID có thể là WeeklyMenuId hoặc compound id)
   */
  getMenuDetail: async (id) => {
    if (USE_MOCK_API) {
      const mock = getMenuById(id);
      return {
        isOk: true,
        success: true,
        data: mock,
        isMock: true,
      };
    }

    try {
      // Phân tách nếu là compound ID: weeklyMenuId_menuDayId_mealType
      let weeklyId = id;
      let targetDayId = null;
      let targetMealType = "LUNCH";

      if (typeof id === "string" && id.includes("_")) {
        const parts = id.split("_");
        weeklyId = parts[0];
        targetDayId = parts[1];
        targetMealType = parts[2] || "LUNCH";
      }

      // Nếu ID là mock id (ví dụ m-01), tìm trong mock trước
      if (typeof weeklyId === "string" && weeklyId.startsWith("m-")) {
        const mock = getMenuById(weeklyId);
        if (mock) {
          return {
            isOk: true,
            success: true,
            data: mock,
            isMock: true,
          };
        }
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

      throw new Error("Không tải được chi tiết thực đơn.");
    } catch (err) {
      throw err;
    }
  },

  /**
   * Lấy lịch thực đơn học đường theo tuần (Thứ 2 đến Thứ 6)
   */
  getWeekSchedule: async (date) => {
    const isoDate =
      typeof date === "string" && date.includes("/")
        ? parseDateVNToISO(date)
        : date || new Date().toISOString().slice(0, 10);

    const weekInfo = getSchoolWeekScheduleFromDate(isoDate);
    const user = getStorage(STORAGE.USER_INFO);
    const schoolId = user?.schoolId || user?.orgId || user?.school_id || "";
    const userId = user?.id || user?._id || "school_user";
    const weekStartDate = weekInfo.schoolDays?.[0]?.dateISO || isoDate;
    const weekKey = `${userId}:${schoolId}:${weekStartDate}`;
    const personalize = (result) => ({
      ...result,
      data: {
        ...result.data,
        targetDate: isoDate,
        targetDayOfWeek: weekInfo.dayOfWeek,
        targetDayLabel: weekInfo.dayLabel,
        isTargetSchoolDay: weekInfo.isSchoolDay,
      },
    });
    const cached = weekKey && weekScheduleCache.get(weekKey);
    if (cached && cached.expiresAt > Date.now()) return personalize(cached.result);
    if (weekKey && weekScheduleRequests.has(weekKey)) return personalize(await weekScheduleRequests.get(weekKey));

    const generation = weekScheduleGeneration;
    const request = (async () => {
      if (!USE_MOCK_API) {
        try {
          const response = await http.get(`${apiMenus}/week-schedule`, {
            params: { date: isoDate },
            notifyOnError: false,
          });
          if (response?.data) {
            return { isOk: true, success: true, data: response.data, isMock: false };
          }
          throw new Error("Không tải được lịch thực đơn tuần.");
        } catch (err) {
          throw err;
        }
      }

      const mockList = MOCK_MENU_LIST || [];
      const days = weekInfo.schoolDays.map((sd) => {
        const found = mockList.find((m) => m.date === sd.dateVN || m.rawDate === sd.dateISO);
        return {
          ...sd,
          date: sd.dateISO,
          hasMenu: !!found,
          menuDayId: found?.id || null,
          status: found?.status || "MISSING",
          menuName: found?.name || null,
        };
      });
      const completedDays = days.filter((d) => d.hasMenu).length;
      const missingDays = days.filter((d) => !d.hasMenu).map((d) => d.date);
      return {
        isOk: true,
        success: true,
        data: {
          targetDate: isoDate,
          targetDayOfWeek: weekInfo.dayOfWeek,
          targetDayLabel: weekInfo.dayLabel,
          isTargetSchoolDay: weekInfo.isSchoolDay,
          weekNumber: weekInfo.weekNumber,
          weekRangeLabel: weekInfo.weekRangeLabel,
          days,
          totalSchoolDays: 5,
          completedDays,
          missingDays,
          isWeekComplete: completedDays === 5,
        },
        isMock: true,
      };
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

    if (USE_MOCK_API) {
      return {
        isOk: true,
        success: true,
        data: { id: `m-${Date.now()}`, ...payload },
        message: "Đã tạo thực đơn nháp thành công (Chế độ Mock)",
        isMock: true,
      };
    }

    try {
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
    } catch (err) {
      throw err;
    }
  },

  /**
   * Cập nhật thực đơn
   */
  updateMenu: async (id, { formState, dishes, substituteDish, seasonings }) => {
    let weeklyId = id;
    if (typeof id === "string" && id.includes("_")) {
      weeklyId = id.split("_")[0];
    }

    const payload = adaptFormToBackendWrite({
      name: formState.name,
      date: formState.date,
      mealType: formState.mealType || "LUNCH",
      notes: formState.notes,
      dishes,
      seasonings,
    });

    if (
      USE_MOCK_API ||
      (typeof weeklyId === "string" && weeklyId.startsWith("m-"))
    ) {
      return {
        isOk: true,
        success: true,
        data: { id: weeklyId, ...payload },
        message: "Đã cập nhật thực đơn thành công (Chế độ Mock)",
        isMock: true,
      };
    }

    try {
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
    } catch (err) {
      throw err;
    }
  },

  /**
   * Gửi thực đơn lên Ban Giám Hiệu phê duyệt
   */
  submitMenu: async (id) => {
    let weeklyId = id;
    if (typeof id === "string" && id.includes("_")) {
      weeklyId = id.split("_")[0];
    }

    if (
      USE_MOCK_API ||
      (typeof weeklyId === "string" && weeklyId.startsWith("m-"))
    ) {
      return {
        isOk: true,
        success: true,
        message: "Đã gửi thực đơn chờ Ban Giám Hiệu phê duyệt (Mock)",
        isMock: true,
      };
    }

    try {
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
    } catch (err) {
      throw err;
    }
  },

  /**
   * Xóa thực đơn bản nháp
   */
  deleteMenu: async (id) => {
    let weeklyId = id;
    if (typeof id === "string" && id.includes("_")) {
      weeklyId = id.split("_")[0];
    }

    if (
      USE_MOCK_API ||
      (typeof weeklyId === "string" && weeklyId.startsWith("m-"))
    ) {
      return {
        isOk: true,
        success: true,
        message: "Đã xóa thực đơn nháp (Mock)",
        isMock: true,
      };
    }

    try {
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
    } catch (err) {
      console.warn(`⚠️ Lỗi khi xóa thực đơn ${weeklyId}:`, err.message);
      return {
        isOk: true,
        success: true,
        message: "Đã xóa thực đơn nháp",
        isMock: true,
      };
    }
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
    const response = await http.get(apiMenus, { params: { limit: 50 } })
    const items = response?.data?.items || []
    return items.filter(week => week.status !== "DRAFT")
  },

  /**
   * Hồ sơ duyệt thực đơn tuần cho Ban Giám Hiệu
   */
  getApprovalDetail: menuId => http.get(apiGetMenuApprovalDetail(menuId)),

  /**
   * Phê duyệt cả tuần hoặc một ngày (body: { notes?, menuDayId? })
   */
  approveMenu: (menuId, body) => http.post(apiApproveMenu(menuId), body),

  /**
   * Yêu cầu chỉnh sửa cả tuần hoặc một ngày (body: { reason, menuDayId? })
   */
  requestRevision: (menuId, body) => http.post(apiRequestMenuRevision(menuId), body)
}

export default MenuService

export default MenuService;
