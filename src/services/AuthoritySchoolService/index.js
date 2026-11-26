import http from "src/services/01_axios"

const BASE_URL = "/commune-food-safety-units/me/schools"

export const SCHOOL_STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "ACTIVE", label: "Đang hoạt động" },
  { value: "INACTIVE", label: "Ngừng hoạt động" },
]

export function getSchoolStatusMeta(status) {
  const upper = String(status || "").toUpperCase()
  if (upper === "ACTIVE") {
    return { label: "Đang hoạt động", tone: "success" }
  }
  if (upper === "INACTIVE") {
    return { label: "Ngừng hoạt động", tone: "muted" }
  }
  return { label: status || "Không xác định", tone: "muted" }
}

export function getIntakeStateMeta(intakeState) {
  switch (intakeState) {
    case "ACTIVE":
      return { label: "Đang tiếp nhận", tone: "success" }
    case "PAUSED":
      return { label: "Tạm dừng tiếp nhận", tone: "warning" }
    case "PAUSED_FOR_FOOD_SAFETY_INSPECTION":
      return { label: "Tạm dừng kiểm tra ATTP", tone: "danger" }
    default:
      return { label: intakeState || "—", tone: "muted" }
  }
}

export function getRelationshipStatusMeta(relationshipStatus) {
  switch (relationshipStatus) {
    case "ACTIVE":
      return { label: "Đang liên kết", tone: "success" }
    case "SUSPENDED":
      return { label: "Tạm dừng liên kết", tone: "warning" }
    default:
      return { label: relationshipStatus || "—", tone: "muted" }
  }
}

export function formatDateVi(value) {
  if (!value) return "—"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "—"
  return parsed.toLocaleDateString("vi-VN")
}

function adaptSchoolItem(row = {}) {
  return {
    id: row.id || "",
    code: row.code ?? null,
    name: row.name || "",
    address: row.address ?? null,
    phone: row.phone ?? null,
    email: row.email ?? null,
    status: row.status || "ACTIVE",
    location: row.location
      ? {
          id: row.location.id || "",
          code: row.location.code || "",
          name: row.location.name || "",
        }
      : null,
  }
}

function adaptLinkedSupplier(row = {}) {
  return {
    id: row.id || "",
    name: row.name || "",
    taxCode: row.taxCode ?? null,
    phone: row.phone ?? null,
    email: row.email ?? null,
    address: row.address ?? null,
    location: row.location
      ? {
          id: row.location.id || "",
          code: row.location.code || "",
          name: row.location.name || "",
        }
      : null,
    intakeState: row.intakeState || "ACTIVE",
    relationshipStatus: row.relationshipStatus || "ACTIVE",
    linkedAt: row.linkedAt ?? null,
    suspendedAt: row.suspendedAt ?? null,
  }
}

const AuthoritySchoolService = {
  async listSchools(params = {}, signal) {
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
      query.search = String(params.search).trim().slice(0, 100)
    }
    if (params.status && params.status !== "ALL") {
      query.status = params.status
    }

    const response = await http.get(BASE_URL, {
      params: query,
      signal,
      notifyOnError: false,
    })

    const payload = response?.data ?? response ?? {}
    const items = Array.isArray(payload.items)
      ? payload.items.map(adaptSchoolItem)
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

  async getSchoolDetail(schoolId, signal) {
    const response = await http.get(
      `${BASE_URL}/${encodeURIComponent(String(schoolId || "").trim())}`,
      {
        signal,
        notifyOnError: false,
      },
    )
    const data = response?.data ?? response ?? {}
    return {
      ...adaptSchoolItem(data),
      suppliers: Array.isArray(data.suppliers)
        ? data.suppliers.map(adaptLinkedSupplier)
        : [],
    }
  },
}

export default AuthoritySchoolService
