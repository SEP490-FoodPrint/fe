import React from "react"
import PropTypes from "prop-types"
import { Box, TextField, MenuItem, InputAdornment, Button } from "@mui/material"
import { Search, RotateCcw } from "lucide-react"
import styles from "./TrackingFilterStrip.module.scss"

export default function TrackingFilterStrip({ filters, onFilterChange, onResetFilters }) {
  return (
    <Box className={styles.filterBar}>
      <Box className={styles.filterInputs}>
        <TextField
          size="small"
          placeholder="Tìm theo mã đơn, mã phiếu, NCC..."
          value={filters.search}
          onChange={e => onFilterChange("search", e.target.value)}
          className={styles.searchInput}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} className={styles.searchIcon} />
                </InputAdornment>
              ),
            },
          }}
        />

        <TextField
          select
          size="small"
          label="Loại đơn hàng"
          value={filters.orderType}
          onChange={e => onFilterChange("orderType", e.target.value)}
          className={styles.selectInput}
        >
          <MenuItem value="all">Tất cả loại đơn</MenuItem>
          <MenuItem value="FRESH_BATCH_1">Đồ tươi (Đợt 1 - 05:30)</MenuItem>
          <MenuItem value="FRESH_BATCH_2">Đồ tươi (Đợt 2 - Bù sĩ số)</MenuItem>
          <MenuItem value="DRY_STOCK">Đồ khô &amp; Gia vị</MenuItem>
        </TextField>

        <TextField
          select
          size="small"
          label="Trạng thái tiến trình"
          value={filters.status}
          onChange={e => onFilterChange("status", e.target.value)}
          className={styles.selectInput}
        >
          <MenuItem value="all">Tất cả trạng thái</MenuItem>
          <MenuItem value="ACCEPTED">Lần 2: NCC đã xác nhận</MenuItem>
          <MenuItem value="IN_TRANSIT">Lần 3: Đang giao (Có ETA)</MenuItem>
          <MenuItem value="ARRIVED">Mốc 4: Đã tới trường (Chờ kiểm duyệt)</MenuItem>
          <MenuItem value="COMPLETED">Đã hoàn tất</MenuItem>
        </TextField>
      </Box>

    </Box>
  )
}

TrackingFilterStrip.propTypes = {
  filters: PropTypes.shape({
    search: PropTypes.string,
    orderType: PropTypes.string,
    status: PropTypes.string,
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onResetFilters: PropTypes.func,
}
