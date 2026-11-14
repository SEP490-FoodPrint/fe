export const apiGetSourceFacilities = "/supplier/source-facilities"
export const apiGetSourceFacilityById = id =>
  `/supplier/source-facilities/${encodeURIComponent(String(id ?? "").trim())}`
export const apiCreateSourceFacility = "/supplier/source-facilities"
export const apiUpdateSourceFacility = id =>
  `/supplier/source-facilities/${encodeURIComponent(String(id ?? "").trim())}`
