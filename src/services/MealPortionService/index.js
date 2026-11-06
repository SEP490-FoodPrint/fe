import http from "../01_axios"
import { apiFinalizeMealPortion, apiMealPortions, apiMyClassMeal } from "./urls"

const getMyClassMeal = params => http.get(apiMyClassMeal, { params, notifyOnError: false })
const getHistory = params => http.get(apiMealPortions, { params, notifyOnError: false })
const saveDraft = payload => http.post(apiMealPortions, payload, { notifyOnError: false })
const finalize = id => http.post(apiFinalizeMealPortion(id), null, { notifyOnError: false })

const MealPortionService = { getMyClassMeal, getHistory, saveDraft, finalize }

export default MealPortionService
