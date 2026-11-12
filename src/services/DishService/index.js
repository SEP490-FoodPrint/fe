import http from "../01_axios";

export const loadDishCatalog = async () => {
  const items = [];
  for (let page = 1; ; page++) {
    const response = await http.get("/dishes/catalog", { params: { page, limit: 100 }, notifyOnError: false });
    const rows = response?.data?.items;
    if (!Array.isArray(rows)) throw new Error("Không tải được danh mục món ăn.");
    items.push(...rows);
    if (rows.length < 100) return items.map(row => ({ ...row, dishId: row.id, ingredientStandards: row.lines.filter(l => l.ingredientRole === "MAIN").map(l => ({ingredientId: l.ingredientId, quantityPerPortion: l.requiredQuantity, unit: l.unit})), mainIngredient: row.lines.filter(l => l.ingredientRole === "MAIN").map(l => l.name).join(", "), seasonings: row.lines.filter(l => l.ingredientRole === "SEASONING").map(l => ({...l, id: l.ingredientEntryId, portionQty: l.requiredQuantity})) }));
  }
};
export const loadRecipeOptions = async () => {
  const response = await http.get("/dishes/recipe-options", {notifyOnError: false});
  if (!Array.isArray(response?.data?.items)) throw new Error("Không tải được danh mục kho trường.");
  return response.data.items;
};
export const saveDishRecipe = async (id, input) => id
  ? http.put(`/dishes/${id}`, input, {notifyOnError: false})
  : http.post("/dishes", input, {notifyOnError: false});
export const previewMealRecipe = async (dishIds) => {
  if (!dishIds.length) return {dishes: [], seasonings: []};
  const response = await http.post("/dishes/recipe-preview", {dishIds}, {notifyOnError: false});
  if (!response?.data) throw new Error("Không tổng hợp được công thức bữa ăn.");
  return response.data;
};
