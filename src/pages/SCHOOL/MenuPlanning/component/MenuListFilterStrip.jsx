import React from "react"
import styles from "./MenuListFilterStrip.module.scss"

const weekRangeLabel = (offset) => {
  const monday = new Date()
  monday.setHours(0, 0, 0, 0)
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7) + offset * 7)
  const sunday = new Date(monday)
  sunday.setDate(sunday.getDate() + 6)
  const format = (date) => `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`
  return `${format(monday)} - ${format(sunday)}`
}

export default function MenuListFilterStrip({
  filters,
  onChangeFilter,
  onResetFilters
}) {
  const {
    searchKeyword = "",
    dateFilter = "all",
    mealType = "all",
    status = "all"
  } = filters

  return (
    <div className={styles.filterStrip}>
      {/* 1. Search Input */}
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

      {/* 2. Date Filter */}
      <div className={styles.selectWrapper}>
        <span className={`material-symbols-outlined ${styles.selectIcon}`}>calendar_today</span>
        <select
          className={styles.selectInput}
          value={dateFilter}
          onChange={(e) => onChangeFilter("dateFilter", e.target.value)}
        >
          <option value="all">Tất cả các ngày</option>
          <option value="current">Tuần này: {weekRangeLabel(0)}</option>
          <option value="next">Tuần tới: {weekRangeLabel(1)}</option>
          <option value="prev">Tuần trước: {weekRangeLabel(-1)}</option>
        </select>
        <span className={`material-symbols-outlined ${styles.chevronIcon}`}>expand_more</span>
      </div>

      {/* 3. Meal Type Filter */}
      <div className={styles.selectWrapperSm}>
        <span className={`material-symbols-outlined ${styles.selectIcon}`}>restaurant</span>
        <select
          className={styles.selectInput}
          value={mealType}
          onChange={(e) => onChangeFilter("mealType", e.target.value)}
        >
          <option value="all">Tất cả bữa</option>
          <option value="LUNCH">Bữa trưa</option>
          <option value="AFTERNOON">Bữa chiều</option>
        </select>
        <span className={`material-symbols-outlined ${styles.chevronIcon}`}>expand_more</span>
      </div>

      {/* 4. Status Filter */}
      <div className={styles.selectWrapperMd}>
        <span className={`material-symbols-outlined ${styles.selectIcon}`}>verified_user</span>
        <select
          className={styles.selectInput}
          value={status}
          onChange={(e) => onChangeFilter("status", e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="DRAFT">Bản nháp</option>
          <option value="PENDING_APPROVAL">Chờ BGH duyệt</option>
          <option value="APPROVED">Đã duyệt</option>
          <option value="REVISION_REQUESTED">Yêu cầu chỉnh sửa</option>
        </select>
        <span className={`material-symbols-outlined ${styles.chevronIcon}`}>expand_more</span>
      </div>

      {/* 5. Reset Filter Button */}
      <button
        type="button"
        className={styles.resetBtn}
        onClick={onResetFilters}
        title="Đặt lại bộ lọc về mặc định"
      >
        <span className={`material-symbols-outlined ${styles.resetIcon}`}>restart_alt</span>
        <span className={styles.resetLabel}>Đặt lại</span>
      </button>
    </div>
  )
}

