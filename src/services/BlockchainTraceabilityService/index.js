import http from "../01_axios"
import {
  apiBlockchainTraceabilitySearch,
  apiBlockchainTraceabilityTrace,
  apiBlockchainTraceabilityVerify,
} from "./urls"

const BlockchainTraceabilityService = {
  async search(params) {
    const response = await http.get(apiBlockchainTraceabilitySearch, { params, notifyOnError: false })
    return response.data
  },
  async trace(mealAllocationId) {
    const response = await http.get(apiBlockchainTraceabilityTrace(mealAllocationId), { notifyOnError: false })
    return response.data
  },
  async verify(anchorId, body = {}) {
    const response = await http.post(apiBlockchainTraceabilityVerify(anchorId), body, { notifyOnError: false })
    return response.data
  },
}

export default BlockchainTraceabilityService
