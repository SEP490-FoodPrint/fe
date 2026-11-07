import React, { useState, useMemo, useCallback } from "react"
import {
  getStoredAllergies,
  saveStoredAllergies,
  computeAllergyStatistics,
  CURRENT_WEEK_MENU_ALLERGY_CHECK,
} from "./mockAllergyData"
import AllergyHeader from "./component/AllergyHeader"
import AllergyKPICards from "./component/AllergyKPICards"
import AllergyAlertBanner from "./component/AllergyAlertBanner"
import AllergyFilterStrip from "./component/AllergyFilterStrip"
import AllergyClassCardView from "./component/AllergyClassCardView"
import AllergyTableView from "./component/AllergyTableView"
import AllergyDetailDrawer from "./component/AllergyDetailDrawer"
import AllergyFormModal from "./component/AllergyFormModal"
import AllergyPrintModal from "./component/AllergyPrintModal"
import styles from "./index.module.scss"

export default function HealthAllergyPage() {
  const [classes, setClasses] = useState(() => getStoredAllergies())

  // Bộ lọc & Tìm kiếm
  const [search, setSearch] = useState("")
  const [selectedGrade, setSelectedGrade] = useState("ALL")
  const [selectedAllergen, setSelectedAllergen] = useState("ALL")
  const [selectedSeverity, setSelectedSeverity] = useState("ALL")
  const [viewMode, setViewMode] = useState("card") // "card" | "table"

  // Drawer chi tiết & Modal biểu mẫu
  const [detailClass, setDetailClass] = useState(null)
  const [editClass, setEditClass] = useState(null)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)

  // Tính toán thống kê KPI
  const stats = useMemo(() => computeAllergyStatistics(classes), [classes])

  // Lọc danh sách lớp học
  const filteredClasses = useMemo(() => {
    let result = [...classes]

    if (selectedGrade !== "ALL") {
      result = result.filter((c) => String(c.grade) === String(selectedGrade))
    }

    if (selectedAllergen !== "ALL") {
      result = result.filter((c) =>
        c.allergies.some((a) => a.allergenId === selectedAllergen)
      )
    }

    if (selectedSeverity !== "ALL") {
      result = result.filter((c) =>
        c.allergies.some((a) => a.severity === selectedSeverity)
      )
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter((c) => {
        const matchClass = c.className.toLowerCase().includes(q)
        const matchTeacher = (c.homeroomTeacher || "").toLowerCase().includes(q)
        const matchAllergy = c.allergies.some(
          (a) =>
            a.allergenName.toLowerCase().includes(q) ||
            a.symptoms.toLowerCase().includes(q) ||
            a.ingredients.some((ing) => ing.toLowerCase().includes(q))
        )
        return matchClass || matchTeacher || matchAllergy
      })
    }

    return result
  }, [classes, selectedGrade, selectedAllergen, selectedSeverity, search])

  // Lưu bản ghi lớp học (thêm mới hoặc cập nhật)
  const handleSaveClass = useCallback((updatedRecord) => {
    setClasses((prev) => {
      const existsIndex = prev.findIndex((c) => c.id === updatedRecord.id)
      let nextList = []
      if (existsIndex >= 0) {
        nextList = [...prev]
        nextList[existsIndex] = updatedRecord
      } else {
        nextList = [updatedRecord, ...prev]
      }
      saveStoredAllergies(nextList)
      return nextList
    })
  }, [])

  const handleOpenCreateModal = () => {
    setEditClass(null)
    setIsFormModalOpen(true)
  }

  const handleOpenEditModal = (classData) => {
    setEditClass(classData)
    setIsFormModalOpen(true)
  }

  const handleResetFilters = () => {
    setSearch("")
    setSelectedGrade("ALL")
    setSelectedAllergen("ALL")
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

        {/* 3. Banner đối soát thời gian thực với Thực đơn tuần đang chạy */}
        <AllergyAlertBanner menuCheck={CURRENT_WEEK_MENU_ALLERGY_CHECK} />

        {/* 4. Thanh tìm kiếm, Bộ lọc đa chiều & View Mode */}
        <AllergyFilterStrip
          search={search}
          setSearch={setSearch}
          selectedGrade={selectedGrade}
          setSelectedGrade={setSelectedGrade}
          selectedAllergen={selectedAllergen}
          setSelectedAllergen={setSelectedAllergen}
          selectedSeverity={selectedSeverity}
          setSelectedSeverity={setSelectedSeverity}
          viewMode={viewMode}
          setViewMode={setViewMode}
          totalResults={filteredClasses.length}
          onResetFilters={handleResetFilters}
        />

        {/* 5. Khu vực hiển thị danh sách hồ sơ: Thẻ theo lớp hoặc Bảng dữ liệu */}
        <main className={styles.mainDataArea}>
          {viewMode === "card" ? (
            <AllergyClassCardView
              classes={filteredClasses}
              onOpenDetail={(cls) => setDetailClass(cls)}
              onOpenEdit={handleOpenEditModal}
            />
          ) : (
            <AllergyTableView
              classes={filteredClasses}
              onOpenDetail={(cls) => setDetailClass(cls)}
              onOpenEdit={handleOpenEditModal}
            />
          )}
        </main>
      </div>

      {/* Drawer xem chi tiết hồ sơ y bạ lớp */}
      <AllergyDetailDrawer
        isOpen={Boolean(detailClass)}
        onClose={() => setDetailClass(null)}
        classData={detailClass}
        onOpenEdit={handleOpenEditModal}
      />

      {/* Modal biểu mẫu thêm mới / chỉnh sửa hồ sơ dị ứng */}
      <AllergyFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        initialData={editClass}
        onSave={handleSaveClass}
      />

      {/* Modal xem trước bản in khổ A4 giao Bếp ăn */}
      <AllergyPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        classes={filteredClasses}
      />
    </div>
  )
}

