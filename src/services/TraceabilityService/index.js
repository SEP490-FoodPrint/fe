import http from "../01_axios";
import { apiMealTraceability, apiPublicSchoolClasses } from "./urls";
import { mockTraceabilityService } from "./mockData";

const isMockEnabled = () => {
  return (
    import.meta.env.VITE_USE_MOCKDATA === "true" ||
    import.meta.env.USE_MOCKDATA === "true" ||
    import.meta.env.VITE_USE_MOCK === "true"
  );
};

// Bóc tách envelope chuẩn: { success: true, data: result }
const unwrap = (response) => {
  if (response && typeof response === "object") {
    if ("data" in response) return response.data ?? null;
    return response;
  }
  return null;
};

const TraceabilityService = {
  /**
   * API duy nhất của trang truy xuất: dữ liệu 5 module + chuỗi bằng chứng
   * blockchain (`blockchainProof`). `verify: true` để BE đối soát on-chain.
   */
  async getMealTraceability(params, signal) {
    if (isMockEnabled()) {
      return mockTraceabilityService.getMealTraceability(params, signal);
    }
    try {
      const response = await http.get(apiMealTraceability, {
        params,
        signal,
        notifyOnError: false,
        skipAuthRedirect: true,
      });
      return unwrap(response);
    } catch (error) {
      // 404: chưa có bản ghi phân bổ cho lớp/ngày/bữa đã chọn
      if (error.response?.status === 404) {
        return {
          isNotFound: true,
          message:
            error.response?.data?.message ||
            "Chưa có dữ liệu phân bổ suất ăn cho lớp học và ngày đã chọn trên hệ thống.",
        };
      }
      throw error;
    }
  },

  verifyMealTraceability(params, signal) {
    return this.getMealTraceability({ ...params, verify: true }, signal);
  },

  /** Lớp học công khai của một trường (Guest không cần token). */
  async getPublicSchoolClasses(schoolCode, signal) {
    if (!schoolCode) return [];
    const response = await http.get(apiPublicSchoolClasses(schoolCode), {
      signal,
      notifyOnError: false,
      skipAuthRedirect: true,
    });
    const data = unwrap(response);
    return Array.isArray(data) ? data : [];
  },
};

export default TraceabilityService;
