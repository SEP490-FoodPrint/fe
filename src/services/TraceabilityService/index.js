import http from "../01_axios";
import { apiMealTraceability } from "./urls";
import { mockTraceabilityService } from "./mockData";

const isMockEnabled = () => {
  return (
    import.meta.env.VITE_USE_MOCKDATA === "true" ||
    import.meta.env.USE_MOCKDATA === "true" ||
    import.meta.env.VITE_USE_MOCK === "true"
  );
};

const TraceabilityService = {
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

      // Bóc tách envelope chuẩn xác: { success: true, data: result }
      if (response && typeof response === "object") {
        if ("data" in response && response.data) {
          return response.data;
        }
        return response;
      }
      return null;
    } catch (error) {
      // Nếu API trả về 404 (chưa có bản ghi phân bổ trong CSDL thật)
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

  // Hỗ trợ nạp dữ liệu mô phỏng chuỗi cung ứng khi DB chưa seed dữ liệu thực tế
  getDemoMockData(params) {
    return mockTraceabilityService.getMealTraceability(params);
  },
};

export default TraceabilityService;
