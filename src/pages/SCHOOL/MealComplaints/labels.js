export const createComplaintTypes = {
  MEAL_QUALITY: "Chất lượng bữa ăn",
  FOOD_HYGIENE: "Vệ sinh thực phẩm",
  OTHER: "Khác",
}

// Legacy HEALTH_ISSUE is kept for displaying historical records only.
export const complaintTypes = {
  MEAL_QUALITY: "Chất lượng bữa ăn",
  FOOD_HYGIENE: "Vệ sinh thực phẩm",
  HEALTH_ISSUE: "Vấn đề sức khỏe (cũ)",
  OTHER: "Khác",
}

export const mealLabels = {
  LUNCH: "Bữa trưa",
  AFTERNOON: "Bữa xế",
}

export const formatMealDate = date => {
  if (!date || typeof date !== "string") return "—"
  const parts = date.slice(0, 10).split("-")
  return parts.length === 3 ? parts.reverse().join("/") : date
}

const dateTime = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Ho_Chi_Minh",
})

export const formatTimestamp = timestamp => {
  if (!timestamp) return "—"
  const parsed = new Date(timestamp)
  return Number.isNaN(parsed.getTime()) ? "—" : dateTime.format(parsed)
}

export const errorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback
