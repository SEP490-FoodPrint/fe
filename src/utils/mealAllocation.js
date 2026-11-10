export function getMealAllocationView(data) {
  const classesById = new Map(data.classes.map(item => [item.id, item]))
  const allocationsById = new Map(data.mealAllocations.map(item => [item.id, item]))
  const demandById = new Map(data.dailyMealPortions.map(demand => [demand.id, {
    id: demand.id,
    name: classesById.get(demand.classId).name,
    total: demand.totalPortions,
    remaining: demand.totalPortions,
  }]))
  const batches = data.cookingBatches.map((batch, index) => ({
    id: batch.id,
    name: `Lô ${index + 1}`,
    note: batch.note,
    total: batch.plannedPortions,
    remaining: batch.plannedPortions,
    entries: [],
  }))
  const batchesById = new Map(batches.map(batch => [batch.id, batch]))

  for (const row of data.mealAllocationBatches) {
    const allocation = allocationsById.get(row.mealAllocationId)
    const demand = demandById.get(allocation.dailyMealPortionId)
    const batch = batchesById.get(row.cookingBatchId)
    demand.remaining -= row.allocatedPortions
    batch.remaining -= row.allocatedPortions
    batch.entries.push({ id: demand.id, name: demand.name, portions: row.allocatedPortions })
  }

  for (const batch of batches) {
    for (const entry of batch.entries) entry.remaining = demandById.get(entry.id).remaining
  }

  return { batches, classes: [...demandById.values()].filter(item => item.remaining > 0) }
}

export function withoutBatchAllocation(data, batchId) {
  return {
    ...data,
    mealAllocationBatches: data.mealAllocationBatches.filter(row => row.cookingBatchId !== batchId),
  }
}

export function replaceBatchAllocation(data, batchId, orderedIds, now, createId) {
  const cleared = withoutBatchAllocation(data, batchId)
  const updated = applyBatchAllocation(cleared, batchId, orderedIds, now, createId)
  const usedIds = new Set(updated.mealAllocationBatches.map(row => row.mealAllocationId))

  return { ...updated, mealAllocations: updated.mealAllocations.filter(row => usedIds.has(row.id)) }
}

export function formatRemainingPortions({ remaining, total }) {
  return remaining === total ? String(total) : `${remaining}/${total}`
}

export function previewBatchAllocation(capacity, classes, orderedIds) {
  const classesById = new Map(classes.map(item => [item.id, item]))
  const entries = []
  let remaining = capacity

  for (const id of new Set(orderedIds)) {
    if (remaining <= 0) break
    const item = classesById.get(id)
    if (!item) continue

    const portions = Math.min(item.remaining, remaining)
    entries.push({ id, name: item.name, portions, remaining: item.remaining - portions })
    remaining -= portions
  }

  return { entries, remaining }
}

export function applyBatchAllocation(data, batchId, orderedIds, now, createId) {
  const batch = data.cookingBatches.find(item => item.id === batchId)
  const view = getMealAllocationView(data)
  const batchView = view.batches.find(item => item.id === batchId)
  if (!batchView) return data
  const { entries } = previewBatchAllocation(batchView.remaining, view.classes, orderedIds)
  if (entries.length === 0) return data

  const mealAllocations = [...data.mealAllocations]
  const mealAllocationBatches = [...data.mealAllocationBatches]
  const allocationsByDemand = new Map(mealAllocations.map(item => [item.dailyMealPortionId, item]))

  for (const entry of entries) {
    let allocation = allocationsByDemand.get(entry.id)
    if (!allocation) {
      allocation = {
        id: createId(entry.id),
        dailyMealPortionId: entry.id,
        createdByUserId: batch.createdByUserId,
        status: "ALLOCATED",
        allocatedAt: now,
        distributedAt: null,
        distributedByUserId: null,
        finalizedAt: null,
        note: null,
        createdAt: now,
        updatedAt: now,
      }
      mealAllocations.push(allocation)
    }

    mealAllocationBatches.push({
      mealAllocationId: allocation.id,
      cookingBatchId: batchId,
      allocatedPortions: entry.portions,
    })
  }

  return { ...data, mealAllocations, mealAllocationBatches }
}
