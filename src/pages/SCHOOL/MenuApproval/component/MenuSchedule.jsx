import React from "react"
import PropTypes from "prop-types"
import { Tooltip, Typography } from "@mui/material"
import { CalendarRange, Cookie, Users, Utensils } from "lucide-react"
import styles from "./MenuSchedule.module.scss"

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
function MenuSchedule({ days }) {
  const missingCount = days.reduce(
    (count, day) => count + MEALS.filter(meal => !day[meal.key].length).length,
    0,
  )

  return (
    <section className={styles.wrapper} aria-labelledby="menu-schedule-title">
      <div className={styles.sectionHeader}>
        <Typography component="h2" id="menu-schedule-title" className={styles.sectionTitle}>
          <CalendarRange size={21} /> Thực đơn tuần
        </Typography>
        {missingCount > 0 && (
          <span className={styles.missingHint}>{missingCount} bữa chưa có món</span>
        )}
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
MenuSchedule.propTypes = { days: PropTypes.array.isRequired }

export default MenuSchedule
