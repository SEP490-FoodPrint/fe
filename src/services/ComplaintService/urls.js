export const apiComplaints = "/meal-complaints"
export const apiComplaint = id => `/meal-complaints/${encodeURIComponent(id)}`
export const apiMealOptions = `${apiComplaints}/meal-options`
export const apiComplaintAccept = id => `${apiComplaint(id)}/accept`
export const apiComplaintComments = id => `${apiComplaint(id)}/comments`
export const apiComplaintResolve = id => `${apiComplaint(id)}/resolve`
export const apiComplaintSatisfy = id => `${apiComplaint(id)}/satisfy`
export const apiComplaintReopen = id => `${apiComplaint(id)}/reopen`
