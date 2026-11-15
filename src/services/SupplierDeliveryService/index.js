import http from "src/services/01_axios"

const BASE_URL = "/deliveries/management"

export const DELIVERY_SOURCE_TYPE = {
  REQUEST: "REQUEST",
  STANDALONE: "STANDALONE",
}

export const DELIVERY_SOURCE_OPTIONS = [
  { value: "ALL", label: "Tất cả nguồn" },
  { value: DELIVERY_SOURCE_TYPE.REQUEST, label: "Từ yêu cầu trường" },
  { value: DELIVERY_SOURCE_TYPE.STANDALONE, label: "Giao độc lập" },
]

export const DELIVERY_STATUS = {
  CREATED: "CREATED",
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
  { value: DELIVERY_STATUS.CREATED, label: "Mới tạo" },
  { value: DELIVERY_STATUS.IN_TRANSIT, label: "Đang vận chuyển" },
  { value: DELIVERY_STATUS.ARRIVED, label: "Đã đến trường" },
  { value: DELIVERY_STATUS.PENDING_APPROVAL, label: "Chờ kiểm nhận" },
  { value: DELIVERY_STATUS.APPROVED, label: "Đã duyệt nhận" },
  { value: DELIVERY_STATUS.RECEIVED, label: "Đã nhập kho" },
  { value: DELIVERY_STATUS.REJECTED, label: "Từ chối nhận" },
  { value: DELIVERY_STATUS.CANCELLED_MEAL, label: "Hủy do suất ăn" },
  { value: DELIVERY_STATUS.CANCELLED, label: "Đã hủy" },
]

const STATUS_META = {
  [DELIVERY_STATUS.CREATED]: { label: "Mới tạo", tone: "info" },
  [DELIVERY_STATUS.IN_TRANSIT]: { label: "Đang vận chuyển", tone: "info" },
  [DELIVERY_STATUS.ARRIVED]: { label: "Đã đến trường", tone: "warning" },
  [DELIVERY_STATUS.PENDING_APPROVAL]: { label: "Chờ kiểm nhận", tone: "warning" },
  [DELIVERY_STATUS.APPROVED]: { label: "Đã duyệt nhận", tone: "success" },
  [DELIVERY_STATUS.RECEIVED]: { label: "Đã nhập kho", tone: "success" },
  [DELIVERY_STATUS.REJECTED]: { label: "Từ chối nhận", tone: "error" },
  [DELIVERY_STATUS.CANCELLED_MEAL]: { label: "Hủy do suất ăn", tone: "muted" },
  [DELIVERY_STATUS.CANCELLED]: { label: "Đã hủy", tone: "muted" },
}

export function getDeliveryStatusMeta(status) {
  return STATUS_META[status] || { label: status || "Không xác định", tone: "muted" }
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

export function validateDeliveryDraft({
  sourceType,
  supplyRequestId,
  schoolId,
  items = [],
  expectedArrivalLocal = "",
  vehiclePlate = "",
  note = "",
}) {
  const errors = {}
  const itemErrors = {}

  if (sourceType === DELIVERY_SOURCE_TYPE.REQUEST) {
    if (!String(supplyRequestId || "").trim()) {
      errors.supplyRequestId = "Vui lòng chọn yêu cầu cung ứng đã tiếp nhận."
    }
  } else {
    if (!String(schoolId || "").trim()) {
      errors.schoolId = "Vui lòng chọn trường học nhận hàng."
    }

    if (!Array.isArray(items) || items.length === 0) {
      errors.items = "Đơn giao độc lập cần ít nhất 1 mặt hàng."
    } else if (items.length > 100) {
      errors.items = "Mỗi đơn giao tối đa 100 dòng nguyên liệu."
    } else {
      const seenIngredients = new Set()
      items.forEach((row, index) => {
        const rowErr = {}
        const ingId = String(row?.ingredientId || "").trim()
        if (!ingId) {
          rowErr.ingredientId = "Chọn nguyên liệu."
        } else if (seenIngredients.has(ingId)) {
          rowErr.ingredientId = "Nguyên liệu bị trùng lặp."
        } else {
          seenIngredients.add(ingId)
        }

        if (!isValidPositiveDecimal(row?.actualQuantity)) {
          rowErr.actualQuantity =
            "Nhập số dương (tối đa 3 chữ số thập phân)."
        }

        if (!String(row?.unit || "").trim()) {
          rowErr.unit = "Thiếu đơn vị tính."
        }

        if (Object.keys(rowErr).length > 0) {
          itemErrors[index] = rowErr
        }
      })
    }
  }

  if (String(expectedArrivalLocal || "").trim()) {
    const parsedIso = toIsoWithTimezoneOffset(expectedArrivalLocal)
    if (!parsedIso) {
      errors.expectedArrivalAt = "Thời gian dự kiến đến không hợp lệ."
    }
  }

  if (String(vehiclePlate || "").trim().length > 40) {
    errors.vehiclePlate = "Biển số xe tối đa 40 ký tự."
  }

  if (String(note || "").trim().length > 2000) {
    errors.note = "Ghi chú tối đa 2000 ký tự."
  }

  if (Object.keys(itemErrors).length > 0) {
    errors.itemErrors = itemErrors
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

function encodeId(id) {
  return encodeURIComponent(String(id || "").trim())
}

function adaptDeliveryItem(item = {}) {
  return {
    id: item.id || "",
    ingredientId: item.ingredientId || "",
    ingredientName: item.ingredientName || "Nguyên liệu",
    ingredientEntryId: item.ingredientEntryId ?? null,
    supplyRequestItemId: item.supplyRequestItemId ?? null,
    actualQuantity:
      item.actualQuantity !== undefined && item.actualQuantity !== null
        ? String(item.actualQuantity)
        : "0",
    unit: item.unit || "",
    note: item.note ?? null,
  }
}

function adaptDeliverySummary(row = {}) {
  return {
    id: row.id || "",
    deliveryNo: row.deliveryNo || "",
    sourceType: row.sourceType || DELIVERY_SOURCE_TYPE.STANDALONE,
    schoolId: row.schoolId || "",
    schoolName: row.schoolName || "Trường học đối tác",
    supplierId: row.supplierId || "",
    supplyRequestId: row.supplyRequestId ?? null,
    requestNo: row.requestNo ?? null,
    status: row.status || DELIVERY_STATUS.CREATED,
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

  async create(input, idempotencyKey) {
    const key = String(idempotencyKey || generateIdempotencyKey()).trim().toLowerCase()
    const vehiclePlate = String(input.vehiclePlate ?? "").trim()
    const note = String(input.note ?? "").trim()
    const expectedArrivalAt = input.expectedArrivalAt || null

    const body =
      input.sourceType === DELIVERY_SOURCE_TYPE.REQUEST
        ? {
            sourceType: DELIVERY_SOURCE_TYPE.REQUEST,
            supplyRequestId: String(input.supplyRequestId || "").trim().toLowerCase(),
            expectedArrivalAt,
            vehiclePlate: vehiclePlate || null,
            note: note || null,
          }
        : {
            sourceType: DELIVERY_SOURCE_TYPE.STANDALONE,
            schoolId: String(input.schoolId || "").trim().toLowerCase(),
            expectedArrivalAt,
            vehiclePlate: vehiclePlate || null,
            note: note || null,
            items: (input.items || []).map(item => ({
              ingredientId: String(item.ingredientId || "").trim().toLowerCase(),
              actualQuantity: normalizeDecimalQuantity(item.actualQuantity),
              unit: String(item.unit || "").trim(),
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
}

export default SupplierDeliveryService
