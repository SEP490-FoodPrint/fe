import React from "react"
import { Search, X, RotateCcw, Filter, ChevronDown } from "lucide-react"
import { DEPARTMENT_CONFIGS, ACCOUNT_STATUSES } from "../mockAccountsData"
import styles from "./AccountFilters.module.scss"

/**
 * AccountFilters - Bộ lọc và thanh tìm kiếm
 * Yêu cầu:
 * - Search theo tên (và mã, email, SĐT)
 * - Lọc theo ban (BGH, Y tế, Bếp, GVCN, Phụ huynh, QL nguyên liệu)
 * - Lọc theo trạng thái
 * - Nút Đặt lại bộ lọc
 */
function AccountFilters({
  searchTerm,
  onSearchChange,
  departmentFilter,
  onDepartmentChange,
  statusFilter,
  onStatusChange,
  onResetFilters,
  totalResults = 0,
}) {
  const hasActiveFilters =
    Boolean(searchTerm) || departmentFilter !== "ALL" || statusFilter !== "ALL"

  return (
    <div className={styles.filterContainer}>
      <div className={styles.mainControlsRow}>
        {/* 1. Search Box theo tên, mã, email */}
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} aria-hidden="true" />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Tìm theo họ tên, mã tài khoản, email, số điện thoại..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Tìm kiếm tài khoản"
          />
          {searchTerm && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => onSearchChange("")}
              title="Xóa tìm kiếm"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* 2. Dropdown Bộ lọc theo ban */}
        <div className={styles.selectWrapper}>
          <label htmlFor="dept-select" className={styles.visuallyHidden}>
            Lọc theo ban
          </label>
          <div className={styles.customSelect}>
            <Filter size={15} className={styles.selectIcon} />
            <select
              id="dept-select"
              value={departmentFilter}
              onChange={(e) => onDepartmentChange(e.target.value)}
              className={styles.selectControl}
            >
              <option value="ALL">Tất cả các ban (6 ban)</option>
              {DEPARTMENT_CONFIGS.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className={styles.arrowIcon} />
          </div>
        </div>

        {/* 3. Dropdown Lọc theo trạng thái */}
        <div className={styles.selectWrapper}>
          <label htmlFor="status-select" className={styles.visuallyHidden}>
            Lọc theo trạng thái
          </label>
          <div className={styles.customSelect}>
            <select
              id="status-select"
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              className={styles.selectControl}
            >
              <option value="ALL">Tất cả trạng thái</option>
              {Object.values(ACCOUNT_STATUSES).map((st) => (
                <option key={st.key} value={st.key}>
                  {st.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className={styles.arrowIcon} />
          </div>
        </div>

        {/* 4. Nút Đặt lại bộ lọc */}
        {hasActiveFilters && (
          <button
            type="button"
            className={styles.resetBtn}
            onClick={onResetFilters}
            title="Xóa tất cả điều kiện lọc và tìm kiếm"
          >
            <RotateCcw size={15} />
            <span>Đặt lại</span>
          </button>
        )}
      </div>

      {/* Thông tin số lượng tìm thấy */}
      <div className={styles.metaRow}>
        <span className={styles.resultCount}>
          Tìm thấy <strong>{totalResults}</strong> tài khoản
          {departmentFilter !== "ALL" && (
            <span className={styles.filterTag}>
              Ban:{" "}
              {DEPARTMENT_CONFIGS.find((d) => d.id === departmentFilter)?.label}
            </span>
          )}
          {statusFilter !== "ALL" && (
            <span className={styles.filterTag}>
              Trạng thái: {ACCOUNT_STATUSES[statusFilter]?.label}
            </span>
          )}
        </span>
      </div>
    </div>
  )
}

export default AccountFilters
