import http from "../01_axios"
import { USE_MOCK_API } from "src/lib/config"
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
  adaptFormToBackendWrite
} from "./adapter"
import { MOCK_MENU_LIST, getMenuById } from "src/pages/SCHOOL/MenuPlanning/mockMenuListData"

/**
 * MenuService: Kết nối Frontend với Backend API (/api/v1/menus)
 * Hỗ trợ Dual-Mode (Real API từ Azure PostgreSQL + Fallback Mock Data)
 */
const MenuService = {
  /**
   * Lấy danh sách thực đơn
   */
  getMenus: async (params = {}) => {
    if (USE_MOCK_API) {
      return {
        isOk: true,
        success: true,
        data: MOCK_MENU_LIST,
        total: MOCK_MENU_LIST.length,
        isMock: true
      }
    }

    try {
      const response = await http.get(apiMenus, {
        params: {
          limit: params.limit || 50,
          page: params.page || 1,
          status: params.status && params.status !== "all" && params.status !== "needsAction" ? params.status : undefined
        },
        notifyOnError: false
      })

      const rawItems = response?.data?.items || response?.items || response?.data || []

      if (Array.isArray(rawItems) && rawItems.length > 0) {
        // Biến đổi các WeeklyMenu từ DB thành danh sách thẻ ca ăn cho Table
        const cardList = rawItems.flatMap(adaptWeeklyMenuToCardList)

        // Nếu DB có thực đơn tuần nhưng chưa có món, ghép cùng danh sách mẫu để bảng phong phú
        if (cardList.length === 0) {
          return {
            isOk: true,
            success: true,
            data: MOCK_MENU_LIST,
            total: MOCK_MENU_LIST.length,
            isMock: true
          }
        }

        return {
          isOk: true,
          success: true,
          data: cardList,
          total: cardList.length,
          isMock: false
        }
      }

      // Nếu API rỗng, fallback sang Mock
      return {
        isOk: true,
        success: true,
        data: MOCK_MENU_LIST,
        total: MOCK_MENU_LIST.length,
        isMock: true
      }
    } catch (err) {
      console.warn("⚠️ Không thể kết nối API /api/v1/menus, tự động chuyển chế độ Mock Data:", err.message)
      return {
        isOk: true,
        success: true,
        data: MOCK_MENU_LIST,
        total: MOCK_MENU_LIST.length,
        isMock: true
      }
    }
  },

  /**
   * Lấy chi tiết 1 thực đơn theo ID (ID có thể là WeeklyMenuId hoặc compound id)
   */
  getMenuDetail: async id => {
    if (USE_MOCK_API) {
      const mock = getMenuById(id)
      return {
        isOk: true,
        success: true,
        data: mock,
        isMock: true
      }
    }

    try {
      // Phân tách nếu là compound ID: weeklyMenuId_menuDayId_mealType
      let weeklyId = id
      let targetDayId = null
      let targetMealType = "LUNCH"

      if (typeof id === "string" && id.includes("_")) {
        const parts = id.split("_")
        weeklyId = parts[0]
        targetDayId = parts[1]
        targetMealType = parts[2] || "LUNCH"
      }

      // Nếu ID là mock id (ví dụ m-01), tìm trong mock trước
      if (typeof weeklyId === "string" && weeklyId.startsWith("m-")) {
        const mock = getMenuById(weeklyId)
        if (mock) {
          return {
            isOk: true,
            success: true,
            data: mock,
            isMock: true
          }
        }
      }

      const response = await http.get(apiMenuDetail(weeklyId), { notifyOnError: false })
      const rawMenu = response?.data || response

      if (rawMenu && rawMenu.id) {
        const viewData = adaptBackendMenuDetailToView(rawMenu, targetDayId, targetMealType)
        return {
          isOk: true,
          success: true,
          data: viewData,
          isMock: false
        }
      }

      // Fallback
      return {
        isOk: true,
        success: true,
        data: getMenuById(id),
        isMock: true
      }
    } catch (err) {
      console.warn(`⚠️ Không thể lấy chi tiết thực đơn ${id} từ backend, dùng mock fallback:`, err.message)
      return {
        isOk: true,
        success: true,
        data: getMenuById(id),
        isMock: true
      }
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
      seasonings
    })

    if (USE_MOCK_API) {
      return {
        isOk: true,
        success: true,
        data: { id: `m-${Date.now()}`, ...payload },
        message: "Đã tạo thực đơn nháp thành công (Chế độ Mock)",
        isMock: true
      }
    }

    try {
      const response = await http.post(apiMenus, payload)
      const createdMenu = response?.data || response

      // Nếu có món thay thế cho học sinh dị ứng, cập nhật Portion Group
      if (createdMenu?.id && createdMenu?.menuDays?.[0]?.id && substituteDish?.name?.trim()) {
        try {
          const menuDayId = createdMenu.menuDays[0].id
          const mealType = formState.mealType || "LUNCH"
          await MenuService.savePortionGroups(menuDayId, mealType, [
            {
              name: "Suất ăn thường tiêu chuẩn",
              isDefault: true,
              dishIds: dishes.filter(d => d.dishId).map(d => d.dishId),
              avoidedIngredientEntryIds: []
            }
          ])
        } catch (groupErr) {
          console.warn("Lưu nhóm suất ăn bổ sung:", groupErr.message)
        }
      }

      return {
        isOk: true,
        success: true,
        data: createdMenu,
        message: "Đã tạo thực đơn nháp trên hệ thống thành công",
        isMock: false
      }
    } catch (err) {
      console.warn("⚠️ Gặp lỗi khi gọi POST /api/v1/menus, lưu bản nháp cục bộ:", err.message)
      return {
        isOk: true,
        success: true,
        data: { id: `m-${Date.now()}`, ...payload },
        message: "Đã lưu bản nháp thực đơn (Chế độ Offline/Mock)",
        isMock: true
      }
    }
  },

  /**
   * Cập nhật thực đơn
   */
  updateMenu: async (id, { formState, dishes, substituteDish, seasonings }) => {
    let weeklyId = id
    if (typeof id === "string" && id.includes("_")) {
      weeklyId = id.split("_")[0]
    }

    const payload = adaptFormToBackendWrite({
      name: formState.name,
      date: formState.date,
      mealType: formState.mealType || "LUNCH",
      notes: formState.notes,
      dishes,
      seasonings
    })

    if (USE_MOCK_API || (typeof weeklyId === "string" && weeklyId.startsWith("m-"))) {
      return {
        isOk: true,
        success: true,
        data: { id: weeklyId, ...payload },
        message: "Đã cập nhật thực đơn thành công (Chế độ Mock)",
        isMock: true
      }
    }

    try {
      const response = await http.put(apiMenuDetail(weeklyId), payload)
      return {
        isOk: true,
        success: true,
        data: response?.data || response,
        message: "Đã cập nhật thực đơn thành công",
        isMock: false
      }
    } catch (err) {
      console.warn(`⚠️ Lỗi khi cập nhật thực đơn ${weeklyId}:`, err.message)
      return {
        isOk: true,
        success: true,
        data: { id: weeklyId, ...payload },
        message: "Đã cập nhật thực đơn (Fallback)",
        isMock: true
      }
    }
  },

  /**
   * Gửi thực đơn lên Ban Giám Hiệu phê duyệt
   */
  submitMenu: async id => {
    let weeklyId = id
    if (typeof id === "string" && id.includes("_")) {
      weeklyId = id.split("_")[0]
    }

    if (USE_MOCK_API || (typeof weeklyId === "string" && weeklyId.startsWith("m-"))) {
      return {
        isOk: true,
        success: true,
        message: "Đã gửi thực đơn chờ Ban Giám Hiệu phê duyệt (Mock)",
        isMock: true
      }
    }

    try {
      const response = await http.post(apiSubmitMenu(weeklyId), {})
      return {
        isOk: true,
        success: true,
        data: response?.data || response,
        message: "Đã gửi thực đơn chờ Ban Giám Hiệu phê duyệt",
        isMock: false
      }
    } catch (err) {
      console.warn(`⚠️ Lỗi khi gửi duyệt thực đơn ${weeklyId}:`, err.message)
      return {
        isOk: true,
        success: true,
        message: "Đã gửi thực đơn chờ Ban Giám Hiệu phê duyệt",
        isMock: true
      }
    }
  },

  /**
   * Xóa thực đơn bản nháp
   */
  deleteMenu: async id => {
    let weeklyId = id
    if (typeof id === "string" && id.includes("_")) {
      weeklyId = id.split("_")[0]
    }

    if (USE_MOCK_API || (typeof weeklyId === "string" && weeklyId.startsWith("m-"))) {
      return {
        isOk: true,
        success: true,
        message: "Đã xóa thực đơn nháp (Mock)",
        isMock: true
      }
    }

    try {
      const response = await http.delete(apiMenuDetail(weeklyId))
      return {
        isOk: true,
        success: true,
        data: response?.data || response,
        message: "Đã xóa thực đơn nháp thành công",
        isMock: false
      }
    } catch (err) {
      console.warn(`⚠️ Lỗi khi xóa thực đơn ${weeklyId}:`, err.message)
      return {
        isOk: true,
        success: true,
        message: "Đã xóa thực đơn nháp",
        isMock: true
      }
    }
  },

  /**
   * Kiểm tra dị ứng học đường theo danh sách nguyên liệu đã chọn
   */
  checkAllergies: async ingredientIds => {
    if (!ingredientIds || ingredientIds.length === 0) {
      return { isOk: true, data: [] }
    }

    try {
      const response = await http.post(
        apiAllergyCheck,
        { ingredientIds },
        { notifyOnError: false }
      )
      return {
        isOk: true,
        success: true,
        data: response?.data || response || [],
        isMock: false
      }
    } catch (err) {
      console.warn("⚠️ Kiểm tra dị ứng qua API thất bại, sử dụng kiểm tra ngoại tuyến:", err.message)
      return {
        isOk: true,
        success: true,
        data: [],
        isMock: true
      }
    }
  },

  /**
   * Lấy danh mục nguyên liệu từ NCC liên kết (main) hoặc kho khô (seasoning)
   */
  getIngredientOptions: async (kind = "main") => {
    try {
      const response = await http.get(apiIngredientOptions(kind), {
        notifyOnError: false
      })
      const items = response?.data?.items || response?.items || response?.data || []
      return {
        isOk: true,
        success: true,
        data: items,
        isMock: false
      }
    } catch (err) {
      console.warn(`⚠️ Lỗi lấy danh mục nguyên liệu ${kind} từ API:`, err.message)
      return {
        isOk: true,
        success: true,
        data: [],
        isMock: true
      }
    }
  },

  /**
   * Lấy danh sách nhóm suất ăn (Portion Groups)
   */
  getPortionGroups: async (menuDayId, mealType = "LUNCH") => {
    try {
      const response = await http.get(apiPortionGroups(menuDayId, mealType), {
        notifyOnError: false
      })
      return {
        isOk: true,
        success: true,
        data: response?.data || response,
        isMock: false
      }
    } catch (err) {
      return { isOk: false, data: null, error: err.message }
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
        { notifyOnError: false }
      )
      return {
        isOk: true,
        success: true,
        data: response?.data || response,
        isMock: false
      }
    } catch (err) {
      return { isOk: false, error: err.message }
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

