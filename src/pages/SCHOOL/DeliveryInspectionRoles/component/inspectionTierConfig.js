/**
 * inspectionTierConfig.js
 * Cấu hình hằng số, nhãn và mô tả cho 3 nhóm duyệt kiểm nhận nguyên liệu.
 * Tuân thủ TASK-04: không chứa styling trực tiếp, chỉ chứa metadata và helper.
 */

export const TIER_KEYS = {
  PRIMARY: "PRIMARY",
  REQUIRED: "REQUIRED",
  OPTIONAL: "OPTIONAL",
}

export const TIER_CONFIG = {
  [TIER_KEYS.PRIMARY]: {
    key: TIER_KEYS.PRIMARY,
    tierNumber: 1,
    title: "Nhóm 1 – Người duyệt chính",
    shortLabel: "Duyệt chính",
    chipLabel: "Nhóm 1: Duyệt chính",
    description: "Đúng 1 người. Duy nhất vai trò này được bấm 'Xác nhận xe đã đến', đồng thời bắt buộc duyệt kiểm nhận.",
    badgeType: "primary",
  },
  [TIER_KEYS.REQUIRED]: {
    key: TIER_KEYS.REQUIRED,
    tierNumber: 2,
    title: "Nhóm 2 – Bắt buộc duyệt",
    shortLabel: "Bắt buộc",
    chipLabel: "Nhóm 2: Bắt buộc",
    description: "Tối đa 2 người (có thể để trống). Bắt buộc phải duyệt đạt thì đợt giao mới hoàn thành nhập kho.",
    badgeType: "info",
  },
  [TIER_KEYS.OPTIONAL]: {
    key: TIER_KEYS.OPTIONAL,
    tierNumber: 3,
    title: "Nhóm 3 – Tùy chọn (Tham khảo)",
    shortLabel: "Tùy chọn",
    chipLabel: "Nhóm 3: Tùy chọn",
    description: "Ý kiến kiểm tra mang tính tham khảo độc lập. Quyết định từ chối không làm hủy đợt giao và không tính vào giới hạn giao lại.",
    badgeType: "neutral",
  },
}

export const ROLE_CODES = {
  CHEF: "SCHOOL_KITCHEN_STAFF",
  WAREHOUSE: "INGREDIENT_MANAGEMENT_DEPARTMENT",
  NUTRITION: "SCHOOL_NUTRITION_OFFICER",
  PARENTS: "PARENTS_COMMITTEE",
}

export const DEFAULT_TIER_CONFIG = [
  { roleCode: ROLE_CODES.CHEF, tier: TIER_KEYS.PRIMARY },
  { roleCode: ROLE_CODES.WAREHOUSE, tier: TIER_KEYS.REQUIRED },
  { roleCode: ROLE_CODES.NUTRITION, tier: TIER_KEYS.REQUIRED },
  { roleCode: ROLE_CODES.PARENTS, tier: TIER_KEYS.OPTIONAL },
]
