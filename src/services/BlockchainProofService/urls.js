export const PROOF_KINDS = ["deliveries", "delivery-declarations", "cooking-batches", "retained-samples", "registrations", "meal-distributions"]

const kindPath = kind => {
  if (!PROOF_KINDS.includes(kind)) throw new Error("Loại bằng chứng không hợp lệ.")
  return `/blockchain-proofs/${kind}`
}

export const apiGetProofVersions = (kind, recordId) => `${kindPath(kind)}/${encodeURIComponent(recordId)}/versions`
export const apiVerifyProofVersion = (kind, versionId) => `${kindPath(kind)}/versions/${encodeURIComponent(versionId)}/verify`
export const apiAnchorProofVersion = (kind, versionId) => `${kindPath(kind)}/versions/${encodeURIComponent(versionId)}/anchor`

export const apiGetGradeMeals = "/blockchain-proofs/chains/grade-meals"
/** `gradeId` null means the classes of a school not yet in a grade. */
export const apiGetGradeChain = gradeId => `${apiGetGradeMeals}/${encodeURIComponent(gradeId || "none")}`

const publicSchoolPath = schoolCode => `/blockchain-proofs/public/schools/${encodeURIComponent(schoolCode)}/grade-meals`
export const apiGetPublicGradeMeals = schoolCode => publicSchoolPath(schoolCode)
export const apiGetPublicGradeChain = (schoolCode, gradeId) =>
  `${publicSchoolPath(schoolCode)}/${encodeURIComponent(gradeId || "none")}`
