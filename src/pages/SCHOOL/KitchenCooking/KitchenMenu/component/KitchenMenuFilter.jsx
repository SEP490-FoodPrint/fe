import React from "react"
import { Search, RotateCcw, Utensils, Coffee, Layers } from "lucide-react"
import { TextField, InputAdornment, IconButton, Tooltip } from "@mui/material"
import styles from "./KitchenMenuFilter.module.scss"

export default function KitchenMenuFilter({
  search,
  onSearchChange,
  mealTypeFilter,
  onMealTypeChange,
  onReset,
  totalDishesCount = 0,
}) {
  const isFiltering = Boolean(search || mealTypeFilter !== "ALL")

  return (
    <div className={styles.filterBar}>
      {/* 1. Thanh tìm kiếm món */}
      <div className={styles.searchWrapper}>
        <TextField
          size="small"
          placeholder="Tìm tên món ăn (ví dụ: Thịt gà, Canh bí, Phở bò...)"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className={styles.searchField}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={16} className={styles.searchIcon} />
                </InputAdornment>
              ),
            },
          }}
        />
      </div>

      {/* 2. Lọc theo ca ăn (Segmented buttons - chuẩn 100% trường MealType DB) */}
      <div className={styles.segmentedGroup}>
        <button
          type="button"
          className={`${styles.segmentBtn} ${
            mealTypeFilter === "ALL" ? styles.segmentActive : ""
          }`}
          onClick={() => onMealTypeChange("ALL")}
        >
          <Layers size={14} />
          <span>Tất cả</span>
        </button>

        <button
          type="button"
          className={`${styles.segmentBtn} ${
            mealTypeFilter === "LUNCH" ? styles.segmentActive : ""
          }`}
          onClick={() => onMealTypeChange("LUNCH")}
        >
          <Utensils size={14} />
          <span>Bữa trưa</span>
        </button>

        <button
          type="button"
          className={`${styles.segmentBtn} ${
            mealTypeFilter === "AFTERNOON" ? styles.segmentActive : ""
          }`}
          onClick={() => onMealTypeChange("AFTERNOON")}
        >
          <Coffee size={14} />
          <span>Bữa xế</span>
        </button>
      </div>

      {/* 3. Reset & Tổng số món */}
      <div className={styles.filterMeta}>
        <span className={styles.totalBadge}>
          {totalDishesCount} món ăn
        </span>

        {isFiltering && (
          <Tooltip title="Đặt lại bộ lọc" arrow>
            <IconButton
              size="small"
              className={styles.resetBtn}
              onClick={onReset}
              aria-label="Đặt lại bộ lọc"
            >
              <RotateCcw size={16} />
            </IconButton>
          </Tooltip>
        )}
      </div>
    </div>
  )
}
