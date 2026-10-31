export const apiGetRegistrationRequests = "/registration-requests"
export const apiSearchRegistrationRequests = "/registration-requests/search"
export const apiGetRegistrationRequest = id => `${apiGetRegistrationRequests}/${encodeURIComponent(id)}`
