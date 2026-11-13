export const USER_URLS = {
  schoolAccounts: (schoolId) => `/api/schools/${schoolId}/accounts`,
  schoolAccountDetail: (schoolId, userId) => `/api/schools/${schoolId}/accounts/${userId}`,
  schoolAccountStatus: (schoolId, userId) => `/api/schools/${schoolId}/accounts/${userId}/status`,
}
