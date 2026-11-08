import React, { useState } from "react"
import {
  TextField,
  MenuItem,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material"
import { Search, RotateCcw, SlidersHorizontal } from "lucide-react"
import { BATCH_STATUSES } from "src/services/KitchenService/adapter"
import styles from "./CookingBatchesFilter.module.scss"

export default function CookingBatchesFilter({
  filters,
  onChange,
  onRefresh,
  onReset,
  academicYearOptions = [],
  weeks = [],
}) {
  const [expanded, setExpanded] = useState(false)
  const filterCount = [
    filters.academicYear && filters.academicYear !== "2026-2027",
    filters.week && filters.week !== "current" && filters.week !== "all",
    filters.mealType,
    filters.status,
  ].filter(Boolean).length

  const update = (field, value) => onChange({ ...filters, [field]: value })

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
          {/* 1. Năm học */}
          <TextField
            select
            size="small"
            label="Năm học"
            value={filters.academicYear || "2026-2027"}
            onChange={(event) => update("academicYear", event.target.value)}
          >
            {academicYearOptions.map((ay) => (
              <MenuItem key={ay.academicYear} value={ay.academicYear}>
                {ay.label || `Năm học ${ay.academicYear}`}
              </MenuItem>
            ))}
          </TextField>

          {/* 2. Tuần học */}
          <TextField
            select
            size="small"
            label="Tuần học"
            value={filters.week ?? "current"}
            onChange={(event) => update("week", event.target.value)}
          >
            <MenuItem value="all">Tất cả các tuần</MenuItem>
            {weeks.map((w) => (
              <MenuItem key={w.key || w.isoWeek} value={w.isoWeek}>
                {w.label}
              </MenuItem>
            ))}
          </TextField>

          {/* 3. Bữa ăn */}
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

          {/* 4. Trạng thái */}
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

          {/* 5. Nút Làm mới / Đặt lại */}
          <Tooltip title="Đặt lại bộ lọc về tuần này">
            <IconButton
              className={styles.resetBtn}
              aria-label="Đặt lại bộ lọc về tuần này"
              onClick={() => {
                if (onReset) {
                  onReset()
                } else {
                  onChange({
                    search: "",
                    academicYear: "2026-2027",
                    week: "current",
                    mealType: "",
                    cookingModeApplied: "",
                    status: "",
                  })
                }
                onRefresh()
              }}
            >
              <RotateCcw size={18} />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}
