/**
 * Dị ứng của lớp khai theo NHÓM: các dòng cùng groupNo là một nhóm học sinh cùng tránh các nguyên liệu đó,
 * và mọi dòng của nhóm mang cùng một số (affectedCount ở hồ sơ lớp, portionCount ở suất hằng ngày).
 * Ví dụ A: 1, B: 1, (A, B): 1 là 3 nhóm, tổng 3 học sinh dị ứng.
 */

const nameOf = row => row?.IngredientEntry?.Ingredient?.name || row?.ingredientName || row?.name || "Nguyên liệu"

/** Gom dòng dị ứng thành nhóm: [{ groupNo, count, items: [{ ingredientEntryId, name }] }]. */
export function groupAllergyRows(rows = [], countField = "affectedCount") {
  const groups = new Map()
  for (const row of rows) {
    const groupNo = Number(row?.groupNo) || 1
    const group = groups.get(groupNo) || { groupNo, count: 0, items: [] }
    group.count = Math.max(group.count, Number(row?.[countField]) || 0)
    if (!group.items.some(item => item.ingredientEntryId === row.ingredientEntryId))
      group.items.push({ ingredientEntryId: row.ingredientEntryId, name: nameOf(row) })
    groups.set(groupNo, group)
  }
  return [...groups.values()].sort((a, b) => a.groupNo - b.groupNo)
}

/** Tổng số học sinh (hoặc suất) dị ứng: mỗi nhóm tính một lần. */
export function totalAllergyCount(rows = [], countField = "affectedCount") {
  return groupAllergyRows(rows, countField).reduce((sum, group) => sum + group.count, 0)
}

/** Nhãn ngắn của nhóm: "Sữa + Lạc". */
export const allergyGroupLabel = group => group.items.map(item => item.name).join(" + ")
