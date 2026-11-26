import http from "../01_axios";
import {
  apiEmailSetupRequest,
  apiEmailSetupVerify,
  apiGetProfile,
  apiLogin,
  apiLogout,
  apiOnboarding,
  apiSendActivationCode,
  apiSignup,
  apiUpdatePersonalProfile,
  apiVerifyActivationCode,
} from "./urls";
import { onboardingBody } from "./onboarding";
import {
  apiChangePassword,
  apiForgotPassword,
  apiResetPassword,
  apiVerifyCurrentPassword,
  apiVerifyPasswordResetCode,
} from "./urls";
import STORAGE, {
  deleteStorage,
  setStorage,
} from "src/lib/storage";
import { ROLES } from "src/constants/roles";

const normalizeUser = (user) => {
  if (!user?.id || !user.role || !user.orgType)
    throw new Error("Thông tin tài khoản không hợp lệ.");
  const roleAliases = {
    SCHOOL_ADMIN: ROLES.SCHOOL_ADMINISTRATION,
    SCHOOL_ADMINISTRATION: ROLES.SCHOOL_ADMINISTRATION,
    INGREDIENT_SUPPLIER_ADMIN: ROLES.INGREDIENT_SUPPLIER,
  };

  const isDemoSchool =
    user.schoolId === "4eabb820-f445-52db-8aeb-2fd0f6cb882a" ||
    user.username === "fp_demo_kitchen" ||
    user.username === "fp_kitchen" ||
    user.email === "fp_demo_kitchen@example.invalid" ||
    user.email === "kitchen@foodprint.edu.vn" ||
    user.email?.includes("demo_kitchen");

  const cookingMode = isDemoSchool
    ? "SEPARATE_BY_LOT"
    : user.cookingMode || "COMBINE_LOTS";
  // Tên đơn vị lấy từ dữ liệu đăng ký (backend trả organizationName); không gán cứng tên trường
  const schoolName = user.organizationName || user.schoolName || user.orgName || "";

  return {
    ...user,
    email: user.email ?? null,
    emailSetupRequired: Boolean(user.emailSetupRequired),
    permissions: Array.isArray(user.permissions) ? user.permissions : [],
    cookingMode,
    schoolName,
    orgName: schoolName || null,
    roleCode: user.role,
    role: roleAliases[user.role] || user.role,
    userId: user.id,
    orgId:
      user.schoolId || user.supplierId || user.communeFoodSafetyUnitId || null,
  };
};
const clearSavedSession = () => {
  deleteStorage(STORAGE.TOKEN);
  deleteStorage(STORAGE.USER_INFO);
};

