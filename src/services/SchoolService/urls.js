/**
 * API Endpoints cho danh mục Trường học (Schools)
 */
export const apiGetPublicSchools = "/schools/public"
export const apiCookingMode = "/schools/me/cooking-mode"
export const apiMealTimes = "/schools/me/meal-times"
export const apiGetPublicLocations = "/schools/public/locations"
export const apiGetSchoolDetail = id => `/schools/public/${id}`
export const apiGetSchoolDetailByCode = code => `/schools/public/code/${code}`
export const apiGetSchoolGrades = (code, week) =>
  `/schools/public/${code}/grades${week ? `?week=${encodeURIComponent(week)}` : ""}`
export const apiGetDailyMealMenu = (schoolCode, date, grade) => {
  const params = new URLSearchParams()
  if (date) params.append("date", date)
  if (grade && grade !== "all") params.append("grade", grade)
  const qs = params.toString()
  return `/schools/public/${schoolCode}/daily-menu${qs ? `?${qs}` : ""}`
}
export const apiGetWeeklyMenu = (schoolCode, weekStart, grade) => {
  const params = new URLSearchParams()
  if (weekStart) params.append("week", weekStart)
  if (grade && grade !== "all") params.append("grade", grade)
  const qs = params.toString()
  return `/schools/public/${schoolCode}/weekly-menu${qs ? `?${qs}` : ""}`
}
export const apiGetSchoolSuppliers = (schoolCode) =>
  `/schools/public/${schoolCode}/suppliers`
export const apiDeliveryInspectionRoles = "/schools/me/delivery-inspection-roles"

