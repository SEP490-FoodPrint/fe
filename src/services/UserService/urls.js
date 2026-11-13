/**
 * API Endpoints cho Quản lý tài khoản (User & School Accounts)
 */
export const apiGetSchoolAccounts = (schoolId) => `/schools/${schoolId}/accounts`
export const apiCreateSchoolAccount = (schoolId) => `/schools/${schoolId}/accounts`
export const apiUpdateSchoolAccount = (schoolId, userId) => `/schools/${schoolId}/accounts/${userId}`
export const apiToggleAccountStatus = (schoolId, userId) => `/schools/${schoolId}/accounts/${userId}/status`
