import http from "../01_axios"
import { apiComplaint, apiComplaints } from "./urls"
const list = (params, signal) => http.get(apiComplaints, { params, signal, notifyOnError: false })
const detail = (id, signal) => http.get(apiComplaint(id), { signal, notifyOnError: false })
const create = payload => http.post(apiComplaints, payload, { notifyOnError: false })
const mealOptions = signal => http.get(`${apiComplaints}/meal-options`, { signal, notifyOnError: false })
const respond = (id, payload) => http.patch(apiComplaint(id), payload, { notifyOnError: false })
export default { list, detail, create, mealOptions, respond }
