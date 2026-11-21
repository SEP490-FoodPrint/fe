import { sumAllocationPortions } from "./allocationDecimal.js";

// Dòng lớp × món × lô đã chuẩn hóa: khóa theo lô–món–lớp, số suất theo đơn vị 0,01.
export function allocationRows(data, draft = {}) {
  const rows = new Map();
  for (const grade of data?.grades ?? []) {
    for (const dish of grade.dishes) {
      for (const batch of dish.batches) {
        const slot = `${batch.cookingBatchId}_${dish.dishId}`;
        for (const entry of draft[slot] ?? batch.entries ?? []) {
          const demandId = entry.dailyMealPortionId ?? entry.id;
          rows.set(slot + ":" + demandId, {
            demandId,
            dishId: dish.dishId,
            batchId: batch.cookingBatchId,
            allocatedPortions: sumAllocationPortions([entry.allocatedPortions ?? entry.portions]),
          });
        }
      }
    }
  }
  return [...rows.keys()].sort().map((key) => rows.get(key));
}

// Chỉ coi là đã sửa khi nội dung chuẩn hóa khác bản gốc, không phụ thuộc thứ tự hay cách viết số.
export function hasAllocationChanges(base, draft) {
  return JSON.stringify(allocationRows(base, draft)) !== JSON.stringify(allocationRows(base));
}
