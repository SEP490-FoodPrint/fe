import React from "react"
import { useNavigate } from "react-router-dom"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import ROUTER from "src/router/ROUTER"
import styles from "./HealthAllergyByClass.module.scss"

const ALLERGY_DATA = [
  {
    id: "ca-1a",
    className: "Lớp 1A — Khối 1",
    allergyType: "Giáp xác & Đậu phộng (4 ca)",
    casesCount: 4,
  },
  {
    id: "ca-2b",
    className: "Lớp 2B — Khối 2",
    allergyType: "Dị ứng tôm sú, cua biển (5 ca)",
    casesCount: 5,
  },
  {
    id: "ca-3c",
    className: "Lớp 3C — Khối 3",
    allergyType: "Giáp xác & Mực tươi (4 ca)",
    casesCount: 4,
  },
]

export default function HealthAllergyByClass() {
  const navigate = useNavigate()

  const handleViewAllergy = () => {
    navigate(ROUTER.SCHOOL_HEALTH_ALLERGY)
  }

  return (
    <div className={styles.allergyCard}>
      <div className={styles.cardTopArea}>
        {/* Header */}
        <div className={styles.cardHeader}>
          <h2 className={styles.title}>Thông tin dị ứng theo lớp</h2>
          <button
            type="button"
            className={styles.viewAllBtn}
            onClick={handleViewAllergy}
          >
            <span>Xem chi tiết</span>
            <ArrowForwardIcon className={styles.arrowIcon} />
          </button>
        </div>

        {/* List of Classes */}
        <div className={styles.allergyList}>
          {ALLERGY_DATA.map((item) => (
            <div
              key={item.id}
              className={styles.allergyItem}
              onClick={handleViewAllergy}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  handleViewAllergy()
                }
              }}
            >
              <div className={styles.itemLeft}>
                <span className={styles.className}>{item.className}</span>
                <span className={styles.allergyType}>{item.allergyType}</span>
              </div>

              <div className={styles.caseBadge}>
                <span>{item.casesCount} trường hợp</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
