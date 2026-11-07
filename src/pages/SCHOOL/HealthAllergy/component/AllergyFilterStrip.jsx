import React from "react"
import PropTypes from "prop-types"
import { Search, RotateCcw, Calendar } from "lucide-react"
import styles from "./AllergyFilterStrip.module.scss"

export default function AllergyFilterStrip({
  searchQuery,
  onSearchChange,
  academicYear,
  onAcademicYearChange,
  academicYearOptions = [],
  onResetFilters,
  isFiltered,
}) {
  return (
    <div className={styles.filterStripContainer}>
      <div className={styles.searchWrap}>
        <Search size={16} className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Tìm theo tên lớp, nguyên liệu dị ứng..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            className={styles.clearSearchBtn}
            onClick={() => onSearchChange("")}
            title="Xóa từ khóa"
          >
            ×
          </button>
        )}
      </div>

      <div className={styles.filterActions}>
        <div className={styles.selectWrap}>
          <Calendar size={15} className={styles.selectIcon} />
          <select
            className={styles.selectInput}
            value={academicYear}
            onChange={(e) => onAcademicYearChange(e.target.value)}
          >
            {academicYearOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {isFiltered && (
          <button
            type="button"
            className={styles.resetBtn}
            onClick={onResetFilters}
            title="Xóa bộ lọc"
          >
            <RotateCcw size={13} />
            <span>Xóa lọc</span>
          </button>
        )}
      </div>
    </div>
  )
}

AllergyFilterStrip.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  academicYear: PropTypes.string.isRequired,
  onAcademicYearChange: PropTypes.func.isRequired,
  academicYearOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  onResetFilters: PropTypes.func.isRequired,
  isFiltered: PropTypes.bool.isRequired,
}
