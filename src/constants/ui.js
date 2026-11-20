/**
 * UI display constants
 */
export const NO_DATA_TEXT = "Không có thông tin";

/** Loại nguyên liệu theo trường × NCC (IngredientHandlingType) */
export const HANDLING_TYPE_LABELS = {
  DRY_STOCK: "Lưu kho",
  DIRECT_USE: "Dùng ngay",
};
export const HANDLING_TYPE_OPTIONS = Object.entries(HANDLING_TYPE_LABELS).map(
  ([value, label]) => ({ value, label }),
);
