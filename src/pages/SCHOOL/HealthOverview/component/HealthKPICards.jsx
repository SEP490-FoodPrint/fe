import React from "react"
import PropTypes from "prop-types"
import { useNavigate } from "react-router-dom"
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined"
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined"
import HealthAndSafetyOutlinedIcon from "@mui/icons-material/HealthAndSafetyOutlined"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import ROUTER from "src/router/ROUTER"
import styles from "./HealthKPICards.module.scss"

const formatCount = (count, loading) => {
  if (loading) return "…"
  if (count === null || count === undefined) return "—"
  return String(count).padStart(2, "0")
}

export default function HealthKPICards({
  onSelectCard,
  allergyClassCount = null,
  menusTodoCount = null,
  deliveriesPendingCount = null,
  loading = false,
}) {
  const navigate = useNavigate()

  const KPI_ITEMS = [
    {
      id: "menus-todo",
      title: "Thực đơn cần xử lý",
      count: formatCount(menusTodoCount, loading),
      description: "Ý kiến BGH & bản nháp cần gửi",
      icon: <EditNoteOutlinedIcon className={styles.kpiIcon} />,
      route: ROUTER.SCHOOL_MENU_PLANNING,
      colorScheme: "primary",
    },
    {
      id: "delivery-inspection",
      title: "Giao hàng chờ kiểm tra",
      count: formatCount(deliveriesPendingCount, loading),
      description: "Đợt giao ca sáng cần đánh giá",
      icon: <LocalShippingOutlinedIcon className={styles.kpiIcon} />,
      route: ROUTER.SCHOOL_INGREDIENT_INSPECT,
      colorScheme: "primary",
    },
    {
      id: "allergy-alerts",
      title: "Cảnh báo dị ứng theo lớp",
      count: formatCount(allergyClassCount, loading),
      description: "Lớp có học sinh cần theo dõi",
      icon: <HealthAndSafetyOutlinedIcon className={styles.kpiIcon} />,
      route: ROUTER.SCHOOL_HEALTH_ALLERGY,
      colorScheme: "primary",
    },
  ]

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

HealthKPICards.propTypes = {
  onSelectCard: PropTypes.func,
  allergyClassCount: PropTypes.number,
  menusTodoCount: PropTypes.number,
  deliveriesPendingCount: PropTypes.number,
  loading: PropTypes.bool,
}
