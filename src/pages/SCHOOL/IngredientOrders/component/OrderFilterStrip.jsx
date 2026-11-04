import React from "react"
import PropTypes from "prop-types"
import { Box, TextField, MenuItem, InputAdornment, Button } from "@mui/material"
import { Search, RotateCcw } from "lucide-react"
import styles from "./OrderFilterStrip.module.scss"

export default function OrderFilterStrip({
  filters,
  onFilterChange,
  onResetFilters,
  suppliers = [],
}) {
  return (
    <Box className={styles.filterBar}>
      <Box className={styles.filterInputs}>
        <TextField
          size="small"
          placeholder="Tìm theo tên nguyên liệu, danh mục hoặc nhà cung cấp..."
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
          label="Phân loại kho"
          value={filters.handlingType}
          onChange={e => onFilterChange("handlingType", e.target.value)}
          className={styles.selectInput}
        >
          <MenuItem value="all">Tất cả phân loại</MenuItem>
          <MenuItem value="DIRECT_USE">Tươi sống (Dùng trong ngày)</MenuItem>
          <MenuItem value="DRY_STOCK">Kho khô (Lưu kho dài ngày)</MenuItem>
        </TextField>

        <TextField
          select
          size="small"
          label="Nhà cung cấp"
          value={filters.supplierId}
          onChange={e => onFilterChange("supplierId", e.target.value)}
          className={styles.selectInput}
        >
          <MenuItem value="all">Tất cả nhà cung cấp</MenuItem>
          {suppliers.map(sup => (
            <MenuItem key={sup.id} value={sup.id}>
              {sup.name}
            </MenuItem>
          ))}
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

OrderFilterStrip.propTypes = {
  filters: PropTypes.shape({
    search: PropTypes.string,
    handlingType: PropTypes.string,
    supplierId: PropTypes.string,
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onResetFilters: PropTypes.func.isRequired,
  suppliers: PropTypes.array,
}
