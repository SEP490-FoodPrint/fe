import http from "../01_axios"
import {
  apiCreateSourceFacility,
  apiDeactivateSourceFacility,
  apiGetSourceFacilities,
  apiGetSourceFacilityDetail,
  apiUpdateSourceFacility,
} from "./urls"

export const FACILITY_STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "ACTIVE", label: "Đang hoạt động" },
  { value: "INACTIVE", label: "Ngừng hoạt động" },
]

export const ALLOWED_PAYLOAD_FIELDS = [
  "name",
  "address",
  "contactName",
  "contactPhone",
  "contactEmail",
]

const STATUS_LABELS = {
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Ngừng hoạt động",
}

export function getFacilityStatusLabel(status) {
  return STATUS_LABELS[status] || "Đang hoạt động"
}

export function formatDateVi(value) {
  if (!value) return "—"
  const raw = String(value).trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [yyyy, mm, dd] = raw.split("-")
    return `${dd}/${mm}/${yyyy}`
  }
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return "—"
  return parsed.toLocaleDateString("vi-VN")
}

export function formatDateTimeVi(value) {
  if (!value) return "—"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "—"
  return parsed.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function isValidEmail(email) {
  if (!email) return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())
}

export function isValidPhoneNumber(phone) {
  if (!phone) return true
  const trimmed = String(phone).trim()
  if (trimmed.length > 30) return false
  if (!/^[+\d][\d\s().-]{6,29}$/.test(trimmed)) return false
  const digits = trimmed.replace(/\D/g, "")
  return digits.length >= 8 && digits.length <= 15
}

export function adaptSourceFacility(item = {}) {
  return {
    id: item.id || "",
    supplierId: item.supplierId || "",
    facilityCode: item.facilityCode ?? null,
    name: item.name || "",
    status: item.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    isVisible: typeof item.isVisible === "boolean" ? item.isVisible : true,
    address: item.address ?? null,
    contactName: item.contactName ?? null,
    contactPhone: item.contactPhone ?? null,
    contactEmail: item.contactEmail ?? null,
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
  }
}

function normalizeOptionalString(value) {
  if (value === null || value === undefined) return null
  const trimmed = String(value).trim()
  return trimmed.length > 0 ? trimmed : null
}

/**
 * Builds a strict payload containing only fields accepted by POST / PATCH /source-facilities.
 * Never includes read-only fields such as id, supplierId, facilityCode, or status.
 */
export function buildSourceFacilityPayload(values = {}) {
  return {
    name: String(values.name ?? "").trim(),
    address: normalizeOptionalString(values.address),
    contactName: normalizeOptionalString(values.contactName),
    contactPhone: normalizeOptionalString(values.contactPhone),
    contactEmail: normalizeOptionalString(values.contactEmail),
  }
}

export function validateFacilityForm(values = {}) {
  const errors = {}
  const name = String(values.name ?? "").trim()
  const contactName = String(values.contactName ?? "").trim()
  const contactPhone = String(values.contactPhone ?? "").trim()
  const contactEmail = String(values.contactEmail ?? "").trim()

  if (!name) {
    errors.name = "Vui lòng nhập tên cơ sở nguồn cung."
  } else if (name.length > 255) {
    errors.name = "Tên cơ sở không được vượt quá 255 ký tự."
  }

  if (contactName.length > 255) {
    errors.contactName = "Tên người liên hệ không được vượt quá 255 ký tự."
  }

  if (contactPhone && !isValidPhoneNumber(contactPhone)) {
    errors.contactPhone =
      "Số điện thoại không hợp lệ (8–15 chữ số, tối đa 30 ký tự)."
  }

  if (contactEmail && !isValidEmail(contactEmail)) {
    errors.contactEmail = "Email liên hệ không đúng định dạng."
  }

  return errors
}

export function extractApiError(error, fallbackMessage = "Đã xảy ra lỗi. Vui lòng thử lại.") {
  const status = error?.response?.status ?? null
  const responseData = error?.response?.data
  const message =
    responseData?.message || error?.message || fallbackMessage

  const fieldErrors = {}
  const fields = responseData?.error?.fields
  if (Array.isArray(fields)) {
    fields.forEach(item => {
      if (item?.field && item?.message && !fieldErrors[item.field]) {
        fieldErrors[item.field] = item.message
      }
    })
  }

  return {
    status,
    message,
    fieldErrors,
  }
}

const SourceFacilityService = {
  async list({ page = 1, limit = 20, signal } = {}) {
    const res = await http.get(apiGetSourceFacilities, {
      params: { page, limit },
      signal,
      notifyOnError: false,
    })
    const data = res?.data ?? res ?? {}
    const rawItems = Array.isArray(data.items) ? data.items : []
    const rawPagination = data.pagination || {}
    return {
      items: rawItems.map(adaptSourceFacility),
      pagination: {
        page: Number(rawPagination.page) || page,
        limit: Number(rawPagination.limit) || limit,
        hasNext: Boolean(rawPagination.hasNext),
      },
    }
  },

  async getById(id, { signal } = {}) {
    const res = await http.get(apiGetSourceFacilityDetail(id), {
      signal,
      notifyOnError: false,
    })
    return adaptSourceFacility(res?.data ?? res)
  },

  async create(values) {
    const payload = buildSourceFacilityPayload(values)
    const res = await http.post(apiCreateSourceFacility, payload, {
      notifyOnError: false,
    })
    return adaptSourceFacility(res?.data ?? res)
  },

  async update(id, values) {
    const payload = buildSourceFacilityPayload(values)
    const res = await http.patch(apiUpdateSourceFacility(id), payload, {
      notifyOnError: false,
    })
    return adaptSourceFacility(res?.data ?? res)
  },

  async deactivate(id) {
    const res = await http.post(
      apiDeactivateSourceFacility(id),
      {},
      { notifyOnError: false },
    )
    return adaptSourceFacility(res?.data ?? res)
  },
}

export default SourceFacilityService
