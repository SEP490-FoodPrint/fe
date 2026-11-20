export function formatAllocationDecimal(value, places = 2) {
  const text = String(value ?? "0");
  if (!/^\d+(?:\.\d+)?$/.test(text)) return "—";
  const [whole, fraction = ""] = text.split(".");
  const padded = fraction.padEnd(places + 1, "0");
  let scaled =
    BigInt(whole) * 10n ** BigInt(places) +
    BigInt(padded.slice(0, places) || "0");
  if (Number(padded[places]) >= 5) scaled += 1n;
  const formatted = scaled.toString().padStart(places + 1, "0");
  return `${formatted.slice(0, -places)},${formatted.slice(-places)}`;
}

export function portionCents(value) {
  const [whole, fraction = ""] = String(value ?? "0").split(".");
  if (!/^\d+$/.test(whole) || !/^\d{0,2}$/.test(fraction))
    throw new Error("Số suất không hợp lệ");
  return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
}
export function sumAllocationPortions(values) {
  const total = values
    .reduce((sum, value) => sum + portionCents(value), 0n)
    .toString()
    .padStart(3, "0");
  return total.slice(0, -2) + "." + total.slice(-2);
}
export function compareAllocationPortions(left, right) {
  const a = portionCents(left),
    b = portionCents(right);
  return a < b ? -1 : a > b ? 1 : 0;
}
