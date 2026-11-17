import React from "react"
import PropTypes from "prop-types"
import { Close, Search } from "@mui/icons-material"
import { ROLE_TYPE_OPTIONS } from "src/services/SystemConfigService"
import styles from "./RoleFilterBar.module.scss"

function RoleFilterBar({
  searchQuery,
  typeFilter,
  visibleCount,
  totalCount,
  onSearchChange,
  onTypeChange,
}) {
  return (
    <div
      className={styles.filterBar}
      role="search"
      aria-label="Bộ lọc vai trò hệ thống"
    >
      <div className={styles.searchControl}>
        <Search className={styles.searchIcon} aria-hidden="true" />
        <input
          id="system-config-role-search"
          type="search"
          className={styles.searchInput}
          placeholder="Tìm theo tên vai trò"
          value={searchQuery}
          onChange={event => onSearchChange(event.target.value)}
          aria-label="Tìm kiếm vai trò theo tên"
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
        <label className={styles.selectGroup} htmlFor="system-config-role-type">
          <span className={styles.selectLabel}>Nhóm đơn vị</span>
          <select
            id="system-config-role-type"
            className={styles.typeSelect}
            value={typeFilter}
            onChange={event => onTypeChange(event.target.value)}
          >
            {ROLE_TYPE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <span className={styles.countSummary} aria-live="polite">
          {visibleCount === totalCount
            ? `${totalCount} vai trò`
            : `Hiển thị ${visibleCount}/${totalCount} vai trò`}
        </span>
      </div>
    </div>
  )
}

RoleFilterBar.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  typeFilter: PropTypes.string.isRequired,
  visibleCount: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onTypeChange: PropTypes.func.isRequired,
}

export default RoleFilterBar
