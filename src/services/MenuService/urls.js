/**
 * Định nghĩa các URL Endpoint cho Phân hệ Thực đơn (Menu Management)
 * Tương thích chuẩn RESTful API với backend FoodPrint (/api/v1/menus)
 */

// Danh sách và chi tiết tuần thực đơn
export const apiMenus = "/v1/menus"
export const apiMenuDetail = id => `/v1/menus/${id}`

// Luồng phê duyệt thực đơn
export const apiSubmitMenu = id => `/v1/menus/${id}/submit`
export const apiReviewMenu = id => `/v1/menus/${id}/reviews`
export const apiMenuReviews = id => `/v1/menus/${id}/reviews`

// Kiểm tra cảnh báo dị nguyên học đường theo danh sách nguyên liệu
export const apiAllergyCheck = "/v1/menus/allergy-check"

// Danh mục nguyên liệu chính (từ NCC liên kết) và gia vị kho khô
export const apiIngredientOptions = kind => `/v1/menus/ingredient-options/${kind}`

// Nhóm suất ăn (suất thường, suất dị ứng, món thay thế do Y tế chọn)
export const apiPortionGroups = (menuDayId, mealType) =>
  `/v1/menus/days/${menuDayId}/meals/${mealType}/portion-groups`

// Định mức nguyên liệu cho ca ăn
export const apiMealIngredients = (menuDayId, mealType) =>
  `/v1/menus/days/${menuDayId}/meals/${mealType}/ingredients`

// Nhu cầu tổng nguyên liệu theo định mức đã nhập
export const apiMealRequirements = (menuDayId, mealType) =>
  `/v1/menus/days/${menuDayId}/meals/${mealType}/requirements`

// Hồ sơ duyệt thực đơn tuần của Ban Giám Hiệu
export const apiGetMenuApprovalDetail = menuId => `/v1/menus/${menuId}/approval-detail`
