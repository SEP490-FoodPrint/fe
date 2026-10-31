import http from "../01_axios"
import { getStorage, setStorage } from "src/lib/storage"
import { USE_MOCK_API } from "src/lib/config"
import { normalizeRequestSearch, organizationName, requestCode, requestDateKey } from "src/lib/registration"
import { MOCK_REGISTRATION_REQUESTS } from "./mockData"
import { apiGetRegistrationRequests, apiGetRegistrationRequest, apiSearchRegistrationRequests, apiGetRegistrationDocument } from "./urls"
import { registrationList, registrationQuery, registrationRequest } from "./adapter"

const REVIEW_STORAGE = "foodprint_registration_reviews_v1"
const getMockRequests = () => {
  const stored = getStorage(REVIEW_STORAGE)
  const reviews = stored && typeof stored === "object" ? stored : {}
  return MOCK_REGISTRATION_REQUESTS.map(request => ({ ...request, ...reviews[request.id] }))
}
function checkResponse(response) {
  if (response?.isOk === false || response?.success === false) throw new Error(response.message || "Không thể xử lý hồ sơ. Vui lòng thử lại.")
  return response
}

const getRequests = async ({ search = "", type = "", status = "", from = "", to = "", page = 1, pageSize = 5 } = {}, { signal } = {}) => {
  if (!USE_MOCK_API) {
    const response = checkResponse(await http.get(search.trim() ? apiSearchRegistrationRequests : apiGetRegistrationRequests, {
      params: registrationQuery({ search, type, status, from, to, page, pageSize }), signal, notifyOnError: false,
    }))
    return registrationList(response)
  }
  const requests = getMockRequests()
  const query = normalizeRequestSearch(search)
  const filtered = requests.filter(request => {
    const haystack = normalizeRequestSearch([requestCode(request.id), request.applicant.full_name, request.applicant.email, organizationName(request)].join(" "))
    const date = requestDateKey(request.submitted_at)
    return (!query || haystack.includes(query)) && (!type || request.request_type === type)
      && (!status || request.status === status) && (!from || date >= from) && (!to || date <= to)
  })
  const currentPage = Math.max(1, Math.min(page, Math.ceil(filtered.length / pageSize) || 1))
  return {
    data: filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize), total: filtered.length,
    page: currentPage, pageSize, isMock: true,
  }
}
const getSummary = async ({ signal } = {}) => {
  if (USE_MOCK_API) {
    const requests = getMockRequests()
    return { total: requests.length, pending: requests.filter(request => request.status === "PENDING").length }
  }
  // No statistics endpoint yet; use the server's pagination counts, without downloading every record.
  const all = await getRequests({ pageSize: 1 }, { signal })
  // The newer basic list only exposes hasNext, without counts or status filters.
  if (all.total === null) return {}
  const pending = await getRequests({ status: "PENDING", pageSize: 1 }, { signal })
  return { total: all.total, pending: pending.total }
}
const getRequest = async (id, { signal } = {}) => {
  if (!USE_MOCK_API) {
    const response = checkResponse(await http.get(apiGetRegistrationRequest(id), { signal, notifyOnError: false }))
    return { data: registrationRequest(response.data), isMock: false }
  }
  const request = getMockRequests().find(item => item.id === id)
  if (!request) throw new Error("Không tìm thấy hồ sơ đăng ký.")
  return { data: request, isMock: true }
}
const getDocument = async (requestId, documentId, { signal } = {}) => {
  const response = checkResponse(await http.get(apiGetRegistrationDocument(requestId, documentId), { signal, notifyOnError: false }))
  const data = response?.data
  let url
  try { url = new URL(data?.url) } catch { throw new Error("Không nhận được đường dẫn xem tài liệu hợp lệ.") }
  if (url.protocol !== "https:" || url.username || url.password || !Number.isInteger(data.expiresIn) || data.expiresIn <= 0) throw new Error("Không nhận được đường dẫn xem tài liệu hợp lệ.")
  return { url: url.href, expiresIn: data.expiresIn }
}
const reviewRequest = async (id, body, reviewer) => {
  if (!["APPROVED", "REJECTED"].includes(body.status)) throw new Error("Quyết định xét duyệt không hợp lệ.")
  if (!USE_MOCK_API) throw new Error("Chức năng xét duyệt chưa khả dụng.")
  const { data: current } = await getRequest(id)
  if (current.status !== "PENDING") throw new Error("Hồ sơ đã được xét duyệt. Vui lòng tải lại trang.")
  const now = new Date().toISOString()
  const review = {
    status: body.status, rejection_reason: body.status === "REJECTED" ? body.rejection_reason?.trim() || null : null,
    reviewed_at: now, updated_at: now, reviewed_by_user_id: reviewer?.id || "demo-system-admin",
    reviewer: { full_name: reviewer?.fullName || "Nguyễn An" },
  }
  const stored = getStorage(REVIEW_STORAGE)
  setStorage(REVIEW_STORAGE, { ...(stored && typeof stored === "object" ? stored : {}), [id]: review })
  return { data: { ...current, ...review }, isMock: true }
}

export default { getRequests, getSummary, getRequest, getDocument, reviewRequest }
