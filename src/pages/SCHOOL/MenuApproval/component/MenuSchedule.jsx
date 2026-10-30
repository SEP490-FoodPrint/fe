import React from "react"
import PropTypes from "prop-types"
import { Button, Card, Chip, Typography } from "@mui/material"
import {
  Apple,
  CalendarRange,
  ChefHat,
  CircleAlert,
  Cookie,
  Utensils,
} from "lucide-react"
import styles from "./MenuSchedule.module.scss"

const dayStatuses = {
  PENDING_APPROVAL: { label: "Chờ duyệt", color: "warning" },
  APPROVED: { label: "Đã duyệt", color: "success" },
  REVISION_REQUIRED: { label: "Yêu cầu điều chỉnh", color: "error" },
  DRAFT: { label: "Bản nháp", color: "default" },
}

function FoodItem({ item, compact = false }) {
  const isAlert = item.tone === "error"
  return (
    <div className={`${styles.foodItem} ${compact ? styles.foodItemCompact : ""}`}>
      <span className={`${styles.foodDot} ${isAlert ? styles.foodDotAlert : ""}`} />
      <div className={styles.foodContent}>
        <div className={styles.foodTitleRow}>
          <Typography component="p" className={styles.foodName}>{item.name}</Typography>
          {item.tag && (
            <Chip
              label={item.tag}
              size="small"
              className={`${styles.foodTag} ${styles[item.tone || "neutral"]}`}
            />
          )}
        </div>
        <Typography component="p" className={styles.foodDescription}>
          {item.description}
        </Typography>
        {item.supplier && (
          <Typography component="p" className={styles.supplier}>{item.supplier}</Typography>
        )}
      </div>
    </div>
  )
}

function DailyMenuCard({ day }) {
  const regularLunch = day.lunch.filter(item => !item.kind)
  const extras = day.lunch.filter(item => item.kind)

  return (
    <Card className={styles.dayCard} elevation={0}>
      <header className={styles.dayHeader}>
        <div className={styles.dayIdentity}>
          <span className={styles.dayNumber}>{day.dayNumber}</span>
          <div>
            <Typography component="h3" className={styles.dayName}>{day.shortLabel}</Typography>
            <Typography className={styles.dayDate}>{day.date}</Typography>
          </div>
        </div>
        <div className={styles.dayMeta}>
          <Chip label={dayStatuses[day.status]?.label || "Chưa xác định"} color={dayStatuses[day.status]?.color || "default"} size="small" variant="outlined" />
          <Chip label={`${(Number(day.portions) || 0).toLocaleString("vi-VN")} suất`} size="small" />
          <Chip label="Bữa trưa + Bữa xế" size="small" className={styles.mealChip} />
        </div>
      </header>

      <div className={styles.dayBody}>
        <section className={styles.lunchSection} aria-label={`Bữa trưa ${day.shortLabel}`}>
          <div className={styles.mealHeading}>
            <span><Utensils size={17} /> Bữa trưa chính</span>
            <small>{day.lunch.length} món</small>
          </div>
          <div className={styles.foodList}>
            {regularLunch.map(item => <FoodItem item={item} key={item.name} />)}
          </div>
          <div className={styles.extrasGrid}>
            {extras.map(item => (
              <div className={styles.extraItem} key={item.name}>
                {item.kind === "dessert" ? <Apple size={17} /> : <ChefHat size={17} />}
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.description}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className={styles.snackSection} aria-label={`Bữa xế ${day.shortLabel}`}>
          <div className={styles.snackHeading}>
            <span><Cookie size={17} /> Bữa xế chiều</span>
            <small>14:30 - 15:00</small>
          </div>
          <div className={styles.snackList}>
            {day.snack.map(item => <FoodItem item={item} compact key={item.name} />)}
          </div>
        </aside>
      </div>
    </Card>
  )
}

function MenuSchedule({ days, visibleDays, activeDay, onDayChange, disabled }) {
  return (
    <section className={styles.wrapper} aria-labelledby="menu-schedule-title">
      <div className={styles.sectionHeader}>
        <div>
          <Typography component="h2" id="menu-schedule-title" className={styles.sectionTitle}>
            <CalendarRange size={21} /> Chi tiết thực đơn từng ngày
          </Typography>
          <Typography className={styles.sectionSubtitle}>
            Chọn Cả tuần để xử lý các ngày còn chờ; chọn từng thứ để chỉ xử lý ngày đó.
          </Typography>
        </div>
        <div className={styles.alertHint}>
          <CircleAlert size={16} /> {days.filter(day => day.status === "APPROVED").length}/{days.length} ngày đã duyệt
        </div>
      </div>

      <div className={styles.tabs} role="tablist" aria-label="Lọc thực đơn theo ngày">
        <Button
          role="tab"
          aria-selected={activeDay === "all"}
          className={activeDay === "all" ? styles.activeTab : styles.tab}
          onClick={() => onDayChange("all")}
          disabled={disabled}
        >
          Cả tuần
        </Button>
        {days.map(day => (
          <Button
            role="tab"
            aria-selected={activeDay === day.id}
            className={activeDay === day.id ? styles.activeTab : styles.tab}
            onClick={() => onDayChange(day.id)}
            disabled={disabled}
            key={day.id}
          >
            {day.shortLabel} · {dayStatuses[day.status]?.label || "Chưa xác định"}
          </Button>
        ))}
      </div>

      <div className={styles.dayList}>
        {visibleDays.map(day => <DailyMenuCard day={day} key={day.id} />)}
      </div>
    </section>
  )
}

FoodItem.propTypes = { item: PropTypes.object.isRequired, compact: PropTypes.bool }
DailyMenuCard.propTypes = { day: PropTypes.object.isRequired }
MenuSchedule.propTypes = {
  days: PropTypes.array.isRequired,
  visibleDays: PropTypes.array.isRequired,
  activeDay: PropTypes.string.isRequired,
  onDayChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
}

export default MenuSchedule
