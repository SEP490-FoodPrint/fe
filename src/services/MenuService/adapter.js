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

export function getDateOfISOWeek(w, y) {
  const simple = new Date(Date.UTC(y, 0, 1 + (w - 1) * 7));
  const dow = simple.getUTCDay();
  const ISOweekStart = new Date(simple);
  if (dow <= 4) {
    if (dow === 0) ISOweekStart.setUTCDate(simple.getUTCDate() - 6);
    else ISOweekStart.setUTCDate(simple.getUTCDate() - dow + 1);
  } else {
    ISOweekStart.setUTCDate(simple.getUTCDate() + (8 - dow));
  }
  return ISOweekStart;
}

export function getWeeksOfYear(year) {
  const weeks = [];
  const p = (y) => (y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400)) % 7;
  const numWeeks = (p(year) === 4 || p(year - 1) === 3) ? 53 : 52;
  const pad = (n) => String(n).padStart(2, "0");

  for (let w = 1; w <= numWeeks; w++) {
    const monday = getDateOfISOWeek(w, year);
    const friday = new Date(monday);
    friday.setUTCDate(friday.getUTCDate() + 4);
    const mStr = `${pad(monday.getUTCDate())}/${pad(monday.getUTCMonth() + 1)}`;
    const fStr = `${pad(friday.getUTCDate())}/${pad(friday.getUTCMonth() + 1)}`;
    weeks.push({
      weekNumber: w,
      year,
      startDate: monday,
      fridayDate: friday,
      label: `Tuần ${w} (${mStr} – ${fStr}/${year})`,
      shortLabel: `Tuần ${w}`,
      dateRangeLabel: `${mStr} – ${fStr}/${year}`,
      startVN: mStr,
      endVN: fStr,
    });
  }
  return weeks;
}

/**
 * Cấu hình năm học toàn trường & ngày nghỉ do BGH thiết lập
 * Bám sát DB PostgreSQL FoodPrint v5.4: bảng `foodprint.school_academic_years`
 * (id, school_id, academic_year, start_date, end_date, holidays JSONB)
 */
export const MOCK_SCHOOL_ACADEMIC_YEARS = [
  {
    id: "ay-2026-2027",
    schoolId: "sch-foodprint-001",
    academicYear: "2026-2027",
    label: "Năm học 2026 - 2027",
    startDate: "2026-09-07", // Thứ Hai, 07/09/2026
    endDate: "2027-05-28",   // Thứ Sáu, 28/05/2027
    isCurrent: true,
    holidays: [
      {
        date: "2026-09-02",
        reason: "Nghỉ lễ: Quốc khánh (02/09)",
        type: "NATIONAL_HOLIDAY",
      },
      {
        date: "2026-11-06",
        reason: "Hội thao học sinh toàn trường",
        type: "BGH_EVENT",
      },
      {
        date: "2026-11-20",
        reason: "Nghỉ lễ: Ngày Nhà giáo Việt Nam (20/11)",
        type: "NATIONAL_HOLIDAY",
      },
      {
        date: "2027-01-01",
        reason: "Nghỉ lễ: Tết Dương lịch 2027",
        type: "NATIONAL_HOLIDAY",
      },
      {
        date: "2027-04-30",
        reason: "Nghỉ lễ: Ngày Giải phóng miền Nam (30/04)",
        type: "NATIONAL_HOLIDAY",
      },
      {
        date: "2027-05-01",
        reason: "Nghỉ lễ: Quốc tế Lao động (01/05)",
        type: "NATIONAL_HOLIDAY",
      },
    ],
  },
  {
    id: "ay-2025-2026",
    schoolId: "sch-foodprint-001",
    academicYear: "2025-2026",
    label: "Năm học 2025 - 2026",
    startDate: "2025-09-08",
    endDate: "2026-05-29",
    isCurrent: false,
    holidays: [
      {
        date: "2025-09-02",
        reason: "Nghỉ lễ: Quốc khánh",
        type: "NATIONAL_HOLIDAY",
      },
      {
        date: "2025-11-20",
        reason: "Nghỉ lễ: Ngày Nhà giáo Việt Nam",
        type: "NATIONAL_HOLIDAY",
      },
      {
        date: "2026-01-01",
        reason: "Nghỉ lễ: Tết Dương lịch",
        type: "NATIONAL_HOLIDAY",
      },
    ],
  },
];

