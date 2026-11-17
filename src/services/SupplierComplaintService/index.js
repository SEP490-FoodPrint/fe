import http from "src/services/01_axios"

const BASE_URL = "/ingredient-quality-feedback"

export const COMPLAINT_STATUS = {
  SUBMITTED: "SUBMITTED",
  RESPONDED: "RESPONDED",
}

export const COMPLAINT_PERMISSIONS = {
  VIEW_DETAILS: "ingredient_quality_feedback.view_details",
  RESPOND: "ingredient_quality_feedback.respond",
}

export const MAX_RESPONSE_LENGTH = 5000

export const COMPLAINT_STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả" },
  { value: COMPLAINT_STATUS.SUBMITTED, label: "Chờ phản hồi" },
  { value: COMPLAINT_STATUS.RESPONDED, label: "Đã phản hồi" },
]

const COMPLAINT_STATUS_META = {
  [COMPLAINT_STATUS.SUBMITTED]: {
    label: "Chờ phản hồi",
    tone: "warning",
  },
  [COMPLAINT_STATUS.RESPONDED]: {
    label: "Đã phản hồi",
    tone: "success",
  },
}

export function getComplaintStatusMeta(status) {
  return (
    COMPLAINT_STATUS_META[status] || {
      label: status || "Không xác định",
      tone: "muted",
    }
  )
}

export function canViewSupplierComplaints(user) {
  if (!user) return false
  if (Array.isArray(user.permissions)) {
    return user.permissions.includes(COMPLAINT_PERMISSIONS.VIEW_DETAILS)
  }
  return true
}

export function canRespondSupplierComplaints(user) {
  if (!canViewSupplierComplaints(user)) return false
  if (Array.isArray(user?.permissions)) {
    return user.permissions.includes(COMPLAINT_PERMISSIONS.RESPOND)
  }
  return true
}

export function formatComplaintCode(code, fallback = "Chưa có mã") {
  const trimmed = typeof code === "string" ? code.trim() : ""
  return trimmed || fallback
}

export function formatSchoolCode(code, fallback = "Chưa có mã") {
  const trimmed = typeof code === "string" ? code.trim() : ""
  return trimmed || fallback
}

export function formatDateTimeVi(value, fallback = "Chưa cập nhật") {
  if (!value) return fallback
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

export function normalizeUuidParam(value) {
  return String(value ?? "").trim().toLowerCase()
}

function encodeUuid(value) {
  return encodeURIComponent(normalizeUuidParam(value))
}

function clampPagination(page, limit) {
  const safePage =
    Number.isSafeInteger(Number(page)) && Number(page) > 0
      ? Number(page)
      : 1
  const safeLimit =
    Number.isSafeInteger(Number(limit)) &&
    Number(limit) > 0 &&
    Number(limit) <= 100
      ? Number(limit)
      : 20
  return { page: safePage, limit: safeLimit }
}

export function countResponseCodePoints(value) {
  return Array.from(String(value ?? "").trim()).length
}

export function validateSupplierResponse(value) {
  const trimmed = String(value ?? "").trim()
  const length = Array.from(trimmed).length

  if (length === 0) {
    return {
      valid: false,
      trimmed,
      length,
      error: "Vui lòng nhập nội dung phản hồi cho nhà trường.",
    }
  }

  if (length > MAX_RESPONSE_LENGTH) {
    return {
      valid: false,
      trimmed,
      length,
      error: `Nội dung phản hồi không được vượt quá ${MAX_RESPONSE_LENGTH.toLocaleString("vi-VN")} ký tự.`,
    }
  }

  return {
    valid: true,
    trimmed,
    length,
    error: "",
  }
}

export function extractApiError(
  error,
  fallbackMessage = "Đã xảy ra lỗi. Vui lòng thử lại.",
) {
  const status = error?.response?.status
  const apiData = error?.response?.data
  const message =
    (apiData && typeof apiData === "object"
      ? apiData.message
      : null) ||
    error?.message ||
    fallbackMessage

  const fields = {}
  const structuredFields = apiData?.error?.fields
  if (Array.isArray(structuredFields)) {
    structuredFields.forEach(item => {
      const key =
        item?.field ||
        (Array.isArray(item?.path) ? item.path[0] : item?.path) ||
        ""
      if (key && item?.message && !fields[key]) {
        fields[key] = item.message
      }
    })
  }

  return { status, message, fields }
}

function adaptSchoolRef(raw = {}) {
  return {
    id: raw?.id || "",
    name: raw?.name || "Trường học đối tác",
    code: raw?.code ?? null,
  }
}

function adaptDeliveryRef(raw = {}) {
  return {
    id: raw?.id || "",
    deliveryNo: raw?.deliveryNo || "Chưa có mã chuyến",
  }
}

function adaptUserRef(raw) {
  if (!raw || typeof raw !== "object") return null
  return {
    id: raw.id || "",
    fullName: raw.fullName || "Chưa cập nhật",
  }
}

function adaptIngredientLotRef(raw) {
  if (!raw || typeof raw !== "object") return null
  return {
    id: raw.id || "",
    lotCode: raw.lotCode || "Chưa có mã lô",
  }
}

function adaptComplaintListItem(raw = {}) {
  return {
    id: raw?.id || "",
    complaintCode: raw?.complaintCode ?? null,
    title: raw?.title || "Khiếu nại chất lượng nguyên liệu",
    school: adaptSchoolRef(raw?.school),
    delivery: adaptDeliveryRef(raw?.delivery),
    status: raw?.status || COMPLAINT_STATUS.SUBMITTED,
    createdAt: raw?.createdAt ?? null,
    respondedAt: raw?.respondedAt ?? null,
  }
}

function adaptComplaintDetail(raw = {}) {
  return {
    ...adaptComplaintListItem(raw),
    description: typeof raw?.description === "string" ? raw.description : "",
    updatedAt: raw?.updatedAt ?? null,
    submittedBy: adaptUserRef(raw?.submittedBy),
    ingredientLot: adaptIngredientLotRef(raw?.ingredientLot),
    supplierResponse:
      typeof raw?.supplierResponse === "string" ? raw.supplierResponse : null,
    respondedBy: adaptUserRef(raw?.respondedBy),
  }
}

const SupplierComplaintService = {
  async listComplaints({ page = 1, limit = 20, signal } = {}) {
    const query = clampPagination(page, limit)
    const response = await http.get(BASE_URL, {
      params: query,
      signal,
      notifyOnError: false,
    })
    const payload = response?.data ?? response ?? {}
    const rawItems = Array.isArray(payload.items) ? payload.items : []
    const rawPagination = payload.pagination || {}

    return {
      items: rawItems.map(adaptComplaintListItem),
      pagination: {
        page: Number(rawPagination.page) || query.page,
        limit: Number(rawPagination.limit) || query.limit,
        hasNext: Boolean(rawPagination.hasNext),
      },
    }
  },

  async getComplaintById(feedbackId, { signal } = {}) {
    const response = await http.get(`${BASE_URL}/${encodeUuid(feedbackId)}`, {
      signal,
      notifyOnError: false,
    })
    return adaptComplaintDetail(response?.data ?? response)
  },

  async respondToComplaint(feedbackId, supplierResponse, { signal } = {}) {
    const trimmed = String(supplierResponse ?? "").trim()
    const response = await http.post(
      `${BASE_URL}/${encodeUuid(feedbackId)}/response`,
      { supplierResponse: trimmed },
      {
        signal,
        notifyOnError: false,
      },
    )
    return adaptComplaintDetail(response?.data ?? response)
  },
}

export default SupplierComplaintService
