import React from "react"
import PropTypes from "prop-types"
import { InputAdornment, MenuItem, TextField } from "@mui/material"
import { Search } from "@mui/icons-material"
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
      <TextField
        id="supplier-complaint-search"
        type="search"
        size="small"
        className={styles.searchField}
        placeholder="Tìm trong trang này: mã FP-CP, tiêu đề, trường, chuyến giao"
        value={searchQuery}
        onChange={event => onSearchChange(event.target.value)}
        slotProps={{
          htmlInput: {
            "aria-label": "Tìm phản ánh nguyên liệu trong trang hiện tại",
          },
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />

      <div className={styles.filterRight}>
        <TextField
          id="supplier-complaint-status-filter"
          select
          size="small"
          label="Trạng thái"
          className={styles.selectField}
          value={statusFilter}
          onChange={event => onStatusChange(event.target.value)}
        >
          {COMPLAINT_STATUS_OPTIONS.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <span className={styles.countSummary}>
          {visibleCount === totalCount
            ? `${totalCount} khiếu nại`
            : `${visibleCount}/${totalCount} khiếu nại`}
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
