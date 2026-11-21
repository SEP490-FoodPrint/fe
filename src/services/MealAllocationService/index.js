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
  async getToday(signal, mealType) {
    if (isMockEnabled()) {
      return mockMealAllocationService.getToday(signal);
    }
    const response = await http.get(apiMealAllocations, {
      signal,
      params: mealType ? { mealType } : {},
      notifyOnError: false,
    });
    return response.data;
  },
  async saveDraft(payload) {
    const response = await http.put(`${apiMealAllocations}/draft`, payload, { notifyOnError: false });
    return response.data;
  },
  async suggestDraft(mealType) {
    const response = await http.post(`${apiMealAllocations}/draft/suggest`, { mealType }, { notifyOnError: false });
    return response.data;
  },
  async retryDraft(mealType) {
    const response = await http.post(`${apiMealAllocations}/draft/retry`, { mealType }, { notifyOnError: false });
    return response.data;
  },
  async apply(payload) {
    if (isMockEnabled()) {
      return mockMealAllocationService.apply(payload);
    }
    const response = await http.put(apiMealAllocations, payload, {
      notifyOnError: false,
    });
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
