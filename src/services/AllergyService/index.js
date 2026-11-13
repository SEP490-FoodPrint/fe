import http from "../01_axios"

export function groupAllergiesByClass(rows) {
  const classes = new Map()
  for (const row of rows) {
    if (!row.classId || !row.ingredientEntryId || !Number.isInteger(row.affectedCount) || row.affectedCount < 1) throw new Error("Dữ liệu dị ứng không hợp lệ.")
    const item = classes.get(row.classId) || {id:row.classId,className:row.className,academicYear:row.academicYear || "",allergies:[]}
    item.allergies.push({id:`${row.classId}:${row.ingredientEntryId}`,ingredientEntryId:row.ingredientEntryId,ingredientId:row.ingredientId,ingredientName:row.ingredientName,category:row.category || "",affectedCount:row.affectedCount,updatedAt:row.updatedAt})
    classes.set(row.classId,item)
  }
  return [...classes.values()].sort((a,b)=>a.className.localeCompare(b.className,"vi"))
}

export function computeAllergySummary(classList = []) {
  return {totalClasses:classList.filter(row=>row.allergies.length).length,totalIngredients:new Set(classList.flatMap(row=>row.allergies.map(line=>line.ingredientEntryId))).size}
}

export function affectedCountsLabel(allergies = []) {
  if (allergies.length === 1) return String(allergies[0].affectedCount)
  return allergies.map(line=>`${line.ingredientName}: ${line.affectedCount}`).join("; ")
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
