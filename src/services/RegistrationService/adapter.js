// The API uses camelCase; these adapters keep the page's view model stable.
const object = value => value && typeof value === "object" && !Array.isArray(value) ? value : {}

export function registrationQuery({ search = "", type, status, from, to, page = 1, pageSize = 5 } = {}) {
  return Object.fromEntries(Object.entries({
    page, limit: pageSize, search: search.trim(), requestType: type, status, fromDate: from, toDate: to,
  }).filter(([, value]) => value !== "" && value != null))
}

export function registrationRequest(value) {
  if (!value?.id) throw new Error("Dữ liệu hồ sơ đăng ký không hợp lệ.")
  const applicant = object(value.applicantUser)
  const reviewer = object(value.reviewedByUser)
  return {
    id: value.id,
    applicant_user_id: value.applicantUserId,
    request_type: value.requestType,
    status: value.status,
    submitted_at: value.submittedAt,
    reviewed_at: value.reviewedAt,
    updated_at: value.updatedAt,
    rejection_reason: value.rejectionReason,
    reviewed_by_user_id: value.reviewedByUserId,
    applicant: { id: applicant.id, full_name: applicant.fullName, username: applicant.username, email: applicant.email, phone: applicant.phone },
    reviewer: value.reviewedByUser ? { id: reviewer.id, full_name: reviewer.fullName } : null,
    // JSON fields have no enforced business schema. Keep their existing keys.
    profile_data: object(value.profileData),
    supporting_documents: Array.isArray(value.supportingDocuments) ? value.supportingDocuments.filter(item => item && typeof item === "object" && !Array.isArray(item)) : [],
  }
}

export function registrationList(response) {
  const { items, pagination } = response?.data || {}
  const counted = Number.isInteger(pagination?.total) && pagination.total >= 0
  if (!Array.isArray(items) || (!counted && typeof pagination?.hasNext !== "boolean")
    || !Number.isInteger(pagination.page) || pagination.page < 1
    || !Number.isInteger(pagination.limit) || pagination.limit < 1) {
    throw new Error("Dữ liệu danh sách hồ sơ không hợp lệ.")
  }
  return {
    data: items.map(registrationRequest), total: counted ? pagination.total : null, page: pagination.page,
    pageSize: pagination.limit, hasNext: pagination.hasNext, isMock: false,
  }
}
