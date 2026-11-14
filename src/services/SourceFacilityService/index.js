import {
  COOPERATION_STATUSES,
  createInitialMockFacilities,
  DEMO_DATA_NOTICE,
  FACILITY_TYPES,
} from "./mockData"

const STORAGE_KEY = "fp_mock_source_facilities_v1"
export const EXPIRING_SOON_DAYS = 30

const FACILITY_TYPE_LABELS = Object.fromEntries(
  FACILITY_TYPES.map(item => [item.value, item.label]),
)
const COOPERATION_STATUS_LABELS = Object.fromEntries(
  COOPERATION_STATUSES.map(item => [item.value, item.label]),
)

export function getFacilityTypeLabel(value) {
  return FACILITY_TYPE_LABELS[value] || value || "Chưa phân loại"
}

export function getCooperationStatusLabel(value) {
  return COOPERATION_STATUS_LABELS[value] || "Đang hợp tác"
}

export function getTodayIsoDate() {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, "0")
  const dd = String(now.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

export function formatDateVi(value) {
  if (!value) return "—"
  const raw = String(value).trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [yyyy, mm, dd] = raw.split("-")
    return `${dd}/${mm}/${yyyy}`
  }
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return "—"
  return parsed.toLocaleDateString("vi-VN")
}

function parseIsoDay(value) {
  if (!value) return null
  const raw = String(value).trim()
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2]) - 1
  const day = Number(match[3])
  const date = new Date(year, month, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null
  }
  date.setHours(0, 0, 0, 0)
  return date
}

export function getCertificationHealth(cert, referenceDate = new Date()) {
  const expiry = parseIsoDay(cert?.expiryDate)
  if (!expiry) {
    return {
      status: "MISSING_DATE",
      daysRemaining: null,
      label: "Chưa rõ hạn",
      detailText: "Thiếu ngày hết hạn",
    }
  }

  const today = new Date(referenceDate)
  today.setHours(0, 0, 0, 0)
  const diffDays = Math.round(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  )

  if (diffDays < 0) {
    const overdue = Math.abs(diffDays)
    return {
      status: "EXPIRED",
      daysRemaining: diffDays,
      label: "Đã hết hạn",
      detailText: `Quá hạn ${overdue} ngày`,
    }
  }

  if (diffDays <= EXPIRING_SOON_DAYS) {
    return {
      status: "EXPIRING_SOON",
      daysRemaining: diffDays,
      label: "Sắp hết hạn",
      detailText: diffDays === 0 ? "Hết hạn hôm nay" : `Còn ${diffDays} ngày`,
    }
  }

  return {
    status: "VALID",
    daysRemaining: diffDays,
    label: "Còn hiệu lực",
    detailText: `Còn ${diffDays} ngày`,
  }
}

export function getFacilityAttention(facility, referenceDate = new Date()) {
  const certifications = Array.isArray(facility?.certifications)
    ? facility.certifications
    : []

  if (certifications.length === 0) {
    return {
      needsAttention: true,
      severity: "warning",
      missingCerts: true,
      expiredCount: 0,
      expiringSoonCount: 0,
      reasons: ["Chưa có hồ sơ chứng nhận nào được khai báo."],
      primaryWarning: "Thiếu chứng nhận",
    }
  }

  let expiredCount = 0
  let expiringSoonCount = 0
  let missingDateCount = 0
  const reasons = []

  certifications.forEach(cert => {
    const health = getCertificationHealth(cert, referenceDate)
    if (health.status === "EXPIRED") {
      expiredCount += 1
      reasons.push(
        `${cert.name || "Chứng nhận"} (${cert.certificateNumber || "chưa có số"}) đã hết hạn ${Math.abs(health.daysRemaining)} ngày (${formatDateVi(cert.expiryDate)}).`,
      )
    } else if (health.status === "EXPIRING_SOON") {
      expiringSoonCount += 1
      reasons.push(
        `${cert.name || "Chứng nhận"} (${cert.certificateNumber || "chưa có số"}) ${health.daysRemaining === 0 ? "hết hạn hôm nay" : `sắp hết hạn sau ${health.daysRemaining} ngày`} (${formatDateVi(cert.expiryDate)}).`,
      )
    } else if (health.status === "MISSING_DATE") {
      missingDateCount += 1
      reasons.push(
        `${cert.name || "Chứng nhận"} chưa có ngày hết hạn hợp lệ.`,
      )
    }
  })

  const needsAttention =
    expiredCount > 0 || expiringSoonCount > 0 || missingDateCount > 0

  let primaryWarning = null
  let severity = "none"
  if (expiredCount > 0) {
    primaryWarning = `${expiredCount} chứng nhận hết hạn`
    severity = "error"
  } else if (expiringSoonCount > 0) {
    primaryWarning = `${expiringSoonCount} chứng nhận sắp hết hạn`
    severity = "warning"
  } else if (missingDateCount > 0) {
    primaryWarning = "Thiếu ngày hết hạn"
    severity = "warning"
  }

  return {
    needsAttention,
    severity,
    missingCerts: false,
    expiredCount,
    expiringSoonCount,
    reasons,
    primaryWarning,
  }
}

