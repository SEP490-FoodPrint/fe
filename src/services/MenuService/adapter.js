/**
 * Adapter module: Chuẩn hóa dữ liệu giữa Backend Prisma Schema và Giao diện Frontend
 * Giúp các View (MenuPlanning, MenuDetail, CreateMenu, EditMenu) hoạt động trơn tru
 * với dữ liệu thực từ Azure PostgreSQL cũng như Mock fallback.
 */

/**
 * Định dạng ngày ISO -> DD/MM/YYYY
 */
export function formatDateVN(dateInput) {
  if (!dateInput) return ""
  const d = new Date(dateInput)
  if (isNaN(d.getTime())) return String(dateInput)
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * Định dạng ngày DD/MM/YYYY -> ISO (YYYY-MM-DDTHH:mm:ss.sssZ)
 */
export function parseDateVNToISO(vnDateStr) {
  if (!vnDateStr) return new Date().toISOString()
  if (vnDateStr.includes("T")) return vnDateStr
  const parts = vnDateStr.split("/")
  if (parts.length === 3) {
    const d = parseInt(parts[0], 10)
    const m = parseInt(parts[1], 10) - 1
    const y = parseInt(parts[2], 10)
    return new Date(Date.UTC(y, m, d, 0, 0, 0)).toISOString()
  }
  return new Date(vnDateStr).toISOString()
}

/**
 * Xác định tuần so với hiện tại ('current', 'next', 'prev')
 */
export function getWeekRelative(dateInput) {
  const target = new Date(dateInput)
  if (isNaN(target.getTime())) return "current"

  const now = new Date()
  const startOfWeek = new Date(now)
  const currentDay = now.getDay() === 0 ? 7 : now.getDay()
  startOfWeek.setDate(now.getDate() - currentDay + 1)
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  if (target < startOfWeek) return "prev"
  if (target > endOfWeek) return "next"
  return "current"
}

/**
 * Chuyển trạng thái Backend sang FE
 * Backend: DRAFT, PENDING_APPROVAL, REVISION_REQUIRED, APPROVED
 * FE: DRAFT, PENDING_APPROVAL, REVISION_REQUESTED, APPROVED
 */
export function normalizeStatus(status) {
  if (!status) return "DRAFT"
  if (status === "REVISION_REQUIRED") return "REVISION_REQUESTED"
  return status
}

export function getStatusLabel(status) {
  const norm = normalizeStatus(status)
  switch (norm) {
    case "APPROVED":
      return "Đã duyệt"
    case "PENDING_APPROVAL":
      return "Chờ BGH duyệt"
    case "REVISION_REQUESTED":
      return "Yêu cầu chỉnh sửa"
    case "DRAFT":
    default:
      return "Bản nháp"
  }
}

/**
 * Biến đổi một Tuần thực đơn (WeeklyMenu từ Backend) thành danh sách các ca ăn
 * hiển thị trong bảng MenuListTable
 */
export function adaptWeeklyMenuToCardList(weeklyMenu) {
  if (!weeklyMenu || !weeklyMenu.menuDays) return []

  const result = []
  const menuDays = Array.isArray(weeklyMenu.menuDays) ? weeklyMenu.menuDays : []

  menuDays.forEach(day => {
    const dateStr = formatDateVN(day.menuDate)
    const rawDate = typeof day.menuDate === "string" ? day.menuDate.slice(0, 10) : new Date(day.menuDate).toISOString().slice(0, 10)
    const weekCategory = getWeekRelative(day.menuDate)
    const dayStatus = normalizeStatus(day.approvalStatus || weeklyMenu.status)
    const dayStatusLabel = getStatusLabel(dayStatus)

    const dishesByMeal = {
      LUNCH: [],
      AFTERNOON: []
    }

    if (Array.isArray(day.menuDayDishes)) {
      day.menuDayDishes.forEach(dishRow => {
        const mealType = dishRow.mealType || "LUNCH"
        const dishItem = {
          id: dishRow.dishId || dishRow.id,
          name: dishRow.Dish?.name || "Món ăn",
          qty: dishRow.ingredients?.[0]
            ? `${Number(dishRow.ingredients[0].quantityPerPortion)}${dishRow.ingredients[0].unit}`
            : "50g",
          ingredients: Array.isArray(dishRow.ingredients)
            ? dishRow.ingredients.map(ing => ing.ingredient?.name || "Nguyên liệu")
            : []
        }
        if (dishesByMeal[mealType]) {
          dishesByMeal[mealType].push(dishItem)
        }
      })
    }

    // Seasonings
    const seasoningsByMeal = {
      LUNCH: [],
      AFTERNOON: []
    }
    if (Array.isArray(day.mealSeasonings)) {
      day.mealSeasonings.forEach(s => {
        const mType = s.mealType || "LUNCH"
        const sName = s.ingredientEntry?.Ingredient?.name || "Gia vị"
        if (seasoningsByMeal[mType] && !seasoningsByMeal[mType].includes(sName)) {
          seasoningsByMeal[mType].push(sName)
        }
      })
    }

    // Portion groups & allergy/substitute
    const portionGroups = Array.isArray(day.portionGroups) ? day.portionGroups : []
    const allergyGroup = portionGroups.find(g => !g.isDefault)

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
              ingredients: ["Thịt bò nạc (Vissan)", "Cà rốt, ngô non"]
            }
          : null,
        seasonings: seasoningsByMeal.LUNCH
      })
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
        seasonings: seasoningsByMeal.AFTERNOON
      })
    }
  })

  return result
}

