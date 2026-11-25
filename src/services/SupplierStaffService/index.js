import http from "src/services/01_axios"
import {
  PASSWORD_HINT,
  validEmail,
  validPassword,
} from "src/lib/authValidation"

const BASE_URL = "/supplier-staff"

export const STAFF_STATUS = {
  ACTIVE: "ACTIVE",
  LOCKED: "LOCKED",
  UNVERIFIED: "UNVERIFIED",
  DEACTIVATED: "DEACTIVATED",
}

export const STAFF_STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả" },
  { value: STAFF_STATUS.ACTIVE, label: "Đang hoạt động" },
  { value: STAFF_STATUS.LOCKED, label: "Đã khóa" },
  { value: STAFF_STATUS.UNVERIFIED, label: "Chờ xác thực" },
  { value: STAFF_STATUS.DEACTIVATED, label: "Đã vô hiệu hóa" },
]

const STATUS_META = {
  [STAFF_STATUS.ACTIVE]: {
    label: "Đang hoạt động",
    tone: "success",
  },
  [STAFF_STATUS.LOCKED]: {
    label: "Đã khóa",
    tone: "warning",
  },
  [STAFF_STATUS.UNVERIFIED]: {
    label: "Chờ xác thực",
    tone: "info",
  },
  [STAFF_STATUS.DEACTIVATED]: {
    label: "Đã vô hiệu hóa",
    tone: "muted",
  },
}

const PERMISSION_MODULE_LABELS = {
  dashboard: "Tổng quan",
  supply_request: "Đơn hàng cung ứng",
  delivery: "Đơn giao hàng",
  ingredient_quality_feedback: "Phản hồi chất lượng",
}

const USERNAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_.-]{2,119}$/
const utf8Encoder = new TextEncoder()

export { PASSWORD_HINT, validEmail, validPassword }

export function getStaffStatusMeta(status) {
  return STATUS_META[status] || { label: status || "Không xác định", tone: "muted" }
}

export function canToggleStaffStatus(status) {
  return status === STAFF_STATUS.ACTIVE || status === STAFF_STATUS.LOCKED
}

export function getPermissionModuleLabel(moduleCode) {
  if (!moduleCode) return "Khác"
  return PERMISSION_MODULE_LABELS[moduleCode] || String(moduleCode)
}

export function formatDateTimeVi(value) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

export function validUsername(value) {
  const trimmed = String(value ?? "").trim()
  return USERNAME_PATTERN.test(trimmed)
}

export function getUtf8ByteLength(value) {
  return utf8Encoder.encode(String(value ?? "")).length
}

export function buildCreateStaffPayload(values = {}) {
  const username = String(values.username ?? "").trim()
  const fullName = String(values.fullName ?? "").trim()
  const email = String(values.email ?? "").trim().toLowerCase()
  const password = String(values.password ?? "")
  const trimmedPhone = String(values.phone ?? "").trim()

  return {
    username,
    fullName,
    email,
    password,
    phone: trimmedPhone ? trimmedPhone : null,
  }
}

