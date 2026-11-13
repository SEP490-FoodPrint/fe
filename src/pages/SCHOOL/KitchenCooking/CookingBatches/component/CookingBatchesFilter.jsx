import React from "react"
import { Search, ChevronDown, RotateCcw, X, Utensils, Filter, Calendar } from "lucide-react"
import { BATCH_STATUSES } from "src/services/KitchenService/adapter"
import styles from "./CookingBatchesFilter.module.scss"

export default function CookingBatchesFilter({
  filters,
  onChange,
  onRefresh,
  onReset,
  academicYearOptions = [],
  weeks = [],
}) {
  const update = (field, value) => onChange({ ...filters, [field]: value })

  const currentWeekValue =
    filters.week === "current"
      ? weeks.find((w) => w.isCurrentWeek)?.isoWeek || "all"
      : (filters.week ?? "all")

  const hasActiveFilters = Boolean(
    filters.search ||
      (filters.academicYear && filters.academicYear !== "2026-2027") ||
      (filters.week && filters.week !== "current" && filters.week !== "all") ||
      filters.mealType ||
      filters.status
  )

  const handleReset = () => {
    if (onReset) {
      onReset()
    } else {
      onChange({
        search: "",
        academicYear: "2026-2027",
        week: "current",
        mealType: "",
        cookingModeApplied: "",
        status: "",
      })
    }
    onRefresh?.()
  }

  return (
    <div className={styles.filterCard}>
      {/* 1. Ô tìm kiếm theo Tên món, Mã lô, Số suất */}
      <div className={styles.searchWrapper}>
        <Search size={15} className={styles.searchIcon} aria-hidden="true" />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Tìm tên món, mã lô, số suất..."
          value={filters.search || ""}
          onChange={(event) => update("search", event.target.value)}
          maxLength={100}
        />
        {filters.search && (
          <button
            type="button"
            className={styles.clearSearchBtn}
            onClick={() => update("search", "")}
            title="Xóa từ khóa tìm kiếm"
            aria-label="Xóa từ khóa"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* 2. Nhóm bộ lọc Dropdown chuẩn đẹp & gọn */}
      <div className={styles.filtersGroup}>
        {/* Năm học */}
        <div className={styles.selectWrapper} style={{ minWidth: 145 }}>
          <Calendar size={14} className={styles.selectIcon} aria-hidden="true" />
          <select
            className={styles.selectInput}
            value={filters.academicYear || "2026-2027"}
            onChange={(event) => update("academicYear", event.target.value)}
            title="Lọc theo năm học"
          >
            {academicYearOptions.map((ay) => (
              <option key={ay.academicYear} value={ay.academicYear}>
                {ay.label || `Năm học ${ay.academicYear}`}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className={styles.chevronIcon} aria-hidden="true" />
        </div>

        {/* Tuần học */}
        <div className={styles.selectWrapper} style={{ minWidth: 220, maxWidth: 300 }}>
          <Calendar size={14} className={styles.selectIcon} aria-hidden="true" />
          <select
            className={styles.selectInput}
            value={currentWeekValue}
            onChange={(event) => update("week", event.target.value)}
            title="Lọc theo tuần học"
          >
            <option value="all">Tất cả các tuần</option>
            {weeks.map((w) => (
              <option key={w.key || w.isoWeek} value={w.isoWeek}>
                {w.label}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className={styles.chevronIcon} aria-hidden="true" />
        </div>

        {/* Bữa ăn */}
        <div className={styles.selectWrapper} style={{ minWidth: 130 }}>
          <Utensils size={14} className={styles.selectIcon} aria-hidden="true" />
          <select
            className={styles.selectInput}
            value={filters.mealType || ""}
            onChange={(event) => update("mealType", event.target.value)}
            title="Lọc theo bữa ăn"
          >
            <option value="">Tất cả bữa ăn</option>
            <option value="LUNCH">Bữa trưa</option>
            <option value="AFTERNOON">Bữa xế</option>
          </select>
          <ChevronDown size={14} className={styles.chevronIcon} aria-hidden="true" />
        </div>

        {/* Trạng thái */}
        <div className={styles.selectWrapper} style={{ minWidth: 155 }}>
          <Filter size={14} className={styles.selectIcon} aria-hidden="true" />
          <select
            className={styles.selectInput}
            value={filters.status || ""}
            onChange={(event) => update("status", event.target.value)}
            title="Lọc theo trạng thái lô"
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(BATCH_STATUSES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className={styles.chevronIcon} aria-hidden="true" />
        </div>

        {/* Nút Đặt lại bộ lọc */}
        <button
          type="button"
          className={`${styles.resetBtn} ${hasActiveFilters ? styles.resetBtnActive : ""}`}
          onClick={handleReset}
          title="Đặt lại bộ lọc về mặc định"
          aria-label="Đặt lại bộ lọc"
        >
          <RotateCcw size={14} />
          <span className={styles.resetLabel}>Đặt lại</span>
        </button>
      </div>
    </div>
  )
}
