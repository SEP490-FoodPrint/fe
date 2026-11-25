import http from "src/services/01_axios"
import { USER_URLS } from "./urls"

// Các màn quản lý tài khoản tự báo lỗi nên tắt thông báo mặc định để không hiện trùng.
const silent = { notifyOnError: false }

const UserService = {
  getSchoolAccounts: (schoolId, params) => {
    return http.get(USER_URLS.schoolAccounts(schoolId), { params })
  },
  getSchoolAccountById: (schoolId, userId) => {
    return http.get(USER_URLS.schoolAccountDetail(schoolId, userId))
  },
  createSchoolAccount: (schoolId, body) => {
    return http.post(USER_URLS.schoolAccounts(schoolId), body, silent)
  },
  updateSchoolAccount: (schoolId, userId, body) => {
    return http.put(USER_URLS.schoolAccountDetail(schoolId, userId), body, silent)
  },
  toggleAccountStatus: (schoolId, userId, status) => {
    return http.patch(USER_URLS.schoolAccountStatus(schoolId, userId), { status }, silent)
  },
}

export default UserService
