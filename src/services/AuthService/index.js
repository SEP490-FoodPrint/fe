import http from "../01_axios"
import STORAGE, { clearStorage, setStorage } from "src/lib/storage"
import { apiLogin } from "./urls"

const AuthService = {
  login: async ({ username, password }) => {
    const response = await http.post(apiLogin, {
      identifier: username.trim(),
      password,
    })
    const { accessToken, user } = response?.data || {}
    if (!accessToken || !user?.id) {
      throw new Error("Máy chủ chưa trả về phiên đăng nhập hợp lệ.")
    }
    const account = {
      ...user,
      userId: user.id,
      orgId: user.schoolId || user.supplierId || user.communeFoodSafetyUnitId,
    }
    setStorage(STORAGE.TOKEN, accessToken)
    setStorage(STORAGE.USER_INFO, account)
    return { isOk: true, Object: { Token: accessToken, User: account } }
  },
  logout: () => clearStorage(),
}

export default AuthService
