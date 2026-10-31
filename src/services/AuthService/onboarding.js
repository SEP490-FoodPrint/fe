export const MAX_PROFILE_DOCUMENTS = 20

export function appendDocumentFiles(current, incoming) {
  const keys = new Set(current.map(file => JSON.stringify([file.name, file.size, file.type, file.lastModified])))
  return [...current, ...incoming.filter(file => {
    const key = JSON.stringify([file.name, file.size, file.type, file.lastModified])
    if (keys.has(key)) return false
    keys.add(key)
    return true
  })]
}

export const usedCertification = row => Boolean(row.certificationType.trim() || row.certificateNo.trim() || row.issuedDate || row.expiryDate || row.files?.length || row.existingDocuments?.length)

export function onboardingBody({ requestType, values, certifications = [], documents = [], existingDocuments = [], editing = false, expectedUpdatedAt }) {
  const optional = value => value?.trim() || null
  const rows = certifications.filter(usedCertification)
  const profile = {
    name: values.name.trim(), email: optional(values.email)?.toLowerCase() || null,
    phone: optional(values.phone), address: optional(values.address),
    ...(requestType === "SCHOOL" ? { code: optional(values.code) } : {
      taxCode: optional(values.taxCode),
      certifications: rows.map(row => ({ certificationType: row.certificationType.trim(), certificateNo: row.certificateNo.trim(), issuedDate: row.issuedDate || null, expiryDate: row.expiryDate || null })),
    }),
  }
  if (editing) {
    profile.retainedDocuments = requestType === "SCHOOL" ? existingDocuments.map(document => ({ id: document.id, field: "legalDocument" }))
      : rows.flatMap((row, index) => (row.existingDocuments || []).map(document => ({ id: document.id, field: `certificate_${index}` })))
    if (expectedUpdatedAt) profile.expectedUpdatedAt = expectedUpdatedAt
  }
  const files = requestType === "SCHOOL" ? documents.map(file => ["legalDocument", file]) : rows.flatMap((row, index) => (row.files || []).map(file => [`certificate_${index}`, file]))
  if (files.length + (profile.retainedDocuments?.length || 0) > MAX_PROFILE_DOCUMENTS) throw new Error(`Hồ sơ chỉ nhận tối đa ${MAX_PROFILE_DOCUMENTS} tệp, gồm cả tệp giữ lại.`)
  if (!files.length) return profile
  const body = new FormData()
  body.set("profile", JSON.stringify(profile))
  for (const [field, file] of files) body.append(field, file)
  return body
}
