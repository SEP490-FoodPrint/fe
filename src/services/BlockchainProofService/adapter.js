// Turns blockchain proof versions into plain-language states for people who do not know blockchain.

export const EVENT_LABELS = {
  DELIVERY_DECLARED: "Nhà cung cấp khai báo giao hàng",
  MEAL_DISTRIBUTED: "Xác nhận phân phối suất ăn",
  DELIVERY_INSPECTED: "Chốt biên bản kiểm nhận",
  COOKING_COMPLETED: "Hoàn thành mẻ nấu",
  SAMPLE_STORED: "Lưu mẫu thực phẩm",
  SAMPLE_DISPOSED: "Tiêu huỷ mẫu",
  REGISTRATION_SUBMITTED: "Nộp hồ sơ",
  REGISTRATION_APPROVED: "Duyệt hồ sơ",
}

/** Overall state of one record: NONE, PENDING, FAILED or CONFIRMED. */
export const SEAL_STATES = {
  NONE: { tone: "neutral", label: "Chưa có bằng chứng", description: "Bản ghi này chưa được niêm phong trên blockchain (ví dụ: được tạo trước khi bật tính năng)." },
  PENDING: { tone: "info", label: "Đang niêm phong", description: "Hệ thống đang ghi dấu vân tay của dữ liệu lên blockchain. Thường mất dưới 1 phút." },
  FAILED: { tone: "warning", label: "Chưa niêm phong được", description: "Lần ghi lên blockchain chưa thành công. Dữ liệu vẫn được lưu bình thường; có thể gửi lại." },
  CONFIRMED: { tone: "success", label: "Đã niêm phong", description: "Dấu vân tay của dữ liệu đã được khoá trên blockchain. Nếu dữ liệu bị sửa sau thời điểm này, hệ thống sẽ phát hiện khi kiểm tra." },
}

export const CHECK_STATES = {
  NOT_VERIFIED: { tone: "neutral", label: "Chưa kiểm tra" },
  VERIFIED: { tone: "success", label: "Còn nguyên vẹn" },
  MISMATCH: { tone: "error", label: "Phát hiện thay đổi" },
  FAILED: { tone: "warning", label: "Không kiểm tra được" },
}

export const DOCUMENT_STATES = {
  MATCH: { tone: "success", label: "Khớp bản gốc" },
  MISMATCH: { tone: "error", label: "Đã bị thay đổi" },
  MISSING: { tone: "error", label: "Không còn tệp" },
  NO_HASH: { tone: "neutral", label: "Nộp trước khi có niêm phong" },
}

const text = value => (typeof value === "string" && value ? value : null)

export function proofVersion(value) {
  if (!value?.id || !Number.isInteger(value.version)) throw new Error("Dữ liệu bằng chứng blockchain không hợp lệ.")
  return {
    id: value.id,
    kind: value.kind,
    recordId: value.recordId,
    version: value.version,
    eventType: value.eventType,
    eventLabel: EVENT_LABELS[value.eventType] || value.eventType,
    dataHash: text(value.dataHash),
    previousVersionId: text(value.previousVersionId),
    changeReason: text(value.changeReason),
    transactionStatus: value.transactionStatus,
    transactionHash: text(value.transactionHash),
    blockNumber: text(value.blockNumber),
    networkName: text(value.networkName),
    explorerUrl: safeExplorerUrl(value.explorerUrl),
    recordedAt: text(value.recordedAt),
    lastError: text(value.lastError),
    verificationStatus: value.verificationStatus || "NOT_VERIFIED",
    verificationResult: text(value.verificationResult),
    verifiedAt: text(value.verifiedAt),
    createdAt: text(value.createdAt),
    documents: Array.isArray(value.documents)
      ? value.documents.filter(item => item && typeof item === "object").map(item => ({
        id: item.id, field: item.field, fileName: item.fileName || item.field || "Tệp minh chứng", status: item.status,
      }))
      : null,
  }
}

/** Only https Etherscan links are rendered, so the API can never inject another target. */
export function safeExplorerUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === "https:" && /(^|\.)etherscan\.io$/.test(url.hostname) ? url.href : null
  } catch {
    return null
  }
}

export function sealState(versions) {
  if (!versions.length) return "NONE"
  if (versions.some(item => item.transactionStatus === "FAILED")) return "FAILED"
  if (versions.some(item => item.transactionStatus === "PREPARED" || item.transactionStatus === "SUBMITTED")) return "PENDING"
  return "CONFIRMED"
}

/** The version a "check integrity" click should verify: the newest confirmed one. */
export function latestConfirmed(versions) {
  return [...versions].reverse().find(item => item.transactionStatus === "CONFIRMED") || null
}

/** The version a "send again" click should resend: the oldest one that is not confirmed. */
export function firstUnconfirmed(versions) {
  return versions.find(item => item.transactionStatus !== "CONFIRMED") || null
}

export function shortHash(value, size = 6) {
  if (!value || value.length <= size * 2 + 3) return value || "—"
  return `${value.slice(0, size + 2)}…${value.slice(-size)}`
}
