/**
 * API Endpoints cho danh mục Trường học (Schools)
 */
export const apiGetPublicSchools = "/schools/public"
export const apiCookingMode = "/schools/me/cooking-mode"
export const apiMealTimes = "/schools/me/meal-times"
export const apiGetPublicLocations = "/schools/public/locations"
export const apiGetSchoolDetail = id => `/schools/public/${id}`
export const apiGetSchoolDetailByCode = code => `/schools/public/code/${code}`
export const apiGetDailyMealMenu = (schoolCode, date) =>
  `/schools/public/${schoolCode}/daily-menu${date ? `?date=${encodeURIComponent(date)}` : ""}`
export const apiGetWeeklyMenu = (schoolCode, weekStart, grade) => {
  const params = new URLSearchParams()
  if (weekStart) params.append("week", weekStart)
  if (grade && grade !== "all") params.append("grade", grade)
  const qs = params.toString()
  return `/schools/public/${schoolCode}/weekly-menu${qs ? `?${qs}` : ""}`
}
