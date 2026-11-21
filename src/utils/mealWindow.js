// Khung giờ hiển thị Tiến độ chế biến:
// - Từ sáng đến hết giờ phục vụ bữa trưa (BGH cấu hình): hiện Bữa trưa.
// - Sau giờ bữa trưa: hiện Bữa xế.
// Chưa cấu hình giờ bữa trưa thì mặc định Bữa trưa.
const pad = (n) => String(n).padStart(2, "0");

export function mealByTime(mealTimes, now = new Date()) {
  const lunch = String(mealTimes?.lunch || "");
  if (!/^\d{2}:\d{2}$/.test(lunch)) return "lunch";
  const vn = new Date(now.getTime() + 7 * 3600 * 1000);
  const current = `${pad(vn.getUTCHours())}:${pad(vn.getUTCMinutes())}`;
  return current <= lunch ? "lunch" : "afternoon";
}
