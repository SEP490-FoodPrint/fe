import http from "src/services/01_axios"
import { ORG_TYPES, ROLE_LABELS, ROLES } from "src/constants/roles"

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const ROLE_TYPE_LABELS = {
  [ORG_TYPES.SCHOOL]: "Nhà trường",
  [ORG_TYPES.SUPPLIER]: "Nhà cung cấp",
  [ORG_TYPES.AUTHORITY]: "Cơ quan ATTP cấp xã",
  [ORG_TYPES.SYSTEM]: "Quản trị hệ thống",
}

export const ROLE_TYPE_OPTIONS = [
  { value: "ALL", label: "Tất cả đơn vị" },
  { value: ORG_TYPES.SCHOOL, label: ROLE_TYPE_LABELS[ORG_TYPES.SCHOOL] },
  { value: ORG_TYPES.SUPPLIER, label: ROLE_TYPE_LABELS[ORG_TYPES.SUPPLIER] },
  { value: ORG_TYPES.AUTHORITY, label: ROLE_TYPE_LABELS[ORG_TYPES.AUTHORITY] },
]

export const PERMISSION_ASSIGNMENT_OPTIONS = [
  { value: "ALL", label: "Tất cả quyền" },
  { value: "ASSIGNED", label: "Đã bật" },
  { value: "UNASSIGNED", label: "Chưa bật" },
]

const PERMISSION_MODULE_LABELS = {
  authority: "Đơn vị ATTP xã",
  class: "Lớp học",
  class_allergy: "Dị ứng theo lớp",
  class_assignment: "Phân công GVCN",
  cooking_batch: "Chế biến bữa ăn",
  daily_meal_portion: "Suất ăn theo ngày",
  dashboard: "Tổng quan",
  delivery: "Giao nhận nguyên liệu",
  food_analysis_result: "Phân tích thực phẩm",
  food_safety_incident: "Sự cố ATTP",
  food_safety_report: "Báo cáo ATTP",
  ingredient: "Nguyên liệu",
  ingredient_quality_feedback: "Phản hồi chất lượng",
  inventory: "Kho nguyên liệu",
  meal_allocation: "Phân bổ suất ăn",
  meal_complaint: "Khiếu nại suất ăn",
  menu: "Thực đơn",
  permission: "Danh mục quyền",
  registration: "Hồ sơ đăng ký",
  retained_sample: "Mẫu lưu thực phẩm",
  role: "Vai trò hệ thống",
  role_permission: "Phân quyền vai trò",
  school: "Nhà trường & Vận hành",
  school_academic_year: "Niên khóa",
  school_alert: "Cảnh báo trường học",
  source_facility: "Cơ sở nguồn cung",
  supplier: "Nhà cung cấp",
  supplier_certification: "Chứng nhận NCC",
  supplier_relationship: "Liên kết Trường - NCC",
  supplier_staff: "Nhân viên NCC",
  supply_request: "Đơn hàng cung ứng",
  traceability: "Truy xuất nguồn gốc",
  user: "Tài khoản",
}

function normalizePositiveInt(value, fallback, max) {
  const num = Number(value)
  if (!Number.isInteger(num) || num <= 0) return fallback
  if (max && num > max) return max
  return num
}

export function normalizeUuidParam(value) {
  const normalized = String(value ?? "").trim().toLowerCase()
  if (!UUID_REGEX.test(normalized)) return ""
  return normalized
}

export function getRoleDisplayName(roleOrCode, fallbackName = "") {
  const code =
    typeof roleOrCode === "string"
      ? roleOrCode
      : String(roleOrCode?.code || "")
  const nameFromRole =
    typeof roleOrCode === "object" && roleOrCode !== null
      ? roleOrCode.name
      : fallbackName
  return ROLE_LABELS[code] || nameFromRole || code || "Vai trò hệ thống"
}

export function getRoleTypeLabel(type) {
  const normalized = String(type || "").toUpperCase()
  return ROLE_TYPE_LABELS[normalized] || type || "Khác"
}

export function getPermissionModuleLabel(moduleCode) {
  if (!moduleCode) return "Khác"
  return PERMISSION_MODULE_LABELS[moduleCode] || String(moduleCode)
}

export function isSystemAdminRole(role) {
  if (!role) return false
  return role.code === ROLES.SYSTEM_ADMIN || role.editable === false
}

