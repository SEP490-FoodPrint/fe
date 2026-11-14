import http from "../01_axios"
import { apiBlockchainDistribution, apiBlockchainDistributionAnchor } from "./urls"

const BlockchainDistributionService = {
  async list(params) {
    const response = await http.get(apiBlockchainDistribution, { params, notifyOnError: false })
    return response.data
  },
  async triggerAnchor(body = {}) {
    const response = await http.post(apiBlockchainDistributionAnchor, body, { notifyOnError: false })
    return response.data
  },
}

export default BlockchainDistributionService
