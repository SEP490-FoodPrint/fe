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

const batchListCache = new Map();
const batchListRequests = new Map();
const BATCH_LIST_CACHE_MS = 20000; // 20s cache danh sách lô chế biến

const statsCache = new Map();
const statsRequests = new Map();
const STATS_CACHE_MS = 20000; // 20s cache thống kê

export const invalidateKitchenBatchCache = () => {
  batchListCache.clear();
  batchListRequests.clear();
  statsCache.clear();
  statsRequests.clear();
};

const KitchenService = {
  async getBatches(filters = {}, { signal, forceRefresh = false } = {}) {
    const params = batchQuery(filters);
    const cacheKey = JSON.stringify(params);

    if (!forceRefresh) {
      const cached = batchListCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < BATCH_LIST_CACHE_MS) {
        return cached.data;
      }
      if (batchListRequests.has(cacheKey)) {
        return batchListRequests.get(cacheKey);
      }
    }

    const requestPromise = (async () => {
      try {
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
        const result = {
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
        batchListCache.set(cacheKey, { data: result, timestamp: Date.now() });
        return result;
      } finally {
        batchListRequests.delete(cacheKey);
      }
    })();

    batchListRequests.set(cacheKey, requestPromise);
    return requestPromise;
  },

  async getStats(filters = {}, { signal, forceRefresh = false } = {}) {
    const params = batchQuery(filters);
    delete params.page;
    delete params.limit;
    const cacheKey = JSON.stringify(params);

    if (!forceRefresh) {
      const cached = statsCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < STATS_CACHE_MS) {
        return cached.data;
      }
      if (statsRequests.has(cacheKey)) {
        return statsRequests.get(cacheKey);
      }
    }

    const requestPromise = (async () => {
      try {
        const response = await http.get(apiCookingBatchStats, {
          params,
          signal,
          notifyOnError: false,
        });
        const result = response?.data || response;
        statsCache.set(cacheKey, { data: result, timestamp: Date.now() });
        return result;
      } finally {
        statsRequests.delete(cacheKey);
      }
    })();

    statsRequests.set(cacheKey, requestPromise);
    return requestPromise;
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
      page += 1;
    } while (items.length < total);
    return { items, total };
  },

  async getBatch(id, { signal } = {}) {
    if (!id) throw new Error("Thiếu mã định danh lô chế biến.");
    const response = await http.get(`${apiCookingBatches}/${id}`, {
      signal,
      notifyOnError: false,
    });
    return response?.data || response;
  },

  async getBatchPlan(params = {}, { signal } = {}) {
    const response = await http.get(`${apiCookingBatches}/plan`, {
      params,
      signal,
      notifyOnError: false,
    });
    return response?.data || response;
  },

  async createBatch(payload) {
    const response = await http.post(apiCookingBatches, payload, {
      notifyOnError: false,
    });
    invalidateKitchenBatchCache();
    return response?.data || response;
  },

  async updateCookingMode(mode) {
    const response = await http.put(
      "/v1/kitchen/cooking-mode",
      { cookingMode: mode },
      { notifyOnError: false },
    );
    invalidateKitchenContextCache();
    invalidateKitchenBatchCache();
    return response?.data || response;
  },

  async updateBatchPortions(id, portions) {
    if (!id) throw new Error("Thiếu mã định danh lô chế biến.");
    const response = await http.put(
      `${apiCookingBatches}/${id}/portions`,
      { plannedPortions: portions },
      { notifyOnError: false },
    );
    invalidateKitchenBatchCache();
    return response?.data || response;
  },

  async confirmBatch(id) {
    if (!id) throw new Error("Thiếu mã định danh lô chế biến.");
    const response = await http.post(
      `${apiCookingBatches}/${id}/confirm`,
      null,
      { notifyOnError: false },
    );
    invalidateKitchenBatchCache();
    return response?.data || response;
  },

  async completeBatch(id, payload = {}) {
    if (!id) throw new Error("Thiếu mã định danh lô chế biến.");
    const response = await http.post(
      `${apiCookingBatches}/${id}/complete`,
      payload,
      { notifyOnError: false },
    );
    invalidateKitchenBatchCache();
    return response?.data || response;
  },

  async deleteBatch(id) {
    if (!id) throw new Error("Thiếu mã định danh lô chế biến.");
    const response = await http.delete(`${apiCookingBatches}/${id}`, {
      notifyOnError: false,
    });
    invalidateKitchenBatchCache();
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
    invalidateKitchenBatchCache();
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
    invalidateKitchenBatchCache();
    return response?.data || response;
  },

  invalidateCache() {
    invalidateKitchenContextCache();
    invalidateKitchenBatchCache();
  },
};

export default KitchenService;
