export const PROOF_KINDS = ["deliveries", "cooking-batches", "retained-samples", "registrations"]

const kindPath = kind => {
  if (!PROOF_KINDS.includes(kind)) throw new Error("Loại bằng chứng không hợp lệ.")
  return `/blockchain-proofs/${kind}`
}

export const apiGetProofVersions = (kind, recordId) => `${kindPath(kind)}/${encodeURIComponent(recordId)}/versions`
export const apiVerifyProofVersion = (kind, versionId) => `${kindPath(kind)}/versions/${encodeURIComponent(versionId)}/verify`
export const apiAnchorProofVersion = (kind, versionId) => `${kindPath(kind)}/versions/${encodeURIComponent(versionId)}/anchor`
