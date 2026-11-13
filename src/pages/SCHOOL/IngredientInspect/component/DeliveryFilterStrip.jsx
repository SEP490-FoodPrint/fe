import React from "react"
import PropTypes from "prop-types"
import { Search, RotateCcw, Calendar, Filter } from "lucide-react"
import styles from "./DeliveryFilterStrip.module.scss"

export default function DeliveryFilterStrip({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  dateFilter,
  onDateChange,
  onResetFilters,
  hasActiveFilters,
}) {
  const todayString = React.useMemo(() => {
    const now = new Date()
    const offset = 7 * 60 * 60 * 1000
    return new Date(now.getTime() + offset).toISOString().slice(0, 10)
  }, [])

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

      {/* 2. Bộ lọc trạng thái & Ngày giao hàng */}
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

        {/* Bộ lọc ngày (thay thế bộ lọc thời gian, mặc định là ngày hôm nay) */}
        <div className={styles.dateWrap} title="Lọc theo ngày giao hàng">
          <Calendar size={15} className={styles.selectIcon} />
          <input
            type="date"
            className={styles.dateInput}
            value={dateFilter}
            onChange={(e) => onDateChange(e.target.value)}
            aria-label="Lọc theo ngày giao hàng"
          />
          {dateFilter && (
            <button
              type="button"
              className={styles.clearDateBtn}
              onClick={() => onDateChange("")}
              title="Xem tất cả các ngày"
            >
              ×
            </button>
          )}
        </div>

        {dateFilter !== todayString && (
          <button
            type="button"
            className={styles.todayQuickBtn}
            onClick={() => onDateChange(todayString)}
            title="Xem giao hàng hôm nay"
          >
            Hôm nay
          </button>
        )}

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
  dateFilter: PropTypes.string.isRequired,
  onDateChange: PropTypes.func.isRequired,
  onResetFilters: PropTypes.func.isRequired,
  hasActiveFilters: PropTypes.bool.isRequired,
}

