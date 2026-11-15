import React from "react"
import PropTypes from "prop-types"
import { Close, KeyboardArrowDown, Search } from "@mui/icons-material"
import {
  DELIVERY_SOURCE_OPTIONS,
  DELIVERY_STATUS_OPTIONS,
} from "src/services/SupplierDeliveryService"
import styles from "./DeliveryFilterBar.module.scss"

function DeliveryFilterBar({
  sourceFilter,
  onSourceChange,
  statusFilter,
  onStatusChange,
  searchQuery,
  onSearchChange,
  visibleCount = 0,
  totalLoadedCount = 0,
}) {
  return (
    <div className={styles.filterContainer}>
      <div className={styles.topRow}>
        <div
          className={styles.sourceTabs}
          role="group"
          aria-label="Lọc theo nguồn tạo đơn giao"
        >
          {DELIVERY_SOURCE_OPTIONS.map(option => {
            const isSelected = sourceFilter === option.value
            return (
              <button
                key={option.value}
                type="button"
                className={`${styles.sourceTab} ${isSelected ? styles.isActive : ""}`}
                aria-pressed={isSelected}
                onClick={() => onSourceChange(option.value)}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className={styles.controlsRow}>
        <div className={styles.searchInputWrap}>
          <Search className={styles.searchIcon} aria-hidden="true" />
          <input
            type="text"
            value={searchQuery}
            onChange={event => onSearchChange(event.target.value)}
            placeholder="Tìm theo mã đơn giao, mã yêu cầu, tên trường..."
            className={styles.searchInput}
            aria-label="Tìm kiếm đơn giao hàng"
          />
          {searchQuery && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => onSearchChange("")}
              aria-label="Xóa từ khóa tìm kiếm"
            >
              <Close className={styles.clearIcon} />
            </button>
          )}
        </div>

        <div className={styles.statusSelectWrap}>
          <select
            value={statusFilter}
            onChange={event => onStatusChange(event.target.value)}
            className={styles.statusSelect}
            aria-label="Lọc theo trạng thái đơn giao"
          >
            {DELIVERY_STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <KeyboardArrowDown className={styles.selectChevron} aria-hidden="true" />
        </div>

        <span className={styles.pageMeta}>
          {visibleCount === totalLoadedCount
            ? `${totalLoadedCount} đơn trên trang`
            : `Hiển thị ${visibleCount}/${totalLoadedCount} đơn trên trang`}
        </span>
      </div>
    </div>
  )
}

DeliveryFilterBar.propTypes = {
  sourceFilter: PropTypes.string.isRequired,
  onSourceChange: PropTypes.func.isRequired,
  statusFilter: PropTypes.string.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  searchQuery: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  visibleCount: PropTypes.number,
  totalLoadedCount: PropTypes.number,
}

export default DeliveryFilterBar
