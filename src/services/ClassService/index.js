import http from "../01_axios"
import {
  apiGetAcademicYears,
  apiGetClasses,
  apiGetEligibleTeachers,
  apiHomeroomTeacher,
} from "./urls"

const getClasses = params => http.get(apiGetClasses, { params })
const getAcademicYears = () => http.get(apiGetAcademicYears)
const getEligibleTeachers = academicYear =>
  http.get(apiGetEligibleTeachers, { params: { academicYear } })
const assignHomeroomTeacher = (classId, teacherUserId) =>
  http.put(apiHomeroomTeacher(classId), { teacherUserId })
const removeHomeroomTeacher = classId => http.delete(apiHomeroomTeacher(classId))

const ClassService = {
  getClasses,
  getAcademicYears,
  getEligibleTeachers,
  assignHomeroomTeacher,
  removeHomeroomTeacher,
}

export default ClassService
