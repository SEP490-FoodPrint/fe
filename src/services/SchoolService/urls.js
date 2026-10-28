/**
 * API Endpoints cho danh mục Trường học (Schools)
 */
export const apiGetPublicSchools = "/schools/public"
export const apiGetSchoolDetail = id => `/schools/public/${id}`
export const apiGetSchoolDetailByCode = code => `/schools/public/code/${code}`
export const apiGetDailyMealMenu = (schoolCode, date) =>
  `/schools/public/${schoolCode}/daily-menu${date ? `?date=${date}` : ""}`
export const apiGetWeeklyMenu = (schoolCode, weekStart, grade) =>
  `/schools/public/${schoolCode}/weekly-menu?week=${weekStart || ""}&grade=${grade || ""}`
