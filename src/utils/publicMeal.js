import { NO_DATA_TEXT } from "../constants/ui.js";

export function getPublicMealData(response) {
  const data = response?.data;
  return data?.data || data || response || null;
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