const AuthService = {
  /**
   * Gọi API đăng nhập thật
   */
  login: async ({ identifier, password }) => {
    const response = await http.post(
      apiLogin,
      { identifier: identifier.trim(), password },
      {
        skipRefresh: true,
        skipAuthRedirect: true,
        notifyOnError: false,
      },
    );
    if (!response?.success)
      throw new Error(response?.message || "Đăng nhập thất bại.");
    const user = normalizeUser(response.data?.user);
    setStorage(STORAGE.USER_INFO, user);
    return { user };
  },

  signup: async (body) => {
    const response = await http.post(apiSignup, body, {
      skipRefresh: true,
      skipAuthRedirect: true,
      notifyOnError: false,
    });
    if (!response?.success || !response.data?.user?.id)
      throw new Error(response?.message || "Không thể tạo tài khoản.");
    return response.data;
  },

  sendActivationCode: async (email) => {
    const response = await http.post(
      apiSendActivationCode,
      { email: email.trim().toLowerCase() },
      { skipRefresh: true, skipAuthRedirect: true, notifyOnError: false },
    );
    if (!response?.success)
      throw new Error(
        response?.message || "Chưa gửi được mã xác nhận. Vui lòng thử lại.",
      );
    return response.data;
  },
  verifyActivationCode: async ({ email, code }) => {
    const response = await http.post(
      apiVerifyActivationCode,
      { email: email.trim().toLowerCase(), code: code.trim() },
      { skipRefresh: true, skipAuthRedirect: true, notifyOnError: false },
    );
    if (!response?.success || response.data?.emailVerified !== true)
      throw new Error(
        response?.message || "Mã xác nhận không hợp lệ hoặc đã hết hạn.",
      );
    return response.data;
  },
  requestEmailSetup: async (email) => {
    const response = await http.post(
      apiEmailSetupRequest,
      { email: email.trim().toLowerCase() },
      { notifyOnError: false },
    );
    if (!response?.success)
      throw new Error(
        response?.message || "Chưa gửi được mã xác nhận. Vui lòng thử lại.",
      );
    return response.data;
  },
  verifyEmailSetup: async ({ email, code }) => {
    const response = await http.post(
      apiEmailSetupVerify,
      { email: email.trim().toLowerCase(), code: code.trim() },
      { notifyOnError: false },
    );
    if (!response?.success || !response.data?.user)
      throw new Error(
        response?.message || "Mã xác nhận không hợp lệ hoặc đã hết hạn.",
      );
    const user = normalizeUser(response.data.user);
    setStorage(STORAGE.USER_INFO, user);
    return { user, expiresIn: response.data.expiresIn };
  },
  updatePersonalProfile: async ({ fullName, phone }) => {
    const response = await http.patch(
      apiUpdatePersonalProfile,
      { fullName: fullName.trim(), phone: phone.trim() || null },
      { notifyOnError: false },
    );
    if (!response?.success)
      throw new Error(response?.message || "Không thể cập nhật profile.");
    return normalizeUser(response.data);
  },
  verifyCurrentPassword: async (currentPassword) => {
    const response = await http.post(
      apiVerifyCurrentPassword,
      { currentPassword },
      { notifyOnError: false },
    );
    if (!response?.success || response.data?.verified !== true)
      throw new Error(
        response?.message || "Không thể xác nhận mật khẩu hiện tại.",
      );
  },
  changePassword: async ({ currentPassword, newPassword }) => {
    const response = await http.post(
      apiChangePassword,
      { currentPassword, newPassword },
      { notifyOnError: false },
    );
    if (!response?.success)
      throw new Error(response?.message || "Không thể đổi mật khẩu.");
    clearSavedSession();
  },
  requestPasswordReset: async (email) => {
    const response = await http.post(
      apiForgotPassword,
      { email: email.trim().toLowerCase() },
      { skipRefresh: true, skipAuthRedirect: true, notifyOnError: false },
    );
    if (!response?.success)
      throw new Error(response?.message || "Chưa thể gửi mã đặt lại mật khẩu.");
    return response.data;
  },
  verifyPasswordResetCode: async ({ email, code }) => {
    const response = await http.post(
      apiVerifyPasswordResetCode,
      { email: email.trim().toLowerCase(), code: code.trim() },
      { skipRefresh: true, skipAuthRedirect: true, notifyOnError: false },
    );
    const grant = response?.data;
    if (
      !response?.success ||
      !/^[A-Za-z0-9_-]{43}$/.test(grant?.resetToken || "") ||
      !Number.isFinite(grant.expiresIn) ||
      grant.expiresIn <= 0
    )
      throw new Error(
        response?.message ||
          "Không thể xác minh mã đặt lại mật khẩu. Vui lòng lấy mã mới.",
      );
    return grant;
  },
  resetPassword: async ({ resetToken, newPassword }) => {
    const response = await http.post(
      apiResetPassword,
      { resetToken, newPassword },
      { skipRefresh: true, skipAuthRedirect: true, notifyOnError: false },
    );
    if (!response?.success)
      throw new Error(response?.message || "Không thể đặt lại mật khẩu.");
    clearSavedSession();
  },
  getPersonalProfile: async ({ signal } = {}) => {
    const response = await http.get(apiUpdatePersonalProfile, {
      signal,
      notifyOnError: false,
    });
    if (!response?.success)
      throw new Error(response?.message || "Không thể tải profile.");
    return normalizeUser(response.data);
  },

  getOnboarding: async ({ signal } = {}) => {
    const response = await http.get(apiOnboarding, {
      signal,
      notifyOnError: false,
    });
    if (!response?.success)
      throw new Error(response?.message || "Không thể tải hồ sơ của bạn.");
    return response.data;
  },
  submitOnboarding: async (values) => {
    const body = onboardingBody(values);
    const response = await http.post(apiOnboarding, body, {
      notifyOnError: false,
      ...(body instanceof FormData ? { timeout: 120000 } : {}),
    });
    if (
      !response?.success ||
      !response.data?.id ||
      response.data.status !== "PENDING"
    )
      throw new Error(
        response?.message ||
          "Chưa xác nhận được hồ sơ. Vui lòng kiểm tra lại trạng thái trước khi gửi lại.",
      );
    return response.data;
  },

  restoreSession: async ({ signal } = {}) => {
    clearSavedSession();
    const response = await http.get(apiGetProfile, {
      signal,
      skipAuthRedirect: true,
      notifyOnError: false,
    });
    if (!response?.success)
      throw new Error(
        response?.message || "Không thể khôi phục phiên đăng nhập.",
      );
    const user = normalizeUser(response.data);
    setStorage(STORAGE.USER_INFO, user);
    return user;
  },

  /**
   * Đăng xuất
   */
  logout: async () => {
    try {
      await http.post(apiLogout, null, {
        skipRefresh: true,
        skipAuthRedirect: true,
        notifyOnError: false,
      });
    } finally {
      clearSavedSession();
    }
  },
  clearSavedSession,
};

export default AuthService;
