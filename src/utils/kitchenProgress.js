// Cảnh báo tiến độ chế biến theo khối và khung giờ ăn (giờ Việt Nam).
// - Còn ≤ 90 phút đến giờ ăn mà khối chưa nấu xong: cảnh báo vàng.
// - Còn ≤ 30 phút hoặc đã quá giờ ăn: cảnh báo đỏ.
// - Đã nấu xong nhưng chưa lưu đủ mẫu: luôn nhắc (cam), không phụ thuộc giờ.
export const WARN_BEFORE_MINUTES = 90
export const DANGER_BEFORE_MINUTES = 30

const MEAL_NAME = { LUNCH: "bữa trưa", AFTERNOON: "bữa xế" }
const LEVEL_ORDER = { danger: 0, warning: 1, sample: 2 }

export const vietnamMinutes = (now = Date.now()) => {
  const date = new Date(now + 7 * 3600 * 1000)
  return date.getUTCHours() * 60 + date.getUTCMinutes()
}

const clockMinutes = (value) => {
  const match = /^(\d{2}):(\d{2})$/.exec(String(value || ""))
  return match ? Number(match[1]) * 60 + Number(match[2]) : null
}

/** Tên phạm vi của một thực đơn trong ngày: các khối hoặc "Toàn trường". */
export const progressMenuLabel = (menu) =>
  menu?.isSchoolWide || !menu?.grades?.length
    ? "Toàn trường"
    : menu.grades.map((grade) => grade.name).join(", ")

export const PROGRESS_STATUS_TEXT = {
  NOT_STARTED: "Chưa nấu",
  IN_PROGRESS: "Đang nấu",
  COOKED_NO_SAMPLE: "Chưa lưu mẫu",
  DONE: "Xong",
}

const dishList = (names) => (names.length ? ` (${names.slice(0, 3).join(", ")}${names.length > 3 ? ", …" : ""})` : "")

/**
 * Danh sách cảnh báo hiện trên màn tiến độ chế biến, nặng nhất trước.
 * mealTimes: { lunch: "HH:MM", afternoon: "HH:MM" } theo cấu hình BGH.
 */
export function kitchenProgressAlerts(progress, mealTimes, now = Date.now()) {
  const current = vietnamMinutes(now)
  const alerts = []
  for (const menu of progress?.menus || []) {
    const label = progressMenuLabel(menu)
    for (const meal of menu.meals || []) {
      if (meal.status === "DONE") continue
      const mealName = MEAL_NAME[meal.mealType] || "bữa ăn"
      const base = { menuId: menu.menuId, mealType: meal.mealType }
      const unfinished = meal.notStarted + meal.cooking
      if (unfinished > 0) {
        const time = mealTimes?.[meal.mealType === "LUNCH" ? "lunch" : "afternoon"]
        const mealAt = clockMinutes(time)
        if (mealAt !== null) {
          const left = mealAt - current
          const what =
            meal.status === "NOT_STARTED"
              ? "chưa bắt đầu nấu"
              : `còn ${unfinished}/${meal.dishCount} món chưa nấu xong`
          const pendingNames = (meal.pendingDishes || [])
            .filter((dish) => dish.status === "NOT_STARTED" || dish.status === "IN_PROGRESS")
            .map((dish) => dish.name)
          if (left < 0)
            alerts.push({ ...base, level: "danger", text: `Quá giờ ăn ${mealName} (${time}): ${label} ${what}${dishList(pendingNames)}.` })
          else if (left <= WARN_BEFORE_MINUTES)
            alerts.push({
              ...base,
              level: left <= DANGER_BEFORE_MINUTES ? "danger" : "warning",
              text: `Còn ${left} phút đến giờ ăn ${mealName} (${time}): ${label} ${what}${dishList(pendingNames)}.`,
            })
        }
      }
      if (meal.cookedNoSample > 0)
        alerts.push({
          ...base,
          level: "sample",
          text: `${label} · ${mealName}: ${meal.cookedNoSample} món đã nấu xong nhưng chưa lưu đủ mẫu 24h${dishList(
            (meal.pendingDishes || []).filter((dish) => dish.status === "COOKED_NO_SAMPLE").map((dish) => dish.name),
          )}.`,
        })
    }
  }
  return alerts.sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level])
}
