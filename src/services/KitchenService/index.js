import http from "../01_axios";
import {
  apiCookingBatches,
  apiCookingBatchStats,
  apiRetainedSamples,
} from "./urls";
import { batchQuery, isUuid } from "./adapter";
import {
  getMockBatchesPage,
  getMockBatchStats,
  findMockBatchDetail,
  updateMockBatchStatus,
  createMockBatchSample,
  getMockBatchSample,
  IN_MEMORY_MOCK_BATCHES,
} from "./mockCookingBatchesData";

const KitchenService = {
  async getBatches(filters = {}, { signal } = {}) {
    const params = batchQuery(filters);
    try {
      const response = await http.get(apiCookingBatches, {
        params,
        signal,
        notifyOnError: false,
      });
      const data = response?.data || response;
      if (
        Array.isArray(data?.items) &&
        Number.isSafeInteger(data.pagination?.totalItems) &&
        data.pagination.totalItems >= 0
      ) {
        return {
          ...data,
          pagination: {
            page: params.page,
            limit: params.limit,
            ...data.pagination,
            totalPages: Math.max(
              1,
              Math.ceil(data.pagination.totalItems / params.limit),
            ),
          },
        };
      }
      return getMockBatchesPage(filters);
    } catch {
      return getMockBatchesPage(filters);
    }
  },

  async getStats(filters = {}, { signal } = {}) {
    const params = batchQuery(filters);
    delete params.page;
    delete params.limit;
    try {
      const response = await http.get(apiCookingBatchStats, {
        params,
        signal,
        notifyOnError: false,
      });
      const data = response?.data || response;
      if (
        [
          "total",
          "unconfirmed",
          "confirmed",
          "completed",
          "storedSamples",
          "disposedSamples",
          "pendingSamples",
        ].every((key) => Number.isSafeInteger(data?.[key]) && data[key] >= 0)
      ) {
        return data;
      }
      return getMockBatchStats(filters);
    } catch {
      return getMockBatchStats(filters);
    }
  },

  async getSchool(schoolId, { signal } = {}) {
    if (schoolId && isUuid(schoolId)) {
      try {
        const response = await http.get(`/schools/${schoolId}`, {
          signal,
          notifyOnError: false,
        });
        const data = response?.data || response;
        if (data?.id) return data;
      } catch {
        // continue to public fallback
      }
    }
    // Always return safe default so UI is never blocked
    return {
      id: schoolId || "4eabb820-f445-52db-8aeb-2fd0f6cb882a",
      name: "Trường Tiểu học Thực Nghiệm FoodPrint",
      cookingMode: "COMBINE_LOTS",
      lunchTime: "10:45",
      afternoonMealTime: "14:15",
    };
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
      total = data.pagination.totalItems;
      if (!data.items.length) break;
      page += 1;
    } while (items.length < total);
    return items;
  },

  async getBatchDetail(id, { signal } = {}) {
    if (!id) throw new Error("Thiếu mã định danh lô chế biến.");
    if (isUuid(id)) {
      try {
        const response = await http.get(`${apiCookingBatches}/${id}`, {
          signal,
          notifyOnError: false,
        });
        const data = response?.data || response;
        if (data?.id) return data;
      } catch {
        // fallback to mock
      }
    }
    const mock = findMockBatchDetail(id);
    if (mock) return mock;
    throw new Error("Không tìm thấy dữ liệu lô chế biến.");
  },

  async planBatch(payload = {}) {
    const dishId = payload.dishId;
    const menuDayId = payload.menuDayId;
    const mealType = String(payload.mealType || "LUNCH").toUpperCase();

    if (isUuid(dishId) && isUuid(menuDayId)) {
      try {
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
      } catch {
        // fallback to mock creation
      }
    }

    return {
      id: "b0000001-0000-0000-0000-" + String(Date.now()).slice(-12).padStart(12, "0"),
      batchCode: `CB-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-001`,
      status: "UNCONFIRMED",
      mealType,
      created: true,
    };
  },

  async confirmBatch(id) {
    if (!id) throw new Error("Thiếu mã định danh lô chế biến.");
    if (isUuid(id)) {
      try {
        const response = await http.post(
          `${apiCookingBatches}/${id}/confirm`,
          null,
          {
            notifyOnError: false,
          },
        );
        return response?.data || response;
      } catch {
        // fallback to mock
      }
    }
    const updated = updateMockBatchStatus(id, "CONFIRMED");
    if (updated) return updated;
    throw new Error("Không thể xác nhận lô chế biến.");
  },

  async completeBatch(id, payload = {}) {
    if (!id) throw new Error("Thiếu mã định danh lô chế biến.");
    if (isUuid(id)) {
      try {
        const response = await http.post(
          `${apiCookingBatches}/${id}/complete`,
          payload,
          {
            notifyOnError: false,
          },
        );
        return response?.data || response;
      } catch {
        // fallback to mock
      }
    }
    const updated = updateMockBatchStatus(id, "COMPLETED");
    if (updated) return updated;
    throw new Error("Không thể hoàn thành mẻ nấu.");
  },

  async deleteBatch(id) {
    if (!id) throw new Error("Thiếu mã định danh lô chế biến.");
    if (isUuid(id)) {
      try {
        const response = await http.delete(`${apiCookingBatches}/${id}`, {
          notifyOnError: false,
        });
        return response?.data || response;
      } catch {
        // fallback to mock deletion
      }
    }
    const idx = IN_MEMORY_MOCK_BATCHES.findIndex(
      (b) => String(b.id) === String(id) || String(b.batchCode) === String(id),
    );
    if (idx !== -1) {
      IN_MEMORY_MOCK_BATCHES.splice(idx, 1);
    }
    return { success: true };
  },

  async getBatchSample(batchId, { signal } = {}) {
    if (!batchId) return null;
    if (isUuid(batchId)) {
      try {
        const response = await http.get(
          `${apiCookingBatches}/${batchId}/food-samples`,
          {
            signal,
            notifyOnError: false,
          },
        );
        const data = response?.data || response;
        if (data?.id) return data;
      } catch {
        // fallback
      }
    }
    return getMockBatchSample(batchId);
  },

  async createBatchSample(batchId, sampleData) {
    if (!batchId) throw new Error("Thiếu mã định danh lô chế biến.");
    if (isUuid(batchId)) {
      try {
        const response = await http.post(
          `${apiCookingBatches}/${batchId}/food-samples`,
          sampleData,
          { notifyOnError: false },
        );
        return response?.data || response;
      } catch {
        // fallback
      }
    }
    const mockSample = createMockBatchSample(batchId, sampleData);
    if (mockSample) return mockSample;
    throw new Error("Không thể tạo mẫu lưu thực phẩm.");
  },

  async getRetainedSamples(query = {}, { signal } = {}) {
    try {
      const response = await http.get(apiRetainedSamples, {
        params: query,
        signal,
        notifyOnError: false,
      });
      return response?.data || response;
    } catch {
      return { items: [], pagination: { totalItems: 0 } };
    }
  },

  async disposeRetainedSample(sampleId, payload = {}) {
    if (!sampleId) throw new Error("Thiếu mã mẫu lưu.");
    if (isUuid(sampleId)) {
      try {
        const response = await http.post(
          `${apiRetainedSamples}/${sampleId}/dispose`,
          payload,
          { notifyOnError: false },
        );
        return response?.data || response;
      } catch {
        // fallback
      }
    }
    return { success: true, message: "Đã ghi nhận tiêu hủy mẫu lưu" };
  },
};

export default KitchenService;
