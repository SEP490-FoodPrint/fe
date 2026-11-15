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
