import React, { useState } from "react"
import styles from "./CookingBatchesFilter.module.scss"

function CookingBatchesFilter({ onFilterChange }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [mealType, setMealType] = useState("LUNCH")
  const [method, setMethod] = useState("ALL")
  const [status, setStatus] = useState("ALL")

  const handleReset = () => {
    setSearchTerm("")
    setMealType("LUNCH")
    setMethod("ALL")
    setStatus("ALL")
    if (onFilterChange) onFilterChange({ searchTerm: "", mealType: "LUNCH", method: "ALL", status: "ALL" })
  }

  return (
    <div className={styles.filterBar}>
      {/* Search Input */}
      <div className={styles.searchBox}>
        <span className="material-symbols-outlined">search</span>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Tìm theo mã lô, món ăn..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filter Controls Row */}
      <div className={styles.filtersRow}>
        {/* Dropdown Ngày */}
        <div className={styles.filterPill}>
          <span className="material-symbols-outlined text-primary">calendar_today</span>
          <span>Hôm nay (24/10/2026)</span>
          <span className="material-symbols-outlined">expand_more</span>
        </div>

        {/* Dropdown Bữa ăn */}
        <div className={styles.selectWrapper}>
          <span className="material-symbols-outlined">restaurant</span>
          <select
            className={styles.select}
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            aria-label="Chọn bữa ăn"
          >
            <option value="ALL">Tất cả bữa</option>
            <option value="LUNCH">Bữa trưa</option>
            <option value="AFTERNOON">Bữa chiều</option>
            <option value="BREAKFAST">Bữa sáng</option>
          </select>
        </div>

        {/* Dropdown Phương thức */}
        <div className={styles.selectWrapper}>
          <select
            className={styles.select}
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            aria-label="Chọn phương thức nấu"
          >
            <option value="ALL">Tất cả phương thức</option>
            <option value="COMMON">Nấu chung</option>
            <option value="ALLERGY">Nấu riêng (Dị ứng)</option>
          </select>
        </div>

        {/* Dropdown Trạng thái */}
        <div className={styles.selectWrapper}>
          <select
            className={styles.select}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Chọn trạng thái mẻ"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="DRAFT">Chưa xác nhận</option>
          </select>
        </div>

        {/* Nút Làm mới */}
        <button
          type="button"
          className={styles.resetBtn}
          onClick={handleReset}
          title="Làm mới bộ lọc"
          aria-label="Làm mới bộ lọc"
        >
          <span className="material-symbols-outlined">sync</span>
        </button>
      </div>
    </div>
  )
}

export default CookingBatchesFilter
