import http from "src/services/01_axios"

const BASE_URL = "/authority-officers"
const utf8Encoder = new TextEncoder()

export const OFFICER_USERNAME_REGEX = /^[a-z0-9][a-z0-9_.-]{2,119}$/

export const OFFICER_STATUS = {
  UNVERIFIED: "UNVERIFIED",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  LOCKED: "LOCKED",
  DEACTIVATED: "DEACTIVATED",
}

export const OFFICER_STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: OFFICER_STATUS.ACTIVE, label: "Đang hoạt động" },
  { value: OFFICER_STATUS.UNVERIFIED, label: "Chờ thiết lập email" },
  { value: OFFICER_STATUS.INACTIVE, label: "Ngừng hoạt động" },
  { value: OFFICER_STATUS.LOCKED, label: "Đã khóa" },
  { value: OFFICER_STATUS.DEACTIVATED, label: "Đã vô hiệu hóa" },
]

const STATUS_META = {
  [OFFICER_STATUS.ACTIVE]: { label: "Đang hoạt động", tone: "success" },
  [OFFICER_STATUS.UNVERIFIED]: { label: "Chờ thiết lập email", tone: "warning" },
  [OFFICER_STATUS.INACTIVE]: { label: "Ngừng hoạt động", tone: "muted" },
  [OFFICER_STATUS.LOCKED]: { label: "Đã khóa", tone: "danger" },
  [OFFICER_STATUS.DEACTIVATED]: { label: "Đã vô hiệu hóa", tone: "muted" },
}

const UNIT_STATUS_META = {
  ACTIVE: { label: "Đang hoạt động", tone: "success" },
  INACTIVE: { label: "Ngừng hoạt động", tone: "muted" },
}

export const AUTHORITY_OFFICER_CONFLICT_MESSAGES = {
  AUTHORITY_OFFICER_EXISTS: {
    message:
      "Phường/xã này đã có tài khoản cán bộ ATTP. Mỗi phường/xã chỉ được cấp tối đa 1 tài khoản.",
    field: "locationId",
  },
  USERNAME_TAKEN: {
    message:
      "Tên đăng nhập này đã được sử dụng. Vui lòng chọn tên đăng nhập khác.",
    field: "username",
  },
  AUTHORITY_UNIT_INACTIVE: {
    message:
      "Đơn vị ATTP của phường/xã này hiện đang ngừng hoạt động nên không thể tạo thêm tài khoản.",
    field: "locationId",
  },
  AUTHORITY_UNIT_CODE_TAKEN: {
    message:
      "Mã đơn vị ATTP cho phường/xã này đã tồn tại trên hệ thống. Vui lòng kiểm tra lại cấu hình đơn vị.",
    field: "locationId",
  },
}

export function getOfficerStatusMeta(status) {
  return (
    STATUS_META[status] || {
      label: status || "Không xác định",
      tone: "muted",
    }
  )
}

export function getUnitStatusMeta(status) {
  return (
    UNIT_STATUS_META[status] || {
      label: status || "Không xác định",
      tone: "muted",
    }
  )
}