export function normalizePhoneNumber(rawPhone) {
  return String(rawPhone ?? "").replace(/[\s.-]/g, "").trim()
}

export function isValidVietnamesePhone(rawPhone) {
  const cleaned = normalizePhoneNumber(rawPhone)
  // Mobile (03/05/07/08/09 + 8 digits) or landline (02 + 8-9 digits), optionally +84 prefix
  return /^(0|\+84)(3|5|7|8|9)\d{8}$/.test(cleaned) || /^(0|\+84)2\d{8,9}$/.test(cleaned)
}

export function validateFacilityForm(
  payload,
  {
    existingFacilities = [],
    editingId = null,
    mode = "create",
    initialCertifications = [],
    referenceDate = new Date(),
  } = {},
) {
  const fieldErrors = {}
  const certErrors = {}

  const code = String(payload?.code ?? "").trim().toUpperCase()
  const name = String(payload?.name ?? "").trim()
  const facilityType = String(payload?.facilityType ?? "").trim()
  const address = String(payload?.address ?? "").trim()
  const contactName = String(payload?.contactName ?? "").trim()
  const contactPhone = normalizePhoneNumber(payload?.contactPhone)
  const contactEmail = String(payload?.contactEmail ?? "").trim()
  const cooperationStatus = String(payload?.cooperationStatus ?? "").trim()

  if (!code) {
    fieldErrors.code = "Vui lòng nhập mã cơ sở."
  } else if (!/^[A-Z0-9-]{3,24}$/.test(code)) {
    fieldErrors.code =
      "Mã cơ sở chỉ gồm chữ in hoa, số và dấu gạch ngang (3–24 ký tự)."
  } else {
    const duplicate = existingFacilities.some(item => {
      if (editingId && String(item.id) === String(editingId)) return false
      return String(item.code || "").trim().toUpperCase() === code
    })
    if (duplicate) {
      fieldErrors.code = "Mã cơ sở này đã tồn tại trong danh sách."
    }
  }

  if (!name) {
    fieldErrors.name = "Vui lòng nhập tên cơ sở nguồn cung."
  } else if (name.length < 3) {
    fieldErrors.name = "Tên cơ sở phải có ít nhất 3 ký tự."
  } else if (name.length > 200) {
    fieldErrors.name = "Tên cơ sở không vượt quá 200 ký tự."
  }

  if (!facilityType) {
    fieldErrors.facilityType = "Vui lòng chọn loại cơ sở."
  }

  if (!cooperationStatus) {
    fieldErrors.cooperationStatus = "Vui lòng chọn trạng thái hợp tác."
  }

  if (!address) {
    fieldErrors.address = "Vui lòng nhập địa chỉ cơ sở."
  } else if (address.length > 300) {
    fieldErrors.address = "Địa chỉ không vượt quá 300 ký tự."
  }

  if (!contactName) {
    fieldErrors.contactName = "Vui lòng nhập họ tên người liên hệ."
  }

  if (!contactPhone) {
    fieldErrors.contactPhone = "Vui lòng nhập số điện thoại liên hệ."
  } else if (!isValidVietnamesePhone(contactPhone)) {
    fieldErrors.contactPhone =
      "Số điện thoại không hợp lệ (ví dụ: 0912345678 hoặc +84912345678)."
  }

  if (
    contactEmail &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)
  ) {
    fieldErrors.contactEmail = "Địa chỉ email liên hệ không đúng định dạng."
  }

  const today = new Date(referenceDate)
  today.setHours(0, 0, 0, 0)

  const certifications = Array.isArray(payload?.certifications)
    ? payload.certifications
    : []

  const initialById = new Map(
    (Array.isArray(initialCertifications) ? initialCertifications : []).map(
      cert => [String(cert.id), cert],
    ),
  )

  certifications.forEach((cert, index) => {
    const rowErr = {}
    const certName = String(cert?.name ?? "").trim()
    const certNumber = String(cert?.certificateNumber ?? "").trim()
    const issuedDate = parseIsoDay(cert?.issuedDate)
    const expiryDate = parseIsoDay(cert?.expiryDate)

    if (!certName) {
      rowErr.name = "Vui lòng nhập hoặc chọn tên chứng nhận."
    }

    if (!certNumber) {
      rowErr.certificateNumber = "Vui lòng nhập số giấy chứng nhận."
    }

    if (cert?.issuedDate && !issuedDate) {
      rowErr.issuedDate = "Ngày cấp không hợp lệ."
    }

    if (!String(cert?.expiryDate ?? "").trim()) {
      rowErr.expiryDate = "Vui lòng chọn ngày hết hạn chứng nhận."
    } else if (!expiryDate) {
      rowErr.expiryDate = "Ngày hết hạn không hợp lệ."
    } else if (issuedDate && expiryDate.getTime() <= issuedDate.getTime()) {
      rowErr.expiryDate = "Ngày hết hạn phải sau ngày cấp."
    } else {
      const previousCert = cert?.id ? initialById.get(String(cert.id)) : null
      const expiryWasEdited =
        mode === "create" ||
        !previousCert ||
        previousCert.expiryDate !== cert.expiryDate

      if (expiryWasEdited && expiryDate.getTime() < today.getTime()) {
        rowErr.expiryDate = "Ngày hết hạn không được nhỏ hơn ngày hôm nay."
      }
    }

    if (Object.keys(rowErr).length > 0) {
      certErrors[index] = rowErr
    }
  })

  const hasErrors =
    Object.keys(fieldErrors).length > 0 || Object.keys(certErrors).length > 0

  return {
    isValid: !hasErrors,
    fieldErrors,
    certErrors,
  }
}

