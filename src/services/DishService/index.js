import http from "../01_axios";

export const dishIngredientIds = dish => [...new Set([
  ...(dish?.ingredientIds || []),
  ...(dish?.ingredientStandards || []).map(line=>line.ingredientId),
  ...(dish?.lines || []).map(line=>line.ingredientId),
  ...(dish?.seasonings || []).map(line=>line.ingredientId),
].filter(Boolean))];

export const loadDishCatalog = async () => {
  const items = [];
  for (let page = 1; ; page++) {
    const response = await http.get("/dishes/catalog", { params: { page, limit: 100 }, notifyOnError: false });
    const rows = response?.data?.items;
    if (!Array.isArray(rows)) throw new Error("Không tải được danh mục món ăn.");
    items.push(...rows);
    if (rows.length < 100) return items.map(row => {
      if (!Array.isArray(row.lines)) throw new Error("Dữ liệu công thức món không hợp lệ.");
      const mains = row.lines.filter(l => l.ingredientRole === "MAIN");
      return {
        ...row, dishId: row.id,
        ingredientStandards: mains.map(l => ({ingredientId:l.ingredientId,quantityPerPortion:l.requiredQuantity,unit:l.unit})),
        ingredients: mains.map(l => ({...l,id:l.ingredientId,portionQty:l.requiredQuantity})),
        ingredientIds: mains.map(l => l.ingredientId),
        ingredientNames: mains.map(l => l.name),
        mainIngredient: mains.map(l => l.name).join(", "),
        supplierId: mains[0]?.supplierId || "",
        supplierIds: [...new Set(mains.map(l => l.supplierId).filter(Boolean))],
        supplierName: [...new Set(mains.map(l => l.supplierName).filter(Boolean))].join(", "),
        seasonings: row.lines.filter(l => l.ingredientRole === "SEASONING").map(l => ({...l,id:l.ingredientEntryId,portionQty:l.requiredQuantity})),
        unclassifiedLines: row.lines.filter(l => !["MAIN","SEASONING"].includes(l.ingredientRole)),
      };
    });
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
export const deleteDishRecipe = async id => http.delete(`/dishes/${id}`, {notifyOnError:false});
export const previewMealRecipe = async (dishIds) => {
  if (!dishIds.length) return {dishes: [], seasonings: []};
  const response = await http.post("/dishes/recipe-preview", {dishIds}, {notifyOnError: false});
  if (!response?.data) throw new Error("Không tổng hợp được công thức bữa ăn.");
  return response.data;
};
