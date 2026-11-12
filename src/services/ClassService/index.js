import http from "../01_axios"
import {
  apiClassStatus,
  apiCopyClasses,
  apiCreateClass,
  apiGetAcademicYears,
  apiGetClasses,
  apiGetEligibleTeachers,
  apiHomeroomTeacher,
  apiUpdateClass,
} from "./urls"

// Các thao tác quản lý lớp tự hiển thị lỗi trong dialog nên tắt thông báo mặc định.
const silent = { notifyOnError: false }

const getClasses = params => http.get(apiGetClasses, { params })
const getAcademicYears = () => http.get(apiGetAcademicYears)
const getEligibleTeachers = academicYear =>
  http.get(apiGetEligibleTeachers, { params: { academicYear } })
const assignHomeroomTeacher = (classId, teacherUserId) =>
  http.put(apiHomeroomTeacher(classId), { teacherUserId })
const removeHomeroomTeacher = classId => http.delete(apiHomeroomTeacher(classId))
const createClass = payload => http.post(apiCreateClass, payload, silent)
const updateClass = (classId, payload) => http.patch(apiUpdateClass(classId), payload, silent)
const changeClassStatus = (classId, status) =>
  http.patch(apiClassStatus(classId), { status }, silent)
const copyClasses = (fromAcademicYear, toAcademicYear) =>
  http.post(apiCopyClasses, { fromAcademicYear, toAcademicYear }, silent)

const ClassService = {
  getClasses,
  getAcademicYears,
  getEligibleTeachers,
  assignHomeroomTeacher,
  removeHomeroomTeacher,
  createClass,
  updateClass,
  changeClassStatus,
  copyClasses,
}

export default ClassService
