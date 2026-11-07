import React from "react"
import { useNavigate } from "react-router-dom"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import ROUTER from "src/router/ROUTER"
import styles from "./HealthAllergyByClass.module.scss"

const ALLERGY_DATA = [
  {
    id: "ALLERGY-6A1",
    className: "Lớp 6A1 — Khối 6",
    allergyType: "Dị ứng hải sản có vỏ",
    casesCount: 2,
  },
  {
    id: "ALLERGY-7A2",
    className: "Lớp 7A2 — Khối 7",
    allergyType: "Dị ứng đậu phộng/lạc",
    casesCount: 1,
  },
  {
    id: "ALLERGY-8B3",
    className: "Lớp 8B3 — Khối 8",
    allergyType: "Dị ứng trứng gà, sữa bò",
    casesCount: 3,
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
