import http from "../01_axios"
import STORAGE, { clearStorage, setStorage } from "src/lib/storage"
import { MOCK_ACCOUNTS } from "src/constants/roles"

const AuthService = {
  /**
   * Gọi API đăng nhập thật
   */
  login: async body => {
    try {
      const res = await http.post("/auth/login", body)
      return res
    } catch {
      // Fallback giả lập nếu backend chưa sẵn sàng
      const found = MOCK_ACCOUNTS.find(
        acc => acc.username.toLowerCase() === body.username?.toLowerCase(),
      )
      if (found) {
        return {
          isOk: true,
          Object: {
            Token: `mock_jwt_token_${found.role}`,
            User: found,
          },
        }
      }
      return { isOk: false, message: "Sai tài khoản hoặc mật khẩu" }
    }
  },

  /**
   * Đăng nhập nhanh bằng mock account (phục vụ test các role)
   */
  mockLoginByRole: roleCode => {
    const account = MOCK_ACCOUNTS.find(acc => acc.role === roleCode) || MOCK_ACCOUNTS[0]
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
  logout: () => {
    clearStorage()
  },
}

export default AuthService
