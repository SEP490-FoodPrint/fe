export const USER_URLS = {
  schoolAccounts: (schoolId) => `/schools/${schoolId}/accounts`,
  schoolAccountDetail: (schoolId, userId) => `/schools/${schoolId}/accounts/${userId}`,
  schoolAccountStatus: (schoolId, userId) => `/schools/${schoolId}/accounts/${userId}/status`,
}
