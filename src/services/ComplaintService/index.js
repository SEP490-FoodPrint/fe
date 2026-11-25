import http from "../01_axios"
import { USE_NEW_FEATURES_MOCK } from "src/lib/config"
import { mockMealComplaints } from "src/services/mockNewFeatures"
import {
  apiComplaint,
  apiComplaintAccept,
  apiComplaintComments,
  apiComplaintReopen,
  apiComplaintResolve,
  apiComplaints,
  apiComplaintSatisfy,
  apiMealOptions,
} from "./urls"

const list = (params, signal) =>
  USE_NEW_FEATURES_MOCK
    ? mockMealComplaints.list(params)
    : http.get(apiComplaints, { params, signal, notifyOnError: false })

const detail = (id, signal) =>
  USE_NEW_FEATURES_MOCK
    ? mockMealComplaints.detail(id)
    : http.get(apiComplaint(id), { signal, notifyOnError: false })

const create = payload =>
  USE_NEW_FEATURES_MOCK
    ? mockMealComplaints.create(payload)
    : http.post(apiComplaints, payload, { notifyOnError: false })

const mealOptions = signal =>
  USE_NEW_FEATURES_MOCK
    ? mockMealComplaints.mealOptions()
    : http.get(apiMealOptions, { signal, notifyOnError: false })

const accept = id =>
  USE_NEW_FEATURES_MOCK
    ? mockMealComplaints.accept(id)
    : http.post(apiComplaintAccept(id), {}, { notifyOnError: false })

const comment = (id, content) =>
  USE_NEW_FEATURES_MOCK
    ? mockMealComplaints.comment(id, content)
    : http.post(
        apiComplaintComments(id),
        { content: String(content ?? "").trim() },
        { notifyOnError: false },
      )

const resolve = (id, content) =>
  USE_NEW_FEATURES_MOCK
    ? mockMealComplaints.resolve(id, content)
    : http.post(
        apiComplaintResolve(id),
        { content: String(content ?? "").trim() },
        { notifyOnError: false },
      )

const satisfy = id =>
  USE_NEW_FEATURES_MOCK
    ? mockMealComplaints.satisfy(id)
    : http.post(apiComplaintSatisfy(id), {}, { notifyOnError: false })

const reopen = (id, reason) => {
  const trimmed = String(reason ?? "").trim()
  if (USE_NEW_FEATURES_MOCK) return mockMealComplaints.reopen(id, trimmed)
  const payload = trimmed ? { reason: trimmed } : {}
  return http.post(apiComplaintReopen(id), payload, { notifyOnError: false })
}

export default {
  list,
  detail,
  create,
  mealOptions,
  accept,
  comment,
  resolve,
  satisfy,
  reopen,
}
