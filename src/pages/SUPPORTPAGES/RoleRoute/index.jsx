import React, { useContext } from "react"
import { Navigate, Outlet } from "react-router-dom"
import { StoreContext } from "src/contexts"
import { hasPermission } from "src/lib/utils"
import ROUTER from "src/router/ROUTER"
import Forbidden from "../Forbidden"

/**
 * Route Guard kiểm tra phân quyền 2 tầng: Cổng tổ chức (orgType) và Vai trò (roles)
 * @param {Array<string>} allowedRoles - Danh sách các role được phép
 * @param {string} [allowedOrg] - Nhóm tổ chức bắt buộc (SYSTEM | SCHOOL | SUPPLIER)
 */
function RoleRoute({ allowedRoles = [], allowedOrg }) {
  const { loginStore, userStore } = useContext(StoreContext)
  const isLoginContext = loginStore?.isLoginContext
  const user = userStore?.user

  // 1. Kiểm tra trạng thái đăng nhập
  if (!isLoginContext) {
    return <Navigate to={ROUTER.LOGIN} replace />
  }

  // 2. Kiểm tra Cổng tổ chức (Portal Isolation)
  if (allowedOrg && user?.orgType !== allowedOrg) {
    return <Forbidden />
  }

  // 3. Kiểm tra Vai trò nghiệp vụ (Role Isolation)
  const isAllowed = hasPermission(allowedRoles, user?.role)
  if (!isAllowed) {
    return <Forbidden />
  }

  return <Outlet />
}

export default RoleRoute
