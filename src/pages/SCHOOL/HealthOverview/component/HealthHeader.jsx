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
        <p className={styles.subtitle}>
          Theo dõi thực đơn, kho món ăn chuẩn hóa, thông tin dị ứng học sinh và đánh giá giao nhận.
        </p>
      </div>

      <div className={styles.rightGroup}>
        <button
          type="button"
          className={styles.dishCatalogBtn}
          onClick={() => navigate(ROUTER.SCHOOL_DISH_CATALOG)}
          title="Mở Kho Món Ăn Master Data"
        >
          <MenuBookOutlinedIcon className={styles.btnIcon} />
          <span>Kho Món Ăn</span>
        </button>

        <div className={styles.dateBadge}>
          <CalendarTodayOutlinedIcon className={styles.dateIcon} />
          <span>{dateStr}</span>
        </div>
      </div>
    </header>
  )
}