export function validateCreateStaffForm(values = {}) {
  const payload = buildCreateStaffPayload(values)
  const errors = {}

  if (!payload.username) {
    errors.username = "Vui lòng nhập tên đăng nhập"
  } else if (payload.username.length < 3 || payload.username.length > 120) {
    errors.username = "Tên đăng nhập phải từ 3 đến 120 ký tự"
  } else if (!USERNAME_PATTERN.test(payload.username)) {
    errors.username =
      "Tên đăng nhập bắt đầu bằng chữ hoặc số và chỉ gồm chữ, số, dấu chấm, gạch dưới hoặc gạch ngang"
  }

  if (!payload.fullName) {
    errors.fullName = "Vui lòng nhập họ và tên nhân viên"
  } else if (payload.fullName.length > 255) {
    errors.fullName = "Họ và tên tối đa 255 ký tự"
  }

  if (!payload.email) {
    errors.email = "Vui lòng nhập email"
  } else if (payload.email.length > 254 || !validEmail(payload.email)) {
    errors.email = "Email không hợp lệ"
  }

  if (payload.phone && payload.phone.length > 30) {
    errors.phone = "Số điện thoại tối đa 30 ký tự"
  }

  if (!payload.password) {
    errors.password = "Vui lòng nhập mật khẩu"
  } else if (getUtf8ByteLength(payload.password) > 72) {
    errors.password = "Mật khẩu tối đa 72 byte"
  } else if (!validPassword(payload.password)) {
    errors.password = PASSWORD_HINT
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export function extractApiError(error, fallbackMessage = "Đã xảy ra lỗi. Vui lòng thử lại.") {
  const status = error?.response?.status
  const apiData = error?.response?.data
  const message = apiData?.message || error?.message || fallbackMessage

  const fields = {}
  const structuredFields = apiData?.error?.fields
  if (Array.isArray(structuredFields)) {
    structuredFields.forEach(item => {
      const key =
        item?.field ||
        item?.path ||
        (Array.isArray(item?.path) ? item.path[0] : "")
      if (key && item?.message && !fields[key]) {
        fields[key] = item.message
      }
    })
  }

  const rawErrors = apiData?.errors
  if (Array.isArray(rawErrors)) {
    rawErrors.forEach(item => {
      const key =
        item?.field ||
        item?.path ||
        (Array.isArray(item?.path) ? item.path[0] : "")
      if (key && item?.message && !fields[key]) {
        fields[key] = item.message
      }
    })
  } else if (rawErrors && typeof rawErrors === "object") {
    Object.entries(rawErrors).forEach(([key, val]) => {
      if (!fields[key] && typeof val === "string" && val.trim()) {
        fields[key] = val
      } else if (!fields[key] && Array.isArray(val) && val[0]) {
        fields[key] = String(val[0])
      }
    })
  }

  return { status, message, fields }
}

function encodeId(id) {
  return encodeURIComponent(String(id || "").trim())
}

function adaptStaffSummary(row = {}) {
  return {
    id: row.id || "",
    username: row.username || "",
    fullName: row.fullName || "",
    email: row.email || "",
    phone: row.phone ?? null,
    roleCode: row.roleCode || "INGREDIENT_SUPPLIER_STAFF",
    roleName: row.roleName || "Nhân viên nhà cung cấp",
    status: row.status || STAFF_STATUS.ACTIVE,
  }
}

function adaptStaffDetail(row = {}) {
  return {
    ...adaptStaffSummary(row),
    supplierId: row.supplierId || "",
    createdAt: row.createdAt || null,
    updatedAt: row.updatedAt || null,
  }
}

function adaptPermissionItem(row = {}) {
  return {
    id: row.id || "",
    code: row.code || "",
    name: row.name || row.code || "Quyền hệ thống",
    module: row.module || "",
    action: row.action || "",
    description: row.description ?? null,
    isActive: row.isActive !== false,
    enabled: Boolean(row.enabled),
  }
}

function adaptStaffPermissions(row = {}) {
  return {
    userId: row.userId || "",
    roleId: row.roleId || "",
    permissions: Array.isArray(row.permissions)
      ? row.permissions.map(adaptPermissionItem)
      : [],
  }
}

const SupplierStaffService = {
  async list({ page = 1, limit = 20, signal } = {}) {
    const safePage =
      Number.isInteger(Number(page)) && Number(page) > 0 ? Number(page) : 1
    const safeLimit =
      Number.isInteger(Number(limit)) && Number(limit) > 0 && Number(limit) <= 100
        ? Number(limit)
        : 20

    const response = await http.get(BASE_URL, {
      params: { page: safePage, limit: safeLimit },
      signal,
      notifyOnError: false,
    })

    const payload = response?.data ?? response ?? {}
    const rawItems = Array.isArray(payload.items) ? payload.items : []
    const rawPagination = payload.pagination || {}

    return {
      items: rawItems.map(adaptStaffSummary),
      // Trạng thái tiếp nhận của NCC (ACTIVE | PAUSED | PAUSED_FOR_FOOD_SAFETY_INSPECTION)
      supplierIntakeState: payload.supplierIntakeState || null,
      pagination: {
        page: Number(rawPagination.page) || safePage,
        limit: Number(rawPagination.limit) || safeLimit,
        hasNext: Boolean(rawPagination.hasNext),
      },
    }
  },

  async getById(userId, { signal } = {}) {
    const response = await http.get(`${BASE_URL}/${encodeId(userId)}`, {
      signal,
      notifyOnError: false,
    })
    return adaptStaffDetail(response?.data ?? response)
  },

  async create(values) {
    const payload = buildCreateStaffPayload(values)
    const response = await http.post(BASE_URL, payload, {
      notifyOnError: false,
    })
    return adaptStaffDetail(response?.data ?? response)
  },

  async changeStatus(userId, status) {
    const response = await http.patch(
      `${BASE_URL}/${encodeId(userId)}/status`,
      { status },
      { notifyOnError: false },
    )
    return adaptStaffDetail(response?.data ?? response)
  },

  async getPermissions(userId, { signal } = {}) {
    const response = await http.get(
      `${BASE_URL}/${encodeId(userId)}/permissions`,
      {
        signal,
        notifyOnError: false,
      },
    )
    return adaptStaffPermissions(response?.data ?? response)
  },

  async disablePermission(userId, permissionId) {
    const response = await http.put(
      `${BASE_URL}/${encodeId(userId)}/permission-denials/${encodeId(permissionId)}`,
      {},
      { notifyOnError: false },
    )
    return adaptStaffPermissions(response?.data ?? response)
  },

  async enablePermission(userId, permissionId) {
    const response = await http.delete(
      `${BASE_URL}/${encodeId(userId)}/permission-denials/${encodeId(permissionId)}`,
      { notifyOnError: false },
    )
    return adaptStaffPermissions(response?.data ?? response)
  },
}

export default SupplierStaffService
