import http from "../01_axios"

const endpoint = "/school-grades"
const config = { notifyOnError: false }

export default {
  list: signal => http.get(endpoint, { ...config, signal }),
  create: data => http.post(endpoint, data, config),
  update: (id, data) => http.patch(`${endpoint}/${id}`, data, config),
  remove: id => http.delete(`${endpoint}/${id}`, config),
}
