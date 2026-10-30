import http from "../01_axios"
import { apiGetSupplierRelationships, apiGetSuppliers } from "./urls"

const PAGE_LIMIT = 100

const getCollection = async endpoint => {
  const items = []
  let page = 1
  let hasNext = false

  do {
    const response = await http.get(endpoint, {
      params: { page, limit: PAGE_LIMIT },
    })
    items.push(...(response?.data?.items || []))
    hasNext = Boolean(response?.data?.pagination?.hasNext)
    page += 1
  } while (hasNext)

  return items
}

const currentRelationship = relationships =>
  [...relationships].sort((left, right) => {
    const leftCurrent = ["ACTIVE", "SUSPENDED"].includes(left.status) ? 1 : 0
    const rightCurrent = ["ACTIVE", "SUSPENDED"].includes(right.status) ? 1 : 0
    if (leftCurrent !== rightCurrent) return rightCurrent - leftCurrent
    return new Date(right.linkedAt) - new Date(left.linkedAt)
  })[0] || null

const getSuppliers = async () => {
  const [suppliers, relationships] = await Promise.all([
    getCollection(apiGetSuppliers),
    getCollection(apiGetSupplierRelationships),
  ])

  return suppliers.map(supplier => ({
    ...supplier,
    relationship: currentRelationship(
      relationships.filter(item => item.supplierId === supplier.id),
    ),
  }))
}

const getRelationships = async () => {
  const [relationships, suppliers] = await Promise.all([
    getCollection(apiGetSupplierRelationships),
    getCollection(apiGetSuppliers),
  ])
  const suppliersById = new Map(suppliers.map(supplier => [supplier.id, supplier]))

  return relationships.map(relationship => ({
    ...relationship,
    supplier: suppliersById.get(relationship.supplierId) || null,
  }))
}

const SupplierRelationshipService = { getSuppliers, getRelationships }

export default SupplierRelationshipService
