import React from "react"
import PropTypes from "prop-types"
import { Box, TextField, MenuItem, InputAdornment, Button } from "@mui/material"
import { Search, RotateCcw } from "lucide-react"
import styles from "./DeliveryFilterStrip.module.scss"

export default function DeliveryFilterStrip({
  filters,
  onFilterChange,
  onResetFilters,
}) {
  return (
    <Box className={styles.filterBar}>
      <Box className={styles.filterInputs}>
        <TextField
          size="small"
          placeholder="Tìm theo mã phiếu, mã đơn, NCC hoặc thực đơn..."
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
          label="Đợt giao hàng"
          value={filters.batchType}
          onChange={e => onFilterChange("batchType", e.target.value)}
          className={styles.selectInput}
        >
          <MenuItem value="all">Tất cả đợt giao</MenuItem>
          <MenuItem value="BATCH_1">Đợt 1 (50% Suất tối đa)</MenuItem>
          <MenuItem value="BATCH_2">Đợt 2 (Theo sĩ số GVCN)</MenuItem>
        </TextField>

        <TextField
          select
          size="small"
          label="Trạng thái nghiệm thu"
          value={filters.status}
          onChange={e => onFilterChange("status", e.target.value)}
          className={styles.selectInput}
        >
          <MenuItem value="all">Tất cả trạng thái</MenuItem>
          <MenuItem value="CONFIRMED">NCC đang chuẩn bị</MenuItem>
          <MenuItem value="INSPECTING">Đang kiểm tra 4 bên</MenuItem>
          <MenuItem value="WAITING_ATTENDANCE">Chờ GVCN chốt sĩ số</MenuItem>
          <MenuItem value="COMPLETED">Đã duyệt 4/4 & Vào bếp</MenuItem>
          <MenuItem value="REJECTED">Từ chối (Yêu cầu giao lại)</MenuItem>
        </TextField>
      </Box>

      <Button
        variant="text"
        startIcon={<RotateCcw size={16} />}
        onClick={onResetFilters}
        className={styles.resetBtn}
      >
        Đặt lại
      </Button>
    </Box>
  )
}

DeliveryFilterStrip.propTypes = {
  filters: PropTypes.shape({
    search: PropTypes.string,
    batchType: PropTypes.string,
    status: PropTypes.string,
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onResetFilters: PropTypes.func.isRequired,
}
