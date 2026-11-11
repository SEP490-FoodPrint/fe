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
          placeholder={
            filters.viewMode === "inventory"
              ? "Tìm theo tên gạo, gia vị, mã mặt hàng, NCC..."
              : "Tìm theo mã phiếu, NCC, thời gian giao..."
          }
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
          label="Danh mục hiển thị"
          value={filters.viewMode}
          onChange={e => onFilterChange("viewMode", e.target.value)}
          className={styles.selectInput}
        >
          <MenuItem value="inventory">Tồn kho gạo &amp; Gia vị</MenuItem>
          <MenuItem value="orders">Phiếu nhập kho (Giao linh hoạt)</MenuItem>
        </TextField>

        {filters.viewMode === "inventory" ? (
          <>
            <TextField
              select
              size="small"
              label="Trạng thái định mức"
              value={filters.status}
              onChange={e => onFilterChange("status", e.target.value)}
              className={styles.selectInput}
              sx={{ minWidth: 260 }}
            >
              <MenuItem value="all">Tất cả trạng thái</MenuItem>
              <MenuItem value="LOW_STOCK">&lt;100% định mức — Cần nhập thêm</MenuItem>
              <MenuItem value="CRITICAL_LOW">&lt;50% định mức — Cần nhập gấp</MenuItem>
              <MenuItem value="SAFE">≥100% định mức — Đủ dùng</MenuItem>
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
          </>
        ) : (
          <>
            <TextField
              select
              size="small"
              label="Thời gian giao hàng"
              value={filters.deliveryType || "all"}
              onChange={e => onFilterChange("deliveryType", e.target.value)}
              className={styles.selectInput}
            >
              <MenuItem value="all">Tất cả thời gian</MenuItem>
              <MenuItem value="OFFICE_HOURS">Giờ hành chính (Sáng/Chiều)</MenuItem>
              <MenuItem value="EVENING">Buổi tối</MenuItem>
              <MenuItem value="WEEKEND">Cuối tuần</MenuItem>
            </TextField>

            <TextField
              select
              size="small"
              label="Trạng thái phiếu"
              value={filters.orderStatus || "all"}
              onChange={e => onFilterChange("orderStatus", e.target.value)}
              className={styles.selectInput}
            >
              <MenuItem value="all">Tất cả trạng thái</MenuItem>
              <MenuItem value="WAITING_DELIVERY">Chờ NCC giao hàng</MenuItem>
              <MenuItem value="COMPLETED">Đã nhập kho hoàn tất</MenuItem>
            </TextField>
          </>
        )}
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
    viewMode: PropTypes.string,
    status: PropTypes.string,
    category: PropTypes.string,
    deliveryType: PropTypes.string,
    orderStatus: PropTypes.string,
  }).isRequired,
  categories: PropTypes.array,
  onFilterChange: PropTypes.func.isRequired,
  onOpenCreate: PropTypes.func,
}
