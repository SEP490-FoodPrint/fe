import http from "src/services/01_axios"
import { lotDateError } from "src/utils/lotDates"

const BASE_URL = "/deliveries/management"

export const DELIVERY_SOURCE_TYPE = {
  REQUEST: "REQUEST",
  STANDALONE: "STANDALONE",
}

export const DELIVERY_SOURCE_OPTIONS = [
  { value: "ALL", label: "Tất cả nguồn" },
  { value: DELIVERY_SOURCE_TYPE.REQUEST, label: "Từ yêu cầu trường" },
  { value: DELIVERY_SOURCE_TYPE.STANDALONE, label: "Tạo đơn thủ công" },
]

export const ORDER_CREATION_STAGE = {
  CONFIRM: "CONFIRM",
  INGREDIENTS: "INGREDIENTS",
  LOGISTICS: "LOGISTICS",
}

export const WORKFLOW_STAGE_STATUS = {
  DRAFT: "DRAFT",
  CONFIRMED: "CONFIRMED",
  PREPARING: "PREPARING",
  IN_TRANSIT: "IN_TRANSIT",
}

const WORKFLOW_STAGE_STATUS_META = {
  [WORKFLOW_STAGE_STATUS.DRAFT]: {
    label: "Chờ xác nhận",
    tone: "warning",
  },
  [WORKFLOW_STAGE_STATUS.CONFIRMED]: {
    label: "Đã xác nhận",
    tone: "success",
  },
  [WORKFLOW_STAGE_STATUS.PREPARING]: {
    label: "Đang chuẩn bị hàng",
    tone: "warning",
  },
  [WORKFLOW_STAGE_STATUS.IN_TRANSIT]: {
    label: "Đang giao hàng",
    tone: "info",
  },
}

export function getWorkflowStageStatusMeta(status) {
  return (
    WORKFLOW_STAGE_STATUS_META[status] || {
      label: status || "Chờ xác nhận",
      tone: "muted",
    }
  )
}

export const DELIVERY_STATUS = {
  CREATED: "CREATED",
  PREPARING: "PREPARING",
  IN_TRANSIT: "IN_TRANSIT",
  ARRIVED: "ARRIVED",
  PENDING_APPROVAL: "PENDING_APPROVAL",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CANCELLED_MEAL: "CANCELLED_MEAL",
  RECEIVED: "RECEIVED",
  CANCELLED: "CANCELLED",
}

const VALID_SOURCE_SET = new Set(Object.values(DELIVERY_SOURCE_TYPE))
const VALID_STATUS_SET = new Set(Object.values(DELIVERY_STATUS))

export const DELIVERY_STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: DELIVERY_STATUS.PREPARING, label: "Đang chuẩn bị hàng" },
  { value: DELIVERY_STATUS.IN_TRANSIT, label: "Đang giao" },
  { value: DELIVERY_STATUS.ARRIVED, label: "Đã đến nơi" },
  { value: DELIVERY_STATUS.PENDING_APPROVAL, label: "Chờ duyệt" },
  { value: DELIVERY_STATUS.APPROVED, label: "Đã duyệt" },
  { value: DELIVERY_STATUS.RECEIVED, label: "Hoàn thành" },
  { value: DELIVERY_STATUS.REJECTED, label: "Yêu cầu giao hàng lại" },
  { value: DELIVERY_STATUS.CANCELLED_MEAL, label: "Đã hủy suất ăn" },
  { value: DELIVERY_STATUS.CANCELLED, label: "Đã hủy" },
  { value: DELIVERY_STATUS.CREATED, label: "Mới tạo" },
]

