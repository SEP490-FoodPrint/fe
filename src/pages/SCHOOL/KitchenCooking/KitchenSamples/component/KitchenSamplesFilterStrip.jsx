import React from "react"
import PropTypes from "prop-types"
import { Search, ChevronDown, RotateCcw, X, Utensils, Filter } from "lucide-react"
import styles from "./KitchenSamplesFilterStrip.module.scss"

export default function KitchenSamplesFilterStrip({
  searchTerm = "",
  onSearchChange,
  statusFilter = "ALL",
  onStatusChange,
  mealTypeFilter = "ALL",
  onMealTypeChange,
  timeFilter = "ALL",
  onTimeChange,
  onResetFilters,
  hasActiveFilters = false,
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

      {/* 2. Nhóm bộ lọc Dropdown */}
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
            <option value="READY">Đã đủ 24 giờ (chờ hủy)</option>
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

        {/* Lọc Ngày */}
        <div className={styles.selectWrapper}>
          <select
            className={styles.selectInput}
            value={timeFilter}
            onChange={(e) => onTimeChange?.(e.target.value)}
            title="Lọc theo ngày lưu mẫu"
          >
            <option value="ALL">Tất cả thời gian</option>
            <option value="TODAY">Hôm nay</option>
            <option value="YESTERDAY">Hôm qua</option>
          </select>
          <ChevronDown size={14} className={styles.chevronIcon} />
        </div>

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
  timeFilter: PropTypes.string,
  onTimeChange: PropTypes.func.isRequired,
  onResetFilters: PropTypes.func.isRequired,
  hasActiveFilters: PropTypes.bool,
}
