import ROUTER from "src/router/ROUTER"

/**
 * Kiểm tra xem user có quyền truy cập vào màn hình/chức năng hay không
 * @param {Array<string>} allowedRoles - Danh sách các role được phép
 * @param {string} userRole - Role hiện tại của user (chuỗi string đơn lẻ)
 * @returns {boolean}
 */
export const hasPermission = (allowedRoles, userRole) => {
  // Nếu màn hình không giới hạn role -> cho phép truy cập
  if (!allowedRoles || allowedRoles.length === 0) return true

  // Nếu user chưa có role hợp lệ -> từ chối
  if (!userRole || typeof userRole !== "string") return false

  // Kiểm tra role của user có nằm trong danh sách được phép không
  return allowedRoles.includes(userRole)
}

/**
 * Lấy trang điều hướng mặc định sau khi đăng nhập dựa theo orgType của user
 * @param {string} orgType - SYSTEM | SCHOOL | SUPPLIER
 * @returns {string} router path
 */
export const getDefaultRedirectByOrg = orgType => {
  switch (orgType) {
    case "SYSTEM":
      return ROUTER.SYSTEM_ORG_APPROVAL
    case "SUPPLIER":
      return "/supplier/overview"
    case "SCHOOL":
    default:
      return "/school/overview"
  }
}

/**
 * Lấy trang điều hướng mặc định dựa theo Role và Org của user
 * @param {object} user - Object chứa role và orgType
 * @returns {string} router path
 */
export const getDefaultRedirectByUser = user => {
  if (!user) return ROUTER.LOGIN
  if (user.role === "SCHOOL_KITCHEN_STAFF") {
    return ROUTER.SCHOOL_KITCHEN_COOKING
  }
  return getDefaultRedirectByOrg(user.orgType)
}

export const getAuthRedirect = user => {
  if (user?.role === "SYSTEM_ADMIN") return ROUTER.SYSTEM_ORG_APPROVAL
  if (user?.onboardingRequired || user?.status === "UNVERIFIED") return ROUTER.DEFAULT
  return getDefaultRedirectByUser(user)
}

export const needsRegistrationCompletion = user => Boolean(user && ["SCHOOL", "SUPPLIER"].includes(user.orgType) && user.onboardingRequired && (!user.registrationRequest || user.registrationRequest.status === "REJECTED"))

export const getRegistrationDestination = user => user?.role === "SYSTEM_ADMIN" ? ROUTER.SYSTEM_ORG_APPROVAL
  : user?.registrationRequest ? ROUTER.REGISTRATION_STATUS : ROUTER.REGISTRATION_PROFILE
