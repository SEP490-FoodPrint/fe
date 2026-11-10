import React from "react"
import { Search, GraduationCap, CalendarDays, Utensils, RotateCcw, X, ChevronDown } from "lucide-react"
import styles from "./MenuListFilterStrip.module.scss"

export default function MenuListFilterStrip({
  filters,
  onChangeFilter,
  onResetFilters,
  academicYearOptions = [],
  weeks = [],
}) {
  const {
    searchKeyword = "",
    academicYear = "",
    week = "",
    mealType = "all",
  } = filters

  return (
    <div className={styles.filterStrip}>
      {/* 1. Tìm kiếm theo tên hoặc mã thực đơn */}
      <div className={styles.searchWrapper}>
        <Search size={16} className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Tìm tên món ăn, thực đơn hoặc mã TD..."
          value={searchKeyword}
          onChange={(e) => onChangeFilter("searchKeyword", e.target.value)}
        />
        {searchKeyword && (
          <button
            type="button"
            className={styles.clearSearchBtn}
            onClick={() => onChangeFilter("searchKeyword", "")}
            title="Xóa tìm kiếm"
            aria-label="Xóa từ khóa tìm kiếm"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* 2. Bộ lọc Năm học (Setup từ BGH) */}
      <div className={styles.selectWrapperAcademicYear}>
        <GraduationCap size={15} className={styles.selectIcon} />
        <select
          className={styles.selectInput}
          value={academicYear}
          onChange={(e) => onChangeFilter("academicYear", e.target.value)}
          title="Chọn năm học"
          disabled={academicYearOptions.length === 0}
        >
          {academicYearOptions.length === 0 && <option value="">Chưa có năm học</option>}
          {academicYearOptions.map((ay) => (
            <option key={ay.academicYear} value={ay.academicYear}>
              {ay.label || `Năm học ${ay.academicYear}`}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className={styles.chevronIcon} />
      </div>

      {/* 3. Bộ lọc Tuần (Chạy từ ngày bắt đầu đến kết thúc năm học) */}
      <div className={styles.selectWrapperWeek}>
        <CalendarDays size={15} className={styles.selectIcon} />
        <select
          className={styles.selectInput}
          value={String(week)}
          onChange={(e) => onChangeFilter("week", e.target.value)}
          title="Chọn tuần học trong năm học"
          disabled={weeks.length === 0}
        >
          {weeks.length === 0 && <option value="">Chưa có tuần học</option>}
          {weeks.map((w) => (
            <option key={w.weekStartDate} value={w.weekStartDate}>
              {w.label}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className={styles.chevronIcon} />
      </div>

      {/* 4. Bộ lọc Ca ăn */}
      <div className={styles.selectWrapperSm}>
        <Utensils size={14} className={styles.selectIcon} />
        <select
          className={styles.selectInput}
          value={mealType}
          onChange={(e) => onChangeFilter("mealType", e.target.value)}
          title="Chọn ca ăn"
        >
          <option value="all">Tất cả ca</option>
          <option value="LUNCH">Bữa trưa</option>
          <option value="AFTERNOON">Bữa xế</option>
        </select>
        <ChevronDown size={14} className={styles.chevronIcon} />
      </div>

      {/* 5. Nút Đặt lại: Icon-only tinh tế */}
      <button
        type="button"
        className={styles.resetBtn}
        onClick={onResetFilters}
        title="Đặt lại bộ lọc về Tuần này"
        aria-label="Đặt lại bộ lọc"
      >
        <RotateCcw size={15} />
      </button>
    </div>
  )
}
