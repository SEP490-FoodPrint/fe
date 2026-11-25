import http from "src/services/01_axios"
import { USE_NEW_FEATURES_MOCK } from "src/lib/config"
import { mockFoodSafetyIncidents } from "src/services/mockNewFeatures"

const INCIDENTS_BASE = "/food-safety-incidents"
const REPORTS_BASE = "/food-safety-reports"

export const INCIDENT_STATUS = {
  PENDING_SCHOOL_REVIEW: "PENDING_SCHOOL_REVIEW",
  SUBMITTED_TO_AUTHORITY: "SUBMITTED_TO_AUTHORITY",
  AUTHORITY_ACKNOWLEDGED: "AUTHORITY_ACKNOWLEDGED",
  UNDER_INSPECTION: "UNDER_INSPECTION",
  INSPECTION_COMPLETED: "INSPECTION_COMPLETED",
  CLOSED: "CLOSED",
  CANCELLED_BY_SCHOOL: "CANCELLED_BY_SCHOOL",
}

export const INCIDENT_STATUS_META = {
  [INCIDENT_STATUS.PENDING_SCHOOL_REVIEW]: {
    label: "Chờ trường xác minh",
    tone: "warning",
  },
  [INCIDENT_STATUS.SUBMITTED_TO_AUTHORITY]: {
    label: "Đã chuyển ATTP",
    tone: "info",
  },
  [INCIDENT_STATUS.AUTHORITY_ACKNOWLEDGED]: {
    label: "ATTP đã tiếp nhận",
    tone: "info",
  },
  [INCIDENT_STATUS.UNDER_INSPECTION]: {
    label: "Đang kiểm tra",
    tone: "warning",
  },
  [INCIDENT_STATUS.INSPECTION_COMPLETED]: {
    label: "Hoàn tất kiểm tra",
    tone: "success",
  },
  [INCIDENT_STATUS.CLOSED]: {
    label: "Đã đóng hồ sơ",
    tone: "muted",
  },
  [INCIDENT_STATUS.CANCELLED_BY_SCHOOL]: {
    label: "Trường đã hủy",
    tone: "danger",
  },
}

export const INCIDENT_STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  {
    value: INCIDENT_STATUS.PENDING_SCHOOL_REVIEW,
    label: INCIDENT_STATUS_META.PENDING_SCHOOL_REVIEW.label,
  },
  {
    value: INCIDENT_STATUS.SUBMITTED_TO_AUTHORITY,
    label: INCIDENT_STATUS_META.SUBMITTED_TO_AUTHORITY.label,
  },
  {
    value: INCIDENT_STATUS.AUTHORITY_ACKNOWLEDGED,
    label: INCIDENT_STATUS_META.AUTHORITY_ACKNOWLEDGED.label,
  },
  {
    value: INCIDENT_STATUS.UNDER_INSPECTION,
    label: INCIDENT_STATUS_META.UNDER_INSPECTION.label,
  },
  {
    value: INCIDENT_STATUS.INSPECTION_COMPLETED,
    label: INCIDENT_STATUS_META.INSPECTION_COMPLETED.label,
  },
  {
    value: INCIDENT_STATUS.CLOSED,
    label: INCIDENT_STATUS_META.CLOSED.label,
  },
  {
    value: INCIDENT_STATUS.CANCELLED_BY_SCHOOL,
    label: INCIDENT_STATUS_META.CANCELLED_BY_SCHOOL.label,
  },
]

export const INCIDENT_SOURCE = {
  PARENT_REPORT: "PARENT_REPORT",
  TEACHER_REPORT: "TEACHER_REPORT",
  SCHOOL_DIRECT: "SCHOOL_DIRECT",
  LEGACY_IMPORT: "LEGACY_IMPORT",
}

export const INCIDENT_SOURCE_LABELS = {
  [INCIDENT_SOURCE.PARENT_REPORT]: "Phụ huynh báo cáo",
  [INCIDENT_SOURCE.TEACHER_REPORT]: "GVCN báo cáo",
  [INCIDENT_SOURCE.SCHOOL_DIRECT]: "Trường lập trực tiếp",
  [INCIDENT_SOURCE.LEGACY_IMPORT]: "Dữ liệu chuyển đổi",
}

