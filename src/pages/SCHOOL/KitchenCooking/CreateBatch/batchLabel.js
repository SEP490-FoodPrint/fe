// Đánh số lô theo từng món trong ngày: mỗi món (theo bữa) bắt đầu từ Lô 1.
// Danh sách lô đầu vào là lô của một ngày nên ngày hôm sau tự bắt đầu lại từ Lô 1.
const dishKey = (batch) =>
  `${batch.dishId || batch.batchDishIds?.[0] || batch.name || batch.dishName || ""}:${String(batch.mealType || "").toLowerCase()}`;

const orderValue = (batch) => [
  Number.isFinite(Number(batch.batchNumber)) && batch.batchNumber != null ? Number(batch.batchNumber) : Number.MAX_SAFE_INTEGER,
  String(batch.confirmedAt || batch.createdAt || ""),
  String(batch.batchCode || batch.id || ""),
];

const compare = (a, b) => {
  const [a1, a2, a3] = orderValue(a);
  const [b1, b2, b3] = orderValue(b);
  if (a1 !== b1) return a1 - b1;
  if (a2 !== b2) return a2.localeCompare(b2);
  return a3.localeCompare(b3);
};

export function withDishLotNumbers(batches = []) {
  const groups = new Map();
  for (const batch of batches) {
    const key = dishKey(batch);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(batch);
  }
  const lotById = new Map();
  for (const rows of groups.values()) {
    [...rows].sort(compare).forEach((batch, index) => lotById.set(batch.id, index + 1));
  }
  return batches.map((batch) => ({ ...batch, lotNumber: lotById.get(batch.id) || 1 }));
}

export function batchDisplayName(batch) {
  const name = (batch?.name || batch?.dishName || "Món ăn").trim();
  return batch?.lotNumber ? `${name} (Lô ${batch.lotNumber})` : name;
}
