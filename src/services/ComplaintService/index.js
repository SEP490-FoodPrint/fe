import http from "../01_axios"
import { apiComplaint, apiComplaints } from "./urls"
const list = params => http.get(apiComplaints, { params, notifyOnError: false })
const detail = id => http.get(apiComplaint(id), { notifyOnError: false })
const create = payload => http.post(apiComplaints, payload, { notifyOnError: false })
const respond = (id, payload) => http.patch(apiComplaint(id), payload, { notifyOnError: false })
export default { list, detail, create, respond }
