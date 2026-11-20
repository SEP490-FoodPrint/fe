import { portionCents } from "./allocationDecimal.js";

const entryId = (entry) => entry.dailyMealPortionId || entry.id;
const entryAmount = (entry) =>
  portionCents(entry.allocatedPortions ?? entry.portions ?? 0);
const nonnegative = (value) => (value > 0n ? value : 0n);
const decimal = (cents) => {
  const value = cents.toString().padStart(3, "0");
  return `${value.slice(0, -2)}.${value.slice(-2)}`;
};

function batchEntries(data, draft, key) {
  if (draft[key] !== undefined) return draft[key];
  const entries = new Map();
  for (const grade of data.grades || []) {
    for (const dish of grade.dishes || []) {
      for (const batch of dish.batches || []) {
        if (`${batch.cookingBatchId}_${dish.dishId}` !== key) continue;
        for (const entry of batch.entries || [])
          entries.set(entryId(entry), entry);
      }
    }
  }
  return [...entries.values()];
}

export function gradeBatchProjection(data, draft, grade, dish, batch) {
  const key = `${batch.cookingBatchId}_${dish.dishId}`;
  const ownIds = new Set((grade.demands || []).map((demand) => demand.id));
  const allEntries = batchEntries(data, draft, key);
  const entries = allEntries.filter((entry) => ownIds.has(entryId(entry)));
  const allocated = entries.reduce(
    (sum, entry) => sum + entryAmount(entry),
    0n,
  );
  const capacity = portionCents(batch.plannedPortions ?? 0);
  const used = allEntries.reduce((sum, entry) => sum + entryAmount(entry), 0n);
  const required = portionCents(dish.totalRequiredPortions ?? 0);
  const allocatedAcrossBatches = (dish.batches || []).reduce(
    (sum, item) =>
      sum +
      batchEntries(data, draft, `${item.cookingBatchId}_${dish.dishId}`)
        .filter((entry) => ownIds.has(entryId(entry)))
        .reduce((total, entry) => total + entryAmount(entry), 0n),
    0n,
  );
  const sharedRemaining = nonnegative(capacity - used);
  const needed = nonnegative(required - allocatedAcrossBatches);
  const locked = entries
    .filter((entry) => entry.locked)
    .reduce((sum, entry) => sum + entryAmount(entry), 0n);
  return {
    entries,
    gradeScoped: true,
    scopeKey: `${grade.gradeId}_${key}`,
    gradeRequiredPortions: decimal(required),
    allocatedForGrade: decimal(allocated),
    sharedRemaining:
      batch.allocationVersion === 2 ? null : decimal(sharedRemaining),
    gradeRemainingPortions: decimal(needed),
    remainingForGrade: decimal(
      sharedRemaining < needed ? sharedRemaining : needed,
    ),
    editableCapacityForGrade: decimal(
      nonnegative(capacity - (used - allocated) - locked),
    ),
  };
}

export function mergeGradeBatchEntries(data, draft, key, gradeId, entries) {
  const grade = (data.grades || []).find((item) => item.gradeId === gradeId);
  const ownIds = new Set((grade?.demands || []).map((demand) => demand.id));
  return [
    ...batchEntries(data, draft, key).filter(
      (entry) => !ownIds.has(entryId(entry)),
    ),
    ...entries,
  ];
}

export function classRemainingAcrossOtherBatches(
  dish,
  batchId,
  demandId,
  required,
) {
  const used = (dish.batches || [])
    .filter((batch) => batch.cookingBatchId !== batchId)
    .flatMap((batch) => batch.entries || [])
    .filter((entry) => entryId(entry) === demandId)
    .reduce((sum, entry) => sum + entryAmount(entry), 0n);
  return decimal(nonnegative(portionCents(required) - used));
}
