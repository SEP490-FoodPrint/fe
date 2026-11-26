import http from "src/services/01_axios"
import { buildEvidenceBody, evidenceRequestConfig } from "src/components/EvidenceFiles/evidenceFiles"
import {
  formatDateTimeVi as formatTicketDateTimeVi,
  formatTicketCode,
  getTicketStatusMeta,
  HANDLER_STATUS_OPTIONS,
  MAX_COMMENT_LENGTH,
  normalizeTicketFields,
  parseApiError,
  TICKET_STATUS,
} from "src/components/ComplaintThread/ticketHelpers"

const BASE_URL = "/ingredient-quality-feedback"

/** Loại vấn đề C02 (`issueType`); đơn cũ trả null. */
export const INGREDIENT_ISSUE_TYPE_LABELS = {
  SPOILED_OR_NOT_FRESH: "Hư hỏng/kém tươi",
  QUANTITY_MISMATCH: "Sai số lượng/khối lượng",
  WRONG_SPECIFICATION: "Sai quy cách/chủng loại",
  EXPIRED_OR_MISSING_LABEL: "Hết hạn/thiếu nhãn mác",
  LATE_DELIVERY: "Giao trễ/sai thời gian",
  OTHER: "Khác",
}

export function formatIngredientIssueType(value, fallback = "—") {
  return INGREDIENT_ISSUE_TYPE_LABELS[value] || fallback
}

export const COMPLAINT_STATUS = TICKET_STATUS

export const COMPLAINT_PERMISSIONS = {
  VIEW_DETAILS: "ingredient_quality_feedback.view_details",
  RESPOND: "ingredient_quality_feedback.respond",
}

export const MAX_RESPONSE_LENGTH = MAX_COMMENT_LENGTH

export const COMPLAINT_STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả" },
  ...HANDLER_STATUS_OPTIONS.filter(opt => opt.value !== ""),
]

export function getComplaintStatusMeta(status) {
  return getTicketStatusMeta(status)
}

export function canViewSupplierComplaints(user) {
  if (!user) return false
  if (Array.isArray(user.permissions)) {
    return user.permissions.includes(COMPLAINT_PERMISSIONS.VIEW_DETAILS)
  }
  return true
}

export function canRespondSupplierComplaints(user) {
  if (!canViewSupplierComplaints(user)) return false
  if (Array.isArray(user?.permissions)) {
    return user.permissions.includes(COMPLAINT_PERMISSIONS.RESPOND)
  }
  return true
}

export function formatComplaintCode(code, fallback = "—") {
  return formatTicketCode(code, fallback)
}

export function formatSchoolCode(code, fallback = "Chưa có mã") {
  const trimmed = typeof code === "string" ? code.trim() : ""
  return trimmed || fallback
}

export function formatDateTimeVi(value, fallback = "Chưa cập nhật") {
  return formatTicketDateTimeVi(value, fallback)
}

export function normalizeUuidParam(value) {
  return String(value ?? "").trim().toLowerCase()
}

function encodeUuid(value) {
  return encodeURIComponent(normalizeUuidParam(value))
}

function clampPagination(page, limit) {
  const safePage =
    Number.isSafeInteger(Number(page)) && Number(page) > 0
      ? Number(page)
      : 1
  const safeLimit =
    Number.isSafeInteger(Number(limit)) &&
    Number(limit) > 0 &&
    Number(limit) <= 100
      ? Number(limit)
      : 20
  return { page: safePage, limit: safeLimit }
}

export function extractApiError(
  error,
  fallbackMessage = "Đã xảy ra lỗi. Vui lòng thử lại.",
) {
  return parseApiError(error, fallbackMessage)
}

function adaptSchoolRef(raw = {}) {
  return {
    id: raw?.id || "",
    name: raw?.name || "Trường học đối tác",
    code: raw?.code ?? null,
  }
}

function adaptDeliveryRef(raw = {}) {
  return {
    id: raw?.id || "",
    deliveryNo: raw?.deliveryNo || raw?.code || "Chưa có mã chuyến",
  }
}

function adaptUserRef(raw) {
  if (!raw || typeof raw !== "object") return null
  return {
    id: raw.id || "",
    fullName: raw.fullName || "Chưa cập nhật",
  }
}

function adaptIngredientLotRef(raw) {
  if (!raw || typeof raw !== "object") return null
  return {
    id: raw.id || "",
    lotCode: raw.lotCode || "Chưa có mã lô",
  }
}

function adaptTicketListItem(raw = {}) {
  const base = normalizeTicketFields(raw)
  return {
    ...base,
    id: raw?.id || "",
    code: base.code,
    complaintCode: base.code,
    title: raw?.title || "Phản ánh chất lượng nguyên liệu",
    issueType: raw?.issueType ?? null,
    school: adaptSchoolRef(raw?.school),
    delivery: adaptDeliveryRef(raw?.delivery),
    createdAt: base.submittedAt,
  }
}

function adaptTicketDetail(raw = {}) {
  const item = adaptTicketListItem(raw)
  return {
    ...item,
    description: typeof raw?.description === "string" ? raw.description : "",
    submittedBy: adaptUserRef(raw?.submittedBy),
    ingredientLot: adaptIngredientLotRef(raw?.ingredientLot),
  }
}

const ELIGIBLE_DELIVERY_STATUSES = new Set(["RECEIVED", "REJECTED"])