/**
 * Tạo danh sách tuần học thực tế trong một năm học dựa trên khoảng thời gian
 * BGH đã setup (từ startDate đến endDate).
 */
export function getWeeksOfAcademicYear(academicYearConfig) {
  if (!academicYearConfig || !academicYearConfig.startDate || !academicYearConfig.endDate) {
    return [];
  }

  const pad = (n) => String(n).padStart(2, "0");
  const weeks = [];

  const startParts = academicYearConfig.startDate.split("-").map(Number);
  const endParts = academicYearConfig.endDate.split("-").map(Number);

  let currentMonday = new Date(Date.UTC(startParts[0], startParts[1] - 1, startParts[2]));
  const dayOfWeek = currentMonday.getUTCDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  currentMonday.setUTCDate(currentMonday.getUTCDate() + diffToMonday);

  const endLimit = new Date(Date.UTC(endParts[0], endParts[1] - 1, endParts[2]));
  const endDow = endLimit.getUTCDay();
  if (endDow !== 5) {
    const diffToFriday = endDow === 0 ? -2 : (5 - endDow);
    endLimit.setUTCDate(endLimit.getUTCDate() + diffToFriday);
  }

  const now = new Date();
  const currentWeekISO = getISOWeekNumber(now);
  const currentYearNum = now.getFullYear();

  let weekIndex = 1;

  while (currentMonday <= endLimit) {
    const monday = new Date(currentMonday);
    const friday = new Date(currentMonday);
    friday.setUTCDate(friday.getUTCDate() + 4);

    const mStr = `${pad(monday.getUTCDate())}/${pad(monday.getUTCMonth() + 1)}`;
    const fStr = `${pad(friday.getUTCDate())}/${pad(friday.getUTCMonth() + 1)}`;
    const mYear = monday.getUTCFullYear();
    const fYear = friday.getUTCFullYear();
    const yearDisplay = mYear === fYear ? String(mYear) : `${mYear}–${fYear}`;

    const isoWeek = getISOWeekNumber(monday);
    const isThisWeek = (isoWeek === currentWeekISO && mYear === currentYearNum);

    const mondayISO = `${monday.getUTCFullYear()}-${pad(monday.getUTCMonth() + 1)}-${pad(monday.getUTCDate())}`;
    const fridayISO = `${friday.getUTCFullYear()}-${pad(friday.getUTCMonth() + 1)}-${pad(friday.getUTCDate())}`;

    weeks.push({
      weekIndex,
      isoWeek,
      weekNumber: isoWeek,
      year: mYear,
      startDate: monday,
      fridayDate: friday,
      startDateISO: mondayISO,
      endDateISO: fridayISO,
      startVN: mStr,
      endVN: fStr,
      isCurrentWeek: isThisWeek,
      label: isThisWeek
        ? `Tuần ${weekIndex} (${mStr} – ${fStr}/${yearDisplay}) — Tuần này`
        : `Tuần ${weekIndex} (${mStr} – ${fStr}/${yearDisplay})`,
      shortLabel: `Tuần ${weekIndex}`,
      key: `AYW_${weekIndex}_${mYear}_${isoWeek}`,
    });

    currentMonday.setUTCDate(currentMonday.getUTCDate() + 7);
    weekIndex++;
  }

  return weeks;
}

export function getMenuDateObj(menu) {
  if (!menu) return new Date();
  if (menu.rawDate) {
    const parts = menu.rawDate.split("-");
    if (parts.length === 3) {
      return new Date(Date.UTC(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)));
    }
  }
  if (menu.date) {
    const parts = menu.date.split("/");
    if (parts.length === 3) {
      return new Date(Date.UTC(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10)));
    }
  }
  return new Date();
}

export function getMenuYear(menu) {
  return getMenuDateObj(menu).getUTCFullYear();
}

export function getMenuISOWeek(menu) {
  return getISOWeekNumber(getMenuDateObj(menu));
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
  return { status: "clear", label: "Chưa ghi nhận dị ứng", description: "" };
}

/**
 * Biến đổi một Tuần thực đơn (WeeklyMenu từ Backend) thành danh sách các ca ăn
 * hiển thị trong bảng MenuListTable
 */
