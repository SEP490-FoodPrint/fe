import http from "src/services/01_axios"

const BASE_URL = "/supplier-schools"

export const RELATIONSHIP_STATUS = {
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  UNLINKED: "UNLINKED",
}

export const RELATIONSHIP_STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả" },
  { value: RELATIONSHIP_STATUS.ACTIVE, label: "Đang liên kết" },
  { value: RELATIONSHIP_STATUS.SUSPENDED, label: "Tạm ngưng" },
  { value: RELATIONSHIP_STATUS.UNLINKED, label: "Đã hủy liên kết" },
]

export const SCHOOL_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
}

export const CONTRACT_STATUS = {
  ACTIVE: "ACTIVE",
  CLOSED: "CLOSED",
}

export const DOCUMENT_KIND = {
  SIGNED_CONTRACT: "SIGNED_CONTRACT",
  APPENDIX: "APPENDIX",
}

export const ALLOWED_DOCUMENT_MIME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
])

const RELATIONSHIP_STATUS_META = {
  [RELATIONSHIP_STATUS.ACTIVE]: {
    label: "Đang liên kết",
    tone: "success",
  },
  [RELATIONSHIP_STATUS.SUSPENDED]: {
    label: "Tạm ngưng",
    tone: "warning",
  },
  [RELATIONSHIP_STATUS.UNLINKED]: {
    label: "Đã hủy liên kết",
    tone: "muted",
  },
}

const SCHOOL_STATUS_META = {
  [SCHOOL_STATUS.ACTIVE]: {
    label: "Đang hoạt động",
    tone: "success",
  },
  [SCHOOL_STATUS.INACTIVE]: {
    label: "Ngừng hoạt động",
    tone: "muted",
  },
}

const CONTRACT_STATUS_META = {
  [CONTRACT_STATUS.ACTIVE]: {
    label: "Đã kích hoạt",
    tone: "success",
  },
  [CONTRACT_STATUS.CLOSED]: {
    label: "Đã đóng",
    tone: "muted",
  },
}

const DOCUMENT_KIND_LABELS = {
  [DOCUMENT_KIND.SIGNED_CONTRACT]: "Hợp đồng đã ký",
  [DOCUMENT_KIND.APPENDIX]: "Phụ lục",
}

export function getRelationshipStatusMeta(status) {
  return (
    RELATIONSHIP_STATUS_META[status] || {
      label: status || "Không xác định",
      tone: "muted",
    }
  )
}

export function getSchoolStatusMeta(status) {
  return (
    SCHOOL_STATUS_META[status] || {
      label: status || "Không xác định",
      tone: "muted",
    }
  )
}

export function getContractStatusMeta(status) {
  return (
    CONTRACT_STATUS_META[status] || {
      label: status || "Không xác định",
      tone: "muted",
    }
  )
}

export function getDocumentKindLabel(kind) {
  return DOCUMENT_KIND_LABELS[kind] || kind || "Tài liệu"
}

export function formatSchoolCode(code, fallback = "Chưa có mã") {
  const trimmed = typeof code === "string" ? code.trim() : ""
  return trimmed || fallback
}

export function formatDateVi(value, fallback = "Chưa cập nhật") {
  if (!value) return fallback
  const raw = String(value).trim()
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw)
  if (dateOnlyMatch) {
    return `${dateOnlyMatch[3]}/${dateOnlyMatch[2]}/${dateOnlyMatch[1]}`
  }
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return fallback
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

