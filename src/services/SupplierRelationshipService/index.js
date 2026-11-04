import http from "../01_axios"
import { displayName } from "src/lib/displayName"
import { supplierUrls } from "./urls"

const SupplierRelationshipService = {
  listSuppliers: (params, signal) =>
    http.get(supplierUrls.directory, { params, signal }),
  listPartners: (params, signal) =>
    http.get(supplierUrls.partners, { params, signal }),
  getDetail: (supplierId) => http.get(supplierUrls.detail(supplierId)),
  getLocations: (parentId, signal) =>
    http.get(supplierUrls.locations, {
      params: parentId ? { parentId } : {},
      signal,
    }),
  getFilters: () => http.get(supplierUrls.filters),
  saveDraft: (body, id) =>
    id
      ? http.put(supplierUrls.contract(id), body)
      : http.post(supplierUrls.contracts, body),
  upload: (id, kind, file) => {
    const body = new FormData()
    body.append("kind", kind)
    body.append("file", file)
    return http.post(supplierUrls.documents(id), body)
  },
  removeDocument: (id) => http.delete(supplierUrls.document(id)),
  download: async (file) => {
    const blob = await http.get(supplierUrls.document(file.id), {
      responseType: "blob",
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = displayName(file.fileName)
    anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  },
  activate: (id, revision) =>
    http.post(supplierUrls.activate(id), {
      revision,
      verified: true,
    }),
  closeContract: (id, reason) =>
    http.post(supplierUrls.close(id), { reason }),
  changeRelationship: (id, action, reason) =>
    http.post(supplierUrls.transition(id, action), { reason }),
}

export default SupplierRelationshipService
