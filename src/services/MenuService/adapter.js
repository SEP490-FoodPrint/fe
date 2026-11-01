/**
 * Adapter module: Chuẩn hóa dữ liệu giữa Backend Prisma Schema và Giao diện Frontend
 * Giúp các View (MenuPlanning, MenuDetail, CreateMenu, EditMenu) hoạt động trơn tru
 * với dữ liệu thực từ Azure PostgreSQL cũng như Mock fallback.
 */

/**
 * Định dạng ngày ISO -> DD/MM/YYYY
 */
export function formatDateVN(dateInput) {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Định dạng ngày DD/MM/YYYY -> ISO (YYYY-MM-DDTHH:mm:ss.sssZ)
 */
export function parseDateVNToISO(vnDateStr) {
  if (!vnDateStr) return new Date().toISOString().slice(0, 10);
  if (vnDateStr.includes("T")) return vnDateStr.slice(0, 10);
  const parts = vnDateStr.split("/");
  if (parts.length === 3) {
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const y = parseInt(parts[2], 10);
    return new Date(Date.UTC(y, m, d, 0, 0, 0)).toISOString().slice(0, 10);
  }
  return new Date(vnDateStr).toISOString().slice(0, 10);
}

/**
 * Xác định tuần so với hiện tại ('current', 'next', 'prev')
 */

export const SCHOOL_DAY_LABELS = [
  "Chủ Nhật",
  "Thứ Hai",
  "Thứ Ba",
  "Thứ Tư",
  "Thứ Năm",
  "Thứ Sáu",
  "Thứ Bảy",
];

export function getISOWeekNumber(date) {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function getSchoolMonday(date) {
  const d = new Date(date);
  const day = d.getDay() === 0 ? 7 : d.getDay();
  d.setDate(d.getDate() - day + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function parseDateToDateObj(input) {
  if (!input) return new Date();
  if (input instanceof Date) return input;
  if (typeof input === "string") {
    if (input.includes("/")) {
      const parts = input.split("/");
      if (parts.length === 3) {
        return new Date(
          parseInt(parts[2], 10),
          parseInt(parts[1], 10) - 1,
          parseInt(parts[0], 10),
        );
      }
    }
    return new Date(input);
  }
  return new Date();
}

export function getSchoolWeekScheduleFromDate(dateInput) {
  const dateObj = parseDateToDateObj(dateInput);
  const monday = getSchoolMonday(dateObj);
  const weekNumber = getISOWeekNumber(monday);

  const schoolDays = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const pad = (n) => String(n).padStart(2, "0");
    const dateVN = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    const dateISO = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    schoolDays.push({
      dateVN,
      dateISO,
      dayOfWeek: i + 1,
      dayLabel: SCHOOL_DAY_LABELS[i + 1],
      isSchoolDay: true,
      dayIndexLabel: `T${i + 2}`,
    });
  }

  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  const pad = (n) => String(n).padStart(2, "0");
  const startVN = `${pad(monday.getDate())}/${pad(monday.getMonth() + 1)}`;
  const endVN = `${pad(friday.getDate())}/${pad(friday.getMonth() + 1)}/${friday.getFullYear()}`;

  const targetDay = dateObj.getDay();
  const isWeekend = targetDay === 0 || targetDay === 6;

  return {
    dateVN: `${pad(dateObj.getDate())}/${pad(dateObj.getMonth() + 1)}/${dateObj.getFullYear()}`,
    dateISO: `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}`,
    dayOfWeek: targetDay === 0 ? 7 : targetDay,
    dayLabel: SCHOOL_DAY_LABELS[targetDay],
    isWeekend,
    isSchoolDay: !isWeekend,
    weekNumber,
    weekRangeLabel: `Tuần ${weekNumber} (T2 ${startVN} – T6 ${endVN})`,
    dayIndexLabel: targetDay >= 1 && targetDay <= 5 ? `T${targetDay + 1}` : (targetDay === 6 ? "T7" : "CN"),
    schoolDays,
  };
}

export function getWeekRelative(dateInput) {
  const target = new Date(dateInput);
  if (isNaN(target.getTime())) return "current";

  const now = new Date();
  const startOfWeek = new Date(now);
  const currentDay = now.getDay() === 0 ? 7 : now.getDay();
  startOfWeek.setDate(now.getDate() - currentDay + 1);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  if (target < startOfWeek) return "prev";
  if (target > endOfWeek) return "next";
  return "current";
}

/**
 * Chuyển trạng thái Backend sang FE
 * Backend: DRAFT, PENDING_APPROVAL, REVISION_REQUIRED, APPROVED
 * FE: DRAFT, PENDING_APPROVAL, REVISION_REQUESTED, APPROVED
 */
export function normalizeStatus(status) {
  if (!status) return "DRAFT";
  if (status === "REVISION_REQUIRED") return "REVISION_REQUESTED";
  return status;
}

export function getStatusLabel(status) {
  const norm = normalizeStatus(status);
  switch (norm) {
    case "APPROVED":
      return "Đã duyệt";
    case "PENDING_APPROVAL":
      return "Chờ BGH duyệt";
    case "REVISION_REQUESTED":
      return "Yêu cầu chỉnh sửa";
    case "DRAFT":
    default:
      return "Bản nháp";
  }
}

export function getDishAllergyState(dish, check) {
  const ingredientIds = dish.ingredientIds || dish.ingredientStandards?.map((line) => line.ingredientId) || [];
  if (!ingredientIds.length) {
    return { status: "unknown", label: "Chưa đủ dữ liệu", description: "Chưa có danh sách nguyên liệu để đối soát." };
  }
  if (check.status === "loading") {
    return { status: "loading", label: "Đang đối soát", description: "Đang đối chiếu hồ sơ dị ứng của các lớp." };
  }
  if (check.status !== "ready") {
    return { status: "unknown", label: "Chưa đối soát", description: "Chưa lấy được kết quả đối chiếu hồ sơ dị ứng." };
  }

  const conflicts = check.conflicts.filter((line) => ingredientIds.includes(line.ingredientId));
  if (conflicts.length) {
    return {
      status: "conflict",
      label: "Có cảnh báo dị ứng",
      description: [...new Set(conflicts.map((line) => line.ingredientName).filter(Boolean))].join(", "),
      classes: [...new Set(conflicts.flatMap((line) => (line.affectedClasses || []).map((group) => group.className)).filter(Boolean))],
    };
  }
  if (ingredientIds.some((id) => !check.ingredientIds.includes(id))) {
    return { status: "unknown", label: "Chưa đủ dữ liệu", description: "Chưa đối soát được đầy đủ nguyên liệu của món." };
  }
  return { status: "clear", label: "Chưa ghi nhận dị ứng", description: "Theo hồ sơ dị ứng của các lớp hiện có." };
}

/**
 * Biến đổi một Tuần thực đơn (WeeklyMenu từ Backend) thành danh sách các ca ăn
 * hiển thị trong bảng MenuListTable
 */
export function adaptWeeklyMenuToCardList(weeklyMenu) {
  if (!weeklyMenu || !weeklyMenu.menuDays) return [];

  const result = [];
  const menuDays = Array.isArray(weeklyMenu.menuDays)
    ? weeklyMenu.menuDays
    : [];

  menuDays.forEach((day) => {
    const dateStr = formatDateVN(day.menuDate);
    const rawDate =
      typeof day.menuDate === "string"
        ? day.menuDate.slice(0, 10)
        : new Date(day.menuDate).toISOString().slice(0, 10);
    const weekCategory = getWeekRelative(day.menuDate);
    const dayStatus = normalizeStatus(day.approvalStatus || weeklyMenu.status);
    const dayStatusLabel = getStatusLabel(dayStatus);

    const dishesByMeal = {
      LUNCH: [],
      AFTERNOON: [],
    };

    if (Array.isArray(day.menuDayDishes)) {
      day.menuDayDishes.forEach((dishRow) => {
        const mealType = dishRow.mealType || "LUNCH";
        const dishItem = {
          id: dishRow.dishId || dishRow.id,
          name: dishRow.Dish?.name || "Món ăn",
          qty: dishRow.ingredients?.[0]
            ? `${Number(dishRow.ingredients[0].quantityPerPortion)}${dishRow.ingredients[0].unit}`
            : "50g",
          ingredients: Array.isArray(dishRow.ingredients)
            ? dishRow.ingredients.map(
                (ing) => ing.ingredient?.name || "Nguyên liệu",
              )
            : [],
        };
        if (dishesByMeal[mealType]) {
          dishesByMeal[mealType].push(dishItem);
        }
      });
    }

    // Seasonings
    const seasoningsByMeal = {
      LUNCH: [],
      AFTERNOON: [],
    };
    if (Array.isArray(day.mealSeasonings)) {
      day.mealSeasonings.forEach((s) => {
        const mType = s.mealType || "LUNCH";
        const sName = s.ingredientEntry?.Ingredient?.name || "Gia vị";
        if (
          seasoningsByMeal[mType] &&
          !seasoningsByMeal[mType].includes(sName)
        ) {
          seasoningsByMeal[mType].push(sName);
        }
      });
    }

    // Portion groups & allergy/substitute
    const portionGroups = Array.isArray(day.portionGroups)
      ? day.portionGroups
      : [];
    const allergyGroup = portionGroups.find((g) => !g.isDefault);

    // Tạo card cho bữa trưa (nếu có món trưa hoặc là bữa mặc định)
    if (dishesByMeal.LUNCH.length > 0 || dishesByMeal.AFTERNOON.length === 0) {
      result.push({
        id: `${weeklyMenu.id}_${day.id}_LUNCH`,
        weeklyMenuId: weeklyMenu.id,
        menuDayId: day.id,
        code: `TD-${rawDate.replace(/-/g, "")}-01`,
        name: weeklyMenu.title || `Thực đơn ${dateStr} (Trưa)`,
        date: dateStr,
        rawDate,
        week: weekCategory,
        mealType: "LUNCH",
        mealTypeLabel: "Trưa",
        targetScope: "Toàn trường (Khối 1 - 5)",
        portionCount: 210,
        hasAllergyMenu: Boolean(allergyGroup),
        allergyNote: allergyGroup ? allergyGroup.name : "Không có",
        status: dayStatus,
        statusLabel: dayStatusLabel,
        feedback: day.note || weeklyMenu.title || "",
        dishes: dishesByMeal.LUNCH,
        substituteDish: allergyGroup
          ? {
              name: "Thịt bò xào rau củ thập cẩm",
              qty: "45g",
              ingredients: ["Thịt bò nạc (Vissan)", "Cà rốt, ngô non"],
            }
          : null,
        seasonings: seasoningsByMeal.LUNCH,
      });
    }

    // Tạo card cho bữa xế (nếu có món xế)
    if (dishesByMeal.AFTERNOON.length > 0) {
      result.push({
        id: `${weeklyMenu.id}_${day.id}_AFTERNOON`,
        weeklyMenuId: weeklyMenu.id,
        menuDayId: day.id,
        code: `TD-${rawDate.replace(/-/g, "")}-02`,
        name: weeklyMenu.title || `Thực đơn ${dateStr} (Chiều)`,
        date: dateStr,
        rawDate,
        week: weekCategory,
        mealType: "AFTERNOON",
        mealTypeLabel: "Chiều",
        targetScope: "Toàn trường (Khối 1 - 5)",
        portionCount: 210,
        hasAllergyMenu: false,
        allergyNote: "Không có",
        status: dayStatus,
        statusLabel: dayStatusLabel,
        feedback: day.note || "",
        dishes: dishesByMeal.AFTERNOON,
        substituteDish: null,
        seasonings: seasoningsByMeal.AFTERNOON,
      });
    }
  });

  return result;
}

/**
 * Biến đổi chi tiết 1 Thực đơn từ Backend thành ViewModel cho trang MenuDetail
 */
export function adaptBackendMenuDetailToView(
  weeklyMenu,
  targetMenuDayId = null,
  targetMealType = "LUNCH",
) {
  if (!weeklyMenu) return null;

  const days = Array.isArray(weeklyMenu.menuDays) ? weeklyMenu.menuDays : [];
  const currentDay =
    (targetMenuDayId ? days.find((d) => d.id === targetMenuDayId) : days[0]) ||
    days[0] ||
    {};

  const dateStr = formatDateVN(currentDay.menuDate || weeklyMenu.weekStartDate);
  const rawDate =
    typeof currentDay.menuDate === "string"
      ? currentDay.menuDate.slice(0, 10)
      : new Date(currentDay.menuDate || weeklyMenu.weekStartDate)
          .toISOString()
          .slice(0, 10);

  const status = normalizeStatus(
    currentDay.approvalStatus || weeklyMenu.status,
  );
  const statusLabel = getStatusLabel(status);

  // Lọc món theo ca ăn
  const dishes = [];
  if (Array.isArray(currentDay.menuDayDishes)) {
    currentDay.menuDayDishes
      .filter((d) => !targetMealType || d.mealType === targetMealType)
      .forEach((d) => {
        dishes.push({
          id: d.dishId || d.id,
          dishId: d.dishId,
          name: d.Dish?.name || "Món ăn",
          qty: d.ingredients?.[0]
            ? `${Number(d.ingredients[0].quantityPerPortion)}${d.ingredients[0].unit}`
            : "50g",
          portionQty: d.ingredients?.[0]
            ? Number(d.ingredients[0].quantityPerPortion)
            : 50,
          unit: d.ingredients?.[0]?.unit || "g",
          ingredients: Array.isArray(d.ingredients)
            ? d.ingredients.map((i) => i.ingredient?.name || "Nguyên liệu")
            : [],
          ingredientIds: Array.isArray(d.ingredients)
            ? d.ingredients.map((i) => i.ingredientId)
            : [],
          ingredientDetails: Array.isArray(d.ingredients)
            ? d.ingredients.map((i) => ({
                id: i.ingredientId,
                name: i.ingredient?.name || "Nguyên liệu",
                category: i.ingredient?.category || "Nguyên liệu",
              }))
            : [],
          ingredientStandards: Array.isArray(d.ingredients)
            ? d.ingredients.map((i) => ({
                ingredientId: i.ingredientId,
                quantityPerPortion: String(i.quantityPerPortion),
                unit: i.unit,
              }))
            : [],
        });
      });
  }

  // Gia vị
  const seasonings = [];
  if (Array.isArray(currentDay.mealSeasonings)) {
    currentDay.mealSeasonings
      .filter((s) => !targetMealType || s.mealType === targetMealType)
      .forEach((s) => {
        const name =
          s.ingredientEntry?.Ingredient?.name ||
          s.ingredientEntry?.ingredient?.name ||
          s.Ingredient?.name ||
          s.ingredient?.name ||
          "Gia vị";
        seasonings.push({
          id: s.ingredientEntryId,
          ingredientEntryId: s.ingredientEntryId,
          catalogId: s.ingredientEntryId,
          name,
          portionQty: Number(s.quantityPerPortion),
          quantityPerPortion: String(s.quantityPerPortion),
          unit: s.unit,
        });
      });
  }

  // Suất riêng / dị ứng
  const portionGroups = Array.isArray(currentDay.portionGroups)
    ? currentDay.portionGroups
    : [];
  const allergyGroup = portionGroups.find((g) => !g.isDefault);

  return {
    id: weeklyMenu.id,
    weeklyMenuId: weeklyMenu.id,
    menuDayId: currentDay.id,
    code: `TD-${rawDate.replace(/-/g, "")}-${targetMealType === "AFTERNOON" ? "02" : "01"}`,
    name: weeklyMenu.title || `Thực đơn ${dateStr}`,
    date: dateStr,
    rawDate,
    mealType: targetMealType,
    weeklyStatus: normalizeStatus(weeklyMenu.status),
    hasMeal: dishes.length > 0 || seasonings.length > 0,
    mealTypeLabel: targetMealType === "AFTERNOON" ? "Chiều" : "Trưa",
    targetScope: "Toàn trường (Khối 1 - 5)",
    portionCount: 210,
    hasAllergyMenu: Boolean(allergyGroup),
    allergyNote: allergyGroup ? allergyGroup.name : "Không có",
    status,
    statusLabel,
    feedback:
      currentDay.note ||
      (status === "REVISION_REQUESTED"
        ? "Ban Giám Hiệu: Cần điều chỉnh thực đơn phù hợp nhu cầu dinh dưỡng và dị ứng học sinh."
        : ""),
    dishes,
    substituteDish: allergyGroup
      ? {
          name: "Thịt bò xào rau củ thập cẩm",
          qty: "45g",
          ingredients: ["Thịt bò nạc loại 1 (Vissan)", "Cà rốt, ngô non"],
        }
      : null,
    seasonings,
    allDays: days.map((d) => ({
      id: d.id,
      date: formatDateVN(d.menuDate),
      rawDate:
        typeof d.menuDate === "string"
          ? d.menuDate.slice(0, 10)
          : new Date(d.menuDate).toISOString().slice(0, 10),
      status: normalizeStatus(d.approvalStatus),
    })),
  };
}

/**
 * Biến đổi Form tạo mới/sửa thực đơn sang Backend validateMenuWrite Payload
 */
export function adaptFormToBackendWrite({
  name,
  date,
  mealType = "LUNCH",
  notes = null,
  dishes = [],
  seasonings = [],
}) {
  const normalizedMealType =
    mealType === "AFTERNOON_SNACK" ? "AFTERNOON" : mealType;
  const menuDateISO = parseDateVNToISO(date);
  const menuDateObj = new Date(menuDateISO);

  // Xác định ngày thứ Hai đầu tuần (weekStartDate)
  const dayOfWeek = menuDateObj.getUTCDay() === 0 ? 7 : menuDateObj.getUTCDay();
  const monday = new Date(menuDateObj);
  monday.setUTCDate(menuDateObj.getUTCDate() - dayOfWeek + 1);
  monday.setUTCHours(0, 0, 0, 0);
  const weekStartDateISO = monday.toISOString().slice(0, 10);

  // Chuyển đổi danh sách món ăn
  const mappedDishes = dishes
    .filter((d) => (d.name || "").trim().length > 0)
    .map((d) => {
      const dishObj = {};
      if (d.dishId) {
        dishObj.dishId = d.dishId;
      } else {
        dishObj.name = (d.name || "").trim();
      }

      // Ingredients
      const ingIds =
        d.ingredientIds || (d.ingredientId ? [d.ingredientId] : []);
      const qtyStr = String(d.portionQty || 50);
      const unitStr = (d.unit || "g").trim().toLowerCase();

      dishObj.ingredients = Array.isArray(d.ingredientStandards)
        ? d.ingredientStandards.map((standard) => ({
            ingredientId: standard.ingredientId,
            quantityPerPortion: String(standard.quantityPerPortion),
            unit: standard.unit,
          }))
        : ingIds.map((id) => ({
            ingredientId: id,
            quantityPerPortion: qtyStr,
            unit: unitStr,
          }));

      return dishObj;
    });

  // Gia vị
  const isEntryId = (value) => /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value || "");
  const mappedSeasonings = seasonings
    .filter((s) => s && (s.ingredientEntryId || s.catalogId || s.name?.trim() || isEntryId(s.id)))
    .map((s) => {
      const ingredientEntryId = s.ingredientEntryId || s.catalogId || s.id;
      if (!isEntryId(ingredientEntryId)) {
        throw new Error(`Vui lòng chọn lại gia vị “${s.name || "chưa chọn"}” từ kho trường.`);
      }
      return {
        ingredientEntryId,
        quantityPerPortion: String(s.portionQty ?? s.quantityPerPortion ?? s.defaultQty ?? 5),
        unit: (s.unit || "g").trim().toLowerCase(),
      };
    });
  if (new Set(mappedSeasonings.map((s) => s.ingredientEntryId)).size !== mappedSeasonings.length) {
    throw new Error("Mỗi gia vị chỉ được khai báo một lần trong bữa ăn.");
  }

  return {
    weekStartDate: weekStartDateISO,
    title: name.trim(),
    days: [
      {
        menuDate: menuDateISO,
        note: notes ? notes.trim() : null,
        meals: [
          {
            mealType: normalizedMealType,
            dishes: mappedDishes,
            seasonings: mappedSeasonings,
          },
        ],
      },
    ],
  };
}