function extractDeliveriesArray(response) {
  const payload = response?.data ?? response
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

function normalizeDeliveryOption(raw = {}) {
  return {
    id: raw.id || "",
    code: raw.code ?? null,
    deliveryNo: raw.deliveryNo || raw.code || raw.id || "Chưa có mã",
    status: raw.status || "",
    supplierName:
      raw.supplierName || raw.supplier?.name || raw.Supplier?.name || "",
    receivedAt: raw.receivedAt || raw.actualArrivalAt || raw.createdAt || null,
  }
}

const SupplierComplaintService = {
  async list({ page = 1, limit = 20, signal } = {}) {
    const query = clampPagination(page, limit)
    const response = await http.get(BASE_URL, {
      params: query,
      signal,
      notifyOnError: false,
    })
    const payload = response?.data ?? response ?? {}
    const rawItems = Array.isArray(payload.items) ? payload.items : []
    const rawPagination = payload.pagination || {}

    return {
      items: rawItems.map(adaptTicketListItem),
      pagination: {
        page: Number(rawPagination.page) || query.page,
        limit: Number(rawPagination.limit) || query.limit,
        hasNext: Boolean(rawPagination.hasNext),
      },
    }
  },

  async listComplaints(options) {
    return this.list(options)
  },

  async detail(feedbackId, { signal } = {}) {
    const response = await http.get(`${BASE_URL}/${encodeUuid(feedbackId)}`, {
      signal,
      notifyOnError: false,
    })
    return adaptTicketDetail(response?.data ?? response)
  },

  async getComplaintById(feedbackId, options) {
    return this.detail(feedbackId, options)
  },

  async create({ deliveryId, ingredientLotId, title, issueType, description, files }) {
    const payload = {
      deliveryId,
      title: String(title ?? "").trim(),
      issueType,
      description: String(description ?? "").trim(),
    }
    if (ingredientLotId) {
      payload.ingredientLotId = ingredientLotId
    }
    const body = buildEvidenceBody(payload, files)
    const response = await http.post(
      BASE_URL,
      body,
      evidenceRequestConfig(body, { notifyOnError: false }),
    )
    return adaptTicketDetail(response?.data ?? response)
  },

  async accept(feedbackId) {
    const response = await http.post(
      `${BASE_URL}/${encodeUuid(feedbackId)}/accept`,
      {},
      { notifyOnError: false },
    )
    return adaptTicketDetail(response?.data ?? response)
  },

  async comment(feedbackId, content, files) {
    const body = buildEvidenceBody(
      { content: String(content ?? "").trim() },
      files,
    )
    const response = await http.post(
      `${BASE_URL}/${encodeUuid(feedbackId)}/comments`,
      body,
      evidenceRequestConfig(body, { notifyOnError: false }),
    )
    return adaptTicketDetail(response?.data ?? response)
  },

  async resolve(feedbackId, content, files) {
    const body = buildEvidenceBody(
      { content: String(content ?? "").trim() },
      files,
    )
    const response = await http.post(
      `${BASE_URL}/${encodeUuid(feedbackId)}/resolve`,
      body,
      evidenceRequestConfig(body, { notifyOnError: false }),
    )
    return adaptTicketDetail(response?.data ?? response)
  },

  async satisfy(feedbackId) {
    const response = await http.post(
      `${BASE_URL}/${encodeUuid(feedbackId)}/satisfy`,
      {},
      { notifyOnError: false },
    )
    return adaptTicketDetail(response?.data ?? response)
  },

  async reopen(feedbackId, reason) {
    const trimmed = String(reason ?? "").trim()
    const payload = trimmed ? { reason: trimmed } : {}
    const response = await http.post(
      `${BASE_URL}/${encodeUuid(feedbackId)}/reopen`,
      payload,
      { notifyOnError: false },
    )
    return adaptTicketDetail(response?.data ?? response)
  },

  async listEligibleDeliveries({ signal } = {}) {
    // Backend lọc theo trường của người gọi và theo trạng thái; gọi riêng từng trạng thái hợp lệ
    const responses = await Promise.all(
      [...ELIGIBLE_DELIVERY_STATUSES].map(status =>
        http.get("/deliveries/inspections", {
          params: { page: 1, limit: 100, status },
          signal,
          notifyOnError: false,
        }),
      ),
    )
    const seenIds = new Set()
    return responses
      .flatMap(extractDeliveriesArray)
      .filter(item => {
        if (!ELIGIBLE_DELIVERY_STATUSES.has(item?.status) || seenIds.has(item?.id)) return false
        seenIds.add(item.id)
        return true
      })
      .map(normalizeDeliveryOption)
      .filter(item => Boolean(item.id))
  },

  async getDeliveryLots(deliveryId, { signal } = {}) {
    if (!deliveryId) return []
    const response = await http.get(
      `/deliveries/${encodeUuid(deliveryId)}/inspection`,
      { signal, notifyOnError: false },
    )
    const detailData = response?.data ?? response

    const lots = []
    const seen = new Set()

    const pushLot = (lot, ingredientName) => {
      if (!lot?.id || seen.has(lot.id)) return
      seen.add(lot.id)
      lots.push({
        id: lot.id,
        lotCode: lot.lotCode || lot.code || lot.id,
        ingredientName:
          ingredientName ||
          lot.ingredientName ||
          lot.ingredient?.name ||
          "",
        status: lot.status || "",
      })
    }

    const deliveryItems =
      detailData?.deliveryItems || detailData?.items || []
    if (Array.isArray(deliveryItems)) {
      deliveryItems.forEach(item => {
        const ingredientName =
          item.ingredientName || item.ingredient?.name || item.name || ""
        if (Array.isArray(item.ingredientLots)) {
          item.ingredientLots.forEach(lot => pushLot(lot, ingredientName))
        }
        if (item.ingredientLot) {
          pushLot(item.ingredientLot, ingredientName)
        }
      })
    }

    if (Array.isArray(detailData?.ingredientLots)) {
      detailData.ingredientLots.forEach(lot => pushLot(lot, ""))
    }

    return lots
  },
}

export default SupplierComplaintService
