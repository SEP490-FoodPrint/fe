import http from "../01_axios"
import {
  apiIngredients,
  apiSuppliers,
  apiSupplyOrders,
  apiDeliveries,
} from "./urls"
import { adaptCatalogItem } from "./adapter"
import { MOCK_MASTER_INGREDIENT_CATALOG, MOCK_SUPPLIERS } from "src/pages/SCHOOL/IngredientOrders/mockData"

const IngredientOrderService = {
  /**
   * Lấy Danh mục nguyên liệu chuẩn (Master Ingredient Catalog)
   */
  async getMasterIngredientCatalog(params = {}) {
    try {
      const response = await http.get(apiIngredients, { params })
      const data = response?.data || response
      if (Array.isArray(data?.items)) {
        return { items: data.items.map(adaptCatalogItem), total: data.total, isMock: false }
      }
      if (Array.isArray(data)) {
        return { items: data.map(adaptCatalogItem), total: data.length, isMock: false }
      }
    } catch (err) {
      console.warn("IngredientOrderService.getMasterIngredientCatalog fallback mock:", err.message)
    }

    let items = [...MOCK_MASTER_INGREDIENT_CATALOG]

    if (params.handlingType && params.handlingType !== "all") {
      items = items.filter(it => it.handlingType === params.handlingType)
    }

    if (params.supplierId && params.supplierId !== "all") {
      items = items.filter(it => it.supplierId === params.supplierId)
    }

    if (params.category && params.category !== "all") {
      items = items.filter(it => it.category === params.category)
    }

    if (params.search) {
      const kw = params.search.toLowerCase()
      items = items.filter(
        it =>
          it.name.toLowerCase().includes(kw) ||
          it.category.toLowerCase().includes(kw) ||
          it.supplierName.toLowerCase().includes(kw)
      )
    }

    return {
      items: items.map(adaptCatalogItem),
      total: items.length,
      isMock: true,
    }
  },

  /**
   * Lấy danh sách Nhà cung cấp liên kết
   */
  async getSuppliers() {
    try {
      const response = await http.get(apiSuppliers)
      const data = response?.data || response
      if (Array.isArray(data?.items)) return { items: data.items, isMock: false }
      if (Array.isArray(data)) return { items: data, isMock: false }
    } catch (err) {
      console.warn("IngredientOrderService.getSuppliers fallback mock:", err.message)
    }
    return { items: MOCK_SUPPLIERS, isMock: true }
  },
}

export default IngredientOrderService
