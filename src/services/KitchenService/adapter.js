export const COOKING_MODES = {
  COMBINE_LOTS: "Nấu chung",
  SEPARATE_BY_LOT: "Nấu riêng theo lô",
};

export function getDishBatchState(batches, dishId, mealType, menuDayId) {
  const matches = (batches || []).filter(batch =>
    batch.mealType === mealType &&
    (!menuDayId || batch.menuDayId === menuDayId) &&
    (Array.isArray(batch.dishes) && batch.dishes.length
      ? batch.dishes.some(dish => dish.dishId === dishId)
      : batch.dishId === dishId),
  );
  return {
    isBatchCreated: matches.length > 0,
    batchCode: matches.map(batch => batch.batchCode).join(", "),
    batchId: matches[0]?.id || "",
  };
}

export function canRecordBatchSample(batch) {
  if (batch?.status !== "COMPLETED") return false;
  const dishes = batch.dishes?.length ? batch.dishes : batch.dishId ? [{dishId:batch.dishId}] : [];
  const sampled = new Set((batch.retainedFoodSamples || []).map(s => s.dishId));
  return dishes.some(dish => !sampled.has(dish.dishId));
}

export const isUuid = (str) =>
  typeof str === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    str,
  );

export const BATCH_STATUSES = {
  UNCONFIRMED: "Chưa xác nhận nấu",
  CONFIRMED: "Chờ nấu",
  COMPLETED: "Đã hoàn thành",
};

export const EMPTY_BATCH_FILTERS = {
  search: "",
  academicYear: "2026-2027",
  week: "current",
  startDate: "",
  endDate: "",
  mealType: "",
  cookingModeApplied: "",
  status: "",
};

