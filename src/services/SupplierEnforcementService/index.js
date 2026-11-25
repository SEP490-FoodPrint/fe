import http from "src/services/01_axios"
import { USE_NEW_FEATURES_MOCK } from "src/lib/config"
import { mockSupplierEnforcement } from "src/services/mockNewFeatures"
import { extractApiError } from "src/services/FoodSafetyIncidentService"

const ACTIONS_BASE = "/supplier-enforcement-actions"
const INCIDENTS_BASE = "/food-safety-incidents"

export const ENFORCEMENT_ACTION_TYPE = {
  PAUSE_INTAKE: "PAUSE_INTAKE",
  LOCK_ACCOUNT: "LOCK_ACCOUNT",
  RESTORE: "RESTORE",
}

export const ENFORCEMENT_ACTION_TYPE_META = {
  [ENFORCEMENT_ACTION_TYPE.PAUSE_INTAKE]: {
    label: "Tạm dừng tiếp nhận đơn",
    shortLabel: "Tạm dừng tiếp nhận",
    tone: "warning",
    description:
      "Chuyển trạng thái tiếp nhận đơn hàng của nhà cung cấp sang tạm dừng phục vụ kiểm tra ATTP.",
  },
  [ENFORCEMENT_ACTION_TYPE.LOCK_ACCOUNT]: {
    label: "Khóa toàn bộ tài khoản NCC",
    shortLabel: "Khóa tài khoản NCC",
    tone: "danger",
    description:
      "Tạm dừng tiếp nhận đơn, đồng thời khóa toàn bộ tài khoản đang hoạt động của nhà cung cấp và thu hồi phiên đăng nhập.",
  },
  [ENFORCEMENT_ACTION_TYPE.RESTORE]: {
    label: "Gỡ chế tài / Khôi phục",
    shortLabel: "Khôi phục NCC",
    tone: "success",
    description:
      "Gỡ bỏ hạn chế gắn với hồ sơ sự cố này. Nếu NCC còn hạn chế từ hồ sơ khác, trạng thái chung sẽ tiếp tục được duy trì.",
  },
}

export const ENFORCEMENT_ACTION_TYPE_OPTIONS = [
  { value: "", label: "Tất cả loại chế tài" },
  {
    value: ENFORCEMENT_ACTION_TYPE.PAUSE_INTAKE,
    label: ENFORCEMENT_ACTION_TYPE_META.PAUSE_INTAKE.label,
  },
  {
    value: ENFORCEMENT_ACTION_TYPE.LOCK_ACCOUNT,
    label: ENFORCEMENT_ACTION_TYPE_META.LOCK_ACCOUNT.label,
  },
  {
    value: ENFORCEMENT_ACTION_TYPE.RESTORE,
    label: ENFORCEMENT_ACTION_TYPE_META.RESTORE.label,
  },
]

export const DECISION_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
}

export const DECISION_STATUS_META = {
  [DECISION_STATUS.PENDING]: {
    label: "Chờ phê duyệt",
    tone: "warning",
  },
  [DECISION_STATUS.APPROVED]: {
    label: "Đã phê duyệt",
    tone: "success",
  },
  [DECISION_STATUS.REJECTED]: {
    label: "Đã từ chối",
    tone: "danger",
  },
}

export const DECISION_STATUS_OPTIONS = [
  { value: "", label: "Tất cả quyết định" },
  {
    value: DECISION_STATUS.PENDING,
    label: DECISION_STATUS_META.PENDING.label,
  },
  {
    value: DECISION_STATUS.APPROVED,
    label: DECISION_STATUS_META.APPROVED.label,
  },
  {
    value: DECISION_STATUS.REJECTED,
    label: DECISION_STATUS_META.REJECTED.label,
  },
]

export const EXECUTION_STATUS = {
  NOT_APPLIED: "NOT_APPLIED",
  APPLIED: "APPLIED",
  FAILED: "FAILED",
}

export const EXECUTION_STATUS_META = {
  [EXECUTION_STATUS.NOT_APPLIED]: {
    label: "Chưa thực thi",
    tone: "muted",
  },
  [EXECUTION_STATUS.APPLIED]: {
    label: "Đã thực thi",
    tone: "success",
  },
  [EXECUTION_STATUS.FAILED]: {
    label: "Thực thi lỗi",
    tone: "danger",
  },
}

export const EXECUTION_STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái thực thi" },
  {
    value: EXECUTION_STATUS.NOT_APPLIED,
    label: EXECUTION_STATUS_META.NOT_APPLIED.label,
  },
  {
    value: EXECUTION_STATUS.APPLIED,
    label: EXECUTION_STATUS_META.APPLIED.label,
  },
  {
    value: EXECUTION_STATUS.FAILED,
    label: EXECUTION_STATUS_META.FAILED.label,
  },
]

export const INTAKE_STATE = {
  ACTIVE: "ACTIVE",
  PAUSED: "PAUSED",
  PAUSED_FOR_FOOD_SAFETY_INSPECTION: "PAUSED_FOR_FOOD_SAFETY_INSPECTION",
}

