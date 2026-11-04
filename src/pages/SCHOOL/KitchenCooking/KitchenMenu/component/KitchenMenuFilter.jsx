import React from "react"
import { Search, RotateCcw, Utensils, Coffee, Layers } from "lucide-react"
import { TextField, InputAdornment, IconButton, Tooltip } from "@mui/material"
import styles from "./KitchenMenuFilter.module.scss"

export default function KitchenMenuFilter({
  search,
  onSearchChange,
  mealTypeFilter,
  onMealTypeChange,
  categoryFilter,
  onCategoryChange,
  onReset,
  totalDishesCount = 0,
}) {
  return (
    <div className={styles.filterBar}>
      {/* 1. Thanh tìm kiếm món */}
      <div className={styles.searchWrapper}>
        <TextField
          size="small"
          placeholder="Tìm tên món ăn (ví dụ: Thịt gà, Canh bí, Bánh bao...)"
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

      {/* 2. Lọc theo ca ăn (Segmented buttons) */}
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

      {/* 3. Lọc theo nhóm món */}
      <div className={styles.categorySelectWrap}>
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          className={styles.categorySelect}
          aria-label="Lọc theo nhóm món ăn"
        >
          <option value="ALL">Tất cả nhóm món</option>
          <option value="MAIN">Món chính</option>
          <option value="SOUP">Món canh</option>
          <option value="SIDE">Món xào / Đạm phụ</option>
          <option value="STAPLE">Cơm / Bánh mì</option>
          <option value="DESSERT">Tráng miệng</option>
          <option value="SNACK">Bữa phụ xế</option>
        </select>
      </div>

      {/* 4. Reset & Tổng số món */}
      <div className={styles.filterMeta}>
        <span className={styles.totalBadge}>
          {totalDishesCount} món ăn
        </span>

        {(search || mealTypeFilter !== "ALL" || categoryFilter !== "ALL") && (
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

