export const apiGetClasses = "/classes"
export const apiGetAcademicYears = "/classes/academic-years"
export const apiGetEligibleTeachers = "/classes/eligible-teachers"
export const apiHomeroomTeacher = classId => `/classes/${classId}/homeroom-teacher`
export const apiCreateClass = "/classes"
export const apiCopyClasses = "/classes/copy"
export const apiUpdateClass = classId => `/classes/${classId}`
export const apiClassStatus = classId => `/classes/${classId}/status`
