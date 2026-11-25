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
          select
          size="small"
          label="Thời gian giao"
          value={filters.timeScope || "today_forward"}
          onChange={e => onFilterChange("timeScope", e.target.value)}
          className={styles.selectInput}
        >
          <MenuItem value="today_forward">Sắp tới</MenuItem>
          <MenuItem value="all">Tất cả các ngày</MenuItem>
          <MenuItem value="past">Đã qua</MenuItem>
        </TextField>

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
          <MenuItem value="REJECTED">Bị từ chối / Giao lại</MenuItem>
          <MenuItem value="CANCELLED">Đã hủy</MenuItem>
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
            Tạo yêu cầu nhập hàng
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
    timeScope: PropTypes.string,
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onResetFilters: PropTypes.func.isRequired,
  onOpenCreate: PropTypes.func,
}
