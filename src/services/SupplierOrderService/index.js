import http from "src/services/01_axios"

const BASE_URL = "/supply-requests"

export const SUPPLY_ORDER_STATUS = {
  SENT: "SENT",
  ACCEPTED: "ACCEPTED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
}

const VALID_STATUS_SET = new Set(Object.values(SUPPLY_ORDER_STATUS))

export const SUPPLY_ORDER_STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả" },
  { value: SUPPLY_ORDER_STATUS.SENT, label: "Chờ tiếp nhận" },
  { value: SUPPLY_ORDER_STATUS.ACCEPTED, label: "Đã xác nhận" },
  { value: SUPPLY_ORDER_STATUS.IN_PROGRESS, label: "Đang giao hàng" },
  { value: SUPPLY_ORDER_STATUS.COMPLETED, label: "Hoàn thành" },
  { value: SUPPLY_ORDER_STATUS.CANCELLED, label: "Đã hủy" },
]

const STATUS_META = {
  [SUPPLY_ORDER_STATUS.SENT]: {
    label: "Chờ tiếp nhận",
    tone: "warning",
  },
  [SUPPLY_ORDER_STATUS.ACCEPTED]: {
    label: "Đã xác nhận",
    tone: "success",
  },
  PREPARING: {
    label: "Đang chuẩn bị hàng",
    tone: "warning",
  },
  [SUPPLY_ORDER_STATUS.IN_PROGRESS]: {
    label: "Đang giao hàng",
    tone: "info",
  },
  [SUPPLY_ORDER_STATUS.COMPLETED]: {
    label: "Hoàn thành",
    tone: "success",
  },
  [SUPPLY_ORDER_STATUS.CANCELLED]: {
    label: "Đã hủy",
    tone: "muted",
  },
}

export function getOrderStatusMeta(status) {
  return STATUS_META[status] || { label: status || "Không xác định", tone: "muted" }
}

export function formatDateVi(value) {
  if (!value) return "Chưa ấn định"
  const raw = String(value).trim()
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw)
  if (dateOnlyMatch) {
    return `${dateOnlyMatch[3]}/${dateOnlyMatch[2]}/${dateOnlyMatch[1]}`
  }
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return "—"
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
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

export function formatQuantityVi(value) {
  if (value === null || value === undefined || value === "") return "—"
  const num = Number(value)
  if (Number.isNaN(num)) return String(value)
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 3,
  }).format(num)
}

export function extractApiError(error, fallbackMessage = "Đã xảy ra lỗi. Vui lòng thử lại.") {
  const status = error?.response?.status
  const apiData = error?.response?.data
  const message = apiData?.message || error?.message || fallbackMessage
  return { status, message }
}

function encodeId(id) {
  return encodeURIComponent(String(id || "").trim())
}

function adaptOrderSummary(row = {}) {
  return {
    id: row.id || "",
    requestNo: row.requestNo || "",
    schoolId: row.schoolId || "",
    supplierId: row.supplierId || "",
    schoolName: row.schoolName || "Trường học đối tác",
    status: row.status || SUPPLY_ORDER_STATUS.SENT,
    // DRY_STOCK: đơn đồ lưu kho (được hẹn giao ngày khác); còn lại là đồ tươi giao trong ngày.
    orderType: row.orderType || null,
    batchNo: row.batchNo ?? null,
    // Tiến độ chuyến giao của đơn (deliveryId, stage) — dùng cho bước lưu mẫu Đợt 2.
    orderProgress: row.orderProgress ?? null,
    requestedDeliveryDate: row.requestedDeliveryDate || null,
    sentAt: row.sentAt || null,
    acceptedAt: row.acceptedAt || null,
    createdAt: row.createdAt || null,
    updatedAt: row.updatedAt || null,
  }
}

function adaptOrderItem(item = {}) {
  return {
    id: item.id || "",
    ingredientEntryId: item.ingredientEntryId || "",
    ingredientName: item.ingredientName || "Nguyên liệu",
    // DRY_STOCK: NCC phải nhập ngày sản xuất và hạn sử dụng của lô khi tạo chuyến giao.
    handlingType: item.handlingType || null,
    sampleTopUpQuantity: item.sampleTopUpQuantity ?? null,
    requestedQuantity:
      item.requestedQuantity !== undefined && item.requestedQuantity !== null
        ? String(item.requestedQuantity)
        : "0",
    unit: item.unit || "",
    note: item.note ?? null,
  }
}

function adaptOrderDetail(row = {}) {
  return {
    ...adaptOrderSummary(row),
    note: row.note ?? null,
    acceptedByUserId: row.acceptedByUserId ?? null,
    // TASK-10 v8: Đợt 2 của trường nấu riêng có bước NCC xác nhận bổ sung lưu mẫu (4 bước).
    requiresSampleStep: Boolean(row.requiresSampleStep),
    items: Array.isArray(row.items) ? row.items.map(adaptOrderItem) : [],
  }
}

const SupplierOrderService = {
  async list({ page = 1, limit = 20, status, signal } = {}) {
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
      items: Array.isArray(payload.items) ? payload.items.map(adaptOrderSummary) : [],
      pagination: {
        page: payload.pagination?.page ?? safePage,
        limit: payload.pagination?.limit ?? safeLimit,
        hasNext: Boolean(payload.pagination?.hasNext),
      },
    }
  },

  async getById(orderId, { signal } = {}) {
    const response = await http.get(`${BASE_URL}/${encodeId(orderId)}`, {
      signal,
      notifyOnError: false,
    })
    return adaptOrderDetail(response?.data || response)
  },

  async accept(orderId) {
    const response = await http.post(
      `${BASE_URL}/${encodeId(orderId)}/accept`,
      {},
      { notifyOnError: false },
    )
    const data = response?.data || response || {}
    return {
      id: data.id || String(orderId),
      status: data.status || SUPPLY_ORDER_STATUS.ACCEPTED,
      acceptedByUserId: data.acceptedByUserId ?? null,
      acceptedAt: data.acceptedAt ?? null,
    }
  },
}

export default SupplierOrderService
