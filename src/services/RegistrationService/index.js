import http from "../01_axios"
import STORAGE, { getStorage, setStorage } from "src/lib/storage"
import { normalizeRequestSearch, organizationName, requestCode, requestDateKey } from "src/lib/registration"
import { MOCK_REGISTRATION_REQUESTS } from "./mockData"
import { apiGetRegistrationRequests, apiGetRegistrationRequest, apiReviewRegistrationRequest } from "./urls"

const REVIEW_STORAGE = "foodprint_registration_reviews_v1"
const useMock = () => import.meta.env.VITE_USE_MOCK === "true" || /^mock_/.test(getStorage(STORAGE.TOKEN) || "")
const getMockRequests = () => {
  const stored = getStorage(REVIEW_STORAGE)
  const reviews = stored && typeof stored === "object" ? stored : {}
  return MOCK_REGISTRATION_REQUESTS.map(request => ({ ...request, ...reviews[request.id] }))
}
function checkResponse(response) {
  if (response?.isOk === false || response?.success === false) throw new Error(response.message || "Không thể xử lý hồ sơ. Vui lòng thử lại.")
  return response
}

const getRequests = async ({ search = "", type = "", status = "", from = "", to = "", page = 1, pageSize = 5 } = {}) => {
  if (!useMock()) {
    const response = checkResponse(await http.get(apiGetRegistrationRequests, {
      params: { search, request_type: type, status, submitted_from: from, submitted_to: to, page, page_size: pageSize },
    }))
    if (!Array.isArray(response?.data) || !Number.isFinite(response.total)) throw new Error("Dữ liệu danh sách hồ sơ không hợp lệ.")
    return response
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
    page: currentPage, isMock: true,
    summary: { total: requests.length, pending: requests.filter(request => request.status === "PENDING").length },
  }
}
const getRequest = async id => {
  if (!useMock()) {
    const response = checkResponse(await http.get(apiGetRegistrationRequest(id)))
    if (!response?.data?.id) throw new Error("Dữ liệu chi tiết hồ sơ không hợp lệ.")
    return response
  }
  const request = getMockRequests().find(item => item.id === id)
  if (!request) throw new Error("Không tìm thấy hồ sơ đăng ký.")
  return { data: request, isMock: true }
}
const reviewRequest = async (id, body, reviewer) => {
  if (!["APPROVED", "REJECTED"].includes(body.status)) throw new Error("Quyết định xét duyệt không hợp lệ.")
  if (!useMock()) {
    const response = checkResponse(await http.patch(apiReviewRegistrationRequest(id), body))
    if (!response?.data?.id || response.data.status !== body.status) throw new Error("Chưa xác nhận được quyết định xét duyệt. Vui lòng tải lại hồ sơ.")
    return response
  }
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

export default { getRequests, getRequest, reviewRequest }
