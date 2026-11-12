import React from "react"
import PropTypes from "prop-types"
import { Box, TextField, MenuItem, InputAdornment, Button } from "@mui/material"
import { Search, PlusCircle } from "lucide-react"
import styles from "./WarehouseFilterStrip.module.scss"

export default function WarehouseFilterStrip({
  filters,
  categories = [],
  onFilterChange,
  onOpenCreate,
}) {
  return (
    <Box className={styles.filterBar}>
      <Box className={styles.filterInputs}>
        <TextField
          size="small"
          placeholder="Tìm theo tên gạo, gia vị, mã mặt hàng, NCC..."
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
          label="Trạng thái định mức"
          value={filters.status}
          onChange={e => onFilterChange("status", e.target.value)}
          className={styles.selectInput}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="all">Tất cả trạng thái</MenuItem>
          <MenuItem value="CRITICAL_LOW">Dưới 50% tồn kho</MenuItem>
          <MenuItem value="WARNING">Trên 50% tồn kho</MenuItem>
          <MenuItem value="SAFE">Đủ dùng</MenuItem>
        </TextField>

        <TextField
          select
          size="small"
          label="Nhóm hàng"
          value={filters.category}
          onChange={e => onFilterChange("category", e.target.value)}
          className={styles.selectInput}
        >
          <MenuItem value="all">Tất cả nhóm hàng</MenuItem>
          {categories.map(cat => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
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
            Tạo phiếu nhập đồ khô
          </Button>
        </Box>
      )}
    </Box>
  )
}

WarehouseFilterStrip.propTypes = {
  filters: PropTypes.shape({
    search: PropTypes.string,
    status: PropTypes.string,
    category: PropTypes.string,
  }).isRequired,
  categories: PropTypes.array,
  onFilterChange: PropTypes.func.isRequired,
  onOpenCreate: PropTypes.func,
}
