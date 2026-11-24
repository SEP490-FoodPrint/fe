import { readWasteRate, readWasteRates } from "./adapter"
import http from "../01_axios"
import { apiWasteRate, apiWasteRates } from "./urls"

/** Danh sách nguyên liệu của trường kèm tỷ lệ hao hụt (wasteRate dạng thập phân, "0.2000" = 20%). */
const getWasteRates = () => http.get(apiWasteRates).then(readWasteRates)

/** Cập nhật tỷ lệ hao hụt; wasteRate là số thập phân 0 <= r < 1. */
const updateWasteRate = (ingredientEntryId, wasteRate) =>
  http.patch(apiWasteRate(ingredientEntryId), { wasteRate }, { notifyOnError: false }).then(readWasteRate)

const IngredientWasteRateService = { getWasteRates, updateWasteRate }

export default IngredientWasteRateService