export const PRELIMINARY_ASSESSMENT = {
  SCHOOL_MEAL_SUSPECTED: "SCHOOL_MEAL_SUSPECTED",
  OUTSIDE_MEAL: "OUTSIDE_MEAL",
  UNDETERMINED: "UNDETERMINED",
}

export const PRELIMINARY_ASSESSMENT_LABELS = {
  [PRELIMINARY_ASSESSMENT.SCHOOL_MEAL_SUSPECTED]:
    "Nghi ngờ liên quan bữa ăn tại trường",
  [PRELIMINARY_ASSESSMENT.OUTSIDE_MEAL]: "Nghi ngờ từ nguồn ăn bên ngoài trường",
  [PRELIMINARY_ASSESSMENT.UNDETERMINED]: "Chưa xác định nguyên nhân sơ bộ",
}

export const PRELIMINARY_ASSESSMENT_OPTIONS = Object.entries(
  PRELIMINARY_ASSESSMENT_LABELS,
).map(([value, label]) => ({ value, label }))

export const CANCELLATION_REASON = {
  DUPLICATE_REPORT: "DUPLICATE_REPORT",
  DATA_ENTRY_ERROR: "DATA_ENTRY_ERROR",
}

export const CANCELLATION_REASON_LABELS = {
  [CANCELLATION_REASON.DUPLICATE_REPORT]: "Báo cáo trùng lặp",
  [CANCELLATION_REASON.DATA_ENTRY_ERROR]: "Nhập nhầm thông tin",
}

export const CANCELLATION_REASON_OPTIONS = Object.entries(
  CANCELLATION_REASON_LABELS,
).map(([value, label]) => ({ value, label }))

export const SNAPSHOT_COMPLETENESS = {
  COMPLETE: "COMPLETE",
  PARTIAL: "PARTIAL",
  MISSING: "MISSING",
}

export const SNAPSHOT_COMPLETENESS_META = {
  [SNAPSHOT_COMPLETENESS.COMPLETE]: {
    label: "Đầy đủ chuỗi truy xuất",
    tone: "success",
  },
  [SNAPSHOT_COMPLETENESS.PARTIAL]: {
    label: "Truy xuất một phần",
    tone: "warning",
  },
  [SNAPSHOT_COMPLETENESS.MISSING]: {
    label: "Thiếu dữ liệu truy xuất",
    tone: "danger",
  },
}

export const MISSING_REASON_LABELS = {
  NO_ALLOCATIONS: "Chưa gắn suất ăn nào vào hồ sơ báo cáo ngộ độc",
  ALLOCATION_WITHOUT_COOKING_BATCH:
    "Suất ăn chưa liên kết với mẻ nấu tương ứng",
  COOKING_BATCH_DISH_WITHOUT_LOTS:
    "Món ăn trong mẻ nấu thiếu thông tin lô nguyên liệu sử dụng",
  COOKING_BATCH_DISH_WITHOUT_RETAINED_SAMPLE:
    "Món ăn trong mẻ nấu chưa ghi nhận mẫu lưu thực phẩm",
}

export const OVERALL_CONCLUSION = {
  SUPPLIER_AT_FAULT: "SUPPLIER_AT_FAULT",
  SCHOOL_AT_FAULT: "SCHOOL_AT_FAULT",
  MIXED_FAULT: "MIXED_FAULT",
  NOT_FOOD_RELATED: "NOT_FOOD_RELATED",
  INCONCLUSIVE: "INCONCLUSIVE",
}

export const OVERALL_CONCLUSION_LABELS = {
  [OVERALL_CONCLUSION.SUPPLIER_AT_FAULT]: "Lỗi thuộc về nhà cung cấp",
  [OVERALL_CONCLUSION.SCHOOL_AT_FAULT]: "Lỗi thuộc về nhà trường",
  [OVERALL_CONCLUSION.MIXED_FAULT]: "Lỗi từ cả nhà cung cấp và nhà trường",
  [OVERALL_CONCLUSION.NOT_FOOD_RELATED]: "Không liên quan đến thực phẩm",
  [OVERALL_CONCLUSION.INCONCLUSIVE]: "Chưa đủ căn cứ kết luận",
}