export function formatDateTimeVi(value) {
  if (!value) return "—"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "—"
  const day = String(parsed.getDate()).padStart(2, "0")
  const month = String(parsed.getMonth() + 1).padStart(2, "0")
  const year = parsed.getFullYear()
  const hours = String(parsed.getHours()).padStart(2, "0")
  const minutes = String(parsed.getMinutes()).padStart(2, "0")
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

export function getUtf8ByteLength(value) {
  return utf8Encoder.encode(String(value ?? "")).length
}

export function checkPasswordChecks(password = "") {
  const str = String(password)
  const charLength = [...str].length
  const byteLength = getUtf8ByteLength(str)
  const minLength = charLength >= 8
  const maxBytes = byteLength > 0 && byteLength <= 72
  const hasLower = /\p{Ll}/u.test(str)
  const hasUpper = /\p{Lu}/u.test(str)
  const hasDigit = /[0-9]/.test(str)
  const hasSymbol = /[\p{P}\p{S}]/u.test(str)
  return {
    charLength,
    byteLength,
    minLength,
    maxBytes,
    hasLower,
    hasUpper,
    hasDigit,
    hasSymbol,
    allValid:
      minLength && maxBytes && hasLower && hasUpper && hasDigit && hasSymbol,
  }
}

export function buildCreateOfficerPayload(values = {}) {
  const locationId = String(values.locationId || "").trim()
  const username = String(values.username || "").trim().toLowerCase()
  const password = String(values.password || "")
  const fullName = String(values.fullName || "").trim()
  const trimmedPhone = String(values.phone || "").trim()

  const payload = {
    locationId,
    username,
    password,
    fullName,
  }
  if (trimmedPhone) {
    payload.phone = trimmedPhone
  }
  return payload
}

export function validateCreateOfficer(values = {}) {
  const payload = buildCreateOfficerPayload(values)
  const errors = {}

  if (!payload.locationId) {
    errors.locationId = "Vui lòng chọn tỉnh/thành phố và phường/xã."
  }

  if (!payload.username) {
    errors.username = "Vui lòng nhập tên đăng nhập."
  } else if (!OFFICER_USERNAME_REGEX.test(payload.username)) {
    errors.username =
      "Tên đăng nhập gồm 3–120 ký tự, bắt đầu bằng chữ thường hoặc số, chỉ dùng chữ thường, số và các ký tự . _ -"
  }

  if (!payload.fullName) {
    errors.fullName = "Vui lòng nhập họ và tên cán bộ."
  } else if (payload.fullName.length > 255) {
    errors.fullName = "Họ và tên tối đa 255 ký tự."
  }

  if (payload.phone && payload.phone.length > 30) {
    errors.phone = "Số điện thoại tối đa 30 ký tự."
  }

  const pwdChecks = checkPasswordChecks(payload.password)
  if (!payload.password) {
    errors.password = "Vui lòng nhập mật khẩu."
  } else if (pwdChecks.byteLength > 72) {
    errors.password = "Mật khẩu tối đa 72 byte UTF-8."
  } else if (!pwdChecks.allValid) {
    errors.password =
      "Mật khẩu cần tối thiểu 8 ký tự, gồm chữ thường, chữ hoa, chữ số và ký tự đặc biệt."
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export function extractAuthorityOfficerError(
  error,
  fallback = "Đã xảy ra lỗi. Vui lòng thử lại.",
) {
  const status = error?.response?.status
  const apiData = error?.response?.data
  const code = apiData?.error?.code || ""
  const fields = {}

  if (Array.isArray(apiData?.error?.fields)) {
    apiData.error.fields.forEach(item => {
      const key = item?.field
      if (key && item?.message && !fields[key]) {
        fields[key] = item.message
      }
    })
  }

  if (status === 409 && code && AUTHORITY_OFFICER_CONFLICT_MESSAGES[code]) {
    const conflictInfo = AUTHORITY_OFFICER_CONFLICT_MESSAGES[code]
    if (conflictInfo.field && !fields[conflictInfo.field]) {
      fields[conflictInfo.field] = conflictInfo.message
    }
    return {
      status,
      code,
      message: conflictInfo.message,
      fields,
    }
  }

  const message = apiData?.message || error?.message || fallback
  return { status, code, message, fields }
}

function adaptOfficer(row = {}) {
  return {
    id: row.id || "",
    username: row.username || "",
    fullName: row.fullName || "",
    email: row.email ?? null,
    phone: row.phone ?? null,
    status: row.status || OFFICER_STATUS.UNVERIFIED,
    emailSetupRequired: Boolean(row.emailSetupRequired),
    emailVerifiedAt: row.emailVerifiedAt ?? null,
    createdAt: row.createdAt ?? null,
    unit: row.unit
      ? {
          id: row.unit.id || "",
          code: row.unit.code || "",
          name: row.unit.name || "",
          status: row.unit.status || "ACTIVE",
        }
      : null,
    location: row.location
      ? {
          id: row.location.id || "",
          code: row.location.code || "",
          name: row.location.name || "",
        }
      : null,
  }
}

const AuthorityOfficerService = {
  async list(params = {}, signal) {
    const query = {
      page:
        Number.isInteger(Number(params.page)) && Number(params.page) > 0
          ? Number(params.page)
          : 1,
      limit:
        Number.isInteger(Number(params.limit)) &&
        Number(params.limit) > 0 &&
        Number(params.limit) <= 100
          ? Number(params.limit)
          : 20,
    }
    if (params.search && String(params.search).trim()) {
      query.search = String(params.search).trim().slice(0, 120)
    }
    if (params.status && params.status !== "ALL") {
      query.status = params.status
    }
    if (params.locationId) {
      query.locationId = params.locationId
    }

    const response = await http.get(BASE_URL, {
      params: query,
      signal,
      notifyOnError: false,
    })

    const payload = response?.data ?? response ?? {}
    const items = Array.isArray(payload.items)
      ? payload.items.map(adaptOfficer)
      : []
    const pagination = payload.pagination || {}

    return {
      items,
      pagination: {
        page: Number(pagination.page) || query.page,
        limit: Number(pagination.limit) || query.limit,
        hasNext: Boolean(pagination.hasNext),
      },
    }
  },

  async detail(userId, signal) {
    const response = await http.get(
      `${BASE_URL}/${encodeURIComponent(String(userId || "").trim())}`,
      {
        signal,
        notifyOnError: false,
      },
    )
    return adaptOfficer(response?.data ?? response)
  },

  async create(values) {
    const payload = buildCreateOfficerPayload(values)
    const response = await http.post(BASE_URL, payload, {
      notifyOnError: false,
    })
    return adaptOfficer(response?.data ?? response)
  },
}

export default AuthorityOfficerService
