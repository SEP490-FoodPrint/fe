import React from "react"
import { useNavigate } from "react-router-dom"
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  CookingPot,
  Users,
  Check,
  ArrowRight,
} from "lucide-react"
import { Button } from "@mui/material"
import ROUTER from "src/router/ROUTER"
import styles from "./KitchenMenuHeader.module.scss"

export default function KitchenMenuHeader({
  weekInfo,
  onPrevWeek,
  onNextWeek,
  onCurrentWeek,
  totalDishes = 30,
  portions = 1250,
  mealTypeFilter = "ALL",
  onMealTypeFilterChange,
}) {
  const navigate = useNavigate()

  return (
    <div className={styles.headerContainer}>
      {/* HÀNG 1: Icon Chuông Đậy Món | Tiêu Đề + Huy Hiệu Duyệt BGH */}
      <div className={styles.topRow}>
        <div className={styles.titleGroup}>
          <div className={styles.clocheIconWrap}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.clocheIcon}
            >
              <path d="M18 11a6 6 0 0 0-12 0" />
              <path d="M4 14h16" />
              <path d="M12 4a1 1 0 0 0-1 1v1" />
              <path d="M2 17h20" />
            </svg>
          </div>

          <span className={styles.verticalDivider} />

          <h1 className={styles.heading}>Thực đơn tuần học đường</h1>

          <span className={styles.approvedBadge}>
            <Check size={12} className={styles.checkIcon} />
            <span>Đã duyệt BGH</span>
          </span>
        </div>

        {/* Nút Điều Hướng Sang Lô Chế Biến */}
        <div className={styles.topActions}>
          <Button
            variant="outlined"
            size="small"
            className={styles.actionBtnPrimary}
            onClick={() => navigate(ROUTER.SCHOOL_KITCHEN_BATCHES)}
            endIcon={<ArrowRight size={14} />}
          >
            Lô chế biến
          </Button>
        </div>
      </div>

      {/* HÀNG 2: Bộ Chuyển Tuần Gộp Khung | Bộ Lọc Ca Ăn | Các KPI Inline */}
      <div className={styles.controlRow}>
        <div className={styles.controlLeft}>
          {/* Cụm điều hướng tuần đóng khung đơn gọn gàng */}
          <div className={styles.weekControlBox}>
            <button
              type="button"
              className={styles.weekArrowBtn}
              onClick={onPrevWeek}
              aria-label="Tuần trước"
              title="Tuần trước"
            >
              <ChevronLeft size={16} />
            </button>

            <div
              className={styles.weekCenterBox}
              onClick={onCurrentWeek}
              role="button"
              tabIndex={0}
              title="Bấm để về tuần này"
            >
              <Calendar size={14} className={styles.calIcon} />
              <span className={styles.weekRangeText}>
                {weekInfo?.weekRangeLabel || "Tuần học đường"}
              </span>
            </div>

            <button
              type="button"
              className={styles.weekArrowBtn}
              onClick={onNextWeek}
              aria-label="Tuần sau"
              title="Tuần sau"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <span className={styles.inlineDivider} />

          {/* Bộ lọc Ca ăn (thay thế 10 bữa ăn theo yêu cầu) */}
          <div className={styles.mealFilterSegment} role="group" aria-label="Bộ lọc ca ăn">
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
                mealTypeFilter === "LUNCH" ? styles.filterSegmentLunchActive : ""
              }`}
              onClick={() => onMealTypeFilterChange?.("LUNCH")}
            >
              Bữa trưa
            </button>
            <button
              type="button"
              className={`${styles.filterSegmentBtn} ${
                mealTypeFilter === "AFTERNOON" ? styles.filterSegmentAfternoonActive : ""
              }`}
              onClick={() => onMealTypeFilterChange?.("AFTERNOON")}
            >
              Bữa xế / chiều
            </button>
          </div>

          <span className={styles.inlineDivider} />

          {/* Các KPI hiển thị ngang theo đúng hình mẫu */}
          <div className={styles.kpiInlineGroup}>
            <div className={styles.kpiInlineItem}>
              <CookingPot size={14} className={styles.kpiIcon} />
              <span className={styles.kpiText}>
                <strong>{totalDishes}</strong> món
              </span>
            </div>

            <div className={styles.kpiInlineItem}>
              <Users size={14} className={styles.kpiIcon} />
              <span className={styles.kpiText}>
                <strong>{portions.toLocaleString("vi-VN")}</strong> suất/ngày
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
