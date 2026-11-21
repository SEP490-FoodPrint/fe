// Cuối tuần (thứ Bảy, Chủ nhật theo giờ Việt Nam) không có bữa bán trú: khóa các thao tác bếp trong ngày.
export const WEEKEND_LOCK_MESSAGE =
  "Hôm nay là cuối tuần, không có bữa bán trú. Các thao tác nấu, lưu mẫu và phân bổ suất tạm khóa."

export const isVietnamWeekend = (now = Date.now()) => {
  const day = new Date(now + 7 * 3600 * 1000).getUTCDay()
  return day === 0 || day === 6
}
