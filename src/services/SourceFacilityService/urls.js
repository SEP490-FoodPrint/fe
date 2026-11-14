const BASE_URL = "/source-facilities"

export const apiGetSourceFacilities = BASE_URL
export const apiGetSourceFacilityDetail = id => `${BASE_URL}/${id}`
export const apiCreateSourceFacility = BASE_URL
export const apiUpdateSourceFacility = id => `${BASE_URL}/${id}`
export const apiDeactivateSourceFacility = id => `${BASE_URL}/${id}/deactivate`
