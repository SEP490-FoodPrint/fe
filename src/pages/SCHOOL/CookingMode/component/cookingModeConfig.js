export const COOKING_MODES = [
  {
    value: "SEPARATE_BY_LOT",
    label: "Nấu riêng theo lô",
    description: "Mỗi mẻ chỉ sử dụng tối đa một lô cho từng loại nguyên liệu.",
    benefit: "Dễ khoanh vùng các mẻ liên quan khi một lô cần được kiểm tra.",
    tradeoff: "Có thể phải chia kế hoạch thành nhiều mẻ nhỏ hơn.",
  },
  {
    value: "COMBINE_LOTS",
    label: "Nấu chung nhiều lô",
    description: "Một mẻ có thể sử dụng nhiều lô của cùng một loại nguyên liệu.",
    benefit: "Linh hoạt tận dụng lượng nguyên liệu khả dụng từ nhiều lô.",
    tradeoff: "Một mẻ có thể liên quan đến nhiều lô khi truy xuất nguồn gốc.",
  },
]

export const cookingModeLabel = value =>
  COOKING_MODES.find(mode => mode.value === value)?.label || "Chưa thiết lập"
