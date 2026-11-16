import MenuService from "./index"
import { menuContentKey } from "./listGrades"
import { menuAppliesToGrade, menuScopeLabel } from "./scope"

export function scheduleCards(schedule) {
  return (schedule.days || []).flatMap((day) =>
    ["LUNCH", "AFTERNOON"].flatMap((mealType) => {
      const meal = day.meals?.[mealType]
      if (!meal?.dishes?.length) return []
      return [
        {
          rawDate: day.date,
          mealType,
          dishes: meal.dishes,
          substituteDish: meal.substituteDish,
          status: day.approvalStatus || day.status,
          notes: day.note,
          portionGroups: day.portionGroupsByMeal?.[mealType] || [],
        },
      ]
    }),
  )
}

export async function loadGradeAuthoringWeek(date, gradeIds) {
  const base = await MenuService.getWeekSchedule(date)
  if (!Array.isArray(base.data?.availableMenus))
    throw new Error("Không tải được danh sách thực đơn theo khối.")
  const candidates = base.data.availableMenus.filter(
    (menu) => gradeIds.some((id) => menuAppliesToGrade(menu, id)),
  )
  const scopes = await Promise.all(
    candidates.map(async (candidate) =>
      base.data.weeklyMenuId === candidate.id
        ? base.data
        : (await MenuService.getWeekSchedule(date, { menuId: candidate.id }))
            .data,
    ),
  )
  if (scopes.some((scope, index) => scope.weeklyMenuId !== candidates[index].id))
    throw new Error("Không tải được đúng thực đơn của khối đã chọn. Vui lòng tải lại.")
  if (!scopes.length)
    return {
      ...base,
      data: {
        ...base.data,
        weeklyMenuId: null,
        weeklyMenuStatus: null,
        gradeMenus: [],
        completedDays: 0,
        isWeekComplete: false,
        days: (base.data.days || []).map((day) => ({
          date: day.date,
          dayLabel: day.dayLabel,
          dayOfWeek: day.dayOfWeek,
          isHoliday: day.isHoliday,
          holidayReason: day.holidayReason,
          hasMenu: false,
          menuDayId: null,
          status: "DRAFT",
          seasonings: [],
          seasoningsByMeal: { LUNCH: [], AFTERNOON: [] },
          meals: { LUNCH: { dishes: [] }, AFTERNOON: { dishes: [] } },
        })),
      },
    }
  const key = menuContentKey(scheduleCards(scopes[0]))
  if (
    scopes.some((schedule) =>
      schedule.weeklyMenuStatus !== scopes[0].weeklyMenuStatus ||
      menuContentKey(scheduleCards(schedule)) !== key,
    )
  )
    throw new Error(
      `Các khối đã có lịch món hoặc trạng thái khác nhau: ${candidates.map(menuScopeLabel).join("; ")}. Chọn một khối để tiếp tục bản soạn đã lưu; chỉ soạn chung khi lịch món và trạng thái giống nhau.`,
    )
  return {
    ...base,
    data: {
      ...scopes[0],
      gradeMenus: scopes.map((scope) => ({
        id: scope.weeklyMenuId,
        gradeIds: scope.gradeIds,
        status: scope.weeklyMenuStatus,
      })),
      days: scopes[0].days.map((day) => ({
        ...day,
        gradeSnapshots: Object.fromEntries(
          gradeIds.flatMap((gradeId) => {
            const scope = scopes.find(
              (row) => menuAppliesToGrade(row, gradeId),
            )
            const stored = scope?.days?.find((row) => row.date === day.date)
            if (!stored) return []
            return [
              [
                gradeId,
                Object.fromEntries(
                  ["LUNCH", "AFTERNOON"].map((type) => [
                    type,
                    {
                      dishes: [
                        ...(stored.meals?.[type]?.dishes || []),
                        ...(stored.meals?.[type]?.substituteDish
                          ? [stored.meals[type].substituteDish]
                          : []),
                      ],
                      seasonings: stored.seasoningsByMeal?.[type] || [],
                    },
                  ]),
                ),
              ],
            ]
          }),
        ),
      })),
    },
  }
}

export function groupSimilarGradeSchedules(schedules) {
  const grouped = new Map()
  for (const schedule of schedules) {
    const key = schedule.gradeIds?.length
      ? `${schedule.weeklyMenuStatus}:${menuContentKey(scheduleCards(schedule))}`
      : `school:${schedule.weeklyMenuId}`
    const current = grouped.get(key)
    if (!current) {
      grouped.set(key, { ...schedule, variants: [schedule] })
      continue
    }
    current.variants.push(schedule)
    current.targetScope = [
      ...new Set(current.variants.map((row) => row.targetScope)),
    ].join(", ")
    current.gradeIds = [
      ...new Set(current.variants.flatMap((row) => row.gradeIds || [])),
    ]
  }
  return [...grouped.values()]
}
