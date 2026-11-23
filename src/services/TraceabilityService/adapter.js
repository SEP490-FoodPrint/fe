import ROUTER from "src/router/ROUTER";

// Bóc tách envelope chuẩn: { success: true, data: result }
export const unwrapTraceability = (response) => {
  if (response && typeof response === "object") {
    if ("data" in response) return response.data ?? null;
    return response;
  }
  return null;
};

/**
 * Đường dẫn trang truy xuất chung theo khối. Có `schoolCode` thì dùng trang
 * công khai của trường; `dishId` chọn sẵn món được bấm.
 */
export function gradeTracePath({
  schoolCode,
  gradeId,
  date,
  mealType,
  dishId,
}) {
  const basePath = schoolCode
    ? ROUTER.SCHOOL_PUBLIC_MEAL_TRACEABILITY.replace(
        ":schoolCode",
        encodeURIComponent(schoolCode),
      )
    : ROUTER.SCHOOL_MEAL_TRACEABILITY;
  // Nhận cả "YYYY-MM-DD..." lẫn "DD/MM/YYYY" (ngày hiển thị của thực đơn).
  const raw = String(date || "");
  const vn = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  const isoDate = vn
    ? `${vn[3]}-${vn[2].padStart(2, "0")}-${vn[1].padStart(2, "0")}`
    : raw.slice(0, 10);
  const query = new URLSearchParams({
    gradeId,
    date: isoDate,
    mealType: mealType || "LUNCH",
  });
  if (dishId) query.set("dishId", dishId);
  return `${basePath}?${query.toString()}`;
}
