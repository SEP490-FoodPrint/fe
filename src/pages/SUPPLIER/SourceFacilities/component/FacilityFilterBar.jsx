import React from "react"
import PropTypes from "prop-types"
import {
  Button,
  IconButton,
  InputAdornment,
  MenuItem,
  TextField,
} from "@mui/material"
import {
  Close,
  FilterAltOffOutlined,
  KeyboardArrowDown,
  Search,
} from "@mui/icons-material"
import { FACILITY_STATUS_OPTIONS } from "src/services/SourceFacilityService"
import styles from "./FacilityFilterBar.module.scss"

function FacilityFilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  hasActiveFilters,
  onResetFilters,
}) {
  return (
    <div className={styles.filterContainer}>
      <div className={styles.filterGrid}>
        <div className={styles.searchFieldWrap}>
          <label htmlFor="facility-search-input" className={styles.fieldLabel}>
            Tìm kiếm cơ sở
          </label>
          <TextField
            id="facility-search-input"
            value={searchQuery}
            onChange={event => onSearchChange?.(event.target.value)}
            placeholder="Tìm theo tên hoặc mã cơ sở..."
            size="small"
            fullWidth
            slotProps={{
              htmlInput: { maxLength: 160 },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search className={styles.searchIcon} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      aria-label="Xóa từ khóa tìm kiếm"
                      onClick={() => onSearchChange?.("")}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}
          />
        </div>

        <div className={styles.selectFieldWrap}>
          <label htmlFor="facility-status-select" className={styles.fieldLabel}>
            Trạng thái hoạt động
          </label>
          <TextField
            id="facility-status-select"
            select
            value={statusFilter}
            onChange={event => onStatusFilterChange?.(event.target.value)}
            size="small"
            fullWidth
            slotProps={{
              select: {
                IconComponent: KeyboardArrowDown,
                SelectDisplayProps: {
                  "aria-label": "Lọc theo trạng thái hoạt động",
                },
              },
            }}
          >
            {FACILITY_STATUS_OPTIONS.map(item => (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </TextField>
        </div>

        {hasActiveFilters && (
          <div className={styles.resetWrap}>
            <Button
              size="small"
              variant="text"
              startIcon={<FilterAltOffOutlined />}
              onClick={onResetFilters}
              className={styles.resetButton}
            >
              Xóa bộ lọc
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

FacilityFilterBar.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  statusFilter: PropTypes.string.isRequired,
  onStatusFilterChange: PropTypes.func.isRequired,
  hasActiveFilters: PropTypes.bool,
  onResetFilters: PropTypes.func,
}

export default FacilityFilterBar
