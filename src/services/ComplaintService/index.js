import http from "../01_axios"
import {
  buildEvidenceBody,
  evidenceRequestConfig,
} from "src/components/EvidenceFiles/evidenceFiles"
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
  http.get(apiComplaints, { params, signal, notifyOnError: false })

const detail = (id, signal) =>
  http.get(apiComplaint(id), { signal, notifyOnError: false })

const postWithFiles = (url, fields, files) => {
  const body = buildEvidenceBody(fields, files)
  return http.post(
    url,
    body,
    evidenceRequestConfig(body, { notifyOnError: false }),
  )
}

const create = ({ files, ...payload }) =>
  postWithFiles(apiComplaints, payload, files)

const mealOptions = signal =>
  http.get(apiMealOptions, { signal, notifyOnError: false })

const accept = id =>
  http.post(apiComplaintAccept(id), {}, { notifyOnError: false })

const comment = (id, content, files) =>
  postWithFiles(
    apiComplaintComments(id),
    { content: String(content ?? "").trim() },
    files,
  )

const resolve = (id, content, files) =>
  postWithFiles(
    apiComplaintResolve(id),
    { content: String(content ?? "").trim() },
    files,
  )

const satisfy = id =>
  http.post(apiComplaintSatisfy(id), {}, { notifyOnError: false })

const reopen = (id, reason) => {
  const trimmed = String(reason ?? "").trim()
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
