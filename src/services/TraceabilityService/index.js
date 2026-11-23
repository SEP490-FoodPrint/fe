import http from "../01_axios";
import { apiGradeMealTraceability } from "./urls";
import { unwrapTraceability } from "./adapter";

export { gradeTracePath } from "./adapter";

const TraceabilityService = {
  /**
   * Truy xuất chung một bữa của cả khối (mọi lớp trong khối): món, nhà cung
   * cấp, đơn giao, mốc phục vụ và chuỗi bằng chứng blockchain.
   * `verify: true` để BE đối soát on-chain.
   */
  async getGradeMealTraceability(params, signal) {
    try {
      const response = await http.get(apiGradeMealTraceability, {
        params,
        signal,
        notifyOnError: false,
        skipAuthRedirect: true,
      });
      return unwrapTraceability(response);
    } catch (error) {
      // 404: khối chưa có bữa ăn được phân bổ vào ngày/bữa đã chọn
      if (error.response?.status === 404) {
        return {
          isNotFound: true,
          message:
            error.response?.data?.message ||
            "Chưa có dữ liệu phục vụ bữa ăn của khối vào ngày đã chọn.",
        };
      }
      throw error;
    }
  },

  verifyGradeMealTraceability(params, signal) {
    return this.getGradeMealTraceability({ ...params, verify: true }, signal);
  },
};

export default TraceabilityService;
