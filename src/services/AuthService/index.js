import http from "../01_axios"
import { apiLogin, apiLogout, apiRefresh, apiGetProfile } from "./urls"
import STORAGE, { clearStorage, setStorage } from "src/lib/storage"
import { MOCK_ACCOUNTS } from "src/constants/roles"

const AuthService = {
  /**
   * Gọi API đăng nhập thật
   */
  login: async body => {
    try {
      const payload = {
        identifier: body.identifier || body.username,
        password: body.password,
      }
      const res = await http.post(apiLogin, payload)
      if (res?.data?.accessToken) {
        setStorage(STORAGE.TOKEN, res.data.accessToken)
      }
      if (res?.data?.user) {
        setStorage(STORAGE.USER_INFO, res.data.user)
      }
      return res
    } catch (err) {
      // Fallback giả lập nếu backend chưa sẵn sàng hoặc kết nối lỗi
      const inputUsername = (body.username || body.identifier || "").toLowerCase()
      const found = MOCK_ACCOUNTS.find(
        acc => acc.username.toLowerCase() === inputUsername,
      )
      if (found && !import.meta.env.PROD) {
        return {
          isOk: true,
          success: true,
          Object: {
            Token: `mock_jwt_token_${found.role}`,
            User: found,
          },
          data: {
            accessToken: `mock_jwt_token_${found.role}`,
            user: found,
          },
        }
      }
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Tên đăng nhập hoặc mật khẩu không chính xác"
      return { success: false, isOk: false, message }
    }
  },

  /**
   * Làm mới Access Token (Silent Refresh)
   */
  refreshToken: async () => {
    try {
      const res = await http.post(apiRefresh, {})
      if (res?.data?.accessToken) {
        setStorage(STORAGE.TOKEN, res.data.accessToken)
      }
      return res
    } catch (err) {
      return null
    }
  },

  /**
   * Lấy thông tin tài khoản hiện tại từ API /auth/me
   */
  getProfile: async () => {
    try {
      const res = await http.get(apiGetProfile)
      return res
    } catch (err) {
      return null
    }
  },

  /**
   * Đăng nhập nhanh bằng mock account (phục vụ test các role)
   */
  mockLoginByRole: roleCode => {
    const account =
      MOCK_ACCOUNTS.find(acc => acc.role === roleCode) || MOCK_ACCOUNTS[0]
    const token = `mock_token_${account.role}`

    setStorage(STORAGE.TOKEN, token)
    setStorage(STORAGE.USER_INFO, account)

    return {
      token,
      user: account,
    }
  },

  /**
   * Đăng xuất
   */
  logout: async () => {
    try {
      await http.post(apiLogout, {}).catch(() => {})
    } finally {
      clearStorage()
    }
  },
}

export default AuthService
