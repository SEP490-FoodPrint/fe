import React from "react"
import PropTypes from "prop-types"
import { Close, Search } from "@mui/icons-material"
import { STAFF_STATUS_OPTIONS } from "src/services/SupplierStaffService"
import styles from "./StaffFilterBar.module.scss"

function StaffFilterBar({
  searchQuery,
  statusFilter,
  visibleCount,
  totalCount,
  onSearchChange,
  onStatusChange,
}) {
  return (
    <div className={styles.filterBar} role="search" aria-label="Bộ lọc nhân viên">
      <div className={styles.searchControl}>
        <Search className={styles.searchIcon} aria-hidden="true" />
        <input
          id="supplier-staff-search"
          type="search"
          className={styles.searchInput}
          placeholder="Tìm theo họ tên, username, email hoặc SĐT..."
          value={searchQuery}
          onChange={event => onSearchChange(event.target.value)}
          aria-label="Tìm kiếm nhân viên"
        />
        {searchQuery ? (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={() => onSearchChange("")}
            aria-label="Xóa từ khóa tìm kiếm"
          >
            <Close className={styles.clearIcon} />
          </button>
        ) : null}
      </div>

      <div className={styles.filterRight}>
        <label className={styles.selectGroup} htmlFor="supplier-staff-status-filter">
          <span className={styles.selectLabel}>Trạng thái</span>
          <select
            id="supplier-staff-status-filter"
            className={styles.statusSelect}
            value={statusFilter}
            onChange={event => onStatusChange(event.target.value)}
          >
            {STAFF_STATUS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <span className={styles.countSummary}>
          {visibleCount === totalCount
            ? `${totalCount} tài khoản`
            : `Hiển thị ${visibleCount}/${totalCount} tài khoản`}
        </span>
      </div>
    </div>
  )
}

StaffFilterBar.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  statusFilter: PropTypes.string.isRequired,
  visibleCount: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
}

export default StaffFilterBar
