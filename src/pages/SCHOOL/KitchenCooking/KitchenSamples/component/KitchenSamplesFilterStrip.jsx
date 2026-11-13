import React from "react"
import PropTypes from "prop-types"
import { Search, ChevronDown, RotateCcw, X, Utensils, Filter, Calendar } from "lucide-react"
import styles from "./KitchenSamplesFilterStrip.module.scss"

export default function KitchenSamplesFilterStrip({
  searchTerm = "",
  onSearchChange,
  statusFilter = "ALL",
  onStatusChange,
  mealTypeFilter = "ALL",
  onMealTypeChange,
  weekFilter = "ALL",
  onWeekChange,
  weeks = [],
  onResetFilters,
  hasActiveFilters = false,
  readyCount = 0,
  onDisposeAllReady,
  disposing = false,
}) {
  return (
    <div className={styles.filterCard}>
      {/* 1. Ô tìm kiếm theo Mã lô hoặc Tên món ăn */}
      <div className={styles.searchWrapper}>
        <Search size={16} className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Tìm theo mã lô (CB-...), tên món ăn..."
          value={searchTerm}
          onChange={(e) => onSearchChange?.(e.target.value)}
        />
        {searchTerm && (
          <button
            type="button"
            className={styles.clearSearchBtn}
            onClick={() => onSearchChange?.("")}
            title="Xóa từ khóa tìm kiếm"
            aria-label="Xóa từ khóa"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* 2. Nhóm bộ lọc Dropdown & Lịch */}
      <div className={styles.filtersGroup}>
        {/* Lọc Trạng thái */}
        <div className={styles.selectWrapper}>
          <Filter size={14} className={styles.selectIcon} />
          <select
            className={styles.selectInput}
            value={statusFilter}
            onChange={(e) => onStatusChange?.(e.target.value)}
            title="Lọc theo trạng thái mẫu lưu"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="STORED">Đang lưu mẫu</option>
            <option value="READY_TO_DISPOSE">Đã đủ 24 giờ (chờ hủy)</option>
            <option value="DISPOSED">Đã tiêu hủy</option>
          </select>
          <ChevronDown size={14} className={styles.chevronIcon} />
        </div>

        {/* Lọc Bữa ăn */}
        <div className={styles.selectWrapper}>
          <Utensils size={14} className={styles.selectIcon} />
          <select
            className={styles.selectInput}
            value={mealTypeFilter}
            onChange={(e) => onMealTypeChange?.(e.target.value)}
            title="Lọc theo ca ăn"
          >
            <option value="ALL">Tất cả bữa ăn</option>
            <option value="LUNCH">Bữa trưa</option>
            <option value="AFTERNOON">Bữa xế</option>
          </select>
          <ChevronDown size={14} className={styles.chevronIcon} />
        </div>

        {/* Lọc Tuần học */}
        <div className={styles.selectWrapper} style={{ minWidth: 200, maxWidth: 300 }}>
          <Calendar size={14} className={styles.selectIcon} />
          <select
            className={styles.selectInput}
            value={weekFilter}
            onChange={(e) => onWeekChange?.(e.target.value)}
            title="Lọc theo tuần học"
          >
            <option value="ALL">Tất cả các tuần</option>
            <option value="CURRENT">Tuần hiện tại (Tuần này)</option>
            {weeks.map((w) => (
              <option key={w.weekIndex} value={w.weekIndex}>
                {w.label}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className={styles.chevronIcon} />
        </div>

        {/* Nút Hủy tất cả cho những mẫu đã đủ 24h */}
        <button
          type="button"
          className={`${styles.disposeAllBtn} ${readyCount > 0 ? styles.disposeAllActive : ""}`}
          onClick={onDisposeAllReady}
          title={
            readyCount > 0
              ? `Hủy tất cả ${readyCount} mẫu lưu đã đủ 24 giờ`
              : "Không có mẫu lưu nào đủ 24h để hủy"
          }
          disabled={readyCount === 0 || disposing}
        >
          <X size={14} className={styles.disposeAllIcon} />
          <span>
            {disposing
              ? "Đang hủy..."
              : readyCount > 0
                ? `Hủy tất cả (${readyCount})`
                : "Hủy tất cả"}
          </span>
        </button>

        {/* Nút Xóa bộ lọc */}
        {hasActiveFilters && (
          <button
            type="button"
            className={styles.resetBtn}
            onClick={onResetFilters}
            title="Xóa tất cả bộ lọc đang chọn"
          >
            <RotateCcw size={13} />
            <span>Xóa lọc</span>
          </button>
        )}
      </div>
    </div>
  )
}

KitchenSamplesFilterStrip.propTypes = {
  searchTerm: PropTypes.string,
  onSearchChange: PropTypes.func.isRequired,
  statusFilter: PropTypes.string,
  onStatusChange: PropTypes.func.isRequired,
  mealTypeFilter: PropTypes.string,
  onMealTypeChange: PropTypes.func.isRequired,
  weekFilter: PropTypes.string,
  onWeekChange: PropTypes.func.isRequired,
  weeks: PropTypes.arrayOf(
    PropTypes.shape({
      weekIndex: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      isCurrentWeek: PropTypes.bool,
    })
  ),
  onResetFilters: PropTypes.func.isRequired,
  hasActiveFilters: PropTypes.bool,
}
