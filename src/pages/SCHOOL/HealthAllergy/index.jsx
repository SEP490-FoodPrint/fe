import React, { useState, useMemo, useCallback } from "react"
import {
  getStoredStudentAllergies,
  saveStoredStudentAllergies,
  computeStudentAllergyStats,
  groupAllergiesByClass,
} from "./mockAllergyData"
import AllergyHeader from "./component/AllergyHeader"
import AllergyKPICards from "./component/AllergyKPICards"
import AllergyFilterStrip from "./component/AllergyFilterStrip"
import AllergyStudentListView from "./component/AllergyStudentListView"
import AllergyClassGroupedView from "./component/AllergyClassGroupedView"
import AllergyStudentDetailModal from "./component/AllergyStudentDetailModal"
import AllergyStudentFormModal from "./component/AllergyStudentFormModal"
import AllergyPrintModal from "./component/AllergyPrintModal"
import notice from "src/components/Notice"
import styles from "./index.module.scss"

export default function HealthAllergyPage() {
  const [students, setStudents] = useState(() => getStoredStudentAllergies())

  // Bộ lọc & Tìm kiếm
  const [search, setSearch] = useState("")
  const [selectedGrade, setSelectedGrade] = useState("ALL")
  const [selectedClass, setSelectedClass] = useState("ALL")
  const [selectedCategory, setSelectedCategory] = useState("ALL")
  const [selectedSeverity, setSelectedSeverity] = useState("ALL")
  const [viewMode, setViewMode] = useState("student") // "student" | "class"

  // Modals & Drawers
  const [detailStudent, setDetailStudent] = useState(null)
  const [editStudent, setEditStudent] = useState(null)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)

  // Thống kê nhanh
  const stats = useMemo(() => computeStudentAllergyStats(students), [students])

  // Lọc danh sách học sinh
  const filteredStudents = useMemo(() => {
    let result = [...students]

    if (selectedGrade !== "ALL") {
      result = result.filter((s) => String(s.grade) === String(selectedGrade))
    }

    if (selectedClass !== "ALL") {
      result = result.filter((s) => s.className === selectedClass)
    }

    if (selectedCategory !== "ALL") {
      result = result.filter((s) => s.allergenCategory === selectedCategory)
    }

    if (selectedSeverity !== "ALL") {
      result = result.filter((s) => s.severity === selectedSeverity)
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter((s) => {
        const matchName = s.studentName.toLowerCase().includes(q)
        const matchClass = s.className.toLowerCase().includes(q)
        const matchTeacher = (s.homeroomTeacher || "").toLowerCase().includes(q)
        const matchAllergen = s.allergenName.toLowerCase().includes(q)
        const matchSymptoms = (s.symptoms || "").toLowerCase().includes(q)
        return matchName || matchClass || matchTeacher || matchAllergen || matchSymptoms
      })
    }

    return result
  }, [students, selectedGrade, selectedClass, selectedCategory, selectedSeverity, search])

  // Gom nhóm theo lớp
  const groupedClasses = useMemo(() => {
    return groupAllergiesByClass(filteredStudents)
  }, [filteredStudents])

  // Lưu học sinh (thêm mới hoặc cập nhật)
  const handleSaveStudent = useCallback((savedRecord) => {
    setStudents((prev) => {
      const existsIndex = prev.findIndex((s) => s.id === savedRecord.id)
      let nextList = []
      if (existsIndex >= 0) {
        nextList = [...prev]
        nextList[existsIndex] = savedRecord
      } else {
        nextList = [savedRecord, ...prev]
      }
      saveStoredStudentAllergies(nextList)
      return nextList
    })
  }, [])

  // Xóa học sinh
  const handleDeleteStudent = useCallback((id, name) => {
    if (window.confirm(`Bạn có chắc muốn xóa thông tin dị ứng của em ${name}?`)) {
      setStudents((prev) => {
        const nextList = prev.filter((s) => s.id !== id)
        saveStoredStudentAllergies(nextList)
        return nextList
      })
      notice({ msg: `Đã xóa thông tin dị ứng của em ${name}`, isSuccess: true })
    }
  }, [])

  const handleOpenCreateModal = () => {
    setEditStudent(null)
    setIsFormModalOpen(true)
  }

  const handleOpenEditModal = (studentData) => {
    setEditStudent(studentData)
    setIsFormModalOpen(true)
  }

  const handleResetFilters = () => {
    setSearch("")
    setSelectedGrade("ALL")
    setSelectedClass("ALL")
    setSelectedCategory("ALL")
    setSelectedSeverity("ALL")
  }

  return (
    <div className={styles.healthAllergyPage}>
      <div className={styles.contentWrap}>
        {/* 1. Header & Quick Actions */}
        <AllergyHeader
          onOpenCreateModal={handleOpenCreateModal}
          onOpenPrintModal={() => setIsPrintModalOpen(true)}
        />

        {/* 2. Thẻ KPI chỉ số an toàn y tế */}
        <AllergyKPICards stats={stats} />

        {/* 3. Thanh tìm kiếm, Bộ lọc đa chiều & Chuyển đổi View */}
        <AllergyFilterStrip
          search={search}
          setSearch={setSearch}
          selectedGrade={selectedGrade}
          setSelectedGrade={setSelectedGrade}
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedSeverity={selectedSeverity}
          setSelectedSeverity={setSelectedSeverity}
          viewMode={viewMode}
          setViewMode={setViewMode}
          totalResults={filteredStudents.length}
          onResetFilters={handleResetFilters}
        />

        {/* 4. Nội dung chính: Xem Danh sách từng học sinh hoặc Gom nhóm theo Lớp */}
        <main className={styles.mainDataArea}>
          {viewMode === "student" ? (
            <AllergyStudentListView
              students={filteredStudents}
              onOpenDetail={(stu) => setDetailStudent(stu)}
              onOpenEdit={handleOpenEditModal}
              onDeleteStudent={handleDeleteStudent}
            />
          ) : (
            <AllergyClassGroupedView
              groupedClasses={groupedClasses}
              onOpenDetail={(stu) => setDetailStudent(stu)}
              onOpenEdit={handleOpenEditModal}
            />
          )}
        </main>
      </div>

      {/* Modal xem chi tiết phiếu dị ứng học sinh */}
      <AllergyStudentDetailModal
        isOpen={Boolean(detailStudent)}
        onClose={() => setDetailStudent(null)}
        student={detailStudent}
        onOpenEdit={handleOpenEditModal}
      />

      {/* Modal biểu mẫu thêm mới / chỉnh sửa học sinh */}
      <AllergyStudentFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        initialData={editStudent}
        onSave={handleSaveStudent}
      />

      {/* Modal xem trước bản in khổ A4 gửi Bếp ăn */}
      <AllergyPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        students={filteredStudents}
      />
    </div>
  )
}
