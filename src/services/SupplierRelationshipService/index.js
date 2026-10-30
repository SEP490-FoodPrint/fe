import http from "../01_axios"

const SupplierRelationshipService = {
  listSuppliers: (params, signal) =>
    http.get("/supplier-directory", { params, signal }),
  listPartners: (params, signal) =>
    http.get("/supplier-partnerships", { params, signal }),
  getDetail: (supplierId) => http.get(`/supplier-directory/${supplierId}`),
  getLocations: (parentId, signal) =>
    http.get("/supplier-locations", {
      params: parentId ? { parentId } : {},
      signal,
    }),
  getFilters: () => http.get("/supplier-directory-filters"),
  saveDraft: (body, id) =>
    id
      ? http.put(`/supplier-contracts/${id}`, body)
      : http.post("/supplier-contracts", body),
  upload: (id, kind, file) => {
    const body = new FormData()
    body.append("kind", kind)
    body.append("file", file)
    return http.post(`/supplier-contracts/${id}/documents`, body)
  },
  removeDocument: (id) => http.delete(`/supplier-contract-documents/${id}`),
  download: async (file) => {
    const blob = await http.get(`/supplier-contract-documents/${file.id}`, {
      responseType: "blob",
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = file.fileName
    anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  },
  activate: (id, revision) =>
    http.post(`/supplier-contracts/${id}/activate`, {
      revision,
      verified: true,
    }),
  closeContract: (id, reason) =>
    http.post(`/supplier-contracts/${id}/close`, { reason }),
  changeRelationship: (id, action, reason) =>
    http.post(`/supplier-partnerships/${id}/${action}`, { reason }),
}

export default SupplierRelationshipService
