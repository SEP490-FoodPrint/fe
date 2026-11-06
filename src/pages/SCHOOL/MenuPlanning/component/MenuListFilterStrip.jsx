import React, { useMemo } from "react"
import styles from "./MenuListFilterStrip.module.scss"
import { getWeeksOfYear, getISOWeekNumber } from "src/services/MenuService/adapter"

export default function MenuListFilterStrip({
  filters,
  onChangeFilter,
  onResetFilters,
  availableYears = [2024, 2025, 2026, 2027],
}) {
  const {
    searchKeyword = "",
    year = new Date().getFullYear(),
    week = getISOWeekNumber(new Date()),
    mealType = "all",
    status = "all",
  } = filters

  const currentYear = new Date().getFullYear()
  const currentWeek = getISOWeekNumber(new Date())

  // Tạo danh sách toàn bộ các tuần của năm đã chọn
  const weeks = useMemo(() => {
    return getWeeksOfYear(Number(year) || currentYear)
  }, [year, currentYear])

  return (
    <div className={styles.filterStrip}>
      {/* 1. Tìm kiếm theo tên hoặc mã thực đơn */}
      <div className={styles.searchWrapper}>
        <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Tìm tên thực đơn hoặc mã TD..."
          value={searchKeyword}
          onChange={(e) => onChangeFilter("searchKeyword", e.target.value)}
        />
        {searchKeyword && (
          <button
            type="button"
            className={styles.clearSearchBtn}
            onClick={() => onChangeFilter("searchKeyword", "")}
            title="Xóa tìm kiếm"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        )}
      </div>

      {/* 2. Bộ lọc Năm (Thêm theo yêu cầu) */}
      <div className={styles.selectWrapperYear}>
        <span className={`material-symbols-outlined ${styles.selectIcon}`}>calendar_month</span>
        <select
          className={styles.selectInput}
          value={year}
          onChange={(e) => onChangeFilter("year", Number(e.target.value))}
          title="Chọn năm"
        >
          {availableYears.map((y) => (
            <option key={y} value={y}>
              Năm {y}
            </option>
          ))}
        </select>
        <span className={`material-symbols-outlined ${styles.chevronIcon}`}>expand_more</span>
      </div>

      {/* 3. Bộ lọc Tuần (Lọc theo các tuần cho mọi năm, mặc định là tuần này) */}
      <div className={styles.selectWrapperWeek}>
        <span className={`material-symbols-outlined ${styles.selectIcon}`}>view_week</span>
        <select
          className={styles.selectInput}
          value={String(week)}
          onChange={(e) => onChangeFilter("week", e.target.value === "all" ? "all" : Number(e.target.value))}
          title="Chọn tuần trong năm"
        >
          <option value="all">Tất cả các tuần ({year})</option>
          {weeks.map((w) => {
            const isThisWeek = Number(year) === currentYear && w.weekNumber === currentWeek
            return (
              <option key={w.weekNumber} value={w.weekNumber}>
                {isThisWeek ? `${w.label} — Tuần này` : w.label}
              </option>
            )
          })}
        </select>
        <span className={`material-symbols-outlined ${styles.chevronIcon}`}>expand_more</span>
      </div>

      {/* 4. Bộ lọc Ca ăn */}
      <div className={styles.selectWrapperSm}>
        <span className={`material-symbols-outlined ${styles.selectIcon}`}>restaurant</span>
        <select
          className={styles.selectInput}
          value={mealType}
          onChange={(e) => onChangeFilter("mealType", e.target.value)}
          title="Chọn ca ăn"
        >
          <option value="all">Tất cả ca</option>
          <option value="LUNCH">Bữa trưa</option>
          <option value="AFTERNOON">Bữa chiều / xế</option>
        </select>
        <span className={`material-symbols-outlined ${styles.chevronIcon}`}>expand_more</span>
      </div>

      {/* 5. Bộ lọc Trạng thái */}
      <div className={styles.selectWrapperMd}>
        <span className={`material-symbols-outlined ${styles.selectIcon}`}>verified_user</span>
        <select
          className={styles.selectInput}
          value={status}
          onChange={(e) => onChangeFilter("status", e.target.value)}
          title="Chọn trạng thái phê duyệt"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="APPROVED">Đã duyệt</option>
          <option value="PENDING_APPROVAL">Chờ BGH duyệt</option>
          <option value="DRAFT">Bản nháp</option>
          <option value="REVISION_REQUESTED">Yêu cầu chỉnh sửa</option>
        </select>
        <span className={`material-symbols-outlined ${styles.chevronIcon}`}>expand_more</span>
      </div>

      {/* 6. Nút Đặt lại bộ lọc */}
      <button
        type="button"
        className={styles.resetBtn}
        onClick={onResetFilters}
        title="Đặt lại bộ lọc về mặc định (Tuần này)"
      >
        <span className={`material-symbols-outlined ${styles.resetIcon}`}>restart_alt</span>
        <span className={styles.resetLabel}>Đặt lại</span>
      </button>
    </div>
  )
}
