import React from "react"
import PropTypes from "prop-types"
import { FormControl, IconButton, MenuItem, Select, Tooltip, Typography } from "@mui/material"
import { Calendar, CalendarRange, ChevronLeft, ChevronRight, Cookie, Users, Utensils } from "lucide-react"
import styles from "./MenuSchedule.module.scss"

const WEEK_STATUS_CONFIG = {
  PENDING_APPROVAL: {
    label: "Chờ duyệt",
    className: styles.statusPending,
  },
  APPROVED: {
    label: "Đã duyệt",
    className: styles.statusApproved,
  },
  REVISION_REQUIRED: {
    label: "Yêu cầu chỉnh sửa",
    className: styles.statusRejected,
  },
  DRAFT: {
    label: "Bản nháp",
    className: styles.statusDraft,
  },
}

// weekStartDate là ngày thứ Hai (YYYY-MM-DD...), tuần học từ thứ Hai đến thứ Sáu
const formatWeekRange = (weekStartDate) => {
  const [year, month, day] = String(weekStartDate).slice(0, 10).split("-").map(Number)
  const start = new Date(Date.UTC(year, month - 1, day))
  const end = new Date(Date.UTC(year, month - 1, day + 4))
  const pad = (value) => String(value).padStart(2, "0")
  const short = (date) => `${pad(date.getUTCDate())}/${pad(date.getUTCMonth() + 1)}`
  return `${short(start)} – ${short(end)}/${end.getUTCFullYear()}`
}

const MEALS = [
  { key: "lunch", label: "Bữa trưa", Icon: Utensils },
  { key: "snack", label: "Bữa xế", Icon: Cookie },
]

function DishCell({ dishes }) {
  if (!dishes.length) return <span className={styles.missing}>Chưa có món</span>

  return (
    <ul className={styles.dishList}>
      {dishes.map((dish, index) => {
        const detail = [dish.description, dish.supplier && `NCC: ${dish.supplier}`]
          .filter(Boolean)
          .join(" · ")
        const sub = dish.substituteDish || dish.substitute
        return (
          <li key={`${dish.name}-${index}`} className={styles.dishListItem}>
            {detail ? (
              <Tooltip title={detail} placement="top" arrow>
                <span className={styles.dishName}>{dish.name}</span>
              </Tooltip>
            ) : (
              <span className={styles.dishName}>{dish.name}</span>
            )}
            {sub && (
              <span className={styles.substituteDishNote}>
                ({sub.name || sub})
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}

// Bảng cả tuần: cột là ngày, hàng là bữa ăn — BGH xem và duyệt toàn bộ thực đơn một lần
function MenuSchedule({ days, weeks, selectedWeekId, onWeekChange, disabled }) {
  const currentIndex = weeks.findIndex((w) => w.id === selectedWeekId)
  // Danh sách weeks được xếp từ mới nhất đến cũ nhất (giảm dần theo ngày)
  // Tuần trước (earlier date, lùi về trước) nằm ở index sau (currentIndex + 1)
  const prevWeek =
    currentIndex >= 0 && currentIndex < weeks.length - 1
      ? weeks[currentIndex + 1]
      : null
  // Tuần kế tiếp (later date, tiến về sau) nằm ở index trước (currentIndex - 1)
  const nextWeek = currentIndex > 0 ? weeks[currentIndex - 1] : null

  return (
    <section className={styles.wrapper} aria-labelledby="menu-schedule-title">
      <div className={styles.sectionHeader}>
        <Typography component="h2" id="menu-schedule-title" className={styles.sectionTitle}>
          <CalendarRange size={21} /> Thực đơn tuần
        </Typography>

        <div className={styles.weekNavigator}>
          <Tooltip title={prevWeek ? `Tuần trước (${formatWeekRange(prevWeek.weekStartDate)})` : ""}>
            <span>
              <IconButton
                size="small"
                disabled={disabled || !prevWeek}
                onClick={() => prevWeek && onWeekChange(prevWeek.id)}
                aria-label="Tuần trước"
                className={styles.navButton}
              >
                <ChevronLeft size={16} />
              </IconButton>
            </span>
          </Tooltip>

          <FormControl size="small" className={styles.weekFormControl}>
            <Select
              value={selectedWeekId || ""}
              onChange={(event) => onWeekChange(event.target.value)}
              disabled={disabled}
              className={styles.weekSelect}
              displayEmpty
              MenuProps={{
                PaperProps: {
                  className: styles.dropdownPaper,
                },
              }}
              renderValue={(selectedId) => {
                const selectedWeek = weeks.find((w) => w.id === selectedId)
                if (!selectedWeek) return "Chọn tuần"
                const st =
                  WEEK_STATUS_CONFIG[selectedWeek.status] || {
                    label: selectedWeek.status,
                    className: styles.statusDraft,
                  }
                return (
                  <div className={styles.selectedValue}>
                    <Calendar size={15} className={styles.calendarIcon} />
                    <span className={styles.weekDateText}>
                      Tuần {formatWeekRange(selectedWeek.weekStartDate)}
                    </span>
                    <span className={`${styles.statusBadge} ${st.className}`}>
                      <span className={styles.statusDot} />
                      {st.label}
                    </span>
                  </div>
                )
              }}
            >
              {weeks.map((week) => {
                const st =
                  WEEK_STATUS_CONFIG[week.status] || {
                    label: week.status,
                    className: styles.statusDraft,
                  }
                return (
                  <MenuItem
                    key={week.id}
                    value={week.id}
                    className={styles.menuItem}
                  >
                    <span className={styles.menuItemText}>
                      Tuần {formatWeekRange(week.weekStartDate)}
                    </span>
                    <span className={`${styles.statusBadge} ${st.className}`}>
                      <span className={styles.statusDot} />
                      {st.label}
                    </span>
                  </MenuItem>
                )
              })}
            </Select>
          </FormControl>

          <Tooltip title={nextWeek ? `Tuần kế tiếp (${formatWeekRange(nextWeek.weekStartDate)})` : ""}>
            <span>
              <IconButton
                size="small"
                disabled={disabled || !nextWeek}
                onClick={() => nextWeek && onWeekChange(nextWeek.id)}
                aria-label="Tuần kế tiếp"
                className={styles.navButton}
              >
                <ChevronRight size={16} />
              </IconButton>
            </span>
          </Tooltip>
        </div>
      </div>

      <div className={styles.scroller}>
        <table className={styles.grid}>
          <thead>
            <tr>
              <th scope="col" className={styles.corner} aria-label="Bữa ăn" />
              {days.map((day) => (
                <th scope="col" key={day.id} className={styles.dayHead}>
                  <span className={styles.dayName}>{day.shortLabel}</span>
                  <span className={styles.dayDate}>{day.date}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MEALS.map(({ key, label, Icon }) => (
              <tr key={key}>
                <th scope="row" className={styles.mealHead}>
                  <Icon size={16} /> {label}
                </th>
                {days.map((day) => (
                  <td key={day.id} className={day[key].length ? undefined : styles.emptyCell}>
                    <DishCell dishes={day[key]} />
                  </td>
                ))}
              </tr>
            ))}
            <tr className={styles.portionRow}>
              <th scope="row" className={styles.mealHead}>
                <Users size={16} /> Số suất
              </th>
              {days.map((day) => (
                <td key={day.id}>{(Number(day.portions) || 0).toLocaleString("vi-VN")}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}

DishCell.propTypes = { dishes: PropTypes.array.isRequired }
MenuSchedule.propTypes = {
  days: PropTypes.array.isRequired,
  weeks: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedWeekId: PropTypes.string,
  onWeekChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
}

export default MenuSchedule