export function localDateISO(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function batchQuery(filters = {}) {
  const query = {
    page: Number(filters.page) || 1,
    limit: Number(filters.limit) || 10,
  };
  if (
    !Number.isSafeInteger(query.page) ||
    query.page < 1 ||
    !Number.isSafeInteger(query.limit) ||
    query.limit < 1 ||
    query.limit > 100
  ) {
    throw new Error("Phân trang không hợp lệ.");
  }
  const search = (filters.search || "").trim();
  if (search.length > 100)
    throw new Error("Từ khóa tìm kiếm tối đa 100 ký tự.");
  if (search) query.search = search;
  if (filters.startDate) query.startDate = filters.startDate;
  if (filters.endDate) query.endDate = filters.endDate;
  if (filters.date) query.date = filters.date;
  if (filters.hasSample !== undefined) {
    if (typeof filters.hasSample !== "boolean")
      throw new Error("Bộ lọc mẫu lưu không hợp lệ.");
    query.hasSample = String(filters.hasSample);
  }
  if (filters.mealType) {
    if (!["LUNCH", "AFTERNOON"].includes(filters.mealType))
      throw new Error("Bữa ăn không hợp lệ.");
    query.mealType = filters.mealType;
  }
  if (filters.cookingModeApplied) {
    if (!COOKING_MODES[filters.cookingModeApplied])
      throw new Error("Phương thức chế biến không hợp lệ.");
    query.cookingModeApplied = filters.cookingModeApplied;
  }
  if (filters.status) {
    if (!BATCH_STATUSES[filters.status])
      throw new Error("Trạng thái lô không hợp lệ.");
    query.status = filters.status;
  }
  return query;
}

export function schoolClock(value) {
  if (!value) return "";
  return String(value).match(/(?:^|T)(\d{2}:\d{2})/)?.[1] || "";
}

export function adaptCookingBatch(batch) {
  const rawDate =
    typeof batch.MenuDay?.menuDate === "string"
      ? batch.MenuDay.menuDate.slice(0, 10)
      : "";
  const dateLabel = /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
    ? rawDate.split("-").reverse().join("/")
    : "Chưa có ngày";
  const mealLabel =
    { LUNCH: "Bữa trưa", AFTERNOON: "Bữa xế" }[batch.mealType] ||
    "Chưa có bữa ăn";

  const batchGroupId = batch.batchGroupId || batch.BatchGroup?.id || null;
  const batchGroupCode = batch.BatchGroup?.batchCode || "";

  const rawDishes = Array.isArray(batch.dishes) ? batch.dishes : [];
  const dishes = rawDishes.map((d) => ({
    dishId: d.dishId || d.id,
    name: d.name || d.Dish?.name || "Món ăn",
    plannedPortions: d.plannedPortions ?? batch.plannedPortions,
    cookingBatchLots: d.cookingBatchLots || [],
  }));

  let dishName = batch.Dish?.name || "";
  if (dishes.length > 0) {
    dishName = dishes
      .map((d) => d.name)
      .filter(Boolean)
      .join(", ");
  }
  if (!dishName) dishName = "Chưa có tên món";

  const samples = Array.isArray(batch.retainedFoodSamples)
    ? batch.retainedFoodSamples
    : batch.retainedFoodSample
      ? [batch.retainedFoodSample]
      : [];

  const totalDishesCount = dishes.length || 1;
  const sampledDishesCount = samples.length;
  const hasSample = sampledDishesCount > 0;
  const allSamplesDone =
    totalDishesCount > 1 ? sampledDishesCount >= totalDishesCount : hasSample;

  let sampleLabel = "Chưa lưu mẫu";
  if (hasSample) {
    if (totalDishesCount > 1) {
      if (allSamplesDone) {
        sampleLabel = `Đã lưu đủ (${sampledDishesCount}/${totalDishesCount} món)`;
      } else {
        sampleLabel = `Đã lưu ${sampledDishesCount}/${totalDishesCount} món`;
      }
    } else {
      const sample = samples[0];
      sampleLabel =
        { STORED: "Đã lưu mẫu (24h)", DISPOSED: "Đã hủy mẫu" }[
          sample?.status
        ] || "Đã lưu mẫu (24h)";
    }
  }

  return {
    id: batch.id,
    code: batch.batchCode || "—",
    batchGroupId,
    batchGroupCode,
    dishes,
    dishName,
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
    hasSample,
    allSamplesDone,
    totalDishesCount,
    sampledDishesCount,
    retainedFoodSamples: samples,
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
  };
}

export function adaptBatchDetail(batch) {
  if (!batch) return null;
  const rawDate =
    typeof batch.MenuDay?.menuDate === "string"
      ? batch.MenuDay.menuDate.slice(0, 10)
      : "";
  const menuDate = /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
    ? rawDate.split("-").reverse().join("/")
    : "Chưa có ngày";
  const mealType =
    { LUNCH: "Bữa trưa", AFTERNOON: "Bữa xế" }[batch.mealType] ||
    batch.mealType ||
    "Bữa trưa";
  const method =
    batch.cookingModeApplied === "SEPARATE_BY_LOT" ? "SEPARATE" : "COMMON";

  const formatDateTime = (val) => {
    if (!val) return null;
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };
  const formatTimeOnly = (val) => {
    if (!val) return null;
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const status = batch.status === "DRAFT" ? "UNCONFIRMED" : batch.status;

  const rawDishes = Array.isArray(batch.dishes) ? batch.dishes : [];
  const dishes = rawDishes.map((d) => ({
    dishId: d.dishId || d.id,
    name: d.name || d.Dish?.name || "Món ăn",
    plannedPortions: d.plannedPortions ?? batch.plannedPortions,
    cookingBatchLots: d.cookingBatchLots || [],
  }));

  let dishName = batch.Dish?.name || "";
  if (dishes.length > 0) {
    dishName = dishes
      .map((d) => d.name)
      .filter(Boolean)
      .join(", ");
  }
  if (!dishName) dishName = "Chưa có tên món";

  const samples = Array.isArray(batch.retainedFoodSamples)
    ? batch.retainedFoodSamples
    : batch.retainedFoodSample
      ? [batch.retainedFoodSample]
      : [];

  const combinedLots =
    batch.cookingBatchLots && batch.cookingBatchLots.length > 0
      ? batch.cookingBatchLots
      : dishes.flatMap((d) =>
          (d.cookingBatchLots || []).map((lot) => ({
            ...lot,
            dishName: d.name,
          })),
        );

  const ingredients = combinedLots.map((lot, idx) => ({
    id: lot.ingredientLotId || idx + 1,
    dishId: lot.dishId,
    dishName: lot.dishName,
    name: lot.ingredientName || lot.name || `Lô nguyên liệu #${idx + 1}`,
    lotCode:
      lot.lotCode ||
      (lot.ingredientLotId
        ? `LOT-${lot.ingredientLotId.slice(0, 8).toUpperCase()}`
        : `LOT-00${idx + 1}`),
    quantity: lot.quantityUsed || "—",
    unit: lot.unit || "kg",
    expiryDate: lot.expirationDate || lot.expiryDate || "Đã kiểm thực",
    expiryNote: "Đạt chuẩn an toàn",
    noteType: "default",
  }));

  return {
    id: batch.id,
    code: batch.batchCode || batch.id,
    batchGroupId: batch.batchGroupId || batch.BatchGroup?.id || null,
    batchGroupCode: batch.BatchGroup?.batchCode || "",
    status,
    statusLabel: BATCH_STATUSES[status] || "Chưa xác định",
    dishName,
    dishes,
    dishCategory: "Món ăn bán trú",
    menuDate,
    mealType,
    servingTime: batch.mealType === "LUNCH" ? "11:15" : "14:30",
    portions: Number.isSafeInteger(batch.plannedPortions)
      ? batch.plannedPortions
      : 0,
    method,
    cookingModeApplied: batch.cookingModeApplied,
    note: batch.note || "",
    createdAt: formatDateTime(batch.createdAt) || "Chưa ghi nhận",
    confirmedAt: formatDateTime(batch.confirmedAt),
    completedAt: formatTimeOnly(batch.completedAt),
    completedAtFull: formatDateTime(batch.completedAt),
    ingredients,
    retainedFoodSamples: samples,
    rawBatchLots: batch.cookingBatchLots || [],
    rawMealSeasonings: batch.mealSeasonings || [],
  };
}

export function batchCSV(rows) {
  const escape = (value) => {
    let cell = String(value ?? "");
    if (/^[\s]*[=+\-@]/.test(cell)) cell = `'${cell}`;
    return `"${cell.replace(/"/g, '""')}"`;
  };
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
  );
}
