import React from "react"
import { useNavigate } from "react-router-dom"
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import { Tooltip } from "@mui/material"
import ROUTER from "src/router/ROUTER"
import styles from "./HealthRecentMenus.module.scss"

const RECENT_MENUS = [
  {
    id: "MENU-W44",
    title: "Thực đơn Tuần 44 — Tiêu chuẩn THCS",
    dateRange: "17/10 - 22/10/2026",
    mealType: "Bữa trưa",
    status: "Đã duyệt",
    statusType: "success",
  },
  {
    id: "MENU-W45",
    title: "Thực đơn Tuần 45 — Điều chỉnh dinh dưỡng",
    dateRange: "24/10 - 29/10/2026",
    mealType: "Bữa trưa",
    status: "Chờ chỉnh sửa",
    statusType: "warning",
  },
  {
    id: "MENU-W46",
    title: "Thực đơn Tuần 46 — Dự thảo học kỳ I",
    dateRange: "31/10 - 05/11/2026",
    mealType: "Bữa trưa & xế",
    status: "Chờ BGH duyệt",
    statusType: "info",
  },
]

export default function HealthRecentMenus() {
  const navigate = useNavigate()

  const getStatusBadgeClass = (statusType) => {
    switch (statusType) {
      case "success":
        return styles.statusSuccess
      case "warning":
        return styles.statusWarning
      case "info":
        return styles.statusInfo
      default:
        return styles.statusDefault
    }
  }

  const handleViewMenu = () => {
    navigate(ROUTER.SCHOOL_MENU_PLANNING)
  }

  return (
    <div className={styles.recentMenusCard}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <h2 className={styles.title}>Thực đơn gần đây</h2>
        <button
          type="button"
          className={styles.viewAllBtn}
          onClick={() => navigate(ROUTER.SCHOOL_MENU_PLANNING)}
        >
          <span className={styles.btnFullText}>Xem danh sách thực đơn</span>
          <span className={styles.btnShortText}>Xem tất cả</span>
          <ArrowForwardIcon className={styles.arrowIcon} />
        </button>
      </div>

      {/* Menu Items List */}
      <div className={styles.menuList}>
        {RECENT_MENUS.map((menu) => (
          <div
            key={menu.id}
            className={styles.menuItem}
            onClick={handleViewMenu}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                handleViewMenu()
              }
            }}
          >
            <div className={styles.itemLeft}>
              <span className={styles.menuTitle}>{menu.title}</span>
              <div className={styles.menuMeta}>
                <span>{menu.dateRange}</span>
                <span className={styles.dotSep}>•</span>
                <span>{menu.mealType}</span>
              </div>
            </div>

            <div className={styles.itemRight}>
              <span className={`${styles.statusBadge} ${getStatusBadgeClass(menu.statusType)}`}>
                {menu.status}
              </span>
              <Tooltip title="Xem chi tiết thực đơn" arrow>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleViewMenu()
                  }}
                  aria-label={`Xem chi tiết ${menu.title}`}
                >
                  <VisibilityOutlinedIcon fontSize="small" />
                </button>
              </Tooltip>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
