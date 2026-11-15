export function filterMenuCardsByGrade(menus, gradeId = "") {
  return menus.filter(
    (menu) =>
      !gradeId || !menu.gradeIds?.length || menu.gradeIds.includes(gradeId),
  )
}

// Keep each week's dishes and approval actions together when showing all grades.
export function groupMenuCardsByWeek(menus) {
  const groups = new Map()
  for (const menu of menus) {
    const id = menu.weeklyMenuId || menu.id
    if (!groups.has(id))
      groups.set(id, {
        id,
        targetScope: menu.targetScope || "Toàn trường",
        menus: [],
      })
    groups.get(id).menus.push(menu)
  }
  return [...groups.values()].map((group) => {
    const revision = group.menus.find((menu) =>
      ["REVISION_REQUESTED", "REVISION_REQUIRED"].includes(menu.status),
    )
    const status = revision
      ? "REVISION_REQUESTED"
      : group.menus.some((menu) => menu.status === "PENDING_APPROVAL")
        ? "PENDING_APPROVAL"
        : group.menus.some((menu) => menu.status === "DRAFT")
          ? "DRAFT"
          : "APPROVED"
    return { ...group, status, feedback: revision?.feedback || "" }
  })
}

export function menuContentKey(rows) {
  return JSON.stringify(
    rows
      .map((row) => ({
        date: row.rawDate || row.date,
        mealType: row.mealType,
        status: row.status,
        notes: row.notes || "",
        dishes: (row.dishes || [])
          .map((dish) => ({
            id: dish.dishId || dish.id,
            substitute:
              dish.substituteDish?.dishId || dish.substituteDish?.id || null,
            avoidances: [
              ...(dish.substituteDish?.avoidedIngredientEntryIds || []),
            ].sort(),
          }))
          .sort((a, b) => String(a.id).localeCompare(String(b.id))),
        substitute:
          row.substituteDish?.dishId || row.substituteDish?.id || null,
        groups: (row.portionGroups || [])
          .map((group) => ({
            name: group.name,
            isDefault: group.isDefault,
            dishIds: [...(group.dishIds || [])].sort(),
            avoidances: [...(group.avoidedIngredientEntryIds || [])].sort(),
          }))
          .sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) =>
        `${a.date}:${a.mealType}`.localeCompare(`${b.date}:${b.mealType}`),
      ),
  )
}

export function groupSimilarMenuCards(groups) {
  const result = new Map()
  for (const group of groups) {
    const grades = [
      ...new Set(group.menus.flatMap((menu) => menu.gradeIds || [])),
    ]
    const key = grades.length
      ? `${group.status}:${group.feedback || ""}:${menuContentKey(group.menus)}`
      : `school:${group.id}`
    const existing = result.get(key)
    if (!existing) {
      result.set(key, { ...group, members: [group] })
      continue
    }
    if (
      existing.members.some((member) =>
        member.menus.some((menu) =>
          (menu.gradeIds || []).some((id) => grades.includes(id)),
        ),
      )
    ) {
      result.set(`${key}:${group.id}`, { ...group, members: [group] })
      continue
    }
    existing.members.push(group)
    existing.targetScope = [
      ...new Set(existing.members.map((member) => member.targetScope)),
    ].join(", ")
    existing.menus = existing.menus.map((menu) => ({
      ...menu,
      targetScope: existing.targetScope,
      gradeIds: [
        ...new Set(
          existing.members.flatMap((member) =>
            member.menus.flatMap((row) => row.gradeIds || []),
          ),
        ),
      ],
    }))
  }
  return [...result.values()]
}
