import React from "react"
import PropTypes from "prop-types"
import { Box, TextField, MenuItem, InputAdornment, Button } from "@mui/material"
import { Search, RotateCcw, PlusCircle } from "lucide-react"
import styles from "./DeliveryFilterStrip.module.scss"

export default function DeliveryFilterStrip({
  filters,
  onFilterChange,
  onResetFilters,
  onOpenCreate,
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
          <MenuItem value="CONFIRMED">NCC chuẩn bị giao</MenuItem>
          <MenuItem value="INSPECTING">Đang kiểm tra 4 bên</MenuItem>
          <MenuItem value="COMPLETED">Đã duyệt 4/4 & Vào bếp</MenuItem>
          <MenuItem value="RE_DELIVER">Yêu cầu giao lại (1 bên từ chối)</MenuItem>
          <MenuItem value="CANCELLED">Đã hủy (≥ 2 bên từ chối)</MenuItem>
        </TextField>
      </Box>

      {onOpenCreate && (
        <Box className={styles.actionGroup}>
          <Button
            variant="contained"
            startIcon={<PlusCircle size={18} />}
            onClick={onOpenCreate}
            className={styles.createBtn}
          >
            Tạo yêu cầu mua hàng
          </Button>
        </Box>
      )}
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
  onOpenCreate: PropTypes.func,
}