function selectedGroupDish(day, group) {
  const chosen = (day.menuDayDishes || []).find(row =>
    row.mealType === group?.mealType && group?.dishes?.some(item => item.dishId === row.dishId)
  );
  if (!chosen) return null;
  return {
    dishId: chosen.dishId,
    name: chosen.Dish?.name || "",
    qty: chosen.ingredients?.[0] ? `${chosen.ingredients[0].quantityPerPortion}${chosen.ingredients[0].unit}` : "",
    ingredients: (chosen.ingredients || []).map(line => line.ingredient?.name).filter(Boolean),
    ingredientDetails: (chosen.ingredients || []).map(line => ({
      name: line.ingredient?.name || "",
      quantityPerPortion: line.quantityPerPortion != null ? Number(line.quantityPerPortion) : null,
      unit: line.unit || line.ingredient?.defaultUnit || "g",
    })),
  };
}

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
        substituteDish: selectedGroupDish(day, portionGroups.find(group => !group.isDefault && group.mealType === "LUNCH")),
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
        hasAllergyMenu: portionGroups.some(group => !group.isDefault && group.mealType === "AFTERNOON"),
        allergyNote: portionGroups.find(group => !group.isDefault && group.mealType === "AFTERNOON")?.name || "Không có",
        status: dayStatus,
        statusLabel: dayStatusLabel,
        feedback: day.note || "",
        dishes: dishesByMeal.AFTERNOON,
        substituteDish: selectedGroupDish(day, portionGroups.find(group => !group.isDefault && group.mealType === "AFTERNOON")),
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
                category: i.ingredient?.ingredientCategory?.categoryName || i.ingredient?.category || "Nguyên liệu",
                quantityPerPortion: i.quantityPerPortion != null ? Number(i.quantityPerPortion) : null,
                unit: i.unit || i.ingredient?.defaultUnit || "g",
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

  // Định dạng tiêu đề theo quy tắc thực đơn tuần và khối lớp
  const targetScope = "Toàn trường (Khối 1 - 5)";
  const weekMatch = (weeklyMenu.title || "").match(/tuần\s*(\d+)/i);
  let weekNum = weekMatch ? weekMatch[1] : null;
  if (!weekNum) {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      const dayNr = (target.getUTCDay() + 6) % 7;
      target.setUTCDate(target.getUTCDate() - dayNr + 3);
      const firstThursday = target.getTime();
      target.setUTCMonth(0, 1);
      if (target.getUTCDay() !== 4) {
        target.setUTCMonth(0, 1 + ((4 - target.getUTCDay()) + 7) % 7);
      }
      weekNum = 1 + Math.ceil((firstThursday - target.getTime()) / 604800000);
    }
  }
  const gradeMatch = targetScope.match(/\((Khối[^)]+)\)/i);
  const gradeText = gradeMatch ? gradeMatch[1] : "Khối 1 - 5";
  const formattedTitle = weekNum ? `Thực đơn tuần ${weekNum} - ${gradeText}` : `Thực đơn tuần - ${gradeText}`;

  return {
    id: weeklyMenu.id,
    weeklyMenuId: weeklyMenu.id,
    menuDayId: currentDay.id,
    code: `TD-${rawDate.replace(/-/g, "")}-${targetMealType === "AFTERNOON" ? "02" : "01"}`,
    name: formattedTitle,
    rawWeeklyTitle: weeklyMenu.title || "",
    date: dateStr,
    rawDate,
    mealType: targetMealType,
    notes: currentDay.note ?? "",
    weeklyStatus: normalizeStatus(weeklyMenu.status),
    hasMeal: dishes.length > 0 || seasonings.length > 0,
    mealTypeLabel: targetMealType === "AFTERNOON" ? "Chiều" : "Trưa",
    targetScope,
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
    substituteDish: selectedGroupDish(currentDay, portionGroups.find(group => !group.isDefault && group.mealType === targetMealType)),
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
      const qtyStr = String(d.portionQty ?? "");
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
        quantityPerPortion: String(s.portionQty ?? s.quantityPerPortion ?? ""),
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

// The backend PUT contract replaces all days, so merge a meal into a fresh snapshot.
export function menuWeekMeals(snapshot) {
  return (snapshot.menuDays || []).map(day => {
    const meals = {};
    const seasoningsByMeal = {};
    for (const mealType of ["LUNCH", "AFTERNOON"]) {
      meals[mealType] = { dishes: (day.menuDayDishes || []).filter(row => row.mealType === mealType).map(row => ({
        id: row.dishId,
        dishId: row.dishId,
        name: row.Dish?.name || "",
        ingredientIds: (row.ingredients || []).map(line => line.ingredientId),
        ingredientStandards: (row.ingredients || []).map(line => ({ ingredientId: line.ingredientId, quantityPerPortion: String(line.quantityPerPortion), unit: line.unit })),
        ingredientDetails: (row.ingredients || []).map(line => ({ id: line.ingredientId, name: line.ingredient?.name || "" })),
        ingredients: (row.ingredients || []).map(line => ({ name: line.ingredient?.name || "", quantityPerPortion: String(line.quantityPerPortion), unit: line.unit })),
        portionQty: row.ingredients?.[0]?.quantityPerPortion ?? "",
        unit: row.ingredients?.[0]?.unit ?? "",
      })) };
      seasoningsByMeal[mealType] = (day.mealSeasonings || []).filter(row => row.mealType === mealType).map(row => ({
        id: row.ingredientEntryId, ingredientEntryId: row.ingredientEntryId,
        catalogId: row.ingredientEntryId, name: row.ingredientEntry?.Ingredient?.name || "",
        portionQty: String(row.quantityPerPortion), quantityPerPortion: String(row.quantityPerPortion), unit: row.unit,
      }));
    }
    return { date: day.menuDate.slice(0, 10), menuDayId: day.id, meals, seasoningsByMeal, seasonings: seasoningsByMeal.LUNCH };
  });
}

export function mergeMenuMealWrite(snapshot, edited, selectedId) {
  if (!snapshot?.id || !Array.isArray(snapshot.menuDays)) {
    throw new Error("Không tải được đầy đủ thực đơn tuần; chưa lưu thay đổi.");
  }
  if (!["DRAFT", "REVISION_REQUIRED"].includes(snapshot.status)) {
    throw new Error("Thực đơn đã gửi duyệt hoặc đã duyệt, không thể sửa.");
  }
  const incomingDay = edited.days[0];
  const selectedDayId = selectedId?.split("_")[1];
  const originalDay = snapshot.menuDays.find(day => day.id === selectedDayId);
  if (selectedDayId && (!originalDay || originalDay.menuDate.slice(0, 10) !== incomingDay.menuDate)) {
    throw new Error("Vui lòng mở đúng ngày thực đơn cần sửa từ danh sách.");
  }
  const weekStartDate = snapshot.weekStartDate.slice(0, 10);
  if (weekStartDate !== edited.weekStartDate) {
    throw new Error("Không thể chuyển bữa ăn sang tuần khác bằng thao tác sửa.");
  }
  const days = snapshot.menuDays.map(day => ({
    menuDate: day.menuDate.slice(0, 10),
    note: day.note ?? null,
    meals: [...new Set(day.menuDayDishes.map(dish => dish.mealType))].map(mealType => ({
      mealType,
      dishes: day.menuDayDishes.filter(dish => dish.mealType === mealType).map(dish => ({
        dishId: dish.dishId,
        ingredients: (dish.ingredients || []).map(line => ({
          ingredientId: line.ingredientId,
          quantityPerPortion: String(line.quantityPerPortion),
          unit: line.unit,
        })),
      })),
      seasonings: (day.mealSeasonings || []).filter(line => line.mealType === mealType).map(line => ({
        ingredientEntryId: line.ingredientEntryId,
        quantityPerPortion: String(line.quantityPerPortion),
        unit: line.unit,
      })),
    })),
  }));
  const target = days.find(day => day.menuDate === incomingDay.menuDate);
  if (!target) throw new Error("Không tìm thấy ngày thực đơn cần sửa.");
  target.note = incomingDay.note;
  target.meals = [
    ...target.meals.filter(meal => !incomingDay.meals.some(editedMeal => editedMeal.mealType === meal.mealType)),
    ...incomingDay.meals,
  ];
  return { weekStartDate, title: edited.title, days };
}
