import React, { useState } from "react"
import { Search, RotateCcw, Calendar, ChevronDown, Utensils, ShieldAlert, CheckCircle2, Clock } from "lucide-react"
import styles from "./CookingBatchesFilter.module.scss"

const QUICK_CHIPS = [
  { id: "ALL", label: "Tất cả" },
  { id: "LUNCH", label: "Bữa trưa" },
  { id: "AFTERNOON", label: "Bữa xế" },
  { id: "PENDING", label: "Chờ nấu" },
  { id: "COMPLETED", label: "Đã xong" },
  { id: "ALLERGY", label: "Nấu riêng (Dị ứng)" },
]

function CookingBatchesFilter({ onFilterChange, activeQuickFilter, onQuickFilterChange }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [mealType, setMealType] = useState("ALL")
  const [method, setMethod] = useState("ALL")
  const [status, setStatus] = useState("ALL")
  const [activeChip, setActiveChip] = useState(activeQuickFilter || "ALL")

  const handleChipClick = (chipId) => {
    setActiveChip(chipId)
    if (onQuickFilterChange) {
      onQuickFilterChange(chipId)
    }
    // Cập nhật các select tương ứng
    if (chipId === "ALL") {
      setMealType("ALL")
      setMethod("ALL")
      setStatus("ALL")
    } else if (chipId === "LUNCH" || chipId === "AFTERNOON") {
      setMealType(chipId)
    } else if (chipId === "ALLERGY") {
      setMethod("ALLERGY")
    } else if (chipId === "PENDING") {
      setStatus("CONFIRMED")
    } else if (chipId === "COMPLETED") {
      setStatus("COMPLETED")
    }
  }

  const handleReset = () => {
    setSearchTerm("")
    setMealType("ALL")
    setMethod("ALL")
    setStatus("ALL")
    setActiveChip("ALL")
    if (onFilterChange) onFilterChange({ searchTerm: "", mealType: "ALL", method: "ALL", status: "ALL" })
    if (onQuickFilterChange) onQuickFilterChange("ALL")
  }

  return (
    <div className={styles.filterSection}>
      {/* 1. Hàng tìm kiếm & Bộ lọc Desktop */}
      <div className={styles.filterBar}>
        {/* Search Input */}
        <div className={styles.searchBox}>
          <Search size={17} className={styles.searchIcon} aria-hidden="true" />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Tìm theo món ăn, số suất..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              if (onFilterChange) onFilterChange({ searchTerm: e.target.value, mealType, method, status })
            }}
            aria-label="Tìm kiếm lô chế biến"
          />
        </div>

        {/* Desktop Dropdowns (Ẩn trên mobile để dùng chip) */}
        <div className={styles.desktopFilters}>
          {/* Dropdown Ngày */}
          <div className={styles.datePill}>
            <Calendar size={15} className={styles.dateIcon} aria-hidden="true" />
            <span>Hôm nay (Ca trưa)</span>
          </div>

          {/* Bữa ăn */}
          <div className={styles.selectWrapper}>
            <select
              className={styles.select}
              value={mealType}
              onChange={(e) => {
                setMealType(e.target.value)
                if (onFilterChange) onFilterChange({ searchTerm, mealType: e.target.value, method, status })
              }}
              aria-label="Chọn bữa ăn"
            >
              <option value="ALL">Tất cả ca ăn</option>
              <option value="LUNCH">Bữa trưa (11:15)</option>
              <option value="AFTERNOON">Bữa xế (14:15)</option>
            </select>
            <ChevronDown size={14} className={styles.selectArrow} aria-hidden="true" />
          </div>

          {/* Phương thức */}
          <div className={styles.selectWrapper}>
            <select
              className={styles.select}
              value={method}
              onChange={(e) => {
                setMethod(e.target.value)
                if (onFilterChange) onFilterChange({ searchTerm, mealType, method: e.target.value, status })
              }}
              aria-label="Chọn phương thức nấu"
            >
              <option value="ALL">Tất cả phương thức</option>
              <option value="COMMON">Nấu chung</option>
              <option value="ALLERGY">Nấu riêng (Dị ứng)</option>
            </select>
            <ChevronDown size={14} className={styles.selectArrow} aria-hidden="true" />
          </div>

          {/* Trạng thái */}
          <div className={styles.selectWrapper}>
            <select
              className={styles.select}
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                if (onFilterChange) onFilterChange({ searchTerm, mealType, method, status: e.target.value })
              }}
              aria-label="Chọn trạng thái lô"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="COMPLETED">Đã nấu xong</option>
              <option value="CONFIRMED">Chờ nấu</option>
              <option value="DRAFT">Chưa xác nhận</option>
            </select>
            <ChevronDown size={14} className={styles.selectArrow} aria-hidden="true" />
          </div>

          {/* Nút Làm mới */}
          <button
            type="button"
            className={styles.resetBtn}
            onClick={handleReset}
            title="Làm mới bộ lọc"
            aria-label="Làm mới bộ lọc"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* 2. Dải Filter Chips cuộn ngang cho Mobile (Touch-friendly 1 tay) */}
      <div className={styles.chipsRow} role="tablist" aria-label="Bộ lọc nhanh lô chế biến">
        {QUICK_CHIPS.map((chip) => {
          const isActive = activeChip === chip.id
          return (
            <button
              key={chip.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`${styles.chipBtn} ${isActive ? styles.chipActive : ""}`}
              onClick={() => handleChipClick(chip.id)}
            >
              {chip.id === "ALLERGY" && <ShieldAlert size={13} className={styles.chipIcon} />}
              <span>{chip.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default CookingBatchesFilter
