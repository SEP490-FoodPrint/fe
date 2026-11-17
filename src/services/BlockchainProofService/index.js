import http from "../01_axios"
import { proofVersion } from "./adapter"
import { apiAnchorProofVersion, apiGetProofVersions, apiVerifyProofVersion } from "./urls"

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

export default { listVersions, verify, anchor }
