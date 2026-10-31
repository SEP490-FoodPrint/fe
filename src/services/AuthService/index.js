import http from "../01_axios"
import { apiGetProfile, apiLogin, apiLogout, apiOnboarding, apiSendActivationCode, apiSignup, apiUpdatePersonalProfile, apiVerifyActivationCode } from "./urls"
import { onboardingBody } from "./onboarding"
import STORAGE, { deleteStorage, getStorage, setStorage } from "src/lib/storage"
import { MOCK_ACCOUNTS, ROLES } from "src/constants/roles"
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
    if (USE_MOCK_API) {
      const account = MOCK_ACCOUNTS.find(acc => acc.username.toLowerCase() === identifier.trim().toLowerCase())
      if (!account) throw new Error("Không tìm thấy tài khoản minh họa.")
      return AuthService.mockLoginByRole(account.role)
    }
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
    const response = await http.post(apiOnboarding, onboardingBody(values), { notifyOnError: false })
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