export function filterManageableRoles(roles = []) {
  return (Array.isArray(roles) ? roles : []).filter(
    role => !isSystemAdminRole(role),
  )
}

export function buildNextRolePermissionIds(
  currentAssignedIds = [],
  permissionId,
  enable,
) {
  const targetId = normalizeUuidParam(permissionId)
  const uniqueIds = []
  const seen = new Set()

  ;(Array.isArray(currentAssignedIds) ? currentAssignedIds : []).forEach(id => {
    const normalized = normalizeUuidParam(id)
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized)
      uniqueIds.push(normalized)
    }
  })

  if (!targetId) return uniqueIds

  if (enable) {
    if (!seen.has(targetId)) {
      uniqueIds.push(targetId)
    }
    return uniqueIds
  }

  return uniqueIds.filter(id => id !== targetId)
}

export function mergeCatalogWithRolePermissions(
  catalogPermissions = [],
  roleAssignedPermissions = [],
) {
  const assignedMap = new Map()
  ;(Array.isArray(roleAssignedPermissions) ? roleAssignedPermissions : []).forEach(
    item => {
      const normalizedId = normalizeUuidParam(item?.id)
      if (normalizedId) {
        assignedMap.set(normalizedId, adaptPermissionItem(item))
      }
    },
  )

  const mergedById = new Map()
  ;(Array.isArray(catalogPermissions) ? catalogPermissions : []).forEach(
    item => {
      const adapted = adaptPermissionItem(item)
      const normalizedId = normalizeUuidParam(adapted.id)
      if (!normalizedId) return
      mergedById.set(normalizedId, {
        ...adapted,
        assigned: assignedMap.has(normalizedId),
      })
    },
  )

  assignedMap.forEach((item, normalizedId) => {
    if (!mergedById.has(normalizedId)) {
      mergedById.set(normalizedId, {
        ...item,
        assigned: true,
      })
    }
  })

  return Array.from(mergedById.values()).sort((a, b) =>
    String(a.code || "").localeCompare(String(b.code || ""), "en"),
  )
}

export function getUnassignedCatalogPermissions(
  catalogPermissions = [],
  roleAssignedPermissions = [],
) {
  const assignedIds = new Set(
    (Array.isArray(roleAssignedPermissions) ? roleAssignedPermissions : [])
      .map(item => normalizeUuidParam(item?.id))
      .filter(Boolean),
  )

  return (Array.isArray(catalogPermissions) ? catalogPermissions : [])
    .map(adaptPermissionItem)
    .filter(item => item.id && !assignedIds.has(item.id))
    .sort((a, b) => {
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1
      return String(a.code || "").localeCompare(String(b.code || ""), "en")
    })
}

export function extractApiError(
  error,
  fallbackMessage = "Đã xảy ra lỗi. Vui lòng thử lại.",
) {
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

  return { status, message, fields }
}

function adaptRoleSummary(row = {}) {
  const code = String(row.code || "").trim()
  const rawName = String(row.name || "").trim()
  return {
    id: normalizeUuidParam(row.id) || String(row.id || ""),
    code,
    name: rawName,
    displayName: getRoleDisplayName(code, rawName),
    type: String(row.type || ""),
    typeLabel: getRoleTypeLabel(row.type),
    editable: row.editable !== false && code !== ROLES.SYSTEM_ADMIN,
  }
}

function adaptPermissionItem(row = {}) {
  return {
    id: normalizeUuidParam(row.id) || String(row.id || ""),
    code: String(row.code || ""),
    name: String(row.name || row.code || "Quyền hệ thống"),
    module: String(row.module || ""),
    moduleLabel: getPermissionModuleLabel(row.module),
    action: String(row.action || ""),
    description: row.description ?? null,
    isActive: row.isActive !== false,
  }
}

