import MenuService from "./index"
import { filterMenuCardsByGrade } from "./listGrades"

export async function loadKitchenGradeSchedules(date, gradeId = "") {
  const response = await MenuService.getWeekSchedule(date)
  const availableMenus = response.data?.availableMenus
  if (!Array.isArray(availableMenus))
    throw new Error("Không tải được danh sách thực đơn theo khối.")
  // A shared menu can contain several grades; selecting one must match membership,
  // not the backend's exact set of gradeIds.
  const candidates = filterMenuCardsByGrade(availableMenus, gradeId)
  return Promise.all(
    candidates.map(async (candidate) => {
      const data =
        response.data.weeklyMenuId === candidate.id
          ? response.data
          : (await MenuService.getWeekSchedule(date, { menuId: candidate.id }))
              .data
      if (data.weeklyMenuId !== candidate.id)
        throw new Error("Không tải được thực đơn của khối đã chọn.")
      return {
        ...data,
        targetScope:
          data.targetScope || candidate.gradeNames?.join(", ") || "Toàn trường",
      }
    }),
  )
}