export function formatDateTimeVi(value, fallback = "Chưa cập nhật") {
  if (!value) return fallback
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

export function formatFileSize(bytes) {
  if (bytes === null || bytes === undefined || bytes === "") return "—"
  const size = Number(bytes)
  if (!Number.isFinite(size) || size < 0) return "—"
  if (size < 1024) return `${Math.round(size)} B`
  const kb = size / 1024
  if (kb < 1024) {
    return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`
  }
  const mb = kb / 1024
  return `${mb.toFixed(1)} MB`
}

export function sanitizeExternalUrl(rawUrl) {
  if (typeof rawUrl !== "string") return null
  const trimmed = rawUrl.trim()
  if (!trimmed) return null
  try {
    const parsed = new URL(trimmed)
    if (!["http:", "https:"].includes(parsed.protocol)) return null
    if (parsed.username || parsed.password) return null
    return parsed.href
  } catch {
    return null
  }
}

export function sanitizeImageUrl(rawUrl) {
  if (typeof rawUrl !== "string") return null
  const trimmed = rawUrl.trim()
  if (!trimmed) return null
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed
  }
  return sanitizeExternalUrl(trimmed)
}

export function normalizeUuidParam(value) {
  return String(value ?? "").trim().toLowerCase()
}

function encodeUuid(value) {
  return encodeURIComponent(normalizeUuidParam(value))
}

export function sanitizeDownloadFilename(fileName) {
  const cleaned = String(fileName ?? "")
    .replace(/[\r\n\0/\\]+/g, "_")
    .trim()
  return cleaned || "hop-dong"
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
  const status = error?.response?.status
  const apiData = error?.response?.data
  const message =
    (apiData && typeof apiData === "object" && !(apiData instanceof Blob)
      ? apiData.message
      : null) ||
    error?.message ||
    fallbackMessage

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

export async function extractBlobError(
  error,
  fallbackMessage = "Không thể đọc tệp tài liệu. Vui lòng thử lại.",
) {
  const status = error?.response?.status
  const data = error?.response?.data
  if (data && typeof data === "object" && typeof data.text === "function") {
    try {
      const rawText = await data.text()
      const parsed = JSON.parse(rawText)
      if (parsed?.message) {
        return { status, message: parsed.message, fields: {} }
      }
    } catch {
      // Fallback to default message if response body is not JSON
    }
  }
  return extractApiError(error, fallbackMessage)
}

function adaptRelationshipSummary(raw = {}) {
  return {
    status: raw?.status || RELATIONSHIP_STATUS.ACTIVE,
    linkedAt: raw?.linkedAt ?? null,
  }
}

function adaptRelationshipDetail(raw = {}) {
  return {
    ...adaptRelationshipSummary(raw),
    suspendedAt: raw?.suspendedAt ?? null,
    unlinkedAt: raw?.unlinkedAt ?? null,
    suspensionReason: raw?.suspensionReason ?? null,
    unlinkReason: raw?.unlinkReason ?? null,
  }
}

function adaptSchoolListItem(raw = {}) {
  return {
    id: raw?.id || "",
    name: raw?.name || "Trường học đối tác",
    code: raw?.code ?? null,
    address: raw?.address ?? null,
    email: raw?.email ?? null,
    phone: raw?.phone ?? null,
    status: raw?.status || SCHOOL_STATUS.ACTIVE,
    relationship: adaptRelationshipSummary(raw?.relationship),
  }
}

function adaptSchoolDetail(raw = {}) {
  return {
    id: raw?.id || "",
    name: raw?.name || "Trường học đối tác",
    code: raw?.code ?? null,
    address: raw?.address ?? null,
    email: raw?.email ?? null,
    phone: raw?.phone ?? null,
    status: raw?.status || SCHOOL_STATUS.ACTIVE,
    description: raw?.description ?? null,
    websiteUrl: raw?.websiteUrl ?? null,
    logoUrl: raw?.logoUrl ?? null,
    coverImageUrl: raw?.coverImageUrl ?? null,
    boardingScale: raw?.boardingScale ?? null,
    relationship: adaptRelationshipDetail(raw?.relationship),
  }
}

function adaptDocumentMetadata(raw = {}) {
  return {
    id: raw?.id || "",
    kind: raw?.kind || DOCUMENT_KIND.SIGNED_CONTRACT,
    fileName: raw?.fileName || "Tệp hợp đồng",
    mimeType: raw?.mimeType || "application/pdf",
    size: typeof raw?.size === "number" ? raw.size : Number(raw?.size) || 0,
    createdAt: raw?.createdAt ?? null,
  }
}

function adaptContract(raw = {}) {
  const rawIngredients = Array.isArray(raw?.ingredients) ? raw.ingredients : []
  const rawDocuments = Array.isArray(raw?.documents) ? raw.documents : []

  return {
    id: raw?.id || "",
    number: raw?.number ?? null,
    status: raw?.status || CONTRACT_STATUS.ACTIVE,
    signedOn: raw?.signedOn ?? null,
    startsOn: raw?.startsOn ?? null,
    endsOn: raw?.endsOn ?? null,
    scopeNote: raw?.scopeNote ?? null,
    ingredients: rawIngredients.map(item => ({
      id: item?.id || "",
      name: item?.name || "Nguyên liệu",
    })),
    activatedAt: raw?.activatedAt ?? null,
    closedAt: raw?.closedAt ?? null,
    closeReason: raw?.closeReason ?? null,
    documents: rawDocuments.map(adaptDocumentMetadata),
  }
}

function resolveValidatedMime(blobType, fallbackMime) {
  const normalizedBlobMime = String(blobType ?? "")
    .split(";")[0]
    .trim()
    .toLowerCase()
  const normalizedFallback = String(fallbackMime ?? "")
    .split(";")[0]
    .trim()
    .toLowerCase()

  const candidate = normalizedBlobMime || normalizedFallback
  return ALLOWED_DOCUMENT_MIME_TYPES.has(candidate) ? candidate : null
}

const SupplierSchoolService = {
  async listSchools({ page = 1, limit = 20, signal } = {}) {
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
      items: rawItems.map(adaptSchoolListItem),
      pagination: {
        page: Number(rawPagination.page) || query.page,
        limit: Number(rawPagination.limit) || query.limit,
        hasNext: Boolean(rawPagination.hasNext),
      },
    }
  },

  async getSchoolById(schoolId, { signal } = {}) {
    const response = await http.get(`${BASE_URL}/${encodeUuid(schoolId)}`, {
      signal,
      notifyOnError: false,
    })
    return adaptSchoolDetail(response?.data ?? response)
  },

  async listContracts(schoolId, { page = 1, limit = 20, signal } = {}) {
    const query = clampPagination(page, limit)
    const response = await http.get(
      `${BASE_URL}/${encodeUuid(schoolId)}/contracts`,
      {
        params: query,
        signal,
        notifyOnError: false,
      },
    )
    const payload = response?.data ?? response ?? {}
    const rawItems = Array.isArray(payload.items) ? payload.items : []
    const rawPagination = payload.pagination || {}

    return {
      items: rawItems.map(adaptContract),
      pagination: {
        page: Number(rawPagination.page) || query.page,
        limit: Number(rawPagination.limit) || query.limit,
        hasNext: Boolean(rawPagination.hasNext),
      },
    }
  },

  async getContractById(schoolId, contractId, { signal } = {}) {
    const response = await http.get(
      `${BASE_URL}/${encodeUuid(schoolId)}/contracts/${encodeUuid(contractId)}`,
      {
        signal,
        notifyOnError: false,
      },
    )
    return adaptContract(response?.data ?? response)
  },

  async getDocumentContent({
    schoolId,
    contractId,
    documentId,
    disposition = "inline",
    mimeType = "",
    signal,
  } = {}) {
    const safeDisposition =
      disposition === "attachment" ? "attachment" : "inline"
    const blob = await http.get(
      `${BASE_URL}/${encodeUuid(schoolId)}/contracts/${encodeUuid(contractId)}/documents/${encodeUuid(documentId)}`,
      {
        params: { disposition: safeDisposition },
        responseType: "blob",
        signal,
        notifyOnError: false,
      },
    )

    if (!blob || !(blob instanceof Blob) || blob.size === 0) {
      throw new Error("Tệp tài liệu trống hoặc không thể đọc nội dung.")
    }

    const validatedMime = resolveValidatedMime(blob.type, mimeType)
    if (!validatedMime) {
      throw new Error("Định dạng tệp tài liệu không được hỗ trợ.")
    }

    const normalizedBlob =
      blob.type === validatedMime
        ? blob
        : new Blob([blob], { type: validatedMime })

    return {
      blob: normalizedBlob,
      mimeType: validatedMime,
      size: normalizedBlob.size,
    }
  },

  async downloadDocument({ schoolId, contractId, document, signal } = {}) {
    const result = await SupplierSchoolService.getDocumentContent({
      schoolId,
      contractId,
      documentId: document?.id,
      disposition: "attachment",
      mimeType: document?.mimeType,
      signal,
    })

    const url = URL.createObjectURL(result.blob)
    const anchor = window.document.createElement("a")
    anchor.href = url
    anchor.download = sanitizeDownloadFilename(document?.fileName)
    anchor.style.display = "none"
    window.document.body?.appendChild(anchor)
    anchor.click()
    window.document.body?.removeChild(anchor)
    setTimeout(() => URL.revokeObjectURL(url), 1000)

    return result
  },
}

export default SupplierSchoolService