const STATUS_META = {
  [DELIVERY_STATUS.CREATED]: { label: "Mới tạo", tone: "muted" },
  [DELIVERY_STATUS.PREPARING]: { label: "Đang chuẩn bị hàng", tone: "warning" },
  [DELIVERY_STATUS.IN_TRANSIT]: { label: "Đang giao", tone: "info" },
  [DELIVERY_STATUS.ARRIVED]: { label: "Đã đến nơi", tone: "warning" },
  [DELIVERY_STATUS.PENDING_APPROVAL]: { label: "Chờ duyệt", tone: "warning" },
  [DELIVERY_STATUS.APPROVED]: { label: "Đã duyệt", tone: "success" },
  [DELIVERY_STATUS.RECEIVED]: { label: "Hoàn thành", tone: "success" },
  [DELIVERY_STATUS.REJECTED]: { label: "Yêu cầu giao hàng lại", tone: "error" },
  [DELIVERY_STATUS.CANCELLED_MEAL]: { label: "Đã hủy suất ăn", tone: "muted" },
  [DELIVERY_STATUS.CANCELLED]: { label: "Đã hủy", tone: "muted" },
}

export function getDeliveryStatusMeta(status, statusLabel = "") {
  const mapped = STATUS_META[status]
  return {
    label: String(statusLabel || "").trim() || mapped?.label || status || "Không xác định",
    tone: mapped?.tone || "muted",
  }
}

export function formatSourceFacilityLabel(facility) {
  if (!facility) return "Chưa gắn cơ sở"
  const name = facility.name || "Cơ sở nguồn cung"
  return facility.facilityCode ? `${name} (${facility.facilityCode})` : name
}

const DECIMAL_QUANTITY_REGEX = /^(?:0|[1-9]\d{0,10})(?:\.\d{1,3})?$/

export function isValidPositiveDecimal(value) {
  const raw = String(value ?? "").trim().replace(",", ".")
  if (!DECIMAL_QUANTITY_REGEX.test(raw)) return false
  return !/^0(?:\.0{1,3})?$/.test(raw)
}

export function normalizeDecimalQuantity(value) {
  return String(value ?? "").trim().replace(",", ".")
}

/** Số lượng (tối đa 3 chữ số thập phân) đổi sang số nguyên phần nghìn để cộng/so sánh không sai số. */
export function quantityToThousandths(value) {
  const raw = normalizeDecimalQuantity(value)
  if (!/^\d+(?:\.\d{1,3})?$/.test(raw)) return null
  const [intPart, fracPart = ""] = raw.split(".")
  return Number(intPart) * 1000 + Number(fracPart.padEnd(3, "0"))
}

/** Tổng phần nghìn của danh sách số lượng; null nếu có giá trị không hợp lệ. */
export function sumQuantityThousandths(values = []) {
  let total = 0
  for (const value of values) {
    const parsed = quantityToThousandths(value)
    if (parsed === null) return null
    total += parsed
  }
  return total
}

/**
 * Đối chiếu tổng khối lượng phân bổ cho 1 dòng yêu cầu với khối lượng trường cần.
 * status: MATCH | UNDER | OVER | INVALID (có ô khối lượng trống/sai định dạng).
 */
export function getAllocationTotalStatus(requestedQuantity, allocations = []) {
  const required = quantityToThousandths(requestedQuantity)
  const values = (Array.isArray(allocations) ? allocations : []).map(
    row => row?.actualQuantity,
  )
  const hasInvalid = values.some(value => !isValidPositiveDecimal(value))
  const allocated = values.reduce((sum, value) => {
    const parsed = quantityToThousandths(value)
    return parsed === null ? sum : sum + parsed
  }, 0)
  let status = "MATCH"
  if (hasInvalid || values.length === 0 || required === null) status = "INVALID"
  else if (allocated < required) status = "UNDER"
  else if (allocated > required) status = "OVER"
  return {
    status,
    allocated,
    required,
    difference: required === null ? null : Math.abs(required - allocated),
  }
}

export function thousandthsToQuantity(value) {
  if (value === null || value === undefined) return ""
  const intPart = Math.floor(value / 1000)
  const fracPart = String(value % 1000).padStart(3, "0").replace(/0+$/, "")
  return fracPart ? `${intPart}.${fracPart}` : String(intPart)
}

