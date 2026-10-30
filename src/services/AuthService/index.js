import http from "../01_axios"
import STORAGE, { clearStorage, setStorage } from "src/lib/storage"
import { apiLogin } from "./urls"

const roleAliases = {
  SCHOOL_ADMINISTRATION: "SCHOOL_ADMIN",
  INGREDIENT_SUPPLIER_ADMIN: "INGREDIENT_SUPPLIER",
  INGREDIENT_SUPPLIER_STAFF: "INGREDIENT_SUPPLIER",
}

const AuthService = {
  login: async ({ username, password }) => {
    const response = await http.post(apiLogin, { identifier: username.trim(), password })
    const { accessToken, user } = response?.data || {}
    if (!accessToken || !user?.id) throw new Error("Máy chủ chưa trả về phiên đăng nhập hợp lệ.")
    const account = {
      ...user,
      userId: user.id,
      roleCode: user.role,
      role: roleAliases[user.role] || user.role,
      orgId: user.schoolId || user.supplierId || user.communeFoodSafetyUnitId,
    }
    setStorage(STORAGE.TOKEN, accessToken)
    setStorage(STORAGE.USER_INFO, account)
    return { isOk: true, Object: { Token: accessToken, User: account } }
  },
  logout: () => clearStorage(),
}

export default AuthService
