import http from "../01_axios"
import { getStorage, setStorage } from "src/lib/storage"
import { USE_MOCK_API } from "src/lib/config"
import { normalizeRequestSearch, requestDateKey } from "src/lib/registration"
import { MOCK_REGISTRATION_REQUESTS } from "./mockData"
import { apiApproveRegistrationRequest, apiGetRegistrationDocument, apiGetRegistrationRequest, apiGetRegistrationRequests, apiRejectRegistrationRequest } from "./urls"
import { isInvalidRegistrationCodeSearch, isRegistrationSearch, registrationList, registrationQuery, registrationRequest } from "./adapter"

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
  const searchCode = search.trim().toUpperCase()
  if (isInvalidRegistrationCodeSearch(searchCode)) throw new Error("Nhập mã hồ sơ đầy đủ, ví dụ FP-REG-00001.")
  const searchByCode = Boolean(searchCode) && isRegistrationSearch(searchCode)
  const query = normalizeRequestSearch(search)
  const matchesFilters = request => {
    const date = requestDateKey(request.submitted_at)
    return (!type || request.request_type === type) && (!status || request.status === status)
      && (!from || date >= from) && (!to || date <= to)
  }
  if (!USE_MOCK_API) {
    if (query && !searchByCode) {
      const matching = []
      let scanPage = 1
      let hasNext = true
      while (hasNext) {
        const response = checkResponse(await http.get(apiGetRegistrationRequests, {
          params: registrationQuery({ page: scanPage, pageSize: 100 }), signal, notifyOnError: false,
        }))
        const result = registrationList(response)
        if (result.page !== scanPage) throw new Error("Không thể tải danh sách hồ sơ.")
        matching.push(...result.data.filter(request => normalizeRequestSearch(request.applicant?.full_name).includes(query) && matchesFilters(request)))
        hasNext = typeof result.hasNext === "boolean" ? result.hasNext : result.total !== null && scanPage * result.pageSize < result.total
        if (hasNext && result.data.length === 0) throw new Error("Không thể tải danh sách hồ sơ.")
        scanPage += 1
      }
      return { data: matching.slice((page - 1) * pageSize, page * pageSize), total: matching.length, page, pageSize, hasNext: page * pageSize < matching.length, isMock: false }
    }
    const response = checkResponse(await http.get(apiGetRegistrationRequests, {
      params: searchCode ? registrationQuery({ search: searchCode, page, pageSize }) : registrationQuery({ type, status, from, to, page, pageSize }), signal, notifyOnError: false,
    }))
    const result = registrationList(response)
    if (!searchCode || !(type || status || from || to)) return result
    const data = result.data.filter(matchesFilters)
    return { ...result, data, total: data.length, hasNext: false }
  }
  const requests = getMockRequests()
  const filtered = requests.filter(request => {
    return (!query || (searchByCode ? normalizeRequestSearch(request.registrationID) === query : normalizeRequestSearch(request.applicant?.full_name).includes(query))) && matchesFilters(request)
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
  // The basic endpoint exposes hasNext without counts or status filters.
  if (all.total === null) {
    if (!all.hasNext) return { total: all.data.length, pending: all.data.filter(request => request.status === "PENDING").length }
    let page = 1
    let total = 0
    let pending = 0
    let hasNext = true
    while (hasNext) {
      const result = await getRequests({ page, pageSize: 100 }, { signal })
      if (result.page !== page || (result.hasNext && result.data.length === 0)) throw new Error("Không thể tải thống kê hồ sơ.")
      total += result.data.length
      pending += result.data.filter(request => request.status === "PENDING").length
      hasNext = result.hasNext
      page += 1
    }
    return { total, pending }
  }
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
const readReviewVersion = value => {
  if (typeof value !== "string" || !/^[a-f0-9]{64}$/.test(value)) throw new Error("Không xác định được phiên bản hồ sơ. Vui lòng tải lại trang.")
  return value
}
const reviewRequest = async (id, body, reviewer) => {
  if (!["APPROVED", "REJECTED"].includes(body.status)) throw new Error("Quyết định xét duyệt không hợp lệ.")
  const rejectionReason = body.rejection_reason?.trim() || null
  if (body.status === "REJECTED" && !rejectionReason) throw new Error("Vui lòng nhập lý do từ chối hồ sơ.")
  if (rejectionReason && rejectionReason.length > 4000) throw new Error("Lý do từ chối tối đa 4000 ký tự.")
  if (!USE_MOCK_API) {
    const response = checkResponse(await http.post(
      body.status === "APPROVED" ? apiApproveRegistrationRequest(id) : apiRejectRegistrationRequest(id),
      {
        expectedReviewVersion: readReviewVersion(body.expected_review_version),
        ...(body.status === "REJECTED" ? { rejectionReason } : {}),
      },
      { notifyOnError: false },
    ))
    return { data: registrationRequest(response.data), isMock: false }
  }
  const { data: current } = await getRequest(id)
  if (current.status !== "PENDING") throw new Error("Hồ sơ đã được xét duyệt. Vui lòng tải lại trang.")
  const now = new Date().toISOString()
  const review = {
    status: body.status, rejection_reason: body.status === "REJECTED" ? rejectionReason : null,
    reviewed_at: now, updated_at: now, reviewed_by_user_id: reviewer?.id || "demo-system-admin",
    reviewer: { full_name: reviewer?.fullName || "Nguyễn An" },
  }
  const stored = getStorage(REVIEW_STORAGE)
  setStorage(REVIEW_STORAGE, { ...(stored && typeof stored === "object" ? stored : {}), [id]: review })
  return { data: { ...current, ...review }, isMock: true }
}

export default { getRequests, getSummary, getRequest, getDocument, reviewRequest }
