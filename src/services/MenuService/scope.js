export function menuAppliesToGrade(menu, gradeId) {
  return menu.isSchoolWide === true || menu.gradeIds?.includes(gradeId) === true
}

export function menuScopeLabel(menu) {
  const names = menu.gradeNames || (menu.grades || []).map(row => row.grade?.name)
  return names.filter(Boolean).join(", ") || (menu.isSchoolWide === true ? "Toàn trường" : "Chưa gán khối")
}
export function hasMenuScope(menu) {
  return menu.isSchoolWide === true || (menu.gradeIds || menu.grades?.map(row => row.gradeId) || []).length > 0
}
