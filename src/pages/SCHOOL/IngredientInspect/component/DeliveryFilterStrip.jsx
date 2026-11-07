import React from "react"
import PropTypes from "prop-types"
import { Search, RotateCcw, Calendar, Filter } from "lucide-react"
import styles from "./DeliveryFilterStrip.module.scss"

export default function DeliveryFilterStrip({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  timeFilter,
  onTimeChange,
  onResetFilters,
  hasActiveFilters,
}) {
  return (
    <div className={styles.filterStrip}>
      {/* 1. Ô tìm kiếm */}
      <div className={styles.searchWrap}>
        <Search size={18} className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Tìm theo mã giao hàng (FP-DEMO-...) hoặc nhà cung cấp..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchTerm && (
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

      {/* 2. Bộ lọc trạng thái & thời gian */}
      <div className={styles.filterControls}>
        <div className={styles.selectWrap}>
          <Filter size={15} className={styles.selectIcon} />
          <select
            className={styles.select}
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            aria-label="Lọc theo trạng thái giao hàng"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="CREATED">Đã tạo</option>
            <option value="IN_TRANSIT">Đang vận chuyển</option>
            <option value="ARRIVED">Đã đến trường</option>
            <option value="PENDING_APPROVAL">Chờ phê duyệt</option>
            <option value="APPROVED">Đã phê duyệt</option>
            <option value="REJECTED">Bị từ chối</option>
            <option value="RECEIVED">Đã tiếp nhận</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>

        <div className={styles.selectWrap}>
          <Calendar size={15} className={styles.selectIcon} />
          <select
            className={styles.select}
            value={timeFilter}
            onChange={(e) => onTimeChange(e.target.value)}
            aria-label="Lọc theo thời gian giao hàng"
          >
            <option value="ALL">Tất cả thời gian</option>
            <option value="today">Hôm nay</option>
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className={styles.resetBtn}
            onClick={onResetFilters}
            title="Đặt lại bộ lọc về mặc định"
          >
            <RotateCcw size={14} />
            <span>Xóa bộ lọc</span>
          </button>
        )}
      </div>
    </div>
  )
}

DeliveryFilterStrip.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  statusFilter: PropTypes.string.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  timeFilter: PropTypes.string.isRequired,
  onTimeChange: PropTypes.func.isRequired,
  onResetFilters: PropTypes.func.isRequired,
  hasActiveFilters: PropTypes.bool.isRequired,
}

