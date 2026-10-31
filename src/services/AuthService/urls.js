/**
 * API Endpoints cho phân hệ Xác thực (Auth)
 */
export const apiLogin = "/auth/login"
export const apiGetProfile = "/auth/me"
export const apiSignup = "/auth/signup"
export const apiRefresh = "/auth/refresh"
export const apiLogout = "/auth/logout"
export const apiOnboarding = "/auth/onboarding"

export const apiSendActivationCode = "/auth/email-verification/request"
export const apiVerifyActivationCode = "/auth/email-verification/verify"
export const apiUpdatePersonalProfile = "/auth/me"
export const apiVerifyCurrentPassword = "/auth/change-password/verify"
export const apiChangePassword = "/auth/change-password"
export const apiForgotPassword = "/auth/forgot-password"
export const apiVerifyPasswordResetCode = "/auth/forgot-password/verify"
export const apiResetPassword = "/auth/reset-password"
