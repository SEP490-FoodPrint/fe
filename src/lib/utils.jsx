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
      return "/system/overview"
    case "SUPPLIER":
      return "/supplier/overview"
    case "SCHOOL":
    default:
      return "/school/overview"
  }
}
