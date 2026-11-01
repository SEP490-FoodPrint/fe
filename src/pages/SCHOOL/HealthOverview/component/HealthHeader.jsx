import React from "react"
import { useNavigate } from "react-router-dom"
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import ROUTER from "src/router/ROUTER"
import styles from "./HealthHeader.module.scss"

export default function HealthHeader() {
  const navigate = useNavigate()

  // Format date: Thứ Hai, 24/10/2026
  const dateStr = "Thứ Hai, 24/10/2026"

  return (
    <header className={styles.header}>
      <div className={styles.leftCol}>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
          <span
            className={styles.breadcrumbLink}
            onClick={() => navigate(ROUTER.SCHOOL_HEALTH_OVERVIEW)}
          >
            Trang chủ
          </span>
          <ChevronRightIcon className={styles.breadcrumbSep} />
          <span className={styles.breadcrumbCurrent}>Tổng quan</span>
        </nav>

        {/* Title & Subtitle */}
        <h1 className={styles.title}>Tổng quan</h1>
        <p className={styles.subtitle}>
          Theo dõi thực đơn, thông tin dị ứng và đánh giá nguyên liệu giao nhận.
        </p>
      </div>

      {/* Date badge */}
      <div className={styles.dateBadge}>
        <CalendarTodayOutlinedIcon className={styles.dateIcon} />
        <span>{dateStr}</span>
      </div>
    </header>
  )
}

