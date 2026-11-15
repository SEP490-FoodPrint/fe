import React from "react"
import PropTypes from "prop-types"
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  GraduationCap,
  CalendarDays,
  CookingPot,
  Check,
  ArrowRight,
  Utensils,
} from "lucide-react"
import { Button, NativeSelect } from "@mui/material"
import styles from "./KitchenMenuHeader.module.scss"

export default function KitchenMenuHeader({
  menuTitle = "Thực đơn tuần",
  targetScope = "Toàn trường (Khối 1 – 5)",
  academicYear = "",
  approved = false,
  academicYearOptions = [],
  onAcademicYearChange,
  week,
  weeks = [],
  onWeekChange,
  onPrevWeek,
  onNextWeek,
  isFirstWeek = false,
  isLastWeek = false,
  totalDishes = 0,
  mealTypeFilter = "ALL",
  onMealTypeFilterChange,
  gradeOptions = [],
  gradeId = "",
  onGradeChange,
  gradeLoading = false,
  gradeError = "",
  onOpenBatches,
}) {

  return (
    <div className={styles.headerContainer}>
      {/* HÀNG 1: Tiêu đề động & Khối lớp & Huy hiệu Đã duyệt BGH & Phím tắt Lô chế biến */}
      <div className={styles.topRow}>
        <div className={styles.titleGroup}>
          <div className={styles.clocheIconWrap}>
            <Utensils size={16} className={styles.clocheIcon} />
          </div>

          <span className={styles.verticalDivider} />

          <h1 className={styles.heading}>{menuTitle || "Thực đơn tuần"}</h1>

          {approved && (
            <span className={styles.approvedBadge}>
              <Check size={12} className={styles.checkIcon} />
              <span>Đã duyệt BGH</span>
            </span>
          )}

          {targetScope && (
            <span className={styles.targetScopeBadge} title="Khối lớp áp dụng">
              • {targetScope}
            </span>
          )}
        </div>

        {/* Nút Điều Hướng Sang Lô Chế Biến */}
        <div className={styles.topActions}>
          <Button
            variant="outlined"
            size="small"
            className={styles.actionBtnPrimary}
            onClick={onOpenBatches}
            endIcon={<ArrowRight size={14} />}
          >
            Lô chế biến
          </Button>
        </div>
      </div>

      {/* Bộ lọc Năm học | Tuần | Khối | Ca ăn | Tổng số món */}
      <div className={styles.controlRow}>
        <div className={styles.controlLeft}>
          {/* 1. Bộ lọc Năm học (đồng bộ từ thiết lập BGH) */}
          <div className={styles.selectWrapperAcademicYear}>
            <GraduationCap size={15} className={styles.selectIcon} />
            <select
              className={styles.selectInput}
              value={academicYear}
              onChange={(e) => onAcademicYearChange?.(e.target.value)}
              title="Chọn năm học"
            >
              {academicYearOptions.map((ay) => (
                <option key={ay.academicYear} value={ay.academicYear}>
                  {ay.label || `Năm học ${ay.academicYear}`}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className={styles.chevronIcon} />
          </div>

          {/* 2. Cụm điều hướng tuần học đường: Nút < + Dropdown chọn tuần + Nút > */}
          <div className={styles.weekControlBox}>
            <button
              type="button"
              className={styles.weekArrowBtn}
              onClick={onPrevWeek}
              disabled={isFirstWeek}
              aria-label="Tuần trước"
              title="Tuần trước"
            >
              <ChevronLeft size={16} />
            </button>

            <div className={styles.weekSelectMiddle}>
              <CalendarDays size={14} className={styles.selectIconMiddle} />
              <select
                className={styles.selectInputMiddle}
                value={String(week)}
                onChange={(e) => onWeekChange?.(Number(e.target.value))}
                title="Chọn tuần học trong năm học"
              >
                {weeks.map((w) => (
                  <option key={w.key || w.isoWeek} value={w.isoWeek}>
                    {w.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className={styles.chevronIconMiddle} />
            </div>

            <button
              type="button"
              className={styles.weekArrowBtn}
              onClick={onNextWeek}
              disabled={isLastWeek}
              aria-label="Tuần sau"
              title="Tuần sau"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <span className={styles.inlineDivider} />

          {/* 4. Bộ lọc Ca ăn (Tất cả / Bữa trưa / Bữa xế) */}
          <div className={styles.selectWrapperScope}>
            <GraduationCap size={15} className={styles.selectIcon} />
            <NativeSelect
              className={styles.scopeControl}
              value={gradeId}
              onChange={(event) => onGradeChange?.(event.target.value)}
              disabled={gradeLoading}
              disableUnderline
              inputProps={{ "aria-label": "Lọc thực đơn theo khối" }}
            >
              <option value="">
                {gradeLoading ? "Đang tải khối…" : "Tất cả khối"}
              </option>
              {gradeOptions.map((grade) => (
                <option key={grade.id} value={grade.id}>
                  {grade.name}
                </option>
              ))}
              {!gradeLoading && !gradeOptions.length && (
                <option disabled>
                  {gradeError ? "Chưa tải được khối" : "Chưa cấu hình khối"}
                </option>
              )}
            </NativeSelect>
          </div>

          <div
            className={styles.mealFilterSegment}
            role="group"
            aria-label="Bộ lọc ca ăn"
          >
            <button
              type="button"
              className={`${styles.filterSegmentBtn} ${
                mealTypeFilter === "ALL" ? styles.filterSegmentBtnActive : ""
              }`}
              onClick={() => onMealTypeFilterChange?.("ALL")}
            >
              Tất cả
            </button>
            <button
              type="button"
              className={`${styles.filterSegmentBtn} ${
                mealTypeFilter === "LUNCH"
                  ? styles.filterSegmentLunchActive
                  : ""
              }`}
              onClick={() => onMealTypeFilterChange?.("LUNCH")}
            >
              Bữa trưa
            </button>
            <button
              type="button"
              className={`${styles.filterSegmentBtn} ${
                mealTypeFilter === "AFTERNOON"
                  ? styles.filterSegmentAfternoonActive
                  : ""
              }`}
              onClick={() => onMealTypeFilterChange?.("AFTERNOON")}
            >
              Bữa xế / chiều
            </button>
          </div>

          <span className={styles.inlineDivider} />

          {/* 5. KPI thống kê tổng số món */}
          <div className={styles.kpiInlineGroup}>
            <div className={styles.kpiInlineItem}>
              <CookingPot size={14} className={styles.kpiIcon} />
              <span className={styles.kpiText}>
                <strong>{totalDishes}</strong> món
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

KitchenMenuHeader.propTypes = {
  menuTitle: PropTypes.string,
  targetScope: PropTypes.string,
  academicYear: PropTypes.string,
  academicYearOptions: PropTypes.array,
  onAcademicYearChange: PropTypes.func,
  week: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  weeks: PropTypes.array,
  onWeekChange: PropTypes.func,
  onPrevWeek: PropTypes.func,
  onNextWeek: PropTypes.func,
  isFirstWeek: PropTypes.bool,
  isLastWeek: PropTypes.bool,
  totalDishes: PropTypes.number,
  mealTypeFilter: PropTypes.string,
  onMealTypeFilterChange: PropTypes.func,
  gradeOptions: PropTypes.array,
  gradeId: PropTypes.string,
  onGradeChange: PropTypes.func,
  gradeLoading: PropTypes.bool,
  gradeError: PropTypes.string,
  onOpenBatches: PropTypes.func,
}
