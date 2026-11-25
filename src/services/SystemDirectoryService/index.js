import http from "../01_axios"
import { USE_NEW_FEATURES_MOCK } from "src/lib/config"
import { mockUpdateDirectoryLocation } from "src/services/mockNewFeatures"
const root = kind => kind === "school" ? "/schools" : "/suppliers"
const enc = value => encodeURIComponent(value)
const get = (url, params, signal) => http.get(url, { params, signal, notifyOnError: false })
const SystemDirectoryService = {
  list: (kind, params, signal) => get(root(kind), params, signal),
  summary: (kind, signal) => get(`${root(kind)}/summary`, undefined, signal),
  detail: (kind, id, signal) => get(`${root(kind)}/${enc(id)}`, undefined, signal),
  group: (kind, id, group, page, signal) => get(`${root(kind)}/${enc(id)}/${group}`, { page, limit: 5 }, signal),
  document: (id, documentId, signal) => get(`/supplier-certifications/${enc(id)}/documents/${enc(documentId)}`, undefined, signal),
  updateLocation: (kind, id, locationId) =>
    USE_NEW_FEATURES_MOCK
      ? mockUpdateDirectoryLocation(kind, id, locationId)
      : http.put(`${root(kind)}/${enc(id)}/location`, { locationId }, { notifyOnError: false }),
}
export default SystemDirectoryService
