import React, { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined"
import { Plus } from "lucide-react"
import ROUTER from "src/router/ROUTER"
import styles from "./HealthHeader.module.scss"

export default function HealthHeader() {
  const navigate = useNavigate()

  const dateStr = useMemo(() => {
    const days = [
      "Chủ Nhật",
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
    ]
    const now = new Date()
    const dayName = days[now.getDay()]
    const pad = (n) => String(n).padStart(2, "0")
    return `${dayName}, ${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`
  }, [])

  return (
    <header className={styles.header}>
      <div className={styles.leftCol}>
        <h1 className={styles.title}>Tổng quan</h1>
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