// Thời gian dự kiến đến: chỉ chọn giờ trong ngày hôm nay theo giờ Việt Nam (+07:00).
const VN_OFFSET_MS = 7 * 3600 * 1000
const TIME_ONLY_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/

/** Ngày hôm nay (YYYY-MM-DD) theo giờ Việt Nam. */
export function getVnTodayDate(now = new Date()) {
  return new Date(now.getTime() + VN_OFFSET_MS).toISOString().slice(0, 10)
}

/** Giờ nhỏ nhất được chọn (HH:mm, giờ Việt Nam): phút kế tiếp sau thời điểm hiện tại. */
export function getMinArrivalTime(now = new Date()) {
  const nextMinute = Math.floor(now.getTime() / 60000) * 60000 + 60000
  const vn = new Date(nextMinute + VN_OFFSET_MS)
  // Đã sang ngày mai thì không còn giờ hợp lệ trong hôm nay.
  if (vn.toISOString().slice(0, 10) !== getVnTodayDate(now)) return "23:59"
  return vn.toISOString().slice(11, 16)
}

/** Ghép giờ (HH:mm) với ngày hôm nay theo giờ Việt Nam thành ISO8601 có múi giờ. */
export function buildTodayArrivalIso(timeValue, now = new Date()) {
  const raw = String(timeValue ?? "").trim()
  if (!TIME_ONLY_REGEX.test(raw)) return null
  return `${getVnTodayDate(now)}T${raw}:00+07:00`
}

export function toIsoWithTimezoneOffset(localDateTimeValue) {
  const raw = String(localDateTimeValue ?? "").trim()
  if (!raw) return null
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return null

  const offsetMinutes = -date.getTimezoneOffset()
  const sign = offsetMinutes >= 0 ? "+" : "-"
  const absMinutes = Math.abs(offsetMinutes)
  const pad2 = n => String(n).padStart(2, "0")

  const year = date.getFullYear()
  const month = pad2(date.getMonth() + 1)
  const day = pad2(date.getDate())
  const hours = pad2(date.getHours())
  const minutes = pad2(date.getMinutes())
  const seconds = pad2(date.getSeconds())
  const offsetH = pad2(Math.floor(absMinutes / 60))
  const offsetM = pad2(absMinutes % 60)

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offsetH}:${offsetM}`
}

export function generateIdempotencyKey() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID().toLowerCase()
  }
  const bytes = new Uint8Array(16)
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    globalThis.crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < 16; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256)
    }
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("")
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export function formatDateTimeVi(value) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  const pad2 = n => String(n).padStart(2, "0")
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`
}

export function formatQuantityVi(value) {
  if (value === null || value === undefined || value === "") return "—"
  const num = Number(value)
  if (Number.isNaN(num)) return String(value)
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 3,
  }).format(num)
}

export function extractApiError(
  error,
  fallbackMessage = "Không thể xử lý đơn giao hàng. Vui lòng thử lại.",
) {
  const status = error?.response?.status
  const apiData = error?.response?.data
  const fieldIssues = apiData?.error?.fields
  const fieldErrors = {}
  if (Array.isArray(fieldIssues)) {
    fieldIssues.forEach(issue => {
      if (issue?.field) {
        fieldErrors[String(issue.field)] = issue.message || fallbackMessage
      }
    })
  }
  const firstFieldMessage =
    Array.isArray(fieldIssues) && fieldIssues.length > 0
      ? fieldIssues[0]?.message
      : null

  return {
    status,
    message: apiData?.message || firstFieldMessage || error?.message || fallbackMessage,
    fieldErrors,
  }
}

