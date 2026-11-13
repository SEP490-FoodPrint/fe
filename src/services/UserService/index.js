import api from "../01_axios"
import * as urls from "./urls"

const UserService = {
  /**
   * Lấy danh sách tài khoản thuộc trường học (phân trang page/limit)
   */
  getSchoolAccounts: (schoolId, params) =>
    api.get(urls.apiGetSchoolAccounts(schoolId), { params }),

  /**
   * Tạo tài khoản nhân sự mới cho trường học
   */
  createSchoolAccount: (schoolId, data) =>
    api.post(urls.apiCreateSchoolAccount(schoolId), data),

  /**
   * Cập nhật thông tin tài khoản nhân sự (Họ tên, SĐT, Vai trò)
   */
  updateSchoolAccount: (schoolId, userId, data) =>
    api.put(urls.apiUpdateSchoolAccount(schoolId, userId), data),

  /**
   * Khóa hoặc Mở khóa tài khoản nhân sự
   */
  toggleAccountStatus: (schoolId, userId, status) =>
    api.patch(urls.apiToggleAccountStatus(schoolId, userId), { status }),
}

export default UserService