export const OVERALL_CONCLUSION_OPTIONS = Object.entries(
  OVERALL_CONCLUSION_LABELS,
).map(([value, label]) => ({ value, label }))

export const SUPPLIER_FINDING = {
  AT_FAULT: "AT_FAULT",
  CLEARED: "CLEARED",
  INCONCLUSIVE: "INCONCLUSIVE",
}

export const SUPPLIER_FINDING_META = {
  [SUPPLIER_FINDING.AT_FAULT]: {
    label: "Có vi phạm / lỗi",
    tone: "danger",
  },
  [SUPPLIER_FINDING.CLEARED]: {
    label: "Không phát hiện lỗi",
    tone: "success",
  },
  [SUPPLIER_FINDING.INCONCLUSIVE]: {
    label: "Chưa đủ căn cứ",
    tone: "warning",
  },
}

export const SUPPLIER_FINDING_OPTIONS = Object.entries(
  SUPPLIER_FINDING_META,
).map(([value, meta]) => ({ value, label: meta.label }))

export const FORWARDING_STATUS_META = {
  PENDING: { label: "Đang chờ gửi", tone: "warning" },
  SENT: { label: "Đã chuyển đơn vị ATTP", tone: "info" },
  FAILED: { label: "Chuyển thất bại", tone: "danger" },
}

export const INSPECTION_STATUS_META = {
  PLANNED: { label: "Đã lập kế hoạch", tone: "info" },
  COMPLETED: { label: "Đã có kết quả", tone: "success" },
}

export const MEAL_TYPE_LABELS = {
  BREAKFAST: "Bữa sáng",
  LUNCH: "Bữa trưa",
  AFTERNOON: "Bữa xế",
  SNACK: "Bữa phụ",
  DINNER: "Bữa tối",
}

export function getIncidentStatusMeta(status) {
  return (
    INCIDENT_STATUS_META[status] || {
      label: status || "Không xác định",
      tone: "muted",
    }
  )
}

export function getCompletenessMeta(completeness) {
  return (
    SNAPSHOT_COMPLETENESS_META[completeness] || {
      label: completeness || "Không xác định",
      tone: "muted",
    }
  )
}

export function getSupplierFindingMeta(finding) {
  return (
    SUPPLIER_FINDING_META[finding] || {
      label: finding || "Không xác định",
      tone: "muted",
    }
  )
}

export function getForwardingStatusMeta(status) {
  return (
    FORWARDING_STATUS_META[status] || {
      label: status || "Không xác định",
      tone: "muted",
    }
  )
}

export function getInspectionStatusMeta(status) {
  return (
    INSPECTION_STATUS_META[status] || {
      label: status || "Không xác định",
      tone: "muted",
    }
  )
}

export function formatCode(code, fallback = "—") {
  const trimmed = typeof code === "string" ? code.trim() : ""
  return trimmed || fallback
}

