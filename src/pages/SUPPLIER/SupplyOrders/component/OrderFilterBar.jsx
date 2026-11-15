import React from "react"
import PropTypes from "prop-types"
import { Close, Search } from "@mui/icons-material"
import {
  SUPPLY_ORDER_STATUS,
  SUPPLY_ORDER_STATUS_OPTIONS,
} from "src/services/SupplierOrderService"
import styles from "./OrderFilterBar.module.scss"

function OrderFilterBar({
  statusFilter,
  onStatusChange,
  searchQuery,
  onSearchChange,
  pendingCount = 0,
  visibleCount = 0,
  totalLoadedCount = 0,
}) {
  return (
    <div className={styles.filterContainer}>
      <div className={styles.topRow}>
        <div
          className={styles.statusTabs}
          role="group"
          aria-label="Lọc theo trạng thái đơn hàng"
        >
          {SUPPLY_ORDER_STATUS_OPTIONS.map(option => {
            const isSelected = statusFilter === option.value
            const showPendingCount =
              option.value === SUPPLY_ORDER_STATUS.SENT &&
              statusFilter === "ALL" &&
              pendingCount > 0

            return (
              <button
                key={option.value}
                type="button"
                className={`${styles.statusTab} ${
                  isSelected ? styles.isActive : ""
                }`}
                aria-pressed={isSelected}
                onClick={() => onStatusChange(option.value)}
              >
                <span>{option.label}</span>
                {showPendingCount && (
                  <span className={styles.tabBadge} title="Số đơn chờ tiếp nhận trên trang">
                    {pendingCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className={styles.searchRow}>
        <div className={styles.searchInputWrap}>
          <Search className={styles.searchIcon} aria-hidden="true" />
          <input
            type="text"
            value={searchQuery}
            onChange={event => onSearchChange(event.target.value)}
            placeholder="Tìm theo mã đơn hàng hoặc tên trường học..."
            className={styles.searchInput}
            aria-label="Tìm kiếm đơn hàng theo mã đơn hoặc tên trường"
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

        <span className={styles.pageMeta}>
          {visibleCount === totalLoadedCount
            ? `${totalLoadedCount} đơn trên trang`
            : `Hiển thị ${visibleCount}/${totalLoadedCount} đơn trên trang`}
        </span>
      </div>
    </div>
  )
}

OrderFilterBar.propTypes = {
  statusFilter: PropTypes.string.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  searchQuery: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  pendingCount: PropTypes.number,
  visibleCount: PropTypes.number,
  totalLoadedCount: PropTypes.number,
}

export default OrderFilterBar
