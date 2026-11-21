import http from "../01_axios"
import { groupAllergyRows, totalAllergyCount } from "src/utils/allergyGroups"

export function groupAllergiesByClass(rows) {
  const classes = new Map()
  for (const row of rows) {
    if (!row.classId || !row.ingredientEntryId || !Number.isInteger(row.affectedCount) || row.affectedCount < 1) throw new Error("Dữ liệu dị ứng không hợp lệ.")
    const item = classes.get(row.classId) || {id:row.classId,className:row.className,academicYear:row.academicYear || "",allergies:[]}
    item.allergies.push({id:`${row.classId}:${row.groupNo ?? 1}:${row.ingredientEntryId}`,groupNo:Number(row.groupNo) || 1,ingredientEntryId:row.ingredientEntryId,ingredientId:row.ingredientId,ingredientName:row.ingredientName,category:row.category || "",supplierName:row.supplierName || "",affectedCount:row.affectedCount,updatedAt:row.updatedAt})
    classes.set(row.classId,item)
  }
  return [...classes.values()].sort((a,b)=>a.className.localeCompare(b.className,"vi"))
}

export function computeAllergySummary(classList = []) {
  return {totalClasses:classList.filter(row=>row.allergies.length).length,totalIngredients:new Set(classList.flatMap(row=>row.allergies.map(line=>line.ingredientEntryId))).size}
}

// Lớp khai dị ứng theo nhóm: mỗi nhóm (cùng groupNo) một tập nguyên liệu + một số học sinh.
// Tổng học sinh dị ứng = tổng các nhóm, mỗi nhóm tính một lần.
export function classAffectedStudents(allergies = []) {
  return totalAllergyCount(allergies)
}

/** Nhóm dị ứng của lớp: [{ groupNo, count, items: [{ ingredientEntryId, name, supplierName }] }]. */
export function classAllergyGroups(allergies = []) {
  return groupAllergyRows(allergies).map(group => ({
    ...group,
    items: group.items.map(item => ({
      ...item,
      supplierName: allergies.find(line => line.ingredientEntryId === item.ingredientEntryId)?.supplierName || "",
    })),
  }))
}

export function affectedCountsLabel(allergies = []) {
  return String(classAffectedStudents(allergies))
}

export async function getSchoolClassAllergies({ signal } = {}) {
  const rows=[]
  for (let page=1; ; page++) {
    const response=await http.get("/class-allergies/catalog",{params:{page,limit:100},signal,notifyOnError:false})
    const data=response?.data
    if (!Array.isArray(data?.items) || typeof data.pagination?.hasNext !== "boolean") throw new Error("Không tải được danh mục dị ứng của trường.")
    rows.push(...data.items)
    if (!data.pagination.hasNext) return groupAllergiesByClass(rows)
    if (!data.items.length) throw new Error("Phân trang dị ứng không hợp lệ.")
  }
}
