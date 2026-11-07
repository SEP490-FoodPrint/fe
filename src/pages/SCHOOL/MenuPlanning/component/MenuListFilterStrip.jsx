import React, { useMemo } from "react"
import { Search, CalendarDays, Utensils, RotateCcw, X, ChevronDown } from "lucide-react"
import styles from "./MenuListFilterStrip.module.scss"
import { getWeeksOfYear, getISOWeekNumber } from "src/services/MenuService/adapter"

export default function MenuListFilterStrip({
  filters,
  onChangeFilter,
  onResetFilters,
}) {
  const {
    searchKeyword = "",
    year = new Date().getFullYear(),
    week = getISOWeekNumber(new Date()),
    mealType = "all",
  } = filters

  const currentYear = new Date().getFullYear()
  const currentWeek = getISOWeekNumber(new Date())

  // Danh sách các tuần của năm đã chọn
  const weeks = useMemo(() => {
    return getWeeksOfYear(Number(year) || currentYear)
  }, [year, currentYear])

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

      {/* 2. Bộ lọc Tuần */}
      <div className={styles.selectWrapperWeek}>
        <CalendarDays size={15} className={styles.selectIcon} />
        <select
          className={styles.selectInput}
          value={String(week)}
          onChange={(e) => onChangeFilter("week", Number(e.target.value))}
          title="Chọn tuần trong năm"
        >
          {weeks.map((w) => {
            const isThisWeek = Number(year) === currentYear && w.weekNumber === currentWeek
            return (
              <option key={w.weekNumber} value={w.weekNumber}>
                {isThisWeek
                  ? `Tuần ${w.weekNumber} (${w.startVN} – ${w.endVN}) — Tuần này`
                  : `Tuần ${w.weekNumber} (${w.startVN} – ${w.endVN})`}
              </option>
            )
          })}
        </select>
        <ChevronDown size={14} className={styles.chevronIcon} />
      </div>

      {/* 3. Bộ lọc Ca ăn */}
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

      {/* 4. Nút Đặt lại: Icon-only tinh tế */}
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
