import {
  currentSchool,
  mockRelationships,
  mockSuppliers,
} from "./mockData"

const delay = (value, timeout = 280) =>
  new Promise(resolve => {
    window.setTimeout(() => resolve(structuredClone(value)), timeout)
  })

let relationships = structuredClone(mockRelationships)

const relationshipForSupplier = supplierId =>
  relationships
    .filter(item => item.supplierId === supplierId)
    .sort((left, right) => new Date(right.linkedAt) - new Date(left.linkedAt))[0] || null

const enrichRelationship = relationship => ({
  ...relationship,
  school: currentSchool,
  supplier: mockSuppliers.find(item => item.id === relationship.supplierId),
})

const getSuppliers = async () =>
  delay(
    mockSuppliers.map(supplier => ({
      ...supplier,
      relationship: relationshipForSupplier(supplier.id),
    })),
  )

const getSupplier = async supplierId => {
  const supplier = mockSuppliers.find(item => item.id === supplierId)
  if (!supplier) throw new Error("Không tìm thấy nhà cung cấp.")
  return delay({
    ...supplier,
    relationship: relationshipForSupplier(supplier.id),
  })
}

const getRelationships = async () =>
  delay(relationships.map(enrichRelationship))

const getRelationship = async relationshipId => {
  const relationship = relationships.find(item => item.id === relationshipId)
  if (!relationship) throw new Error("Không tìm thấy liên kết.")
  return delay(enrichRelationship(relationship))
}

const linkSupplier = async supplierId => {
  const current = relationshipForSupplier(supplierId)
  if (current && ["ACTIVE", "SUSPENDED"].includes(current.status)) {
    return delay(enrichRelationship(current), 420)
  }

  const relationship = {
    id: crypto.randomUUID(),
    schoolId: currentSchool.id,
    supplierId,
    status: "ACTIVE",
    linkedAt: new Date().toISOString(),
    unlinkedAt: null,
    linkNote: null,
  }
  relationships = [relationship, ...relationships]
  return delay(enrichRelationship(relationship), 520)
}

const unlinkRelationship = async relationshipId => {
  relationships = relationships.map(item =>
    item.id === relationshipId
      ? { ...item, status: "UNLINKED", unlinkedAt: new Date().toISOString() }
      : item,
  )
  return getRelationship(relationshipId)
}

const resetMockData = () => {
  relationships = structuredClone(mockRelationships)
}

const SupplierRelationshipService = {
  getSuppliers,
  getSupplier,
  getRelationships,
  getRelationship,
  linkSupplier,
  unlinkRelationship,
  resetMockData,
  currentSchool,
}

export default SupplierRelationshipService
