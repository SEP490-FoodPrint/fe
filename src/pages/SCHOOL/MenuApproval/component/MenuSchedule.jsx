import React from "react"
import PropTypes from "prop-types"
import { Tooltip } from "@mui/material"
import { Cookie, Users, Utensils } from "lucide-react"
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

// Bảng cả tuần của một thực đơn: cột là ngày, hàng là bữa ăn
function MenuSchedule({ days, label }) {
  if (!days.length) return <p className={styles.missing}>Thực đơn chưa có ngày ăn.</p>

  return (
    <div className={styles.scroller}>
      <table className={styles.grid} aria-label={label}>
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
          {MEALS.map(({ key, label: mealLabel, Icon }) => (
            <tr key={key}>
              <th scope="row" className={styles.mealHead}>
                <Icon size={16} /> {mealLabel}
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
  )
}

DishCell.propTypes = { dishes: PropTypes.array.isRequired }
MenuSchedule.propTypes = {
  days: PropTypes.array.isRequired,
  label: PropTypes.string,
}

export default MenuSchedule
