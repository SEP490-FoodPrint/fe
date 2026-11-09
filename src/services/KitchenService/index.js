import http from "../01_axios";
import {
  apiCookingBatches,
  apiCookingBatchStats,
  apiRetainedSamples,
} from "./urls";
import { batchQuery, isUuid } from "./adapter";

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

  async getContext({ signal } = {}) {
    const response = await http.get("/v1/kitchen/context", {
      signal,
      notifyOnError: false,
    });
    return response?.data || response;
  },

  async getSchool(schoolId, { signal } = {}) {
    return KitchenService.getContext({ signal });
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
    return response?.data ?? response ?? null;
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

  async disposeRetainedSample(sampleId, payload = {}) {
    if (!sampleId) throw new Error("Thiếu mã mẫu lưu.");
    const response = await http.post(
      `${apiRetainedSamples}/${sampleId}/dispose`,
      payload,
      { notifyOnError: false },
    );
    return response?.data || response;
  },
};

export default KitchenService;
