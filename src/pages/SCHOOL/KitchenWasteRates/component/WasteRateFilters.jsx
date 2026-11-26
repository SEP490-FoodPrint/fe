import React from "react"
import PropTypes from "prop-types"
import { Button, InputAdornment, MenuItem, TextField } from "@mui/material"
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined"
import styles from "./WasteRateFilters.module.scss"

export const EMPTY_FILTERS = { search: "", handlingType: "", rate: "" }

function WasteRateFilters({ filters, onChange, unsavedCount }) {
  const update = field => event =>
    onChange({ ...filters, [field]: event.target.value })
  const filtering = Object.values(filters).some(Boolean)

  return (
    <div className={styles.filters} role="search">
      <TextField
        className={styles.search}
        size="small"
        placeholder="Tìm nguyên liệu"
        value={filters.search}
        onChange={update("search")}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlinedIcon fontSize="small" />
              </InputAdornment>
            ),
          },
          htmlInput: { "aria-label": "Tìm nguyên liệu", maxLength: 100 },
        }}
      />
      <TextField
        select
        className={styles.select}
        size="small"
        value={filters.handlingType}
        onChange={update("handlingType")}
        slotProps={{
          select: { displayEmpty: true },
          htmlInput: { "aria-label": "Lọc theo loại" },
        }}
      >
        <MenuItem value="">Tất cả loại</MenuItem>
        <MenuItem value="DIRECT_USE">Đồ tươi</MenuItem>
        <MenuItem value="DRY_STOCK">Đồ lưu kho</MenuItem>
      </TextField>
      <TextField
        select
        className={styles.select}
        size="small"
        value={filters.rate}
        onChange={update("rate")}
        slotProps={{
          select: { displayEmpty: true },
          htmlInput: { "aria-label": "Lọc theo hao hụt" },
        }}
      >
        <MenuItem value="">Tất cả mức hao hụt</MenuItem>
        <MenuItem value="WITH">Có hao hụt</MenuItem>
        <MenuItem value="ZERO">Bằng 0%</MenuItem>
        <MenuItem value="UNSAVED">Chưa lưu ({unsavedCount})</MenuItem>
      </TextField>
      {filtering && (
        <Button
          className={styles.reset}
          onClick={() => onChange(EMPTY_FILTERS)}
        >
          Xóa lọc
        </Button>
      )}
    </div>
  )
}

WasteRateFilters.propTypes = {
  filters: PropTypes.shape({
    search: PropTypes.string.isRequired,
    handlingType: PropTypes.string.isRequired,
    rate: PropTypes.string.isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  unsavedCount: PropTypes.number.isRequired,
}

export default WasteRateFilters
