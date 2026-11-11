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
