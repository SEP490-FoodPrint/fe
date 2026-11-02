export const apiGetRegistrationRequests = "/registration-requests"
export const apiSearchRegistrationRequests = "/registration-requests/search"
export const apiGetRegistrationRequest = id => `${apiGetRegistrationRequests}/${encodeURIComponent(id)}`

export const apiGetRegistrationDocument = (id, documentId) => `${apiGetRegistrationRequest(id)}/documents/${encodeURIComponent(documentId)}`

export const apiApproveRegistrationRequest = id => `${apiGetRegistrationRequest(id)}/approve`
export const apiRejectRegistrationRequest = id => `${apiGetRegistrationRequest(id)}/reject`
