export const normalizeUnit = (value) =>
  String(value ?? "")
    .trim()
    .normalize("NFC")
    .toLowerCase();
const pattern = /^(?:0|[1-9]\d{0,10})(?:\.\d{1,3})?$/;
export function quantityMilli(value) {
  const text = String(value ?? "")
    .trim()
    .replace(",", ".");
  if (!pattern.test(text)) return null;
  const [whole, fraction = ""] = text.split(".");
  return BigInt(whole) * 1000n + BigInt(fraction.padEnd(3, "0"));
}
export function formatMilli(value) {
  const whole = value / 1000n;
  const fraction = (value % 1000n)
    .toString()
    .padStart(3, "0")
    .replace(/0+$/, "");
  return `${whole}${fraction ? "," + fraction : ""}`;
}
export function quantityError(value) {
  if (value === "" || value === null || value === undefined)
    return "Nhập số lượng lớn hơn 0";
  const scaled = quantityMilli(value);
  return scaled === null || scaled <= 0n
    ? "Số lượng phải dương, tối đa 3 chữ số thập phân"
    : "";
}
export function requireOrderQuantity(value) {
  const error = quantityError(value);
  if (error) throw new Error(error);
  return String(value).trim().replace(",", ".");
}
export function unitStepWarning(value, unit) {
  const amount = quantityMilli(value),
    step = quantityMilli(unit?.recommendedStep);
  if (
    amount === null ||
    amount <= 0n ||
    step === null ||
    step <= 0n ||
    amount % step === 0n
  )
    return "";
  const lower = (amount / step) * step,
    upper = lower + step;
  const suggestions = [
    ...(lower > 0n ? [formatMilli(lower)] : []),
    formatMilli(upper),
  ]
    .map((v) => `${v} ${unit.symbol}`)
    .join(" hoặc ");
  return `Số lượng chưa theo bước khuyến nghị ${formatMilli(step)} ${unit.symbol}. Giá trị gần nhất: ${suggestions}. Bạn vẫn có thể giữ nguyên để gửi.`;
}
export function findMeasurementUnit(units, value) {
  const key = normalizeUnit(value);
  return units.find((u) =>
    [u.code, u.symbol, ...(u.aliases ?? [])].some(
      (alias) => normalizeUnit(alias) === key,
    ),
  );
}
