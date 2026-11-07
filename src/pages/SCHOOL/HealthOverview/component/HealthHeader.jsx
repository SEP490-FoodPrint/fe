import React from "react"
import { useNavigate } from "react-router-dom"
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined"
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined"
import ROUTER from "src/router/ROUTER"
import styles from "./HealthHeader.module.scss"

export default function HealthHeader() {
  const navigate = useNavigate()
  const dateStr = "Thứ Hai, 24/10/2026"

  return (
    <header className={styles.header}>
      <div className={styles.leftCol}>
        <h1 className={styles.title}>Tổng quan Ban Y tế</h1>
      </div>

      <div className={styles.rightGroup}>
        <button
          type="button"
          className={styles.dishCatalogBtn}
          onClick={() => navigate(ROUTER.SCHOOL_DISH_CATALOG)}
          title="Mở Danh sách món ăn"
        >
          <MenuBookOutlinedIcon className={styles.btnIcon} />
          <span>Danh sách món ăn</span>
        </button>

        <div className={styles.dateBadge}>
          <CalendarTodayOutlinedIcon className={styles.dateIcon} />
          <span>{dateStr}</span>
        </div>
      </div>
    </header>
  )
}
