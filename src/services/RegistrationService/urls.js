// Proposed integration endpoints; confirm these contracts when connecting the backend.
export const apiGetRegistrationRequests = "/system/registration-requests"
export const apiGetRegistrationRequest = id => `${apiGetRegistrationRequests}/${encodeURIComponent(id)}`
export const apiReviewRegistrationRequest = id => `${apiGetRegistrationRequest(id)}/review`
