import { smallQuantity } from "src/utils/quantity"
import http from "../01_axios"
import { apiMenus, apiMenuDetail } from "./urls"
import { adaptBackendMenuDetailToView } from "./adapter"
import { hasMenuScope, menuScopeLabel } from "./scope"

const dateOf = (value) =>
  typeof value === "string"
    ? value.slice(0, 10)
    : value?.toISOString?.().slice(0, 10)

// Compare stored menu snapshots, never the current dish catalogue recipe.
export async function loadGradeMenuDetails(
  weeklyMenu,
  menuDayId,
  mealType,
  { signal } = {},
) {
  const sourceDay = weeklyMenu.menuDays?.find((day) => day.id === menuDayId)
  if (!sourceDay) throw new Error("Không tìm thấy ngày trong thực đơn đã lưu.")
  const date = dateOf(sourceDay.menuDate)
  const response = await http.get(`${apiMenus}/week-schedule`, {
    params: { date, menuId: weeklyMenu.id },
    signal,
    notifyOnError: false,
  })
  if (!Array.isArray(response?.data?.availableMenus))
    throw new Error("Chưa tải được danh sách thực đơn theo khối.")
  const candidates = [
    ...new Map(
      [
        ...response.data.availableMenus,
        {
          id: weeklyMenu.id,
          isSchoolWide: weeklyMenu.isSchoolWide,
          gradeIds: (weeklyMenu.grades || []).map((row) => row.gradeId),
          gradeNames: (weeklyMenu.grades || []).map((row) => row.grade?.name),
        },
      ].map((item) => [item.id, item]),
    ).values(),
  ].filter(hasMenuScope)
  const snapshots = await Promise.all(
    candidates.map(async (candidate) => {
      try {
        const week =
          candidate.id === weeklyMenu.id
            ? weeklyMenu
            : (
                await http.get(apiMenuDetail(candidate.id), {
                  signal,
                  notifyOnError: false,
                })
              ).data
        if (!week?.id || !Array.isArray(week.menuDays))
          throw new Error("Chưa tải được chi tiết thực đơn.")
        const day = week.menuDays.find((item) => dateOf(item.menuDate) === date)
        if (
          !day ||
          !day.menuDayDishes?.some((dish) => dish.mealType === mealType)
        ) {
          return {
            candidate,
            week,
            menu: null,
            error: "Chưa có thực đơn cho ngày và bữa ăn này.",
          }
        }
        const menu = adaptBackendMenuDetailToView(week, day.id, mealType)
        let portionLabel = "Chưa tải được số suất"
        try {
          const demand = (
            await http.get(
              `${apiMenus}/days/${day.id}/meals/${mealType}/requirements`,
              { signal, notifyOnError: false },
            )
          ).data
          if (
            demand?.portionsFinalized &&
            Number.isFinite(Number(demand.portions))
          ) {
            portionLabel = `${Number(demand.portions).toLocaleString("vi-VN")} suất`
            if (candidate.gradeIds?.length > 1)
              portionLabel += ` dùng chung (${(candidate.gradeNames || []).filter(Boolean).join(", ")})`
            else if (candidate.isSchoolWide === true) portionLabel += " toàn trường"
          } else if (demand) portionLabel = "Chưa chốt đủ suất"
        } catch {
          /* Quantities remain readable when meal attendance is unavailable. */
        }
        const ingredientIds = [
          ...new Set(
            [
              ...day.menuDayDishes
                .filter((dish) => dish.mealType === mealType)
                .flatMap((dish) =>
                  (dish.ingredients || []).map((line) => line.ingredientId),
                ),
              ...(day.mealSeasonings || [])
                .filter((line) => line.mealType === mealType)
                .map((line) => line.ingredientEntry?.ingredientId),
            ].filter(Boolean),
          ),
        ]
        return { candidate, week, menu, portionLabel, ingredientIds }
      } catch (error) {
        return {
          candidate,
          menu: null,
          loadFailed: true,
          error: error.message || "Chưa tải được chi tiết thực đơn.",
        }
      }
    }),
  )
  return snapshots.flatMap((snapshot) => {
    const grades = snapshot.candidate.gradeIds || []
    const scopes = grades.length
      ? grades.map((gradeId, index) => ({
          key: gradeId,
          label: snapshot.candidate.gradeNames?.[index] || "Khối lớp",
          gradeIds: [gradeId],
        }))
      : [
          {
            key: `school:${snapshot.candidate.id}`,
            label: menuScopeLabel(snapshot.candidate),
            gradeIds: [],
          },
        ]
    return scopes.map((scope) => ({ ...snapshot, ...scope }))
  })
}

export function gradeComparisonRows(scopes) {
  const sections = new Map()
  const add = (sectionId, name, lines, scopeKey) => {
    if (!sections.has(sectionId))
      sections.set(sectionId, { id: sectionId, name, rows: new Map() })
    const section = sections.get(sectionId)
    lines.forEach((line, index) => {
      const normalized = smallQuantity(line.quantityPerPortion ?? line.portionQty, line.unit)
      const unit = normalized.unit
      const identity =
        line.ingredientId ||
        line.id ||
        line.ingredientEntryId ||
        `${scopeKey}:${index}`
      const key = `${identity}:${unit}`
      if (!section.rows.has(key))
        section.rows.set(key, {
          id: key,
          name: line.name || "Nguyên liệu",
          unit,
          values: {},
        })
      section.rows.get(key).values[scopeKey] =
        normalized.quantity ?? null
    })
  }
  for (const scope of scopes) {
    if (!scope.menu) continue
    const dishes = [...scope.menu.dishes]
    if (
      scope.menu.substituteDish &&
      !dishes.some((dish) => dish.dishId === scope.menu.substituteDish.dishId)
    ) {
      dishes.push({ ...scope.menu.substituteDish, comparisonSubstitute: true })
    }
    dishes.forEach((dish, index) => {
      const id = dish.dishId || dish.id || `${scope.key}:${index}`
      add(
        `dish:${id}`,
        `${dish.name}${dish.comparisonSubstitute ? " (suất riêng)" : ""}`,
        dish.ingredientDetails || dish.ingredientStandards || [],
        scope.key,
      )
    })
    if (scope.menu.seasonings?.length)
      add(
        "seasonings",
        "Gia vị dùng chung của bữa ăn",
        scope.menu.seasonings,
        scope.key,
      )
  }
  return [...sections.values()].map((section) => ({
    ...section,
    rows: [...section.rows.values()],
  }))
}
