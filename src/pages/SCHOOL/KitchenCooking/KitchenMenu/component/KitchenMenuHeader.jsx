import React from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, ChevronRight, Calendar, ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@mui/material"
import ROUTER from "src/router/ROUTER"
import styles from "./KitchenMenuHeader.module.scss"

export default function KitchenMenuHeader({
  weekInfo,
  onPrevWeek,
  onNextWeek,
  onCurrentWeek,
}) {
  const navigate = useNavigate()

  return (
    <div className={styles.headerContainer}>
      <div className={styles.titleRow}>
        <div className={styles.titleLeft}>
          <div className={styles.headingWrap}>
            <h1 className={styles.heading}>Thực đơn đã lên</h1>
            <span className={styles.approvedBadge}>
              <CheckCircle2 size={13} />
              <span>Đã duyệt BGH</span>
            </span>
          </div>
          <span className={styles.subHint}>
            Kế hoạch chế biến các bữa ăn trong tuần của bếp cơ sở
          </span>
        </div>

        <div className={styles.headerActions}>
          <Button
            variant="outlined"
            size="small"
            className={styles.batchesBtn}
            onClick={() => navigate(ROUTER.SCHOOL_KITCHEN_BATCHES)}
            endIcon={<ArrowRight size={14} />}
          >
            Quản lý lô chế biến
          </Button>
        </div>
      </div>

      {/* Dải điều hướng tuần */}
      <div className={styles.weekNavStrip}>
        <div className={styles.weekControls}>
          <button
            type="button"
            className={styles.navArrowBtn}
            onClick={onPrevWeek}
            aria-label="Tuần trước"
            title="Tuần trước"
          >
            <ChevronLeft size={18} />
          </button>

          <div className={styles.weekInfoBox}>
            <Calendar size={16} className={styles.calendarIcon} />
            <span className={styles.weekRangeText}>
              {weekInfo?.weekRangeLabel || "Tuần học đường"}
            </span>
          </div>

          <button
            type="button"
            className={styles.navArrowBtn}
            onClick={onNextWeek}
            aria-label="Tuần sau"
            title="Tuần sau"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className={styles.quickNavBtns}>
          <button
            type="button"
            className={styles.todayBtn}
            onClick={onCurrentWeek}
          >
            Tuần này
          </button>
        </div>
      </div>
    </div>
  )
}

