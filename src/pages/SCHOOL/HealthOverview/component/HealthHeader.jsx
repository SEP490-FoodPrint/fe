import React from "react"
import { useNavigate } from "react-router-dom"
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined"
import { Plus } from "lucide-react"
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
        <div className={styles.dateBadge}>
          <CalendarTodayOutlinedIcon className={styles.dateIcon} />
          <span>{dateStr}</span>
        </div>

        <button
          type="button"
          className={styles.createBtn}
          onClick={() => navigate(ROUTER.SCHOOL_MENU_CREATE)}
          title="Tạo thực đơn tuần mới"
        >
          <Plus size={16} />
          <span>Tạo thực đơn tuần</span>
        </button>
      </div>
    </header>
  )
}