/**
 * Biến đổi chi tiết 1 Thực đơn từ Backend thành ViewModel cho trang MenuDetail
 */
export function adaptBackendMenuDetailToView(weeklyMenu, targetMenuDayId = null, targetMealType = "LUNCH") {
  if (!weeklyMenu) return null

  const days = Array.isArray(weeklyMenu.menuDays) ? weeklyMenu.menuDays : []
  const currentDay = (targetMenuDayId ? days.find(d => d.id === targetMenuDayId) : days[0]) || days[0] || {}

  const dateStr = formatDateVN(currentDay.menuDate || weeklyMenu.weekStartDate)
  const rawDate = typeof currentDay.menuDate === "string"
    ? currentDay.menuDate.slice(0, 10)
    : new Date(currentDay.menuDate || weeklyMenu.weekStartDate).toISOString().slice(0, 10)

  const status = normalizeStatus(currentDay.approvalStatus || weeklyMenu.status)
  const statusLabel = getStatusLabel(status)

  // Lọc món theo ca ăn
  const dishes = []
  if (Array.isArray(currentDay.menuDayDishes)) {
    currentDay.menuDayDishes
      .filter(d => !targetMealType || d.mealType === targetMealType)
      .forEach(d => {
        dishes.push({
          id: d.dishId || d.id,
          name: d.Dish?.name || "Món ăn",
          qty: d.ingredients?.[0]
            ? `${Number(d.ingredients[0].quantityPerPortion)}${d.ingredients[0].unit}`
            : "50g",
          portionQty: d.ingredients?.[0] ? Number(d.ingredients[0].quantityPerPortion) : 50,
          unit: d.ingredients?.[0]?.unit || "g",
          ingredients: Array.isArray(d.ingredients)
            ? d.ingredients.map(i => i.ingredient?.name || "Nguyên liệu")
            : [],
          ingredientIds: Array.isArray(d.ingredients)
            ? d.ingredients.map(i => i.ingredientId)
            : []
        })
      })
  }

  // Gia vị
  const seasonings = []
  if (Array.isArray(currentDay.mealSeasonings)) {
    currentDay.mealSeasonings
      .filter(s => !targetMealType || s.mealType === targetMealType)
      .forEach(s => {
        const name = s.ingredientEntry?.Ingredient?.name || "Gia vị"
        if (!seasonings.includes(name)) seasonings.push(name)
      })
  }

  // Suất riêng / dị ứng
  const portionGroups = Array.isArray(currentDay.portionGroups) ? currentDay.portionGroups : []
  const allergyGroup = portionGroups.find(g => !g.isDefault)

  return {
    id: weeklyMenu.id,
    weeklyMenuId: weeklyMenu.id,
    menuDayId: currentDay.id,
    code: `TD-${rawDate.replace(/-/g, "")}-${targetMealType === "AFTERNOON" ? "02" : "01"}`,
    name: weeklyMenu.title || `Thực đơn ${dateStr}`,
    date: dateStr,
    rawDate,
    mealType: targetMealType,
    mealTypeLabel: targetMealType === "AFTERNOON" ? "Chiều" : "Trưa",
    targetScope: "Toàn trường (Khối 1 - 5)",
    portionCount: 210,
    hasAllergyMenu: Boolean(allergyGroup),
    allergyNote: allergyGroup ? allergyGroup.name : "Không có",
    status,
    statusLabel,
    feedback: currentDay.note || (status === "REVISION_REQUESTED" ? "Ban Giám Hiệu: Cần điều chỉnh thực đơn phù hợp nhu cầu dinh dưỡng và dị ứng học sinh." : ""),
    dishes,
    substituteDish: allergyGroup
      ? {
          name: "Thịt bò xào rau củ thập cẩm",
          qty: "45g",
          ingredients: ["Thịt bò nạc loại 1 (Vissan)", "Cà rốt, ngô non"]
        }
      : null,
    seasonings,
    allDays: days.map(d => ({
      id: d.id,
      date: formatDateVN(d.menuDate),
      rawDate: typeof d.menuDate === "string" ? d.menuDate.slice(0, 10) : new Date(d.menuDate).toISOString().slice(0, 10),
      status: normalizeStatus(d.approvalStatus)
    }))
  }
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
  seasonings = []
}) {
  const menuDateISO = parseDateVNToISO(date)
  const menuDateObj = new Date(menuDateISO)

  // Xác định ngày thứ Hai đầu tuần (weekStartDate)
  const dayOfWeek = menuDateObj.getUTCDay() === 0 ? 7 : menuDateObj.getUTCDay()
  const monday = new Date(menuDateObj)
  monday.setUTCDate(menuDateObj.getUTCDate() - dayOfWeek + 1)
  monday.setUTCHours(0, 0, 0, 0)
  const weekStartDateISO = monday.toISOString()

  // Chuyển đổi danh sách món ăn
  const mappedDishes = dishes
    .filter(d => (d.name || "").trim().length > 0)
    .map(d => {
      const dishObj = {}
      if (d.dishId) {
        dishObj.dishId = d.dishId
      } else {
        dishObj.name = (d.name || "").trim()
      }

      // Ingredients
      const ingIds = d.ingredientIds || (d.ingredientId ? [d.ingredientId] : [])
      const qtyStr = String(d.portionQty || 50)
      const unitStr = (d.unit || "g").trim().toLowerCase()

      dishObj.ingredients = ingIds.map(id => ({
        ingredientId: id,
        quantityPerPortion: qtyStr,
        unit: unitStr
      }))

      return dishObj
    })

  // Gia vị
  const mappedSeasonings = seasonings
    .filter(s => s && (s.ingredientEntryId || s.id))
    .map(s => ({
      ingredientEntryId: s.ingredientEntryId || s.id,
      quantityPerPortion: String(s.quantityPerPortion || s.defaultQty || 5),
      unit: (s.unit || "g").trim().toLowerCase()
    }))

  return {
    weekStartDate: weekStartDateISO,
    title: name.trim(),
    days: [
      {
        menuDate: menuDateISO,
        note: notes ? notes.trim() : null,
        meals: [
          {
            mealType,
            dishes: mappedDishes,
            seasonings: mappedSeasonings
          }
        ]
      }
    ]
  }
}

