import http from "../01_axios"
import { apiIngredients, apiSuppliers } from "./urls"
import { adaptCatalogItem } from "./adapter"
import {
  MOCK_MASTER_INGREDIENT_CATALOG,
  MOCK_SUPPLIERS,
} from "src/pages/SCHOOL/IngredientOrders/mockData"

const IngredientOrderService = {
  /**
   * Lấy Danh mục nguyên liệu chuẩn (Master Ingredient Catalog)
   * Đảm bảo luôn có đầy đủ cả Kho khô (DRY_STOCK) và Tươi sống (DIRECT_USE)
   */
  async getMasterIngredientCatalog() {
    try {
      const response = await http.get(apiIngredients, {
        params: { page: 1, limit: 100 },
        notifyOnError: false,
      })
      const data = response?.data || response
      const apiItems = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []

      if (apiItems.length > 0) {
        const adaptedApi = apiItems.map(adaptCatalogItem)
        const hasDryStock = adaptedApi.some(it => it.handlingType === "DRY_STOCK")

        if (!hasDryStock) {
          // Nếu backend DB chỉ có đồ tươi sống, tự động bổ sung danh mục Đồ khô chuẩn
          const dryItems = MOCK_MASTER_INGREDIENT_CATALOG.filter(it => it.handlingType === "DRY_STOCK").map(adaptCatalogItem)
          return {
            items: [...adaptedApi, ...dryItems],
            total: adaptedApi.length + dryItems.length,
            isMock: false,
          }
        }
        return { items: adaptedApi, total: adaptedApi.length, isMock: false }
      }
    } catch (err) {
      // Backend chưa có data -> Tự động dùng mock chuẩn
    }

    return {
      items: MOCK_MASTER_INGREDIENT_CATALOG.map(adaptCatalogItem),
      total: MOCK_MASTER_INGREDIENT_CATALOG.length,
      isMock: true,
    }
  },

  /**
   * Lấy danh sách Nhà cung cấp liên kết
   */
  async getSuppliers() {
    try {
      const response = await http.get(apiSuppliers, {
        params: { page: 1, limit: 100 },
        notifyOnError: false,
      })
      const data = response?.data || response
      if (Array.isArray(data?.items) && data.items.length > 0) return { items: data.items, isMock: false }
      if (Array.isArray(data) && data.length > 0) return { items: data, isMock: false }
    } catch (err) {
      // Fallback sang mock suppliers
    }
    return { items: MOCK_SUPPLIERS, isMock: true }
  },
}

export default IngredientOrderService
