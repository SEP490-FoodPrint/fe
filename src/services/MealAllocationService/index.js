import http from "../01_axios";
import { apiMealAllocations } from "./urls";

const MealAllocationService = {
  async getToday(signal) {
    const response = await http.get(apiMealAllocations, { signal, notifyOnError: false });
    return response.data;
  },
  async apply(payload) {
    const response = await http.put(apiMealAllocations, payload, { notifyOnError: false });
    return response.data;
  },
  async confirmDistribution(revision) {
    const response = await http.post(
      `${apiMealAllocations}/confirm-distribution`,
      { revision },
      { notifyOnError: false },
    );
    return response.data;
  },
};

export default MealAllocationService;
