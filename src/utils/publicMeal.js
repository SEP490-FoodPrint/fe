import { NO_DATA_TEXT } from "../constants/ui.js";

export function getPublicMealData(response) {
  if (!response || response.error) return null;
  const data = response.data;
  if (data === null) return null;
  return data?.data || data || response || null;
}

// Khối mặc định: khối đầu tiên có thực đơn trong tuần (hasMenu từ API /grades),
// nếu không khối nào có thì lấy khối đầu tiên. Trả "" khi trường chưa có khối.
export function pickDefaultGradeId(grades) {
  const list = Array.isArray(grades) ? grades.filter((g) => g?.id) : [];
  return (list.find((g) => g.hasMenu) || list[0])?.id || "";
}

// Trả về true khi lời gọi API thực đơn công khai thất bại (khác với "không có thực đơn").
export function isPublicMealError(response) {
  return Boolean(response?.error);
}

export function hasDailyMealDishes(dailyMeal) {
  return Boolean(
    dailyMeal?.lunch?.dishes?.length > 0 ||
      dailyMeal?.snack?.dishes?.length > 0 ||
      dailyMeal?.snack?.items?.length > 0,
  );
}

export function getSnackItems(snack) {
  if (snack?.items?.length > 0) return snack.items;

  return (snack?.dishes || []).map(dish => {
    const name = dish.name.toLowerCase();
    const isDrink = name.includes("sữa") || name.includes("nước") || name.includes("chè");

    return {
      id: dish.id,
      name: dish.name,
      desc: dish.portion || NO_DATA_TEXT,
      icon: isDrink ? "coffee" : "cake",
    };
  });
}
