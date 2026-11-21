import http from "../01_axios"
import { apiFinalizeMealPortion, apiMealPortions, apiMyClassAllergies, apiMyClassAllergyOptions, apiMyClassMeal } from "./urls"

const getMyClassMeal = params => http.get(apiMyClassMeal, { params, notifyOnError: false })
const getHistory = params => http.get(apiMealPortions, { params, notifyOnError: false })
const saveDraft = payload => http.post(apiMealPortions, payload, { notifyOnError: false })
const finalize = id => http.post(apiFinalizeMealPortion(id), null, { notifyOnError: false })

const getClassAllergyOptions = () => http.get(apiMyClassAllergyOptions, { notifyOnError: false })
// Danh sách nguyên liệu dị ứng chung của lớp + một số học sinh dị ứng chung
/** groups: [{ ingredientEntryIds: string[], affectedCount: number }] — mỗi nhóm một tập nguyên liệu cùng tránh. */
const saveClassAllergies = groups =>
  http.put(apiMyClassAllergies, { groups }, { notifyOnError: false })

const MealPortionService = { getMyClassMeal, getHistory, saveDraft, finalize, getClassAllergyOptions, saveClassAllergies }

export default MealPortionService
