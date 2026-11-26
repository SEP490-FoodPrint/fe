export const EVIDENCE_MAX_FILES = 5
export const EVIDENCE_MAX_BYTES = 5 * 1024 * 1024
export const EVIDENCE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
export const EVIDENCE_ACCEPT = ".jpg,.jpeg,.png,.webp,.pdf," + EVIDENCE_MIME_TYPES.join(",")
// Gửi file làm request lâu hơn JSON thường (tối đa 5 × 5 MiB).
export const EVIDENCE_UPLOAD_TIMEOUT = 120000

const EXTENSION_TYPES = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", pdf: "application/pdf" }

export function evidenceMimeType(file) {
  if (EVIDENCE_MIME_TYPES.includes(file?.type)) return file.type
  const ext = String(file?.name || "").split(".").pop().toLowerCase()
  return EXTENSION_TYPES[ext] || ""
}

export function isPdfFile(file) {
  return (file?.mimeType || evidenceMimeType(file)) === "application/pdf"
}

export function formatFileSize(bytes) {
  const value = Number(bytes)
  if (!Number.isFinite(value) || value <= 0) return ""
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`
  return `${(value / (1024 * 1024)).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} MB`
}

/**
 * Thêm file mới vào danh sách đã chọn, bỏ file sai loại/quá dung lượng/trùng.
 * Trả { files, error } — error là câu báo lỗi đầu tiên (nếu có).
 */
export function mergeEvidenceFiles(current = [], incoming = [], max = EVIDENCE_MAX_FILES) {
  const files = [...current]
  let error = ""
  for (const file of incoming) {
    if (!evidenceMimeType(file)) { error ||= `“${file.name}” không đúng định dạng. Chỉ nhận JPG, PNG, WEBP hoặc PDF.`; continue }
    if (!file.size || file.size > EVIDENCE_MAX_BYTES) { error ||= `“${file.name}” vượt quá 5 MB.`; continue }
    if (files.some(item => item.name === file.name && item.size === file.size && item.lastModified === file.lastModified)) continue
    if (files.length >= max) { error ||= `Tối đa ${max} file mỗi lần gửi.`; break }
    files.push(file)
  }
  return { files, error }
}

/**
 * Không có file: trả object để gửi JSON như cũ. Có file: trả FormData
 * (trường file là `files`; mảng/object được chuyển thành chuỗi JSON; bỏ trường rỗng).
 */
export function buildEvidenceBody(fields, files) {
  const list = Array.isArray(files) ? files.filter(Boolean) : []
  if (list.length === 0) return fields
  const form = new FormData()
  Object.entries(fields || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return
    form.append(key, typeof value === "object" ? JSON.stringify(value) : String(value))
  })
  list.forEach(file => form.append("files", file, file.name))
  return form
}

export function evidenceRequestConfig(body, config = {}) {
  return body instanceof FormData ? { ...config, timeout: EVIDENCE_UPLOAD_TIMEOUT } : config
}

export function normalizeAttachments(list) {
  if (!Array.isArray(list)) return []
  return list.filter(item => item && item.id).map(item => ({
    id: item.id,
    fileName: item.fileName || item.originalFilename || "Tệp đính kèm",
    mimeType: item.mimeType || "",
    sizeBytes: item.sizeBytes ?? null,
    stage: item.stage || null,
    uploaderSide: item.uploaderSide || null,
    createdAt: item.createdAt || null,
    url: item.url || null,
  }))
}
