import React, { useState, useMemo } from "react"
import {
  MOCK_CLASS_ALLERGIES,
  MOCK_ACADEMIC_YEARS,
  computeAllergySummary,
} from "./mockAllergyData"
import AllergyHeader from "./component/AllergyHeader"
import AllergyKPICards from "./component/AllergyKPICards"
import AllergyFilterStrip from "./component/AllergyFilterStrip"
import AllergyTableView from "./component/AllergyTableView"
import AllergyMobileCards from "./component/AllergyMobileCards"
import AllergyEmptyState from "./component/AllergyEmptyState"
import AllergyClassDetailView from "./component/AllergyClassDetailView"
import styles from "./index.module.scss"

export default function HealthAllergyPage() {
  // Master data
  const [classList] = useState(MOCK_CLASS_ALLERGIES)

  // Điều hướng 2 màn hình: null = SCREEN 01 (Danh sách), object = SCREEN 02 (Chi tiết lớp)
  const [selectedClass, setSelectedClass] = useState(null)

  // Bộ lọc & Tìm kiếm cho SCREEN 01
  const [searchQuery, setSearchQuery] = useState("")
  const [academicYear, setAcademicYear] = useState("ALL")

  // Tính toán 2 chỉ số KPI tổng hợp nhỏ gọn
  const summary = useMemo(() => computeAllergySummary(classList), [classList])

  // Lọc danh sách lớp theo năm học và từ khóa tìm kiếm
  const filteredList = useMemo(() => {
    let result = [...classList]

    // 1. Lọc theo năm học
    if (academicYear !== "ALL") {
      result = result.filter((cls) => cls.academicYear === academicYear)
    }

    // 2. Tìm kiếm theo tên lớp hoặc tên nguyên liệu dị ứng
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter((cls) => {
        const matchClass = cls.className.toLowerCase().includes(q)
        const matchIngredient = (cls.allergies || []).some(
          (alg) =>
            alg.ingredientName.toLowerCase().includes(q) ||
            (alg.category && alg.category.toLowerCase().includes(q))
        )
        return matchClass || matchIngredient
      })
    }

    return result
  }, [classList, academicYear, searchQuery])

  const isFiltered = academicYear !== "ALL" || searchQuery.trim().length > 0

  const handleResetFilters = () => {
    setSearchQuery("")
    setAcademicYear("ALL")
  }

  // SCREEN 02: CHI TIẾT DỊ ỨNG THEO LỚP
  if (selectedClass) {
    return (
      <div className={styles.healthAllergyPage}>
        <AllergyClassDetailView
          classData={selectedClass}
          onBack={() => setSelectedClass(null)}
        />
      </div>
    )
  }

  // SCREEN 01: DANH SÁCH THÔNG TIN DỊ ỨNG
  return (
    <div className={styles.healthAllergyPage}>
      {/* A. Page Header */}
      <AllergyHeader />

      {/* B. Summary: 2 chỉ số nhỏ gọn */}
      <AllergyKPICards summary={summary} />

      {/* C. Search và Filter */}
      <AllergyFilterStrip
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        academicYear={academicYear}
        onAcademicYearChange={setAcademicYear}
        academicYearOptions={MOCK_ACADEMIC_YEARS}
        onResetFilters={handleResetFilters}
        isFiltered={isFiltered}
      />

      {/* D. Allergy List & E. Empty State */}
      {filteredList.length === 0 ? (
        <AllergyEmptyState
          isSearching={isFiltered}
          onResetFilters={handleResetFilters}
        />
      ) : (
        <div className={styles.listWrapper}>
          {/* Desktop & Tablet Table */}
          <div className={styles.desktopTableWrap}>
            <AllergyTableView
              classList={filteredList}
              onSelectClass={(cls) => setSelectedClass(cls)}
            />
          </div>

          {/* Mobile Cards */}
          <div className={styles.mobileCardsWrap}>
            <AllergyMobileCards
              classList={filteredList}
              onSelectClass={(cls) => setSelectedClass(cls)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
