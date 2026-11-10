import http from "../01_axios";
import {
  apiCookingBatches,
  apiCookingBatchStats,
  apiRetainedSamples,
} from "./urls";
import { batchQuery, isUuid } from "./adapter";

let kitchenContextCache = null;
let kitchenContextCacheTime = 0;
const KITCHEN_CONTEXT_CACHE_MS = 300000; // 5 phút cache cấu hình bếp trường học

export const invalidateKitchenContextCache = () => {
  kitchenContextCache = null;
  kitchenContextCacheTime = 0;
};

const KitchenService = {
  async getBatches(filters = {}, { signal } = {}) {
    const params = batchQuery(filters);
    const response = await http.get(apiCookingBatches, {
      params,
      signal,
      notifyOnError: false,
    });
    const data = response?.data || response;
    const items = Array.isArray(data?.items) ? data.items : [];
    const pagination = data?.pagination || {
      page: params.page || 1,
      limit: params.limit || 10,
      totalItems: items.length,
    };
    return {
      items,
      pagination: {
        page: params.page || 1,
        limit: params.limit || 10,
        ...pagination,
        totalPages: Math.max(
          1,
          Math.ceil((pagination.totalItems || 0) / (params.limit || 10)),
        ),
      },
    };
  },

  async getStats(filters = {}, { signal } = {}) {
    const params = batchQuery(filters);
    delete params.page;
    delete params.limit;
    const response = await http.get(apiCookingBatchStats, {
      params,
      signal,
      notifyOnError: false,
    });
    return response?.data || response;
  },

  async getContext({ signal, forceRefresh = false } = {}) {
    if (!forceRefresh && kitchenContextCache && (Date.now() - kitchenContextCacheTime < KITCHEN_CONTEXT_CACHE_MS)) {
      return kitchenContextCache;
    }
    const response = await http.get("/v1/kitchen/context", {
      signal,
      notifyOnError: false,
    });
    const result = response?.data || response;
    kitchenContextCache = result;
    kitchenContextCacheTime = Date.now();
    return result;
  },

  async getSchool(schoolId, { signal, forceRefresh = false } = {}) {
    return KitchenService.getContext({ signal, forceRefresh });
  },

  async getAllBatches(filters = {}) {
    const items = [];
    let page = 1;
    let total = 0;
    do {
      const data = await KitchenService.getBatches({
        ...filters,
        page,
        limit: 100,
      });
      items.push(...data.items);
      total = data.pagination?.totalItems || 0;
      if (!data.items.length) break;
      page += 1;
    } while (items.length < total);
    return items;
  },

  async getBatchDetail(id, { signal } = {}) {
    if (!id) throw new Error("Thiếu mã định danh lô chế biến.");
    const response = await http.get(`${apiCookingBatches}/${id}`, {
      signal,
      notifyOnError: false,
    });
    const data = response?.data || response;
    if (data?.id) return data;
    throw new Error("Không tìm thấy dữ liệu lô chế biến.");
  },

  async planBatch(payload = {}) {
    const dishId = payload.dishId;
    const menuDayId = payload.menuDayId;
    const mealType = String(payload.mealType || "LUNCH").toUpperCase();

    if (!dishId || !menuDayId) {
      throw new Error("Thiếu thông tin món ăn hoặc ngày thực đơn để lập phương án chế biến.");
    }

    const response = await http.post(
      apiCookingBatches,
      {
        dishId,
        menuDayId,
        mealType: mealType === "AFTERNOON" ? "AFTERNOON" : "LUNCH",
      },
      { notifyOnError: false },
    );
    return response?.data || response;
  },

  async confirmBatch(id) {
    if (!id) throw new Error("Thiếu mã định danh lô chế biến.");
    const response = await http.post(
      `${apiCookingBatches}/${id}/confirm`,
      null,
      { notifyOnError: false },
    );
    return response?.data || response;
  },

  async completeBatch(id, payload = {}) {
    if (!id) throw new Error("Thiếu mã định danh lô chế biến.");
    const response = await http.post(
      `${apiCookingBatches}/${id}/complete`,
      payload,
      { notifyOnError: false },
    );
    return response?.data || response;
  },

  async deleteBatch(id) {
    if (!id) throw new Error("Thiếu mã định danh lô chế biến.");
    const response = await http.delete(`${apiCookingBatches}/${id}`, {
      notifyOnError: false,
    });
    return response?.data || response;
  },

  async getBatchSample(batchId, { signal } = {}) {
    if (!batchId) return null;
    const response = await http.get(
      `${apiCookingBatches}/${batchId}/food-samples`,
      {
        signal,
        notifyOnError: false,
      },
    );
    return response && Object.hasOwn(response, "data") ? response.data : response ?? null;
  },

  async createBatchSample(batchId, sampleData) {
    if (!batchId) throw new Error("Thiếu mã định danh lô chế biến.");
    const response = await http.post(
      `${apiCookingBatches}/${batchId}/food-samples`,
      sampleData,
      { notifyOnError: false },
    );
    return response?.data || response;
  },

  async getRetainedSamples(query = {}, { signal } = {}) {
    const response = await http.get(apiRetainedSamples, {
      params: query,
      signal,
      notifyOnError: false,
    });
    const data = response?.data || response;
    return {
      items: Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [],
      pagination: data?.pagination || { totalItems: 0 },
    };
  },

  async getAllRetainedSamples({ signal } = {}) {
    const items = [];
    let page = 1;
    let totalItems;
    do {
      const result = await KitchenService.getRetainedSamples({ page, limit: 100 }, { signal });
      items.push(...result.items);
      totalItems = result.pagination.totalItems;
      if (!result.items.length) break;
      page += 1;
    } while (Number.isSafeInteger(totalItems) && items.length < totalItems);
    return { items };
  },

  async disposeRetainedSample(sampleId, payload = {}) {
    if (!sampleId) throw new Error("Thiếu mã mẫu lưu.");
    const response = await http.post(
      `${apiRetainedSamples}/${sampleId}/dispose`,
      payload,
      { notifyOnError: false },
    );
    return response?.data || response;
  },

  invalidateCache() {
    invalidateKitchenContextCache();
  },
};

export default KitchenService;
