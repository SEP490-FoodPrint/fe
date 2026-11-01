import React from "react"
import { useNavigate } from "react-router-dom"
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined"
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined"
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined"
import HealthAndSafetyOutlinedIcon from "@mui/icons-material/HealthAndSafetyOutlined"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import ROUTER from "src/router/ROUTER"
import styles from "./HealthKPICards.module.scss"

const KPI_ITEMS = [
  {
    id: "menus-todo",
    title: "Thực đơn cần xử lý",
    count: "02",
    description: "Cần hoàn thiện hoặc sửa theo ý kiến BGH",
    icon: <EditNoteOutlinedIcon className={styles.kpiIcon} />,
    route: ROUTER.SCHOOL_MENU_PLANNING,
    colorScheme: "primary",
  },
  {
    id: "pending-approval",
    title: "Chờ BGH duyệt",
    count: "01",
    description: "Đã gửi duyệt tuần 46",
    icon: <PendingActionsOutlinedIcon className={styles.kpiIcon} />,
    route: ROUTER.SCHOOL_MENU_PLANNING,
    colorScheme: "primary",
  },
  {
    id: "delivery-inspection",
    title: "Giao hàng cần đánh giá",
    count: "03",
    description: "Đợt giao ca sáng cần kiểm thực",
    icon: <LocalShippingOutlinedIcon className={styles.kpiIcon} />,
    route: ROUTER.SCHOOL_INGREDIENT_INSPECT,
    colorScheme: "primary",
  },
  {
    id: "allergy-alerts",
    title: "Lớp có thông tin dị ứng",
    count: "06",
    description: "Tổng hợp số liệu từ các khối",
    icon: <HealthAndSafetyOutlinedIcon className={styles.kpiIcon} />,
    route: ROUTER.SCHOOL_HEALTH_ALLERGY,
    colorScheme: "primary",
  },
]

export default function HealthKPICards({ onSelectCard }) {
  const navigate = useNavigate()

  const handleCardClick = (item) => {
    if (onSelectCard) {
      onSelectCard(item.id)
    }
    if (item.route) {
      navigate(item.route)
    }
  }

  return (
    <section aria-label="Chỉ số hoạt động chính" className={styles.kpiGrid}>
      {KPI_ITEMS.map((item) => (
        <div
          key={item.id}
          className={styles.kpiCard}
          onClick={() => handleCardClick(item)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              handleCardClick(item)
            }
          }}
        >
          <div className={styles.cardTop}>
            <span className={styles.cardTitle}>{item.title}</span>
            <div className={styles.iconBox}>{item.icon}</div>
          </div>

          <div className={styles.cardBottom}>
            <div className={styles.valueRow}>
              <span className={styles.countNumber}>{item.count}</span>
              <span className={styles.hoverArrow}>
                <ArrowForwardIcon fontSize="inherit" />
              </span>
            </div>
            <p className={styles.cardDesc}>{item.description}</p>
          </div>
        </div>
      ))}
    </section>
  )
}

