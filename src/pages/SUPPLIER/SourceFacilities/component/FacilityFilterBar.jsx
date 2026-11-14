import React from "react"
import PropTypes from "prop-types"
import {
  Button,
  Chip,
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
  WarningAmberOutlined,
} from "@mui/icons-material"
import {
  COOPERATION_STATUSES,
  FACILITY_TYPES,
} from "src/services/SourceFacilityService/mockData"
import styles from "./FacilityFilterBar.module.scss"

function FacilityFilterBar({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  attentionOnly,
  onToggleAttentionOnly,
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
            placeholder="Tìm theo tên, mã cơ sở hoặc địa chỉ..."
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
          <label htmlFor="facility-type-select" className={styles.fieldLabel}>
            Loại cơ sở
          </label>
          <TextField
            id="facility-type-select"
            select
            value={typeFilter}
            onChange={event => onTypeFilterChange?.(event.target.value)}
            size="small"
            fullWidth
            slotProps={{
              select: {
                IconComponent: KeyboardArrowDown,
                SelectDisplayProps: {
                  "aria-label": "Lọc theo loại cơ sở",
                },
              },
            }}
          >
            <MenuItem value="ALL">Tất cả loại cơ sở</MenuItem>
            {FACILITY_TYPES.map(item => (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </TextField>
        </div>

        <div className={styles.selectFieldWrap}>
          <label htmlFor="facility-status-select" className={styles.fieldLabel}>
            Trạng thái hợp tác
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
                  "aria-label": "Lọc theo trạng thái hợp tác",
                },
              },
            }}
          >
            <MenuItem value="ALL">Tất cả trạng thái</MenuItem>
            {COOPERATION_STATUSES.map(item => (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </TextField>
        </div>
      </div>

      <div className={styles.filterSecondaryRow}>
        <Chip
          icon={<WarningAmberOutlined />}
          label="Chỉ xem hồ sơ cần chú ý"
          clickable
          color={attentionOnly ? "warning" : "default"}
          variant={attentionOnly ? "filled" : "outlined"}
          aria-pressed={attentionOnly}
          onClick={onToggleAttentionOnly}
          className={styles.attentionChip}
        />

        {hasActiveFilters && (
          <Button
            type="button"
            variant="text"
            size="small"
            startIcon={<FilterAltOffOutlined />}
            onClick={onResetFilters}
            className={styles.resetButton}
          >
            Xóa bộ lọc
          </Button>
        )}
      </div>
    </div>
  )
}

FacilityFilterBar.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  typeFilter: PropTypes.string.isRequired,
  onTypeFilterChange: PropTypes.func.isRequired,
  statusFilter: PropTypes.string.isRequired,
  onStatusFilterChange: PropTypes.func.isRequired,
  attentionOnly: PropTypes.bool.isRequired,
  onToggleAttentionOnly: PropTypes.func.isRequired,
  hasActiveFilters: PropTypes.bool.isRequired,
  onResetFilters: PropTypes.func.isRequired,
}

export default FacilityFilterBar
