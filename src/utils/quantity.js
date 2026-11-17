// Operational meal screens use g and ml even when stock/history uses kg or l.
// Count units stay unchanged: there is no weight-to-volume or count conversion.
const UNITS = {
  kg: ["g", 3], kilogram: ["g", 3], kilogam: ["g", 3],
  g: ["g", 0], gr: ["g", 0], gram: ["g", 0], gam: ["g", 0],
  l: ["ml", 3], lit: ["ml", 3], "lít": ["ml", 3],
  liter: ["ml", 3], litre: ["ml", 3],
  ml: ["ml", 0], milliliter: ["ml", 0], millilitre: ["ml", 0],
}

export function smallQuantity(quantity, unit = "") {
  const originalUnit = String(unit || "").trim()
  const key = originalUnit.toLowerCase()
  const match = Object.hasOwn(UNITS, key) ? UNITS[key] : null
  if (!match) return { quantity, unit: originalUnit }
  const [smallUnit, shift] = match
  if (quantity == null || quantity === "") return { quantity, unit: smallUnit }
  const value = String(quantity).trim()
  if (!/^-?\d+(?:\.\d+)?$/.test(value)) return { quantity, unit: originalUnit }
  if (!shift) return { quantity, unit: smallUnit }
  const negative = value.startsWith("-")
  const [whole, fraction = ""] = value.replace(/^-/, "").split(".")
  const padded = fraction.padEnd(shift, "0")
  const integer = (whole + padded.slice(0, shift)).replace(/^0+(?=\d)/, "")
  const decimal = padded.slice(shift).replace(/0+$/, "")
  const result = `${integer}${decimal ? `.${decimal}` : ""}`
  return { quantity: negative && Number(result) !== 0 ? `-${result}` : result, unit: smallUnit }
}

export function formatSmallQuantity(quantity, unit = "") {
  const result = smallQuantity(quantity, unit)
  if (result.quantity == null || result.quantity === "") return "—"
  return `${result.quantity}${result.unit ? ` ${result.unit}` : ""}`
}

// Some older display adapters supply a single quantity/unit string.
export function formatSmallQuantityText(text) {
  const match = String(text ?? "").trim().match(/^(-?\d+(?:\.\d+)?)\s*([^\d\s]+)$/u)
  return match ? formatSmallQuantity(match[1], match[2]) : text
}
