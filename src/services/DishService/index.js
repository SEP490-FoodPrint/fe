import http from "../01_axios";

export const dishIngredientIds = dish => [...new Set([
  ...(dish?.ingredientIds || []),
  ...(dish?.ingredientStandards || []).map(line=>line.ingredientId),
  ...(dish?.lines || []).map(line=>line.ingredientId),
  ...(dish?.seasonings || []).map(line=>line.ingredientId),
].filter(Boolean))];

export const dishForGrades = (dish, gradeIds = []) => {
  if (!gradeIds.length) return dish;
  const profiles = gradeIds.map((id) => dish.gradeRecipes?.find((profile) => profile.gradeId === id));
  if (profiles.some((profile) => !profile?.lines?.length)) return { ...dish, gradeRecipeIssue: "Chưa có định lượng cho đủ các khối đã chọn." };
  const lines = profiles[0].lines;
  const mains = lines.filter((line) => line.ingredientRole === "MAIN");
  return {
    ...dish, lines,
    ingredientStandards: mains.map((line) => ({ ingredientId: line.ingredientId, quantityPerPortion: line.requiredQuantity, unit: line.unit })),
    ingredientIds: [...new Set(lines.map((line) => line.ingredientId).filter(Boolean))],
    ingredients: mains.map((line) => ({ ...line, id: line.ingredientId, portionQty: line.requiredQuantity })),
    mainIngredient: mains.map((line) => line.name).join(", "),
    supplierName: [...new Set(mains.map((line) => line.supplierName).filter(Boolean))].join(", "),
    seasonings: lines.filter((line) => line.ingredientRole === "SEASONING").map((line) => ({ ...line, id: line.ingredientEntryId, portionQty: line.requiredQuantity })),
  };
};

export const loadDishCatalogData = async () => {
  const items = [];
  let categories = [];
  for (let page = 1; ; page++) {
    const response = await http.get("/dishes/catalog", { params: { page, limit: 100 }, notifyOnError: false });
    const rows = response?.data?.items;
    if (!Array.isArray(rows)) throw new Error("Không tải được danh mục món ăn.");
    if (page === 1) {
      categories = response.data.categories;
      if (!Array.isArray(categories) || categories.some(option => !option.key || !option.label)) {
        throw new Error("API chưa trả danh mục nhóm món ăn. Vui lòng cập nhật Backend.");
      }
    }
    items.push(...rows);
    if (rows.length < 100) return { categories, items: items.map(row => {
      if (!Array.isArray(row.lines)) throw new Error("Dữ liệu công thức món không hợp lệ.");
      const mains = row.lines.filter(l => l.ingredientRole === "MAIN");
      return {
        ...row, dishId: row.id,
        ingredientStandards: mains.map(l => ({ingredientId:l.ingredientId,quantityPerPortion:l.requiredQuantity,unit:l.unit})),
        ingredients: mains.map(l => ({...l,id:l.ingredientId,portionQty:l.requiredQuantity})),
        ingredientIds: [...new Set(row.lines.map(l => l.ingredientId).filter(Boolean))],
        ingredientNames: mains.map(l => l.name),
        mainIngredient: mains.map(l => l.name).join(", "),
        supplierId: mains[0]?.supplierId || "",
        supplierIds: [...new Set(mains.map(l => l.supplierId).filter(Boolean))],
        supplierName: [...new Set(mains.map(l => l.supplierName).filter(Boolean))].join(", "),
        seasonings: row.lines.filter(l => l.ingredientRole === "SEASONING").map(l => ({...l,id:l.ingredientEntryId,portionQty:l.requiredQuantity})),
        unclassifiedLines: row.lines.filter(l => !["MAIN","SEASONING"].includes(l.ingredientRole)),
      };
    }) };
  }
};
export const loadDishCatalog = async () => (await loadDishCatalogData()).items;
export const dishCategoryKey = dish => dish?.category || "UNCLASSIFIED";
export const loadRecipeOptions = async () => {
  const response = await http.get("/dishes/recipe-options", {notifyOnError: false});
  if (!Array.isArray(response?.data?.items)) throw new Error("Không tải được danh mục kho trường.");
  return response.data.items;
};
export const saveDishRecipe = async (id, input) => id
  ? http.put(`/dishes/${id}`, input, {notifyOnError: false})
  : http.post("/dishes", input, {notifyOnError: false});
export const deleteDishRecipe = async id => http.delete(`/dishes/${id}`, {notifyOnError:false});
export const createDishCategory = name => http.post('/dishes/categories', { name }, { notifyOnError: false });
export const updateDishCategory = (id, name) => http.put(`/dishes/categories/${id}`, { name }, { notifyOnError: false });
export const deleteDishCategory = id => http.delete(`/dishes/categories/${id}`, { notifyOnError: false });
export const previewMealRecipe = async (dishIds, gradeIds = []) => {
  if (!dishIds.length) return {dishes: [], seasonings: []};
  const response = await http.post("/dishes/recipe-preview", {dishIds, ...(gradeIds.length ? { gradeIds } : {})}, {notifyOnError: false});
  if (!response?.data) throw new Error("Không tổng hợp được công thức bữa ăn.");
  return response.data;
};
