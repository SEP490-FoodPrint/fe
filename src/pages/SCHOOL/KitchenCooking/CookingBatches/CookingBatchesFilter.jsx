import React, { useState } from "react"
import {
  TextField,
  MenuItem,
  InputAdornment,
  IconButton,
  Tooltip,
  Button,
} from "@mui/material"
import { Search, RotateCcw, SlidersHorizontal } from "lucide-react"
import {
  BATCH_STATUSES,
  COOKING_MODES,
  EMPTY_BATCH_FILTERS,
  localDateISO,
} from "src/services/KitchenService/adapter"
import styles from "./CookingBatchesFilter.module.scss"

export default function CookingBatchesFilter({ filters, onChange, onRefresh }) {
  const [expanded, setExpanded] = useState(false)
  const filterCount = [
    filters.date,
    filters.mealType,
    filters.status,
  ].filter(Boolean).length
  const update = (field, value) => onChange({ ...filters, [field]: value })
  const today = localDateISO()
  const chips = [
    {
      id: "all",
      label: "Tất cả",
      active: !Object.entries(filters).some(([key, value]) =>
        key === "search" ? value.trim() : value,
      ),
      apply: () => onChange({ ...EMPTY_BATCH_FILTERS }),
    },
    {
      id: "today",
      label: "Hôm nay",
      active: filters.date === today,
      apply: () => update("date", filters.date === today ? "" : today),
    },
    ...Object.entries(BATCH_STATUSES).map(([value, label]) => ({
      id: value,
      label,
      active: filters.status === value,
      apply: () => update("status", filters.status === value ? "" : value),
    })),
  ]
  return (
    <div className={styles.filterSection}>
      <div className={styles.filterBar}>
        <TextField
          className={styles.searchField}
          size="small"
          label="Tìm lô chế biến"
          placeholder="Tên món, mã lô hoặc số suất"
          value={filters.search}
          onChange={(event) => update("search", event.target.value)}
          slotProps={{
            htmlInput: { maxLength: 100 },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={17} aria-hidden="true" />
                </InputAdornment>
              ),
            },
          }}
        />
        <Tooltip title="Bộ lọc">
          <IconButton
            className={styles.mobileToggle}
            aria-label={`Bộ lọc${filterCount ? `, ${filterCount} điều kiện đang chọn` : ""}`}
            aria-expanded={expanded}
            aria-controls="cooking-batch-filter-fields"
            onClick={() => setExpanded((value) => !value)}
          >
            <SlidersHorizontal size={19} />
            {filterCount > 0 && (
              <span className={styles.filterCount}>{filterCount}</span>
            )}
          </IconButton>
        </Tooltip>
        <div
          id="cooking-batch-filter-fields"
          className={`${styles.filterControls} ${expanded ? styles.controlsExpanded : ""}`}
        >
          <TextField
            size="small"
            type="date"
            label="Ngày thực đơn"
            value={filters.date}
            onChange={(event) => update("date", event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            select
            size="small"
            label="Bữa ăn"
            value={filters.mealType}
            onChange={(event) => update("mealType", event.target.value)}
          >
            <MenuItem value="">Tất cả bữa ăn</MenuItem>
            <MenuItem value="LUNCH">Bữa trưa</MenuItem>
            <MenuItem value="AFTERNOON">Bữa xế</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            label="Trạng thái"
            value={filters.status}
            onChange={(event) => update("status", event.target.value)}
          >
            <MenuItem value="">Tất cả trạng thái</MenuItem>
            {Object.entries(BATCH_STATUSES).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>
          <Tooltip title="Xóa bộ lọc và tải lại">
            <IconButton
              className={styles.resetBtn}
              aria-label="Xóa bộ lọc và tải lại"
              onClick={() => {
                onChange({ ...EMPTY_BATCH_FILTERS })
                onRefresh()
              }}
            >
              <RotateCcw size={18} />
            </IconButton>
          </Tooltip>
        </div>
      </div>
      <div
        className={styles.chipsRow}
        role="group"
        aria-label="Bộ lọc nhanh lô chế biến"
      >
        {chips.map((chip) => (
          <Button
            key={chip.id}
            className={styles.chipBtn}
            variant={chip.active ? "contained" : "outlined"}
            aria-pressed={chip.active}
            onClick={chip.apply}
          >
            {chip.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
