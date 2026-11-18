// QĐ 1246/QĐ-BYT: mẫu thức ăn đặc tối thiểu 100 g, thức ăn lỏng tối thiểu 150 ml.
// Phải khớp MINIMUM_SAMPLE_QUANTITY ở be/src/modules/retained-sample/retained-sample.validation.ts.
export const MINIMUM_SAMPLE_QUANTITY = { g: 100, ml: 150 }

export const minimumSampleQuantity = (unit) =>
  MINIMUM_SAMPLE_QUANTITY[String(unit || "").toLowerCase()] ?? 0

// Trả về thông báo lỗi, hoặc "" nếu lượng mẫu hợp lệ.
export function sampleQuantityError(quantity, unit) {
  const value = Number(quantity)
  if (quantity === "" || quantity === null || quantity === undefined || !Number.isFinite(value) || value <= 0)
    return "Vui lòng nhập lượng mẫu lưu là số dương."
  const normalizedUnit = String(unit || "").toLowerCase()
  if (!(normalizedUnit in MINIMUM_SAMPLE_QUANTITY)) return "Đơn vị mẫu lưu phải là g hoặc ml."
  const minimum = MINIMUM_SAMPLE_QUANTITY[normalizedUnit]
  if (value < minimum)
    return normalizedUnit === "g"
      ? `Mẫu thức ăn đặc tối thiểu ${minimum} g (QĐ 1246/QĐ-BYT).`
      : `Mẫu thức ăn lỏng tối thiểu ${minimum} ml (QĐ 1246/QĐ-BYT).`
  return ""
}
