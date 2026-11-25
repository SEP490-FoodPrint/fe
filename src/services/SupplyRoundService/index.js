import http from "../01_axios"
import { apiSupplyRounds, apiSupplyRoundDishPlan, apiSupplyRoundDishApproval } from "./urls"

const SupplyRoundService = {
  get: params => http.get(apiSupplyRounds, { params, notifyOnError: false }),
  retry: (roundId, dishId) => http.post(apiSupplyRoundDishPlan(roundId, dishId), {}, { notifyOnError: false }),
  approve: (roundId, dishId, planVersion) => http.post(apiSupplyRoundDishApproval(roundId, dishId), { planVersion }, { notifyOnError: false }),
}

export default SupplyRoundService