export const INTAKE_STATE_META = {
  [INTAKE_STATE.ACTIVE]: {
    label: "Đang tiếp nhận đơn",
    tone: "success",
  },
  [INTAKE_STATE.PAUSED]: {
    label: "Tạm dừng tiếp nhận",
    tone: "warning",
  },
  [INTAKE_STATE.PAUSED_FOR_FOOD_SAFETY_INSPECTION]: {
    label: "Tạm dừng để kiểm tra ATTP",
    tone: "danger",
  },
}

export function getActionTypeMeta(actionType) {
  return (
    ENFORCEMENT_ACTION_TYPE_META[actionType] || {
      label: actionType || "Không xác định",
      shortLabel: actionType || "Không xác định",
      tone: "muted",
      description: "",
    }
  )
}

export function getDecisionStatusMeta(status) {
  return (
    DECISION_STATUS_META[status] || {
      label: status || "Không xác định",
      tone: "muted",
    }
  )
}

export function getExecutionStatusMeta(status) {
  return (
    EXECUTION_STATUS_META[status] || {
      label: status || "Không xác định",
      tone: "muted",
    }
  )
}

export function getIntakeStateMeta(state) {
  return (
    INTAKE_STATE_META[state] || {
      label: state || "Không xác định",
      tone: "muted",
    }
  )
}

export { extractApiError }

function clampPagination(page, limit) {
  const safePage =
    Number.isSafeInteger(Number(page)) && Number(page) > 0 ? Number(page) : 1
  const safeLimit =
    Number.isSafeInteger(Number(limit)) &&
    Number(limit) > 0 &&
    Number(limit) <= 100
      ? Number(limit)
      : 20
  return { page: safePage, limit: safeLimit }
}

export async function requestEnforcement(incidentId, payload) {
  if (USE_NEW_FEATURES_MOCK) {
    return mockSupplierEnforcement.requestEnforcement(incidentId, payload)
  }
  const response = await http.post(
    `${INCIDENTS_BASE}/${encodeURIComponent(incidentId)}/enforcement-actions`,
    payload,
    { notifyOnError: false },
  )
  return response?.data ?? response
}

export async function listActions(params = {}, signal) {
  if (USE_NEW_FEATURES_MOCK) {
    return mockSupplierEnforcement.listActions(params)
  }
  const { page = 1, limit = 20, ...rest } = params
  const query = clampPagination(page, limit)
  const filterKeys = [
    "incidentId",
    "supplierId",
    "actionType",
    "decisionStatus",
    "executionStatus",
  ]
  filterKeys.forEach(key => {
    if (rest[key]) query[key] = rest[key]
  })

  const response = await http.get(ACTIONS_BASE, {
    params: query,
    signal,
    notifyOnError: false,
  })
  const payload = response?.data ?? response ?? {}
  const items = Array.isArray(payload.items)
    ? payload.items
    : Array.isArray(payload)
      ? payload
      : []
  const rawPagination = payload.pagination || {}

  return {
    items,
    pagination: {
      page: Number(rawPagination.page) || query.page,
      limit: Number(rawPagination.limit) || query.limit,
      hasNext: Boolean(rawPagination.hasNext),
    },
  }
}

export async function getActionDetail(actionId, signal) {
  if (USE_NEW_FEATURES_MOCK) {
    return mockSupplierEnforcement.getActionDetail(actionId)
  }
  const response = await http.get(
    `${ACTIONS_BASE}/${encodeURIComponent(actionId)}`,
    {
      signal,
      notifyOnError: false,
    },
  )
  return response?.data ?? response
}

export async function approveAction(actionId, payload = {}) {
  if (USE_NEW_FEATURES_MOCK) {
    return mockSupplierEnforcement.approveAction(actionId, payload)
  }
  const body = {}
  if (payload?.note && String(payload.note).trim()) {
    body.note = String(payload.note).trim()
  }
  const response = await http.post(
    `${ACTIONS_BASE}/${encodeURIComponent(actionId)}/approve`,
    body,
    { notifyOnError: false },
  )
  return response?.data ?? response
}

export async function rejectAction(actionId, payload) {
  if (USE_NEW_FEATURES_MOCK) {
    return mockSupplierEnforcement.rejectAction(actionId, payload)
  }
  const response = await http.post(
    `${ACTIONS_BASE}/${encodeURIComponent(actionId)}/reject`,
    { note: String(payload?.note ?? "").trim() },
    { notifyOnError: false },
  )
  return response?.data ?? response
}

export async function retryAction(actionId) {
  if (USE_NEW_FEATURES_MOCK) {
    return mockSupplierEnforcement.retryAction(actionId)
  }
  const response = await http.post(
    `${ACTIONS_BASE}/${encodeURIComponent(actionId)}/retry`,
    {},
    { notifyOnError: false },
  )
  return response?.data ?? response
}

const SupplierEnforcementService = {
  requestEnforcement,
  listActions,
  getActionDetail,
  approveAction,
  rejectAction,
  retryAction,
}

export default SupplierEnforcementService