const SystemConfigService = {
  async listRoles({ page = 1, limit = 100, signal } = {}) {
    const safePage = normalizePositiveInt(page, 1)
    const safeLimit = normalizePositiveInt(limit, 100, 100)

    const response = await http.get("/roles", {
      params: { page: safePage, limit: safeLimit },
      signal,
      notifyOnError: false,
    })

    const data = response?.data || {}
    const items = Array.isArray(data.items)
      ? data.items.map(adaptRoleSummary)
      : []

    return {
      items,
      pagination: {
        page: data.pagination?.page ?? safePage,
        limit: data.pagination?.limit ?? safeLimit,
        hasNext: Boolean(data.pagination?.hasNext),
      },
    }
  },

  async listAllManageableRoles({ signal } = {}) {
    const allItems = []
    let page = 1
    let hasNext = true

    while (hasNext) {
      const result = await SystemConfigService.listRoles({
        page,
        limit: 100,
        signal,
      })
      allItems.push(...result.items)
      hasNext = result.pagination.hasNext
      page += 1
      if (page > 20) break
    }

    return filterManageableRoles(allItems)
  },

  async listPermissions({ page = 1, limit = 100, signal } = {}) {
    const safePage = normalizePositiveInt(page, 1)
    const safeLimit = normalizePositiveInt(limit, 100, 100)

    const response = await http.get("/permissions", {
      params: { page: safePage, limit: safeLimit },
      signal,
      notifyOnError: false,
    })

    const data = response?.data || {}
    const items = Array.isArray(data.items)
      ? data.items.map(adaptPermissionItem)
      : []

    return {
      items,
      pagination: {
        page: data.pagination?.page ?? safePage,
        limit: data.pagination?.limit ?? safeLimit,
        hasNext: Boolean(data.pagination?.hasNext),
      },
    }
  },

  async listAllPermissions({ signal } = {}) {
    const allItems = []
    let page = 1
    let hasNext = true

    while (hasNext) {
      const result = await SystemConfigService.listPermissions({
        page,
        limit: 100,
        signal,
      })
      allItems.push(...result.items)
      hasNext = result.pagination.hasNext
      page += 1
      if (page > 20) break
    }

    return allItems
  },

  async getRolePermissions(roleId, { signal } = {}) {
    const normalizedId = normalizeUuidParam(roleId)
    if (!normalizedId) {
      const invalidError = new Error("Định danh vai trò không hợp lệ.")
      invalidError.response = {
        status: 400,
        data: { message: "Định danh vai trò không hợp lệ." },
      }
      throw invalidError
    }

    const response = await http.get(
      `/roles/${encodeURIComponent(normalizedId)}/permissions`,
      {
        signal,
        notifyOnError: false,
      },
    )

    const data = response?.data || {}
    const summary = adaptRoleSummary(data)
    return {
      ...summary,
      permissions: Array.isArray(data.permissions)
        ? data.permissions.map(adaptPermissionItem)
        : [],
    }
  },

  async replaceRolePermissions(roleId, permissionIds = []) {
    const normalizedId = normalizeUuidParam(roleId)
    if (!normalizedId) {
      const invalidError = new Error("Định danh vai trò không hợp lệ.")
      invalidError.response = {
        status: 400,
        data: { message: "Định danh vai trò không hợp lệ." },
      }
      throw invalidError
    }

    const normalizedPermissionIds = []
    const seen = new Set()

    ;(Array.isArray(permissionIds) ? permissionIds : []).forEach(item => {
      const normalized = normalizeUuidParam(item)
      if (!normalized) {
        const err = new Error("Danh sách quyền chứa mã không hợp lệ.")
        err.response = {
          status: 400,
          data: { message: "Danh sách quyền chứa mã không hợp lệ." },
        }
        throw err
      }
      if (!seen.has(normalized)) {
        seen.add(normalized)
        normalizedPermissionIds.push(normalized)
      }
    })

    if (normalizedPermissionIds.length > 1000) {
      const limitErr = new Error("Chỉ nhận tối đa 1000 quyền.")
      limitErr.response = {
        status: 400,
        data: { message: "Chỉ nhận tối đa 1000 quyền." },
      }
      throw limitErr
    }

    const response = await http.put(
      `/roles/${encodeURIComponent(normalizedId)}/permissions`,
      { permissionIds: normalizedPermissionIds },
      { notifyOnError: false },
    )

    const data = response?.data || {}
    return {
      roleId: normalizeUuidParam(data.roleId) || normalizedId,
      permissionIds: Array.isArray(data.permissionIds)
        ? data.permissionIds.map(id => normalizeUuidParam(id)).filter(Boolean)
        : normalizedPermissionIds,
    }
  },
}

export default SystemConfigService
