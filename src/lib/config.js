export const USE_MOCK_API =
  import.meta.env.VITE_USE_MOCK === "true" ||
  import.meta.env.VITE_USE_MOCKDATA === "true" ||
  import.meta.env.USE_MOCKDATA === "true";

// Mock cho các tính năng mới (khiếu nại ticket, sự cố ATTP, chế tài, phường/xã, tài khoản ATTP).
// Chỉ bật khi đặt rõ VITE_USE_NEW_FEATURES_MOCK=true, không phụ thuộc cờ mock cũ.
export const USE_NEW_FEATURES_MOCK =
  import.meta.env.VITE_USE_NEW_FEATURES_MOCK === "true";
