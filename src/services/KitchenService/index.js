import http from "../01_axios"
import {
  apiCookingBatches,
  apiCookingBatchStats,
  apiRetainedSamples,
} from "./urls"
import { apiGetSchoolDetail } from "../SchoolService/urls"
import { batchQuery } from "./adapter"

const KitchenService = {
  async getBatches(filters = {}, { signal } = {}) {
    const params = batchQuery(filters)
    const response = await http.get(apiCookingBatches, {
      params,
      signal,
      notifyOnError: false,
    })
    const data = response?.data || response
    if (
      !Array.isArray(data?.items) ||
      !Number.isSafeInteger(data.pagination?.totalItems) ||
      data.pagination.totalItems < 0
    ) {
      throw new Error("Dữ liệu danh sách lô chế biến không hợp lệ.")
    }
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
    }
  },
  async getStats(filters = {}, { signal } = {}) {
    const params = batchQuery(filters)
    delete params.page
    delete params.limit
    const response = await http.get(apiCookingBatchStats, {
      params,
      signal,
      notifyOnError: false,
    })
    const data = response?.data || response
    if (
      ![
        "total",
        "unconfirmed",
        "confirmed",
        "completed",
        "storedSamples",
        "disposedSamples",
        "pendingSamples",
      ].every((key) => Number.isSafeInteger(data?.[key]) && data[key] >= 0)
    ) {
      throw new Error("Dữ liệu thống kê lô chế biến không hợp lệ.")
    }
    return data
  },
  async getSchool(schoolId, { signal } = {}) {
    const response = await http.get(apiGetSchoolDetail(schoolId), {
      signal,
      notifyOnError: false,
    })
    const data = response?.data || response
    if (!data?.id) throw new Error("Chưa tải được cấu hình trường.")
    return data
  },
  async getAllBatches(filters = {}) {
    const items = []
    let page = 1
    let total = 0
    do {
      const data = await KitchenService.getBatches({
        ...filters,
        page,
        limit: 100,
      })
      items.push(...data.items)
      total = data.pagination.totalItems
      if (!data.items.length) break
      page += 1
    } while (items.length < total)
    return items
  },
  async getBatchDetail(id, { signal } = {}) {
    if (!id) throw new Error("Thiếu mã định danh lô chế biến.")
    const response = await http.get(`${apiCookingBatches}/${id}`, {
      signal,
      notifyOnError: false,
    })
    const data = response?.data || response
    if (!data?.id) throw new Error("Không tìm thấy dữ liệu lô chế biến.")
    return data
  },
  async confirmBatch(id) {
    if (!id) throw new Error("Thiếu mã định danh lô chế biến.")
    const response = await http.post(`${apiCookingBatches}/${id}/confirm`, null, {
      notifyOnError: true,
    })
    return response?.data || response
  },
  async completeBatch(id, payload = {}) {
    if (!id) throw new Error("Thiếu mã định danh lô chế biến.")
    const response = await http.post(`${apiCookingBatches}/${id}/complete`, payload, {
      notifyOnError: true,
    })
    return response?.data || response
  },
  async deleteBatch(id) {
    if (!id) throw new Error("Thiếu mã định danh lô chế biến.")
    const response = await http.delete(`${apiCookingBatches}/${id}`, {
      notifyOnError: true,
    })
    return response?.data || response
  },
  async getBatchSample(batchId, { signal } = {}) {
    if (!batchId) return null
    try {
      const response = await http.get(`${apiCookingBatches}/${batchId}/food-samples`, {
        signal,
        notifyOnError: false,
      })
      return response?.data || response
    } catch {
      return null
    }
  },
  async createBatchSample(batchId, sampleData) {
    if (!batchId) throw new Error("Thiếu mã định danh lô chế biến.")
    const response = await http.post(
      `${apiCookingBatches}/${batchId}/food-samples`,
      sampleData,
      { notifyOnError: true }
    )
    return response?.data || response
  },
  async getRetainedSamples(query = {}, { signal } = {}) {
    const response = await http.get(apiRetainedSamples, {
      params: query,
      signal,
      notifyOnError: false,
    })
    return response?.data || response
  },
  async disposeRetainedSample(sampleId, payload = {}) {
    if (!sampleId) throw new Error("Thiếu mã mẫu lưu.")
    const response = await http.post(
      `${apiRetainedSamples}/${sampleId}/dispose`,
      payload,
      { notifyOnError: true }
    )
    return response?.data || response
  },
}

export default KitchenService
