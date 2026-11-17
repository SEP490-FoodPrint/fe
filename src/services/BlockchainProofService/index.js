import http from "../01_axios"
import { proofVersion } from "./adapter"
import { gradeMeal, mealChain, parseMealKey } from "./chainAdapter"
import {
  apiAnchorProofVersion,
  apiGetGradeChain,
  apiGetGradeMeals,
  apiGetPublicGradeChain,
  apiGetPublicGradeMeals,
  apiGetProofVersions,
  apiVerifyProofVersion,
} from "./urls"

function checkResponse(response) {
  if (response?.isOk === false || response?.success === false) throw new Error(response.message || "Không thể tải bằng chứng blockchain.")
  return response
}

/** Keeps the HTTP status so the card can hide itself on 403 and explain 409. */
function wrap(error) {
  const wrapped = new Error(error?.message || "Không thể kết nối máy chủ. Vui lòng thử lại.")
  wrapped.status = error?.response?.status ?? null
  return wrapped
}

// Proof calls never pop global error toasts: the card shows its own state.
const options = signal => ({ signal, notifyOnError: false })

const listVersions = async (kind, recordId, { signal } = {}) => {
  try {
    const response = checkResponse(await http.get(apiGetProofVersions(kind, recordId), options(signal)))
    return Array.isArray(response?.data) ? response.data.map(proofVersion) : []
  } catch (error) {
    throw wrap(error)
  }
}

const verify = async (kind, versionId) => {
  try {
    const response = checkResponse(await http.post(apiVerifyProofVersion(kind, versionId), null, options()))
    return proofVersion(response.data)
  } catch (error) {
    throw wrap(error)
  }
}

const anchor = async (kind, versionId) => {
  try {
    const response = checkResponse(await http.post(apiAnchorProofVersion(kind, versionId), null, options()))
    return proofVersion(response.data)
  } catch (error) {
    throw wrap(error)
  }
}

/** Grade meals of one day that can be traced (a school only gets its own). */
const listGradeMeals = async (date, { signal } = {}) => {
  try {
    const response = checkResponse(await http.get(apiGetGradeMeals, { ...options(signal), params: { date } }))
    return Array.isArray(response?.data) ? response.data.map(gradeMeal) : []
  } catch (error) {
    throw wrap(error)
  }
}

const chainParams = (key, date, check) => {
  const { mealType } = parseMealKey(key)
  return { date, mealType, verify: check ? "true" : "false" }
}

/**
 * Every step of one grade's meal with its proofs. `key` is a list row's key
 * (`<gradeId|none>:<mealType>`); `verify` re-checks each proof against the chain.
 */
const getGradeChain = async (key, { date, verify: check = false, signal } = {}) => {
  try {
    const response = checkResponse(await http.get(apiGetGradeChain(parseMealKey(key).gradeId), {
      ...options(signal),
      params: chainParams(key, date, check),
    }))
    return mealChain(response.data, { checked: check })
  } catch (error) {
    throw wrap(error)
  }
}

// Public pages never redirect to login: the endpoints need no account.
const publicOptions = signal => ({ ...options(signal), skipAuthRedirect: true })

/** Grade meals of one day on a school's public page. */
const listPublicGradeMeals = async (schoolCode, date, { signal } = {}) => {
  try {
    const response = checkResponse(await http.get(apiGetPublicGradeMeals(schoolCode), { ...publicOptions(signal), params: { date } }))
    return Array.isArray(response?.data) ? response.data.map(gradeMeal) : []
  } catch (error) {
    throw wrap(error)
  }
}

/** Public journey of one grade's meal; a check reads the chain but is not saved. */
const getPublicGradeChain = async (schoolCode, key, { date, verify: check = false, signal } = {}) => {
  try {
    const response = checkResponse(await http.get(apiGetPublicGradeChain(schoolCode, parseMealKey(key).gradeId), {
      ...publicOptions(signal),
      params: chainParams(key, date, check),
    }))
    return mealChain(response.data, { checked: check })
  } catch (error) {
    throw wrap(error)
  }
}

export default {
  listVersions,
  verify,
  anchor,
  listGradeMeals,
  getGradeChain,
  listPublicGradeMeals,
  getPublicGradeChain,
}
