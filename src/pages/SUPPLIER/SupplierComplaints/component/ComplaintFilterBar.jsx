import React from "react"
import PropTypes from "prop-types"
import { Close, Search } from "@mui/icons-material"
import { COMPLAINT_STATUS_OPTIONS } from "src/services/SupplierComplaintService"
import styles from "./ComplaintFilterBar.module.scss"

function ComplaintFilterBar({
  searchQuery,
  statusFilter,
  visibleCount,
  totalCount,
  onSearchChange,
  onStatusChange,
}) {
  return (
    <div
      className={styles.filterBar}
      role="search"
      aria-label="Bộ lọc khiếu nại chất lượng nguyên liệu"
    >
      <div className={styles.searchControl}>
        <Search className={styles.searchIcon} aria-hidden="true" />
        <input
          id="supplier-complaint-search"
          type="search"
          className={styles.searchInput}
          placeholder="Tìm mã khiếu nại, tiêu đề, trường"
          value={searchQuery}
          onChange={event => onSearchChange(event.target.value)}
          aria-label="Tìm kiếm khiếu nại chất lượng nguyên liệu"
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
        <label
          className={styles.selectGroup}
          htmlFor="supplier-complaint-status-filter"
        >
          <span className={styles.selectLabel}>Trạng thái</span>
          <select
            id="supplier-complaint-status-filter"
            className={styles.statusSelect}
            value={statusFilter}
            onChange={event => onStatusChange(event.target.value)}
          >
            {COMPLAINT_STATUS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <span className={styles.countSummary}>
          {visibleCount === totalCount
            ? `${totalCount} khiếu nại`
            : `Hiển thị ${visibleCount}/${totalCount} khiếu nại`}
        </span>
      </div>
    </div>
  )
}

ComplaintFilterBar.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  statusFilter: PropTypes.string.isRequired,
  visibleCount: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
}

export default ComplaintFilterBar
