import http from "../01_axios"
import {
  apiClassStatus,
  apiCopyClasses,
  apiCreateClass,
  apiGetAcademicYears,
  apiGetClasses,
  apiGetEligibleTeachers,
  apiHomeroomTeacher,
  apiImportClasses,
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

// rows: các dòng đã đọc từ file Excel; dryRun = true chỉ kiểm tra, không lưu.
const importClasses = (academicYear, rows, dryRun) =>
  http.post(apiImportClasses, { academicYear, dryRun, rows }, silent)

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
  importClasses,
}

export default ClassService
