export const complaintTypes = {
  MEAL_QUALITY: "Chất lượng bữa ăn",
  FOOD_HYGIENE: "Vệ sinh thực phẩm",
  HEALTH_ISSUE: "Vấn đề sức khỏe",
  OTHER: "Khác",
};

export const complaintStatuses = {
  SUBMITTED: { label: "Mới gửi", color: "warning" },
  IN_REVIEW: { label: "Đang xử lý", color: "info" },
  RESOLVED: { label: "Đã giải quyết", color: "success" },
  CLOSED: { label: "Đã đóng", color: "default" },
};

export const mealLabels = { LUNCH: "Bữa trưa", AFTERNOON: "Bữa chiều" };

export const formatMealDate = (date) => date.split("-").reverse().join("/");

const dateTime = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Asia/Ho_Chi_Minh",
});

export const formatTimestamp = (timestamp) => dateTime.format(new Date(timestamp));
export const errorMessage = (error, fallback) => error.response?.data?.message || error.message || fallback;
