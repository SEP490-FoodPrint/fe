import STORAGE, { clearStorage, setStorage } from "src/lib/storage"
import { MOCK_ACCOUNTS } from "src/constants/roles"

const AuthService = {
  /**
   * Gọi API đăng nhập thật
   */
  login: async body => {
    const found = MOCK_ACCOUNTS.find(
      acc => acc.username.toLowerCase() === body.username?.toLowerCase(),
    )
    if (found) {
      const token = `demo_token_${found.role}`
      setStorage(STORAGE.TOKEN, token)
      setStorage(STORAGE.USER_INFO, found)
      return { isOk: true, Object: { Token: token, User: found } }
    }
    return { isOk: false, message: "Không tìm thấy tài khoản demo" }
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

  quickLoginByRole: async roleCode => {
    return AuthService.mockLoginByRole(roleCode)
  },

  /**
   * Đăng xuất
   */
  logout: () => {
    clearStorage()
  },
}

export default AuthService
