export const apiSupplyRounds = "/supply-rounds"
export const apiSupplyRoundDishPlan = (roundId, dishId) => `${apiSupplyRounds}/${roundId}/dishes/${dishId}/plan`
export const apiSupplyRoundDishApproval = (roundId, dishId) => `${apiSupplyRounds}/${roundId}/dishes/${dishId}/approve`
