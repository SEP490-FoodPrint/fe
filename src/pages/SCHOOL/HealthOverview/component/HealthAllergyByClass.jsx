import React from "react"
import { useNavigate } from "react-router-dom"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import ROUTER from "src/router/ROUTER"
import styles from "./HealthAllergyByClass.module.scss"

const ALLERGY_DATA = [
  {
    id: "ca-1a",
    className: "Lớp 1A — Khối 1",
    allergyType: "Giáp xác & Đậu phộng",
    casesCount: 4,
  },
  {
    id: "ca-2b",
    className: "Lớp 2B — Khối 2",
    allergyType: "Tôm sú, cua biển",
    casesCount: 5,
  },
  {
    id: "ca-3c",
    className: "Lớp 3C — Khối 3",
    allergyType: "Giáp xác & Mực tươi",
    casesCount: 4,
  },
  {
    id: "ca-4d",
    className: "Lớp 4D — Khối 4",
    allergyType: "Trứng gà & Sữa bò",
    casesCount: 2,
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
          <h2 className={styles.title}>Cảnh báo dị ứng theo lớp</h2>
          <button
            type="button"
            className={styles.viewAllBtn}
            onClick={handleViewAllergy}
            title="Xem chi tiết danh sách dị ứng học sinh"
          >
            <span>Xem tất cả</span>
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
                <span>{item.casesCount} ca</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
