export const TICKET_STATUS = {
  NEW: "NEW",
  IN_PROGRESS: "IN_PROGRESS",
  REOPENED: "REOPENED",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
}

export const TICKET_STATUS_META = {
  [TICKET_STATUS.NEW]: {
    label: "Mới tạo",
    tone: "warning",
  },
  [TICKET_STATUS.IN_PROGRESS]: {
    label: "Đang xử lý",
    tone: "info",
  },
  [TICKET_STATUS.REOPENED]: {
    label: "Yêu cầu xử lý lại",
    tone: "warning",
  },
  [TICKET_STATUS.RESOLVED]: {
    label: "Đã xử lý",
    tone: "success",
  },
  [TICKET_STATUS.CLOSED]: {
    label: "Đã đóng",
    tone: "muted",
  },
}

export const HANDLER_STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: TICKET_STATUS.NEW, label: TICKET_STATUS_META.NEW.label },
  { value: TICKET_STATUS.IN_PROGRESS, label: TICKET_STATUS_META.IN_PROGRESS.label },
  { value: TICKET_STATUS.REOPENED, label: TICKET_STATUS_META.REOPENED.label },
  { value: TICKET_STATUS.RESOLVED, label: TICKET_STATUS_META.RESOLVED.label },
  { value: TICKET_STATUS.CLOSED, label: TICKET_STATUS_META.CLOSED.label },
]

export const REQUESTER_STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: TICKET_STATUS.IN_PROGRESS, label: TICKET_STATUS_META.IN_PROGRESS.label },
  { value: TICKET_STATUS.RESOLVED, label: TICKET_STATUS_META.RESOLVED.label },
  { value: TICKET_STATUS.CLOSED, label: TICKET_STATUS_META.CLOSED.label },
]

export const CLOSE_REASON_LABELS = {
  SATISFIED: "Người gửi hài lòng",
  ESCALATED: "Đã chuyển cơ quan ATTP",
  AUTO_CLOSED: "Tự động đóng sau 48 giờ",
}

export const COMMENT_TYPE_META = {
  MESSAGE: null,
  RESOLUTION: { label: "Kết quả xử lý", tone: "success" },
  REOPEN_NOTE: { label: "Yêu cầu xử lý lại", tone: "warning" },
  ESCALATION_NOTE: { label: "Chuyển cơ quan ATTP", tone: "error" },
}

export const MAX_COMMENT_LENGTH = 5000

const VN_TIMEZONE = "Asia/Ho_Chi_Minh"

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: VN_TIMEZONE,
})

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: VN_TIMEZONE,
})

const timeFormatter = new Intl.DateTimeFormat("vi-VN", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: VN_TIMEZONE,
})

export function getTicketStatusMeta(status) {
  return (
    TICKET_STATUS_META[status] || {
      label: status || "Không xác định",
      tone: "muted",
    }
  )
}

export function formatTicketCode(code, fallback = "—") {
  const trimmed = typeof code === "string" ? code.trim() : ""
  return trimmed || fallback
}

export function formatDateVi(value, fallback = "-") {
  if (!value) return fallback
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback
  return dateFormatter.format(date)
}

export function formatDateTimeVi(value, fallback = "-") {
  if (!value) return fallback
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback
  return dateTimeFormatter.format(date)
}

export function formatTimeVi(value, fallback = "") {
  if (!value) return fallback
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback
  return timeFormatter.format(date)
}

export function formatDateDividerLabel(value) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const targetStr = dateFormatter.format(date)
  const todayStr = dateFormatter.format(new Date())
  return targetStr === todayStr ? "Hôm nay" : targetStr
}

export function groupCommentsByDate(comments = []) {
  if (!Array.isArray(comments) || comments.length === 0) return []
  const groups = []
  let currentGroup = null

  comments.forEach(comment => {
    const label = formatDateDividerLabel(comment?.createdAt) || "Khác"
    if (!currentGroup || currentGroup.label !== label) {
      currentGroup = { label, items: [] }
      groups.push(currentGroup)
    }
    currentGroup.items.push(comment)
  })

  return groups
}

export function formatCountdown(feedbackDeadlineAt, nowMs = Date.now()) {
  if (!feedbackDeadlineAt) return null
  const deadlineMs = new Date(feedbackDeadlineAt).getTime()
  if (Number.isNaN(deadlineMs)) return null

  const diffMs = deadlineMs - nowMs
  if (diffMs <= 0) {
    return {
      expired: true,
      text: "Đã hết thời hạn phản hồi 48 giờ",
    }
  }

  const totalMinutes = Math.ceil(diffMs / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours >= 1 && minutes > 0) {
    return { expired: false, text: `Còn ${hours} giờ ${minutes} phút` }
  }
  if (hours >= 1) {
    return { expired: false, text: `Còn ${hours} giờ` }
  }
  return { expired: false, text: `Còn ${Math.max(1, minutes)} phút` }
}

export function countCodePoints(value) {
  return Array.from(String(value ?? "").trim()).length
}

/**
 * Parses backend API errors including:
 * - Standard 400 validation: { error: { fields: [{ field, message }] } }
 * - /api/meal-complaints plain 400 string: "Dữ liệu khiếu nại không hợp lệ: <field>: <lỗi>; ..."
 * - 409 conflicts and error.code
 */
export function parseApiError(error, fallback = "Đã xảy ra lỗi. Vui lòng thử lại.") {
  const status = error?.response?.status ?? null
  const apiData = error?.response?.data
  const message =
    (apiData && typeof apiData === "object" ? apiData.message : null) ||
    error?.message ||
    fallback
  const code = apiData?.error?.code || null

  const fields = {}
  const structuredFields = apiData?.error?.fields
  if (Array.isArray(structuredFields)) {
    structuredFields.forEach(item => {
      const key =
        item?.field ||
        (Array.isArray(item?.path) ? item.path[0] : item?.path) ||
        ""
      if (key && item?.message && !fields[key]) {
        fields[key] = item.message
      }
    })
  } else if (
    status === 400 &&
    typeof message === "string" &&
    message.includes(":")
  ) {
    const prefixIndex = message.indexOf(":")
    const detailPart = message.slice(prefixIndex + 1).trim()
    if (detailPart) {
      detailPart.split(";").forEach(segment => {
        const idx = segment.indexOf(":")
        if (idx > 0) {
          const field = segment.slice(0, idx).trim()
          const errMsg = segment.slice(idx + 1).trim()
          if (field && errMsg && !fields[field]) {
            fields[field] = errMsg
          }
        }
      })
    }
  }

  return { status, code, message, fields }
}

export function normalizeTicketFields(raw = {}) {
  if (!raw || typeof raw !== "object") return raw
  const status = raw.status || TICKET_STATUS.NEW
  const displayStatus = raw.displayStatus || status
  return {
    ...raw,
    code: raw.code ?? raw.complaintCode ?? null,
    status,
    displayStatus,
    hasNewMessage: Boolean(raw.hasNewMessage),
    closeReason: raw.closeReason ?? null,
    lastResolvedAt: raw.lastResolvedAt ?? null,
    resolvedCount: Number(raw.resolvedCount ?? 0),
    feedbackDeadlineAt: raw.feedbackDeadlineAt ?? null,
    closedAt: raw.closedAt ?? null,
    submittedAt: raw.submittedAt ?? raw.createdAt ?? null,
    updatedAt: raw.updatedAt ?? null,
    allowedActions: Array.isArray(raw.allowedActions) ? raw.allowedActions : [],
    comments: Array.isArray(raw.comments) ? raw.comments : [],
    attachments: Array.isArray(raw.attachments) ? raw.attachments : [],
  }
}
