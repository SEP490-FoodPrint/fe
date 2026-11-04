export const apiGetSuppliers = "/suppliers"
export const apiGetSupplierRelationships = "/school-supplier-relationships"

export const supplierUrls = {
  directory: "/supplier-directory",
  partners: "/supplier-partnerships",
  detail: id => `/supplier-directory/${id}`,
  locations: "/supplier-locations",
  filters: "/supplier-directory-filters",
  contracts: "/supplier-contracts",
  contract: id => `/supplier-contracts/${id}`,
  documents: id => `/supplier-contracts/${id}/documents`,
  document: id => `/supplier-contract-documents/${id}`,
  activate: id => `/supplier-contracts/${id}/activate`,
  close: id => `/supplier-contracts/${id}/close`,
  transition: (id, action) => `/supplier-partnerships/${id}/${action}`,
}