export function formatDateTimeVi(value, fallback = "—") {
  if (!value) return fallback
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback
  const dd = String(date.getDate()).padStart(2, "0")
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const yyyy = date.getFullYear()
  const hh = String(date.getHours()).padStart(2, "0")
  const min = String(date.getMinutes()).padStart(2, "0")
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`
}

export function formatDateVi(value, fallback = "—") {
  if (!value) return fallback
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback
  const dd = String(date.getDate()).padStart(2, "0")
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const yyyy = date.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

/**
 * Convert a `<input type="datetime-local">` value (`YYYY-MM-DDTHH:mm` or `YYYY-MM-DDTHH:mm:ss`)
 * into an ISO 8601 string WITH explicit local timezone offset (e.g. `2026-11-25T08:00:00+07:00`).
 */
export function toIsoWithTimezone(datetimeLocalValue) {
  if (!datetimeLocalValue) return undefined
  const raw = String(datetimeLocalValue).trim()
  if (!raw) return undefined
  if (/(Z|[+-]\d{2}:\d{2})$/i.test(raw)) return raw

  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return undefined

  const pad = n => String(n).padStart(2, "0")
  const yyyy = parsed.getFullYear()
  const mm = pad(parsed.getMonth() + 1)
  const dd = pad(parsed.getDate())
  const hh = pad(parsed.getHours())
  const min = pad(parsed.getMinutes())
  const sec = pad(parsed.getSeconds())

  const offsetMinutes = -parsed.getTimezoneOffset()
  const sign = offsetMinutes >= 0 ? "+" : "-"
  const absMinutes = Math.abs(offsetMinutes)
  const offH = pad(Math.floor(absMinutes / 60))
  const offM = pad(absMinutes % 60)

  return `${yyyy}-${mm}-${dd}T${hh}:${min}:${sec}${sign}${offH}:${offM}`
}

export function getDefaultDatetimeLocalValue(date = new Date()) {
  const pad = n => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function extractApiError(
  error,
  fallbackMessage = "Đã xảy ra lỗi. Vui lòng thử lại.",
) {
  const status = error?.response?.status
  const apiData = error?.response?.data
  const code = apiData?.error?.code || null
  const message =
    (apiData && typeof apiData === "object" ? apiData.message : null) ||
    error?.message ||
    fallbackMessage

  const fields = {}
  const structuredFields = apiData?.error?.fields
  if (Array.isArray(structuredFields)) {
    structuredFields.forEach(item => {
      const key =
        item?.field ||
        (Array.isArray(item?.path) ? item.path.join(".") : item?.path) ||
        ""
      if (key && item?.message && !fields[key]) {
        fields[key] = item.message
      }
    })
  }

  return { status, code, message, fields }
}

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

function normalizeListResponse(response, fallbackPage = 1, fallbackLimit = 20) {
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
      page: Number(rawPagination.page) || fallbackPage,
      limit: Number(rawPagination.limit) || fallbackLimit,
      hasNext: Boolean(rawPagination.hasNext),
    },
  }
}

export async function listIncidents(
  { page = 1, limit = 20, status = "" } = {},
  signal,
) {
  if (USE_NEW_FEATURES_MOCK) {
    return mockFoodSafetyIncidents.listIncidents({ page, limit, status })
  }
  const query = clampPagination(page, limit)
  if (status) query.status = status
  const response = await http.get(INCIDENTS_BASE, {
    params: query,
    signal,
    notifyOnError: false,
  })
  return normalizeListResponse(response, query.page, query.limit)
}

export async function getIncidentDetail(id, signal) {
  if (USE_NEW_FEATURES_MOCK) {
    return mockFoodSafetyIncidents.getIncidentDetail(id)
  }
  const response = await http.get(
    `${INCIDENTS_BASE}/${encodeURIComponent(id)}`,
    {
      signal,
      notifyOnError: false,
    },
  )
  return response?.data ?? response
}

export async function reportIncident(payload) {
  if (USE_NEW_FEATURES_MOCK) {
    return mockFoodSafetyIncidents.reportIncident(payload)
  }
  const response = await http.post(INCIDENTS_BASE, payload, {
    notifyOnError: false,
  })
  return response?.data ?? response
}

export async function reportDirectIncident(payload) {
  if (USE_NEW_FEATURES_MOCK) {
    return mockFoodSafetyIncidents.reportDirectIncident(payload)
  }
  const response = await http.post(`${INCIDENTS_BASE}/direct`, payload, {
    notifyOnError: false,
  })
  return response?.data ?? response
}

export async function forwardIncident(id, payload) {
  if (USE_NEW_FEATURES_MOCK) {
    return mockFoodSafetyIncidents.forwardIncident(id, payload)
  }
  const response = await http.post(
    `${INCIDENTS_BASE}/${encodeURIComponent(id)}/forward`,
    payload,
    { notifyOnError: false },
  )
  return response?.data ?? response
}

export async function cancelIncident(id, payload) {
  if (USE_NEW_FEATURES_MOCK) {
    return mockFoodSafetyIncidents.cancelIncident(id, payload)
  }
  const response = await http.post(
    `${INCIDENTS_BASE}/${encodeURIComponent(id)}/cancel`,
    payload,
    { notifyOnError: false },
  )
  return response?.data ?? response
}

export async function addAllocations(id, mealAllocationIds) {
  if (USE_NEW_FEATURES_MOCK) {
    return mockFoodSafetyIncidents.addAllocations(id, mealAllocationIds)
  }
  const response = await http.post(
    `${INCIDENTS_BASE}/${encodeURIComponent(id)}/allocations`,
    { mealAllocationIds },
    { notifyOnError: false },
  )
  return response?.data ?? response
}

export async function getTraceSnapshot(id, version, signal) {
  if (USE_NEW_FEATURES_MOCK) {
    return mockFoodSafetyIncidents.getTraceSnapshot(id, version)
  }
  const response = await http.get(
    `${INCIDENTS_BASE}/${encodeURIComponent(id)}/trace-snapshots/${encodeURIComponent(version)}`,
    { signal, notifyOnError: false },
  )
  return response?.data ?? response
}

export async function getInspectionSuppliers(id, signal) {
  if (USE_NEW_FEATURES_MOCK) {
    return mockFoodSafetyIncidents.getInspectionSuppliers(id)
  }
  const response = await http.get(
    `${INCIDENTS_BASE}/${encodeURIComponent(id)}/inspection-suppliers`,
    { signal, notifyOnError: false },
  )
  const payload = response?.data ?? response ?? {}
  return {
    source: payload.source || "SCHOOL_RELATIONSHIP",
    items: Array.isArray(payload.items) ? payload.items : [],
  }
}

export async function createInspection(id, payload) {
  if (USE_NEW_FEATURES_MOCK) {
    return mockFoodSafetyIncidents.createInspection(id, payload)
  }
  const response = await http.post(
    `${INCIDENTS_BASE}/${encodeURIComponent(id)}/inspections`,
    payload,
    { notifyOnError: false },
  )
  return response?.data ?? response
}

export async function recordInspectionResult(id, inspectionId, payload) {
  if (USE_NEW_FEATURES_MOCK) {
    return mockFoodSafetyIncidents.recordInspectionResult(
      id,
      inspectionId,
      payload,
    )
  }
  const response = await http.post(
    `${INCIDENTS_BASE}/${encodeURIComponent(id)}/inspections/${encodeURIComponent(inspectionId)}/result`,
    payload,
    { notifyOnError: false },
  )
  return response?.data ?? response
}

export async function closeIncident(id, payload = {}) {
  if (USE_NEW_FEATURES_MOCK) {
    return mockFoodSafetyIncidents.closeIncident(id, payload)
  }
  const response = await http.post(
    `${INCIDENTS_BASE}/${encodeURIComponent(id)}/close`,
    payload,
    { notifyOnError: false },
  )
  return response?.data ?? response
}

export async function listReports({ page = 1, limit = 20 } = {}, signal) {
  if (USE_NEW_FEATURES_MOCK) {
    return mockFoodSafetyIncidents.listReports({ page, limit })
  }
  const query = clampPagination(page, limit)
  const response = await http.get(REPORTS_BASE, {
    params: query,
    signal,
    notifyOnError: false,
  })
  return normalizeListResponse(response, query.page, query.limit)
}

export async function receiveReport(reportId) {
  if (USE_NEW_FEATURES_MOCK) {
    return mockFoodSafetyIncidents.receiveReport(reportId)
  }
  const response = await http.post(
    `${REPORTS_BASE}/${encodeURIComponent(reportId)}/receive`,
    {},
    { notifyOnError: false },
  )
  return response?.data ?? response
}

function normalizeClassOptions(raw) {
  const payload = raw?.data ?? raw ?? {}
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload.classes)
      ? payload.classes
      : Array.isArray(payload.items)
        ? payload.items
        : []

  const seen = new Set()
  const normalized = []
  list.forEach(item => {
    const id = item?.id || item?.classId || ""
    const name = item?.name || item?.className || ""
    if (!id || seen.has(id)) return
    seen.add(id)
    normalized.push({
      id,
      name: name || id,
      academicYear: item?.academicYear || null,
      homeroomTeacherId:
        item?.homeroomTeacherId || item?.homeroomTeacher?.id || null,
    })
  })
  return normalized
}

export async function listSchoolClasses(
  signal,
  { preferMealOptions = false, homeroomOnly = false } = {},
) {
  if (USE_NEW_FEATURES_MOCK) {
    return mockFoodSafetyIncidents.listSchoolClasses()
  }
  const fetchFromMealOptions = async () => {
    const res = await http.get("/meal-complaints/meal-options", {
      signal,
      notifyOnError: false,
    })
    return normalizeClassOptions(res)
  }
  const fetchFromClasses = async () => {
    const res = await http.get("/classes", {
      params: { limit: 100 },
      signal,
      notifyOnError: false,
    })
    return normalizeClassOptions(res)
  }

  // GVCN: meal-options chỉ trả lớp mình chủ nhiệm; không lùi về /classes (toàn trường)
  const attempts = homeroomOnly
    ? [fetchFromMealOptions]
    : preferMealOptions
    ? [fetchFromMealOptions, fetchFromClasses]
    : [fetchFromClasses, fetchFromMealOptions]

  for (const fn of attempts) {
    try {
      const classes = await fn()
      if (classes.length > 0) return classes
    } catch (error) {
      if (error?.name === "CanceledError" || signal?.aborted) throw error
    }
  }
  return []
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUuid(value) {
  return UUID_REGEX.test(String(value ?? "").trim())
}

export async function listDistributedAllocations(signal) {
  if (USE_NEW_FEATURES_MOCK) {
    return mockFoodSafetyIncidents.listDistributedAllocations()
  }
  try {
    const response = await http.get("/meal-allocations", {
      signal,
      notifyOnError: false,
    })
    const payload = response?.data ?? response ?? {}
    const candidates = []
    const seen = new Set()

    const pushCandidate = item => {
      if (!item || typeof item !== "object") return
      const mealAllocationId =
        item.mealAllocationId ||
        item.allocationId ||
        (item.classId && item.id ? item.id : null)
      if (!mealAllocationId || !isUuid(mealAllocationId)) return
      if (seen.has(mealAllocationId)) return

      const status = item.allocationStatus || item.status || ""
      if (status && status !== "DISTRIBUTED") return

      seen.add(mealAllocationId)
      candidates.push({
        mealAllocationId,
        classId: item.classId || null,
        className: item.className || item.name || "Lớp học",
        mealDate: item.mealDate || payload.date || null,
        mealType: item.mealType || null,
        status: status || "DISTRIBUTED",
      })
    }

    if (Array.isArray(payload)) {
      payload.forEach(pushCandidate)
    } else {
      if (Array.isArray(payload.allocations)) {
        payload.allocations.forEach(pushCandidate)
      }
      if (Array.isArray(payload.items)) {
        payload.items.forEach(pushCandidate)
      }
      if (Array.isArray(payload.demands)) {
        payload.demands.forEach(pushCandidate)
      }
      if (Array.isArray(payload.grades)) {
        payload.grades.forEach(grade => {
          if (Array.isArray(grade?.demands)) {
            grade.demands.forEach(pushCandidate)
          }
        })
      }
    }
    return candidates
  } catch (error) {
    if (error?.name === "CanceledError" || signal?.aborted) throw error
    return []
  }
}

const FoodSafetyIncidentService = {
  listIncidents,
  getIncidentDetail,
  reportIncident,
  reportDirectIncident,
  forwardIncident,
  cancelIncident,
  addAllocations,
  getTraceSnapshot,
  getInspectionSuppliers,
  createInspection,
  recordInspectionResult,
  closeIncident,
  listReports,
  receiveReport,
  listSchoolClasses,
  listDistributedAllocations,
}

export default FoodSafetyIncidentService
