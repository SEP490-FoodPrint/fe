import http from "../01_axios";
import { apiMeasurementUnits, apiMeasurementUnit } from "./urls";
const service = {
  async list(params = {}, signal) {
    return (
      await http.get(apiMeasurementUnits, {
        params,
        signal,
        notifyOnError: false,
      })
    ).data;
  },
  async all(signal) {
    const items = [];
    let page = 1;
    while (true) {
      const result = await service.list(
        { page, limit: 100, status: "ALL" },
        signal,
      );
      items.push(...result.items);
      if (page >= result.pagination.totalPages) break;
      page++;
    }
    return items;
  },
  async create(payload) {
    return (
      await http.post(apiMeasurementUnits, payload, { notifyOnError: false })
    ).data;
  },
  async update(id, payload) {
    return (
      await http.patch(apiMeasurementUnit(id), payload, {
        notifyOnError: false,
      })
    ).data;
  },
};
export default service;
