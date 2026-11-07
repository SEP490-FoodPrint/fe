import React from "react"
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined"
import styles from "./HealthHeader.module.scss"

export default function HealthHeader() {
  const dateStr = "Thứ Hai, 24/10/2026"

  return (
    <header className={styles.header}>
      <div className={styles.leftCol}>
        <h1 className={styles.title}>Tổng quan Ban Y tế</h1>
      </div>

      <div className={styles.rightGroup}>
        <div className={styles.dateBadge}>
          <CalendarTodayOutlinedIcon className={styles.dateIcon} />
          <span>{dateStr}</span>
        </div>
      </div>
    </header>
  )
}