function readStoredFacilities() {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return createInitialMockFacilities()
  }
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const initial = createInitialMockFacilities()
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
      return initial
    }
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed
    }
  } catch {
    // Fallback to fresh mock list
  }
  return createInitialMockFacilities()
}

function writeStoredFacilities(items) {
  if (typeof window === "undefined" || !window.sessionStorage) return
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Ignore storage quota errors in restricted environments
  }
}

function sanitizePayload(input) {
  const certifications = Array.isArray(input.certifications)
    ? input.certifications.map((cert, idx) => ({
        id: cert.id || `cert-${Date.now()}-${idx}`,
        name: String(cert.name ?? "").trim(),
        certificateNumber: String(cert.certificateNumber ?? "").trim(),
        issuer: String(cert.issuer ?? "").trim(),
        issuedDate: String(cert.issuedDate ?? "").trim(),
        expiryDate: String(cert.expiryDate ?? "").trim(),
        note: String(cert.note ?? "").trim(),
      }))
    : []

  const suppliedIngredients = Array.isArray(input.suppliedIngredients)
    ? input.suppliedIngredients
        .map((ing, idx) => ({
          id: ing.id || `ing-${Date.now()}-${idx}`,
          name: String(ing.name ?? "").trim(),
          group: String(ing.group ?? "").trim() || "Nguyên liệu thực phẩm",
          unit: String(ing.unit ?? "").trim() || "kg",
          standard: String(ing.standard ?? "").trim(),
        }))
        .filter(ing => Boolean(ing.name))
    : []

  return {
    code: String(input.code ?? "").trim().toUpperCase(),
    name: String(input.name ?? "").trim(),
    facilityType: String(input.facilityType ?? "FARM").trim(),
    address: String(input.address ?? "").trim(),
    contactName: String(input.contactName ?? "").trim(),
    contactPhone: normalizePhoneNumber(input.contactPhone),
    contactEmail: String(input.contactEmail ?? "").trim(),
    cooperationStatus:
      input.cooperationStatus === "PAUSED" ? "PAUSED" : "ACTIVE",
    operationalNotes: String(input.operationalNotes ?? "").trim(),
    suppliedIngredients,
    certifications,
    updatedAt: getTodayIsoDate(),
    isMock: true,
  }
}

const SourceFacilityService = {
  demoNotice: DEMO_DATA_NOTICE,

  async list() {
    const items = readStoredFacilities()
    return {
      items,
      isMock: true,
      demoNotice: DEMO_DATA_NOTICE,
    }
  },

  async getById(facilityId) {
    const items = readStoredFacilities()
    const target = items.find(
      item =>
        String(item.id) === String(facilityId) ||
        String(item.code).toUpperCase() === String(facilityId).toUpperCase(),
    )
    if (!target) {
      const error = new Error("Không tìm thấy cơ sở nguồn cung.")
      error.response = { status: 404, data: { message: error.message } }
      throw error
    }
    return target
  },

  async create(input) {
    const items = readStoredFacilities()
    const validation = validateFacilityForm(input, {
      existingFacilities: items,
      mode: "create",
    })
    if (!validation.isValid) {
      const error = new Error("Dữ liệu cơ sở nguồn cung chưa hợp lệ.")
      error.validation = validation
      throw error
    }

    const sanitized = sanitizePayload(input)
    const created = {
      id: `sf-${Date.now()}`,
      ...sanitized,
    }
    const next = [created, ...items]
    writeStoredFacilities(next)
    return created
  },

  async update(facilityId, input) {
    const items = readStoredFacilities()
    const index = items.findIndex(item => String(item.id) === String(facilityId))
    if (index === -1) {
      const error = new Error("Không tìm thấy cơ sở nguồn cung cần cập nhật.")
      error.response = { status: 404, data: { message: error.message } }
      throw error
    }

    const existing = items[index]
    const validation = validateFacilityForm(input, {
      existingFacilities: items,
      editingId: existing.id,
      mode: "edit",
      initialCertifications: existing.certifications,
    })
    if (!validation.isValid) {
      const error = new Error("Dữ liệu cập nhật chưa hợp lệ.")
      error.validation = validation
      throw error
    }

    const sanitized = sanitizePayload(input)
    const updated = {
      ...existing,
      ...sanitized,
      id: existing.id,
    }
    const next = [...items]
    next[index] = updated
    writeStoredFacilities(next)
    return updated
  },

  async resetDemoData() {
    const fresh = createInitialMockFacilities()
    writeStoredFacilities(fresh)
    return fresh
  },
}

export default SourceFacilityService
