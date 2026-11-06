export const COOKING_MODES = {
  COMBINE_LOTS: "Nấu chung",
  SEPARATE_BY_LOT: "Nấu riêng theo lô",
}

export const BATCH_STATUSES = {
  UNCONFIRMED: "Chưa xác nhận",
  CONFIRMED: "Chờ nấu",
  COMPLETED: "Đã hoàn thành",
}

export const EMPTY_BATCH_FILTERS = {
  search: "",
  date: "",
  mealType: "",
  cookingModeApplied: "",
  status: "",
}

export function localDateISO(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

export function batchQuery(filters = {}) {
  const query = {
    page: Number(filters.page) || 1,
    limit: Number(filters.limit) || 10,
  }
  if (
    !Number.isSafeInteger(query.page) ||
    query.page < 1 ||
    !Number.isSafeInteger(query.limit) ||
    query.limit < 1 ||
    query.limit > 100
  ) {
    throw new Error("Phân trang không hợp lệ.")
  }
  const search = (filters.search || "").trim()
  if (search.length > 100) throw new Error("Từ khóa tìm kiếm tối đa 100 ký tự.")
  if (search) query.search = search
  if (filters.date) query.date = filters.date
  if (filters.mealType) {
    if (!["LUNCH", "AFTERNOON"].includes(filters.mealType))
      throw new Error("Bữa ăn không hợp lệ.")
    query.mealType = filters.mealType
  }
  if (filters.cookingModeApplied) {
    if (!COOKING_MODES[filters.cookingModeApplied])
      throw new Error("Phương thức chế biến không hợp lệ.")
    query.cookingModeApplied = filters.cookingModeApplied
  }
  if (filters.status) {
    if (!BATCH_STATUSES[filters.status])
      throw new Error("Trạng thái lô không hợp lệ.")
    query.status = filters.status
  }
  return query
}

export function schoolClock(value) {
  if (!value) return ""
  return String(value).match(/(?:^|T)(\d{2}:\d{2})/)?.[1] || ""
}

export function adaptCookingBatch(batch) {
  const rawDate =
    typeof batch.MenuDay?.menuDate === "string"
      ? batch.MenuDay.menuDate.slice(0, 10)
      : ""
  const dateLabel = /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
    ? rawDate.split("-").reverse().join("/")
    : "Chưa có ngày"
  const mealLabel =
    { LUNCH: "Bữa trưa", AFTERNOON: "Bữa xế" }[batch.mealType] ||
    "Chưa có bữa ăn"
  const sample = batch.retainedFoodSample
  const sampleLabel = sample
    ? { STORED: "Đang lưu mẫu", DISPOSED: "Đã hủy mẫu" }[sample.status] ||
      "Chưa rõ trạng thái mẫu"
    : "Chưa lưu mẫu"
  return {
    id: batch.id,
    code: batch.batchCode || "—",
    dishName: batch.Dish?.name || "Chưa có tên món",
    dateLabel,
    mealType: batch.mealType,
    mealLabel,
    timeTag: `${dateLabel} · ${mealLabel}`,
    cookingModeApplied: batch.cookingModeApplied,
    methodLabel: COOKING_MODES[batch.cookingModeApplied] || "Chưa xác định",
    methodType:
      batch.cookingModeApplied === "COMBINE_LOTS"
        ? "common"
        : batch.cookingModeApplied === "SEPARATE_BY_LOT"
          ? "separate"
          : "unknown",
    plannedPortions: batch.plannedPortions,
    portion: Number.isSafeInteger(batch.plannedPortions)
      ? `${batch.plannedPortions.toLocaleString("vi-VN")} suất`
      : "Chưa có số suất",
    sampleLabel,
    hasSample: Boolean(sample),
    status: batch.status,
    statusLabel: BATCH_STATUSES[batch.status] || "Chưa xác định",
    statusType:
      { UNCONFIRMED: "muted", CONFIRMED: "warning", COMPLETED: "success" }[
        batch.status
      ] || "muted",
    note: batch.note || "",
    createdAt: batch.createdAt,
    confirmedAt: batch.confirmedAt,
    completedAt: batch.completedAt,
  }
}

export function batchCSV(rows) {
  const escape = (value) => {
    let cell = String(value ?? "")
    if (/^[\s]*[=+\-@]/.test(cell)) cell = `'${cell}`
    return `"${cell.replace(/"/g, '""')}"`
  }
  return (
    "\uFEFF" +
    [
      [
        "Mã lô",
        "Món ăn",
        "Ngày",
        "Bữa ăn",
        "Phương thức",
        "Số suất",
        "Mẫu lưu",
        "Trạng thái",
      ],
      ...rows.map((row) => [
        row.code,
        row.dishName,
        row.dateLabel,
        row.mealLabel,
        row.methodLabel,
        row.plannedPortions,
        row.sampleLabel,
        row.statusLabel,
      ]),
    ]
      .map((line) => line.map(escape).join(","))
      .join("\r\n")
  )
}
