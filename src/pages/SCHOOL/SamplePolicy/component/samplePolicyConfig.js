export const SAMPLE_FIELDS = [
  { name: "sampleGrams", label: "Lượng mẫu cho món tính theo gam", unit: "g", minimum: 100 },
  { name: "sampleMilliliters", label: "Lượng mẫu cho món tính theo mililít", unit: "ml", minimum: 150 },
]

// Người dùng có thể gõ dấu phẩy thập phân; backend nhận dấu chấm.
export const normalizeAmount = value => String(value ?? "").trim().replace(",", ".")

export const isValidAmount = value => {
  const amount = normalizeAmount(value)
  return /^(?:0|[1-9]\d{0,8})(?:\.\d{1,3})?$/.test(amount) && Number(amount) > 0
}

export const belowMinimum = (value, minimum) => isValidAmount(value) && Number(normalizeAmount(value)) < minimum
