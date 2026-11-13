import http from "src/services/01_axios"
import { USER_URLS } from "./urls"

const UserService = {
  getSchoolAccounts: (schoolId, params) => {
    return http.get(USER_URLS.schoolAccounts(schoolId), { params })
  },
  getSchoolAccountById: (schoolId, userId) => {
    return http.get(USER_URLS.schoolAccountDetail(schoolId, userId))
  },
  createSchoolAccount: (schoolId, body) => {
    return http.post(USER_URLS.schoolAccounts(schoolId), body)
  },
  updateSchoolAccount: (schoolId, userId, body) => {
    return http.put(USER_URLS.schoolAccountDetail(schoolId, userId), body)
  },
  toggleAccountStatus: (schoolId, userId, status) => {
    return http.patch(USER_URLS.schoolAccountStatus(schoolId, userId), { status })
  },
}

export default UserService
