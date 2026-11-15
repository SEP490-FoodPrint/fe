import React from "react"
import { Button, NativeSelect } from "@mui/material"
import {
  Search,
  GraduationCap,
  CalendarDays,
  Utensils,
  RotateCcw,
  X,
  ChevronDown,
} from "lucide-react"
import styles from "./MenuListFilterStrip.module.scss"

export default function MenuListFilterStrip({
  filters,
  onChangeFilter,
  onResetFilters,
  academicYearOptions = [],
  weeks = [],
  gradeOptions = [],
  gradeLoading = false,
  gradeError = "",
  onRetryGrades,
}) {
  const {
    searchKeyword = "",
    academicYear = "",
    week = "",
    mealType = "all",
    gradeId = "",
  } = filters

  return (
    <>
      <div className={styles.filterStrip} role="region" aria-label="Bộ lọc danh sách thực đơn">
        {/* Search */}
        <div className={styles.searchWrapper}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Tìm tên món ăn, thực đơn hoặc mã TD..."
            value={searchKeyword}
            onChange={(e) => onChangeFilter("searchKeyword", e.target.value)}
          />
          {searchKeyword && (
            <button
              type="button"
              className={styles.clearSearchBtn}
              onClick={() => onChangeFilter("searchKeyword", "")}
              title="Xóa tìm kiếm"
              aria-label="Xóa từ khóa tìm kiếm"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Divider */}
        <span className={styles.divider} />

        {/* Năm học */}
        <div className={styles.selectWrapper} style={{ "--sel-w": "148px" }}>
          <GraduationCap size={14} className={styles.selIcon} />
          <select
            className={styles.sel}
            value={academicYear}
            onChange={(e) => onChangeFilter("academicYear", e.target.value)}
            disabled={academicYearOptions.length === 0}
            title="Chọn năm học"
          >
            {academicYearOptions.length === 0 && <option value="">Chưa có năm học</option>}
            {academicYearOptions.map((ay) => (
              <option key={ay.academicYear} value={ay.academicYear}>
                {ay.label || `Năm học ${ay.academicYear}`}
              </option>
            ))}
          </select>
          <ChevronDown size={13} className={styles.selChevron} />
        </div>

        {/* Tuần */}
        <div className={styles.selectWrapper} style={{ "--sel-w": "190px" }}>
          <CalendarDays size={14} className={styles.selIcon} />
          <select
            className={styles.sel}
            value={String(week)}
            onChange={(e) => onChangeFilter("week", e.target.value)}
            disabled={weeks.length === 0}
            title="Chọn tuần học"
          >
            {weeks.length === 0 && <option value="">Chưa có tuần học</option>}
            {weeks.map((w) => (
              <option key={w.weekStartDate} value={w.weekStartDate}>{w.label}</option>
            ))}
          </select>
          <ChevronDown size={13} className={styles.selChevron} />
        </div>

        {/* Khối */}
        <div className={styles.selectWrapper} style={{ "--sel-w": "140px" }}>
          <GraduationCap size={14} className={styles.selIcon} />
          <NativeSelect
            className={styles.gradeControl}
            value={gradeId}
            disabled={gradeLoading}
            onChange={(e) => onChangeFilter("gradeId", e.target.value)}
            disableUnderline
            IconComponent={() => null}
            inputProps={{ className: styles.sel, "aria-label": "Lọc theo khối" }}
          >
            <option value="">{gradeLoading ? "Đang tải…" : "Tất cả khối"}</option>
            {gradeOptions.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
            {!gradeLoading && !gradeError && !gradeOptions.length && (
              <option disabled>Chưa cấu hình khối</option>
            )}
          </NativeSelect>
          <ChevronDown size={13} className={styles.selChevron} />
        </div>

        {/* Ca ăn */}
        <div className={styles.selectWrapper} style={{ "--sel-w": "118px" }}>
          <Utensils size={14} className={styles.selIcon} />
          <select
            className={styles.sel}
            value={mealType}
            onChange={(e) => onChangeFilter("mealType", e.target.value)}
            title="Chọn ca ăn"
          >
            <option value="all">Tất cả ca</option>
            <option value="LUNCH">Bữa trưa</option>
            <option value="AFTERNOON">Bữa xế</option>
          </select>
          <ChevronDown size={13} className={styles.selChevron} />
        </div>

        {/* Reset */}
        <button
          type="button"
          className={styles.resetBtn}
          onClick={onResetFilters}
          title="Đặt lại bộ lọc"
          aria-label="Đặt lại bộ lọc"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {gradeError && (
        <div className={styles.gradeError} role="alert">
          <span>{gradeError}</span>
          <Button size="small" onClick={onRetryGrades}>Thử lại</Button>
        </div>
      )}
    </>
  )
}
