export const COOKING_MODES = [
  {
    value: "SEPARATE_BY_LOT",
    label: "Nấu riêng theo lô",
    description: "Hệ thống có thể tạo nhiều mẻ; mỗi loại nguyên liệu trong một mẻ chỉ lấy từ một lô.",
  },
  {
    value: "COMBINE_LOTS",
    label: "Nấu chung nhiều lô",
    description: "Hệ thống tạo một mẻ và có thể lấy cùng một loại nguyên liệu từ nhiều lô.",
  },
]

export const cookingModeLabel = value =>
  COOKING_MODES.find(mode => mode.value === value)?.label || "Chưa thiết lập"
