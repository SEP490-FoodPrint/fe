import React from "react"
import PropTypes from "prop-types"
import { MenuItem, TextField, Tooltip, Typography } from "@mui/material"
import { CalendarRange, Cookie, Users, Utensils } from "lucide-react"
import styles from "./MenuSchedule.module.scss"

const WEEK_STATUS_LABEL = {
  PENDING_APPROVAL: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REVISION_REQUIRED: "Yêu cầu điều chỉnh",
}

// weekStartDate là ngày thứ Hai (YYYY-MM-DD...), tuần học từ thứ Hai đến thứ Sáu
const formatWeekRange = weekStartDate => {
  const [year, month, day] = String(weekStartDate).slice(0, 10).split("-").map(Number)
  const start = new Date(Date.UTC(year, month - 1, day))
  const end = new Date(Date.UTC(year, month - 1, day + 4))
  const pad = value => String(value).padStart(2, "0")
  const short = date => `${pad(date.getUTCDate())}/${pad(date.getUTCMonth() + 1)}`
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
        return (
          <li key={`${dish.name}-${index}`}>
            {detail ? (
              <Tooltip title={detail} placement="top" arrow>
                <span className={styles.dishName}>{dish.name}</span>
              </Tooltip>
            ) : (
              <span className={styles.dishName}>{dish.name}</span>
            )}
          </li>
        )
      })}
    </ul>
  )
}

// Bảng cả tuần: cột là ngày, hàng là bữa ăn — BGH xem và duyệt toàn bộ thực đơn một lần
function MenuSchedule({ days, weeks, selectedWeekId, onWeekChange, disabled }) {
  return (
    <section className={styles.wrapper} aria-labelledby="menu-schedule-title">
      <div className={styles.sectionHeader}>
        <Typography component="h2" id="menu-schedule-title" className={styles.sectionTitle}>
          <CalendarRange size={21} /> Thực đơn tuần
        </Typography>
        <TextField
          select
          size="small"
          label="Tuần thực đơn"
          value={selectedWeekId || ""}
          onChange={event => onWeekChange(event.target.value)}
          disabled={disabled}
          className={styles.weekSelect}
        >
          {weeks.map(week => (
            <MenuItem key={week.id} value={week.id}>
              Tuần {formatWeekRange(week.weekStartDate)} · {WEEK_STATUS_LABEL[week.status] || week.status}
            </MenuItem>
          ))}
        </TextField>
      </div>

      <div className={styles.scroller}>
        <table className={styles.grid}>
          <thead>
            <tr>
              <th scope="col" className={styles.corner} aria-label="Bữa ăn" />
              {days.map(day => (
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
                {days.map(day => (
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
              {days.map(day => (
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
