import http from "../01_axios"
import { apiGetProfile, apiLogin, apiLogout, apiOnboarding, apiSendActivationCode, apiSignup, apiUpdatePersonalProfile, apiVerifyActivationCode } from "./urls"
import { onboardingBody } from "./onboarding"
import { apiChangePassword, apiForgotPassword, apiResetPassword, apiVerifyCurrentPassword, apiVerifyPasswordResetCode } from "./urls"
import STORAGE, { deleteStorage, getStorage, setStorage } from "src/lib/storage"
import { ROLES } from "src/constants/roles"
import { USE_MOCK_API } from "src/lib/config"

const normalizeUser = user => {
  if (!user?.id || !user.role || !user.orgType) throw new Error("Thông tin tài khoản không hợp lệ.")
  const roleAliases = { SCHOOL_ADMINISTRATION: ROLES.SCHOOL_ADMIN, INGREDIENT_SUPPLIER_ADMIN: ROLES.INGREDIENT_SUPPLIER }
  return { ...user, roleCode: user.role, role: roleAliases[user.role] || user.role, userId: user.id, orgId: user.schoolId || user.supplierId || user.communeFoodSafetyUnitId || null }
}
const saveSession = (token, user) => {
  setStorage(STORAGE.TOKEN, token)
  setStorage(STORAGE.USER_INFO, user)
  return { token, user }
}
const clearSavedSession = () => {
  deleteStorage(STORAGE.TOKEN)
  deleteStorage(STORAGE.USER_INFO)
}

const AuthService = {
  /**
   * Gọi API đăng nhập thật
   */
  login: async ({ identifier, password }) => {
    const response = await http.post(apiLogin, { identifier: identifier.trim(), password }, {
      skipRefresh: true, skipAuthRedirect: true, notifyOnError: false,
    })
    if (!response?.success) throw new Error(response?.message || "Đăng nhập thất bại.")
    const user = normalizeUser(response.data?.user)
    clearSavedSession()
    return { user }
  },

  signup: async body => {
    const response = await http.post(apiSignup, body, { skipRefresh: true, skipAuthRedirect: true, notifyOnError: false })
    if (!response?.success || !response.data?.user?.id) throw new Error(response?.message || "Không thể tạo tài khoản.")
    return response.data
  },

  sendActivationCode: async email => {
    const response = await http.post(apiSendActivationCode, { email: email.trim().toLowerCase() }, { skipRefresh: true, skipAuthRedirect: true, notifyOnError: false })
    if (!response?.success) throw new Error(response?.message || "Chưa gửi được mã xác nhận. Vui lòng thử lại.")
    return response.data
  },
  verifyActivationCode: async ({ email, code }) => {
    const response = await http.post(apiVerifyActivationCode, { email: email.trim().toLowerCase(), code: code.trim() }, { skipRefresh: true, skipAuthRedirect: true, notifyOnError: false })
    if (!response?.success || response.data?.emailVerified !== true) throw new Error(response?.message || "Mã xác nhận không hợp lệ hoặc đã hết hạn.")
    return response.data
  },
  updatePersonalProfile: async ({ fullName, phone }) => {
    const response = await http.patch(apiUpdatePersonalProfile, { fullName: fullName.trim(), phone: phone.trim() || null }, { notifyOnError: false })
    if (!response?.success) throw new Error(response?.message || "Không thể cập nhật profile.")
    return normalizeUser(response.data)
  },
  verifyCurrentPassword: async currentPassword => {
    const response = await http.post(apiVerifyCurrentPassword, { currentPassword }, { notifyOnError: false })
    if (!response?.success || response.data?.verified !== true) throw new Error(response?.message || "Không thể xác nhận mật khẩu hiện tại.")
  },
  changePassword: async ({ currentPassword, newPassword }) => {
    const response = await http.post(apiChangePassword, { currentPassword, newPassword }, { notifyOnError: false })
    if (!response?.success) throw new Error(response?.message || "Không thể đổi mật khẩu.")
    clearSavedSession()
  },
  requestPasswordReset: async email => {
    const response = await http.post(apiForgotPassword, { email: email.trim().toLowerCase() }, { skipRefresh: true, skipAuthRedirect: true, notifyOnError: false })
    if (!response?.success) throw new Error(response?.message || "Chưa thể gửi mã đặt lại mật khẩu.")
    return response.data
  },
  verifyPasswordResetCode: async ({ email, code }) => {
    const response = await http.post(apiVerifyPasswordResetCode, { email: email.trim().toLowerCase(), code: code.trim() }, { skipRefresh: true, skipAuthRedirect: true, notifyOnError: false })
    const grant = response?.data
    if (!response?.success || !/^[A-Za-z0-9_-]{43}$/.test(grant?.resetToken || "") || !Number.isFinite(grant.expiresIn) || grant.expiresIn <= 0) throw new Error(response?.message || "Không thể xác minh mã đặt lại mật khẩu. Vui lòng lấy mã mới.")
    return grant
  },
  resetPassword: async ({ resetToken, newPassword }) => {
    const response = await http.post(apiResetPassword, { resetToken, newPassword }, { skipRefresh: true, skipAuthRedirect: true, notifyOnError: false })
    if (!response?.success) throw new Error(response?.message || "Không thể đặt lại mật khẩu.")
    clearSavedSession()
  },
  getPersonalProfile: async ({ signal } = {}) => {
    const response = await http.get(apiUpdatePersonalProfile, { signal, notifyOnError: false })
    if (!response?.success) throw new Error(response?.message || "Không thể tải profile.")
    return normalizeUser(response.data)
  },

  getOnboarding: async ({ signal } = {}) => {
    const response = await http.get(apiOnboarding, { signal, notifyOnError: false })
    if (!response?.success) throw new Error(response?.message || "Không thể tải hồ sơ của bạn.")
    return response.data
  },
  submitOnboarding: async values => {
    const body = onboardingBody(values)
    const response = await http.post(apiOnboarding, body, { notifyOnError: false, ...(body instanceof FormData ? { timeout: 120000 } : {}) })
    if (!response?.success || !response.data?.id || response.data.status !== "PENDING") throw new Error(response?.message || "Chưa xác nhận được hồ sơ. Vui lòng kiểm tra lại trạng thái trước khi gửi lại.")
    return response.data
  },

  /**
   * Đăng nhập nhanh bằng mock account (phục vụ test các role)
   */
  mockLoginByRole: roleCode => {
    if (!USE_MOCK_API) throw new Error("Chế độ dữ liệu minh họa đang tắt.")
    const account = MOCK_ACCOUNTS.find(acc => acc.role === roleCode) || MOCK_ACCOUNTS[0]
    const token = `mock_token_${account.role}`

    return saveSession(token, account)
  },

  restoreSession: async ({ signal } = {}) => {
    const token = getStorage(STORAGE.TOKEN)
    if (/^mock_/.test(token)) {
      const user = getStorage(STORAGE.USER_INFO)
      if (USE_MOCK_API && user) return user
      clearSavedSession()
    }
    if (USE_MOCK_API) return null
    clearSavedSession()
    const response = await http.get(apiGetProfile, { signal, skipAuthRedirect: true, notifyOnError: false })
    if (!response?.success) throw new Error(response?.message || "Không thể khôi phục phiên đăng nhập.")
    const user = normalizeUser(response.data)
    return user
  },

  /**
   * Đăng xuất
   */
  logout: async () => {
    try {
      if (!USE_MOCK_API) await http.post(apiLogout, null, { skipRefresh: true, skipAuthRedirect: true, notifyOnError: false })
    } finally { clearSavedSession() }
  },
  clearSavedSession,
}

export default AuthService