/** Validate Step 1 (selecting receiving school) of manual delivery creation. */
export function validateStandaloneSchool({ schoolId } = {}) {
  const errors = {}
  if (!String(schoolId || "").trim()) {
    errors.schoolId = "Vui lòng chọn trường học nhận hàng."
  }
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export const DUPLICATE_INGREDIENT_FACILITY_MSG =
  "Nguyên liệu này đã chọn cơ sở nguồn cung này."

export function normalizeOptionId(value) {
  return String(value || "").trim().toLowerCase()
}

/** Return indices (> first occurrence) where `(ingredientId, sourceFacilityId)` duplicates an earlier row. */
export function getDuplicateIngredientFacilityIndices(items = []) {
  const seenPairs = new Set()
  const duplicateIndices = new Set()
  if (!Array.isArray(items)) return duplicateIndices

  items.forEach((row, index) => {
    const ingId = normalizeOptionId(row?.ingredientId)
    const facId = normalizeOptionId(row?.sourceFacilityId)
    if (!ingId || !facId) return
    const pairKey = `${ingId}::${facId}`
    if (seenPairs.has(pairKey)) {
      duplicateIndices.add(index)
    } else {
      seenPairs.add(pairKey)
    }
  })

  return duplicateIndices
}

/** Validate Step 2 (ingredients & source facilities) for either creation flow. */
export function validateDeliveryIngredientsStep({
  sourceType,
  supplyRequestId,
  sources = [],
  requestItems = [],
  schoolId,
  items = [],
} = {}) {
  const errors = {}
  const itemErrors = {}
  const sourceErrors = {}

  if (sourceType === DELIVERY_SOURCE_TYPE.REQUEST) {
    if (!String(supplyRequestId || "").trim()) {
      errors.supplyRequestId = "Vui lòng chọn yêu cầu từ nhà trường."
    }

    // Một dòng yêu cầu có thể chia cho nhiều cơ sở nguồn cung (mỗi phần là 1 lô riêng).
    const sourceList = Array.isArray(sources) ? sources : []
    const allocationErrors = {}
    const sourcesByItemId = new Map()
    sourceList.forEach((src, index) => {
      const reqItemId = String(src?.supplyRequestItemId || "").trim()
      if (!reqItemId) return
      const group = sourcesByItemId.get(reqItemId) || []
      group.push({ src, errorKey: String(src?.key || `${reqItemId}#${index}`) })
      sourcesByItemId.set(reqItemId, group)
    })

    const checkItemGroup = (reqItemId, requestedQuantity) => {
      const group = sourcesByItemId.get(reqItemId) || []
      if (group.length === 0) {
        sourceErrors[reqItemId] = "Chọn cơ sở nguồn cung."
        return
      }
      const seenFacilities = new Set()
      group.forEach(({ src, errorKey }) => {
        const rowErr = {}
        const facId = normalizeOptionId(src?.sourceFacilityId)
        if (!facId) {
          rowErr.sourceFacilityId = "Chọn cơ sở nguồn cung."
        } else if (seenFacilities.has(facId)) {
          rowErr.sourceFacilityId = DUPLICATE_INGREDIENT_FACILITY_MSG
        } else {
          seenFacilities.add(facId)
        }
        if (
          src?.actualQuantity !== undefined &&
          !isValidPositiveDecimal(src.actualQuantity)
        ) {
          rowErr.actualQuantity = "Nhập số dương (tối đa 3 chữ số thập phân)."
        }
        if (Object.keys(rowErr).length > 0) allocationErrors[errorKey] = rowErr
      })

      if (requestedQuantity === undefined || requestedQuantity === null) return
      const allocated = sumQuantityThousandths(group.map(({ src }) => src?.actualQuantity))
      const required = quantityToThousandths(requestedQuantity)
      if (allocated === null) {
        sourceErrors[reqItemId] = "Nhập khối lượng giao cho từng cơ sở nguồn cung."
      } else if (required !== null && allocated !== required) {
        sourceErrors[reqItemId] = "Tổng khối lượng giao phải bằng khối lượng trường yêu cầu."
      }
    }

    if (Array.isArray(requestItems) && requestItems.length > 0) {
      requestItems.forEach(reqItem => {
        const reqItemId = String(reqItem?.id || "").trim()
        if (!reqItemId) return
        checkItemGroup(reqItemId, reqItem?.requestedQuantity)
      })
    } else if (sourceList.length === 0) {
      errors.sources = "Mỗi nguyên liệu trong đơn cần gắn ít nhất 1 cơ sở nguồn cung."
    } else {
      sourcesByItemId.forEach((_group, reqItemId) => checkItemGroup(reqItemId))
    }

    if (Object.keys(allocationErrors).length > 0) {
      errors.allocationErrors = allocationErrors
    }

    if (
      (Object.keys(sourceErrors).length > 0 ||
        Object.keys(allocationErrors).length > 0) &&
      !errors.sources
    ) {
      errors.sources =
        "Kiểm tra lại cơ sở nguồn cung và khối lượng giao của từng nguyên liệu."
    }
  } else {
    const schoolCheck = validateStandaloneSchool({ schoolId })
    if (!schoolCheck.valid) {
      errors.schoolId = schoolCheck.errors.schoolId
    }

    if (!Array.isArray(items) || items.length === 0) {
      errors.items = "Đơn giao thủ công cần ít nhất 1 mặt hàng."
    } else if (items.length > 100) {
      errors.items = "Mỗi đơn giao tối đa 100 dòng nguyên liệu."
    } else {
      const duplicatePairIndices = getDuplicateIngredientFacilityIndices(items)
      items.forEach((row, index) => {
        const rowErr = {}
        const ingId = normalizeOptionId(row?.ingredientId)
        const facId = normalizeOptionId(row?.sourceFacilityId)

        if (!ingId) {
          rowErr.ingredientId = "Chọn nguyên liệu."
        }

        if (!facId) {
          rowErr.sourceFacilityId = "Chọn cơ sở nguồn cung."
        } else if (duplicatePairIndices.has(index)) {
          rowErr.sourceFacilityId = DUPLICATE_INGREDIENT_FACILITY_MSG
        }

        if (!isValidPositiveDecimal(row?.actualQuantity)) {
          rowErr.actualQuantity =
            "Nhập số dương (tối đa 3 chữ số thập phân)."
        }

        if (!String(row?.unit || "").trim()) {
          rowErr.unit = "Thiếu đơn vị tính."
        }

        const dateError = lotDateError({
          manufactureDate: String(row?.manufactureDate || "").trim(),
          expiryDate: String(row?.expiryDate || "").trim(),
        })
        if (dateError) rowErr.lotDates = dateError

        if (Object.keys(rowErr).length > 0) {
          itemErrors[index] = rowErr
        }
      })
    }
  }

  if (Object.keys(itemErrors).length > 0) {
    errors.itemErrors = itemErrors
  }

  if (Object.keys(sourceErrors).length > 0) {
    errors.sourceErrors = sourceErrors
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

/** Validate Step 3 (mandatory ETA, vehicle plate, optional note) before dispatch. */
export function validateDeliveryLogisticsStep({
  expectedArrivalLocal = "",
  vehiclePlate = "",
  note = "",
  now = new Date(),
} = {}) {
  const errors = {}

  const rawArrival = String(expectedArrivalLocal || "").trim()
  if (!rawArrival) {
    errors.expectedArrivalAt = "Vui lòng chọn giờ dự kiến đến trường."
  } else {
    const parsedIso = buildTodayArrivalIso(rawArrival, now)
    if (!parsedIso) {
      errors.expectedArrivalAt = "Giờ dự kiến đến không hợp lệ."
    } else if (Date.parse(parsedIso) <= now.getTime()) {
      errors.expectedArrivalAt = "Giờ dự kiến đến phải sau thời điểm hiện tại."
    }
  }

  const normalizedPlate = String(vehiclePlate || "").trim()
  if (!normalizedPlate) {
    errors.vehiclePlate = "Vui lòng nhập biển số xe giao hàng."
  } else if (normalizedPlate.length > 40) {
    errors.vehiclePlate = "Biển số xe tối đa 40 ký tự."
  }

  if (String(note || "").trim().length > 2000) {
    errors.note = "Ghi chú tối đa 2000 ký tự."
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export function validateDeliveryDraft({
  sourceType,
  supplyRequestId,
  sources = [],
  requestItems = [],
  schoolId,
  items = [],
  expectedArrivalLocal = "",
  vehiclePlate = "",
  note = "",
  now = new Date(),
}) {
  const ingredientStep = validateDeliveryIngredientsStep({
    sourceType,
    supplyRequestId,
    sources,
    requestItems,
    schoolId,
    items,
  })
  const logisticsStep = validateDeliveryLogisticsStep({
    expectedArrivalLocal,
    vehiclePlate,
    note,
    now,
  })

  const errors = {
    ...ingredientStep.errors,
    ...logisticsStep.errors,
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

function encodeId(id) {
  return encodeURIComponent(String(id || "").trim())
}

function adaptSourceFacility(facility) {
  if (!facility || !facility.id) return null
  return {
    id: facility.id,
    name: facility.name || "Cơ sở nguồn cung",
    facilityCode: facility.facilityCode || "",
  }
}

function adaptDeliveryItem(item = {}) {
  return {
    id: item.id || "",
    ingredientId: item.ingredientId || "",
    ingredientName: item.ingredientName || "Nguyên liệu",
    ingredientEntryId: item.ingredientEntryId ?? null,
    supplyRequestItemId: item.supplyRequestItemId ?? null,
    sourceFacility: adaptSourceFacility(item.sourceFacility),
    traceUrl: item.traceUrl ?? null,
    actualQuantity:
      item.actualQuantity !== undefined && item.actualQuantity !== null
        ? String(item.actualQuantity)
        : "0",
    unit: item.unit || "",
    note: item.note ?? null,
  }
}

function adaptDeliverySummary(row = {}) {
  const status = row.status || DELIVERY_STATUS.CREATED
  return {
    id: row.id || "",
    deliveryNo: row.deliveryNo || "",
    sourceType: row.sourceType || DELIVERY_SOURCE_TYPE.STANDALONE,
    schoolId: row.schoolId || "",
    schoolName: row.schoolName || "Trường học đối tác",
    supplierId: row.supplierId || "",
    supplyRequestId: row.supplyRequestId ?? null,
    requestNo: row.requestNo ?? null,
    status,
    statusLabel: row.statusLabel || STATUS_META[status]?.label || "",
    traceabilityVersion: row.traceabilityVersion ?? null,
    workflowVersion: row.workflowVersion ?? null,
    nextAction: row.nextAction ?? null,
    expectedArrivalAt: row.expectedArrivalAt ?? null,
    arrivedAt: row.arrivedAt ?? null,
    receivedAt: row.receivedAt ?? null,
    vehiclePlate: row.vehiclePlate ?? null,
    note: row.note ?? null,
    createdByUserId: row.createdByUserId ?? null,
    createdAt: row.createdAt || null,
    updatedAt: row.updatedAt || null,
  }
}

function adaptDeliveryLabel(label = {}) {
  return {
    deliveryItemId: label.deliveryItemId || "",
    deliveryNo: label.deliveryNo || "",
    supplierName: label.supplierName || "",
    ingredientName: label.ingredientName || "Nguyên liệu",
    actualQuantity:
      label.actualQuantity !== undefined && label.actualQuantity !== null
        ? String(label.actualQuantity)
        : "0",
    unit: label.unit || "",
    sourceFacility: label.sourceFacility
      ? {
          name: label.sourceFacility.name || "Cơ sở nguồn cung",
          facilityCode: label.sourceFacility.facilityCode || "",
        }
      : null,
    traceUrl: label.traceUrl || "",
    qrImageDataUrl: label.qrImageDataUrl || "",
  }
}

function adaptDeliveryDetail(row = {}) {
  return {
    ...adaptDeliverySummary(row),
    items: Array.isArray(row.items) ? row.items.map(adaptDeliveryItem) : [],
  }
}

const SupplierDeliveryService = {
  async list({ page = 1, limit = 20, sourceType, status, signal } = {}) {
    const safePage =
      Number.isInteger(Number(page)) && Number(page) > 0 ? Number(page) : 1
    const safeLimit =
      Number.isInteger(Number(limit)) && Number(limit) > 0 && Number(limit) <= 100
        ? Number(limit)
        : 20

    const params = {
      page: safePage,
      limit: safeLimit,
    }
    if (sourceType && sourceType !== "ALL" && VALID_SOURCE_SET.has(sourceType)) {
      params.sourceType = sourceType
    }
    if (status && status !== "ALL" && VALID_STATUS_SET.has(status)) {
      params.status = status
    }

    const response = await http.get(BASE_URL, {
      params,
      signal,
      notifyOnError: false,
    })
    const payload = response?.data || {}
    return {
      items: Array.isArray(payload.items) ? payload.items.map(adaptDeliverySummary) : [],
      pagination: {
        page: payload.pagination?.page ?? safePage,
        limit: payload.pagination?.limit ?? safeLimit,
        hasNext: Boolean(payload.pagination?.hasNext),
      },
    }
  },

  async getById(deliveryId, { signal } = {}) {
    const response = await http.get(`${BASE_URL}/${encodeId(deliveryId)}`, {
      signal,
      notifyOnError: false,
    })
    return adaptDeliveryDetail(response?.data || response)
  },

  async listSchoolOptions({ page = 1, limit = 100, signal } = {}) {
    const response = await http.get(`${BASE_URL}/options/schools`, {
      params: { page, limit },
      signal,
      notifyOnError: false,
    })
    const payload = response?.data || {}
    return {
      items: Array.isArray(payload.items)
        ? payload.items.map(s => ({
            id: s.id,
            code: s.code ?? null,
            name: s.name || "Trường học",
          }))
        : [],
      pagination: {
        page: payload.pagination?.page ?? page,
        limit: payload.pagination?.limit ?? limit,
        hasNext: Boolean(payload.pagination?.hasNext),
      },
    }
  },

  async listIngredientOptions({ page = 1, limit = 100, signal } = {}) {
    const response = await http.get(`${BASE_URL}/options/ingredients`, {
      params: { page, limit },
      signal,
      notifyOnError: false,
    })
    const payload = response?.data || {}
    return {
      items: Array.isArray(payload.items)
        ? payload.items.map(ing => ({
            id: ing.id,
            name: ing.name || "Nguyên liệu",
            defaultUnit: ing.defaultUnit || "",
            categoryId: ing.categoryId ?? null,
            categoryName: ing.categoryName ?? null,
          }))
        : [],
      pagination: {
        page: payload.pagination?.page ?? page,
        limit: payload.pagination?.limit ?? limit,
        hasNext: Boolean(payload.pagination?.hasNext),
      },
    }
  },

  async listSourceFacilityOptions({ page = 1, limit = 100, signal } = {}) {
    const response = await http.get(`${BASE_URL}/options/source-facilities`, {
      params: { page, limit },
      signal,
      notifyOnError: false,
    })
    const payload = response?.data || {}
    return {
      items: Array.isArray(payload.items)
        ? payload.items.map(fac => ({
            id: fac.id,
            facilityCode: fac.facilityCode || "",
            name: fac.name || "Cơ sở nguồn cung",
          }))
        : [],
      pagination: {
        page: payload.pagination?.page ?? page,
        limit: payload.pagination?.limit ?? limit,
        hasNext: Boolean(payload.pagination?.hasNext),
      },
    }
  },

  async listLabels(deliveryId, { page = 1, limit = 20, signal } = {}) {
    const safePage =
      Number.isInteger(Number(page)) && Number(page) > 0 ? Number(page) : 1
    const safeLimit =
      Number.isInteger(Number(limit)) && Number(limit) > 0 && Number(limit) <= 50
        ? Number(limit)
        : 20

    const response = await http.get(`${BASE_URL}/${encodeId(deliveryId)}/labels`, {
      params: { page: safePage, limit: safeLimit },
      signal,
      notifyOnError: false,
    })
    const payload = response?.data || {}
    return {
      items: Array.isArray(payload.items)
        ? payload.items.map(adaptDeliveryLabel)
        : [],
      pagination: {
        page: payload.pagination?.page ?? safePage,
        limit: payload.pagination?.limit ?? safeLimit,
        hasNext: Boolean(payload.pagination?.hasNext),
      },
    }
  },

  async listAllLabels(deliveryId, { limit = 50, signal } = {}) {
    const collected = []
    let page = 1
    let hasNext = true
    while (hasNext && page <= 20) {
      const res = await this.listLabels(deliveryId, { page, limit, signal })
      collected.push(...res.items)
      hasNext = Boolean(res.pagination?.hasNext)
      page += 1
    }
    return collected
  },

  async create(input, idempotencyKey) {
    // Ngày của lô (YYYY-MM-DD): chỉ gửi khi có; đồ lưu kho bắt buộc, đồ tươi bỏ trống.
    const lotDatesPayload = line => ({
      ...(String(line?.manufactureDate || "").trim() ? { manufactureDate: String(line.manufactureDate).trim() } : {}),
      ...(String(line?.expiryDate || "").trim() ? { expiryDate: String(line.expiryDate).trim() } : {}),
    })
    const key = String(idempotencyKey || generateIdempotencyKey()).trim().toLowerCase()
    const note = String(input.note ?? "").trim()

    const body =
      input.sourceType === DELIVERY_SOURCE_TYPE.REQUEST
        ? {
            sourceType: DELIVERY_SOURCE_TYPE.REQUEST,
            supplyRequestId: String(input.supplyRequestId || "").trim().toLowerCase(),
            sources: (input.sources || []).map(src => ({
              supplyRequestItemId: String(src.supplyRequestItemId || "")
                .trim()
                .toLowerCase(),
              sourceFacilityId: String(src.sourceFacilityId || "")
                .trim()
                .toLowerCase(),
              ...(src.actualQuantity !== undefined &&
              src.actualQuantity !== null &&
              String(src.actualQuantity).trim() !== ""
                ? { actualQuantity: normalizeDecimalQuantity(src.actualQuantity) }
                : {}),
              ...lotDatesPayload(src),
            })),
            note: note || null,
          }
        : {
            sourceType: DELIVERY_SOURCE_TYPE.STANDALONE,
            schoolId: String(input.schoolId || "").trim().toLowerCase(),
            note: note || null,
            items: (input.items || []).map(item => ({
              ingredientId: String(item.ingredientId || "").trim().toLowerCase(),
              sourceFacilityId: String(item.sourceFacilityId || "")
                .trim()
                .toLowerCase(),
              actualQuantity: normalizeDecimalQuantity(item.actualQuantity),
              unit: String(item.unit || "").trim(),
              ...lotDatesPayload(item),
            })),
          }

    const response = await http.post(BASE_URL, body, {
      headers: {
        "Idempotency-Key": key,
      },
      notifyOnError: false,
    })
    return adaptDeliveryDetail(response?.data || response)
  },

  async dispatch(deliveryId, { expectedArrivalAt, vehiclePlate } = {}) {
    const response = await http.post(
      `${BASE_URL}/${encodeId(deliveryId)}/dispatch`,
      {
        expectedArrivalAt,
        vehiclePlate: String(vehiclePlate ?? "").trim(),
      },
      { notifyOnError: false },
    )
    return adaptDeliveryDetail(response?.data || response)
  },
}

export default SupplierDeliveryService
