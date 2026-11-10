import http from "../01_axios";
import { CanceledError } from "axios";
import STORAGE, { getStorage, getSessionRevision } from "src/lib/storage";
import {
  apiCookingBatches,
  apiCookingBatchStats,
  apiRetainedSamples,
} from "./urls";
import { batchQuery, isUuid } from "./adapter";

const MAX_CACHE_ENTRIES = 100;
const readStore = (ttl) => ({
  ttl,
  cache: new Map(),
  requests: new Map(),
  generation: 0,
});
const batchesStore = readStore(20000);
const statsStore = readStore(20000);
const contextStore = readStore(300000);
let activeScope = null;

function sessionScope() {
  const user = getStorage(STORAGE.USER_INFO);
  const userId = user?.id || user?.userId || user?._id;
  const schoolId = user?.schoolId || user?.school_id || user?.orgId;
  if (!userId || !schoolId) return null;
  return JSON.stringify([
    getSessionRevision(),
    userId,
    schoolId,
    user.role ?? null,
    user.orgType ?? null,
    Array.isArray(user.permissions) ? [...user.permissions].sort() : [],
  ]);
}

function invalidateStore(store) {
  store.generation += 1;
  store.cache.clear();
  for (const entry of store.requests.values()) entry.controller.abort();
  store.requests.clear();
}

export const invalidateKitchenContextCache = () =>
  invalidateStore(contextStore);
export const invalidateKitchenBatchCache = () => {
  invalidateStore(batchesStore);
  invalidateStore(statsStore);
};

function subscribe(entry, signal) {
  if (signal?.aborted) return Promise.reject(new CanceledError());
  entry.subscribers += 1;
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (callback) => {
      if (settled) return;
      settled = true;
      signal?.removeEventListener("abort", onAbort);
      entry.subscribers -= 1;
      callback();
    };
    const onAbort = () => {
      finish(() => reject(new CanceledError()));
      if (entry.subscribers === 0 && !entry.settled) entry.controller.abort();
    };
    signal?.addEventListener("abort", onAbort, { once: true });
    entry.promise.then(
      (value) => {
        try {
          finish(() => resolve(structuredClone(value)));
        } catch (error) {
          reject(error);
        }
      },
      (error) => finish(() => reject(error)),
    );
  });
}

function cachedRead(
  store,
  params,
  read,
  { signal, forceRefresh = false } = {},
) {
  if (signal?.aborted) return Promise.reject(new CanceledError());
  const scope = sessionScope();
  if (activeScope !== scope) {
    invalidateKitchenContextCache();
    invalidateKitchenBatchCache();
    activeScope = scope;
  }
  // Without a known session, do not reuse private responses across cookie sessions.
  if (!scope) return read(signal);
  const key = JSON.stringify([scope, params]);
  const now = Date.now();
  for (const [cacheKey, cached] of store.cache) {
    if (now >= cached.expiresAt) store.cache.delete(cacheKey);
  }
  if (!forceRefresh) {
    const cached = store.cache.get(key);
    if (cached) return Promise.resolve(structuredClone(cached.value));
    const pending = store.requests.get(key);
    if (pending && !pending.controller.signal.aborted)
      return subscribe(pending, signal);
  }
  store.cache.delete(key);
  const generation = store.generation;
  const entry = {
    controller: new AbortController(),
    subscribers: 0,
    settled: false,
    promise: null,
  };
  entry.promise = Promise.resolve()
    .then(() => read(entry.controller.signal))
    .then((value) => {
      if (
        entry.controller.signal.aborted ||
        generation !== store.generation ||
        sessionScope() !== scope ||
        store.requests.get(key) !== entry
      ) {
        throw new CanceledError("Dữ liệu đã thay đổi; cần tải lại.");
      }
      store.cache.delete(key);
      store.cache.set(key, {
        value: structuredClone(value),
        expiresAt: Date.now() + store.ttl,
      });
      while (store.cache.size > MAX_CACHE_ENTRIES)
        store.cache.delete(store.cache.keys().next().value);
      return value;
    })
    .finally(() => {
      entry.settled = true;
      if (store.requests.get(key) === entry) store.requests.delete(key);
    });
  store.requests.set(key, entry);
  return subscribe(entry, signal);
}

const KitchenService = {
  async getBatches(filters = {}, { signal, forceRefresh = false } = {}) {
    const params = batchQuery(filters);
    return cachedRead(
      batchesStore,
      params,
      async (transportSignal) => {
        const response = await http.get(apiCookingBatches, {
          params,
          signal: transportSignal,
          notifyOnError: false,
        });
        const data = response?.data || response;
        if (!Array.isArray(data?.items))
          throw new Error("Phản hồi danh sách lô không hợp lệ.");
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
        return result;
      },
      { signal, forceRefresh },
    );
  },

  async getStats(filters = {}, { signal, forceRefresh = false } = {}) {
    const params = batchQuery(filters);
    delete params.page;
    delete params.limit;
    return cachedRead(
      statsStore,
      params,
      async (transportSignal) => {
        const response = await http.get(apiCookingBatchStats, {
          params,
          signal: transportSignal,
          notifyOnError: false,
        });
        const result = response?.data || response;
        if (!Number.isSafeInteger(result?.total) || result.total < 0)
          throw new Error("Phản hồi thống kê lô không hợp lệ.");
        return result;
      },
      { signal, forceRefresh },
    );
  },

  async getContext({ signal, forceRefresh = false } = {}) {
    return cachedRead(
      contextStore,
      {},
      async (transportSignal) => {
        const response = await http.get("/v1/kitchen/context", {
          signal: transportSignal,
          notifyOnError: false,
        });
        const result = response?.data || response;
        if (!result?.id) throw new Error("Phản hồi cấu hình bếp không hợp lệ.");
        return result;
      },
      { signal, forceRefresh },
    );
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

  async getBatchDetail(id, options = {}) {
    if (!id) throw new Error("Thiếu mã định danh lô chế biến.");
    const batch = await KitchenService.getBatch(id, options);
    if (!batch?.id) throw new Error("Không tìm thấy dữ liệu lô chế biến.");
    return batch;
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
    return KitchenService.planBatch(payload);
  },

  async planBatch(payload = {}) {
    const { dishId, menuDayId } = payload;
    const mealType = String(payload.mealType || "LUNCH").toUpperCase();
    if (
      !isUuid(dishId) ||
      !isUuid(menuDayId) ||
      !["LUNCH", "AFTERNOON"].includes(mealType)
    ) {
      throw new Error("Món ăn, ngày thực đơn hoặc ca ăn không hợp lệ.");
    }
    const response = await http.post(
      apiCookingBatches,
      { dishId, menuDayId, mealType },
      {
        notifyOnError: false,
      },
    );
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
    return response && Object.hasOwn(response, "data")
      ? response.data
      : (response ?? null);
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
      items: Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data)
          ? data
          : [],
      pagination: data?.pagination || { totalItems: 0 },
    };
  },

  async getAllRetainedSamples({ signal } = {}) {
    const items = [];
    let page = 1;
    let totalItems;
    do {
      const result = await KitchenService.getRetainedSamples(
        { page, limit: 100 },
        { signal },
      );
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
