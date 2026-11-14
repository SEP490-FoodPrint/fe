import http from "../01_axios"

// The current API supports pagination only for users and roles, so resolve the
// administrator/officer from the complete paginated lists before acting.
async function allPages(url, signal) {
  const items = []
  let page = 1
  let hasNext = true
  while (hasNext) {
    const response = await http.get(url, { params: { page, limit: 100 }, signal, notifyOnError: false })
    items.push(...response.data.items)
    hasNext = response.data.pagination.hasNext
    page += 1
  }
  return items
}

export async function getDirectoryUsers(signal) {
  const [users, roles] = await Promise.all([allPages("/users", signal), allPages("/auth/roles", signal)])
  const codes = new Map(roles.map(role => [role.id, role.code]))
  return users.map(user => ({ ...user, roleCode: codes.get(user.roleId) }))
}

export async function getOfficerDirectory(signal) {
  const users = await getDirectoryUsers(signal)
  return users.filter(user => user.roleCode === "COMMUNE_FOOD_SAFETY_OFFICER")
}

export async function getLifecycleTarget(kind, id, signal) {
  const users = await getDirectoryUsers(signal)
  const code = kind === "school" ? "SCHOOL_ADMINISTRATION" : kind === "supplier" ? "INGREDIENT_SUPPLIER_ADMIN" : "COMMUNE_FOOD_SAFETY_OFFICER"
  const matches = users.filter(user => user.roleCode === code && (kind === "school" ? user.schoolId === id : kind === "supplier" ? user.supplierId === id : user.id === id))
  if (matches.length !== 1) throw new Error(matches.length ? "Có nhiều tài khoản quản trị phù hợp. Không thể xác định tài khoản cần quản lý." : "Không tìm thấy tài khoản quản trị phù hợp.")
  const response = await http.get(`/users/${encodeURIComponent(matches[0].id)}/lifecycle`, { signal, notifyOnError: false })
  return { user: matches[0], lifecycle: response.data }
}

export const setIntakeState = (id, state) => http.patch(`/users/${encodeURIComponent(id)}/intake-state`, { state }, { notifyOnError: false })
export const deactivateAccount = id => http.post(`/users/${encodeURIComponent(id)}/deactivate`, {}, { notifyOnError: false })
