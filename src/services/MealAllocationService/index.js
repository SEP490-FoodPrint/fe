import http from "../01_axios";
import { apiMealAllocations } from "./urls";
import { mockMealAllocationService } from "./mockData";

const isMockEnabled = () => {
  return (
    import.meta.env.VITE_USE_MOCKDATA === "true" ||
    import.meta.env.USE_MOCKDATA === "true" ||
    import.meta.env.VITE_USE_MOCK === "true"
  );
};

const MealAllocationService = {
  async getToday(signal) {
    if (isMockEnabled()) {
      return mockMealAllocationService.getToday(signal);
    }
    const response = await http.get(apiMealAllocations, { signal, notifyOnError: false });
    return response.data;
  },
  async apply(payload) {
    if (isMockEnabled()) {
      return mockMealAllocationService.apply(payload);
    }
    const response = await http.put(apiMealAllocations, payload, { notifyOnError: false });
    return response.data;
  },
  async confirmDistribution(revision) {
    if (isMockEnabled()) {
      return mockMealAllocationService.confirmDistribution(revision);
    }
    const response = await http.post(
      `${apiMealAllocations}/confirm-distribution`,
      { revision },
      { notifyOnError: false },
    );
    return response.data;
  },
};

export default MealAllocationService;
