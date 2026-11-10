import http from "../01_axios"
import { apiAcademicYearDetail, apiAcademicYears } from "./urls"

const list = () => http.get(apiAcademicYears, { notifyOnError: false })
const get = id => http.get(apiAcademicYearDetail(id), { notifyOnError: false })
const create = payload => http.post(apiAcademicYears, payload, { notifyOnError: false })
const update = (id, payload) => http.patch(apiAcademicYearDetail(id), payload, { notifyOnError: false })

export default { list, get, create, update }
