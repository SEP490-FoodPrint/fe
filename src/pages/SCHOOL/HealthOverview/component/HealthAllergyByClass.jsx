import React from "react"
import { useNavigate } from "react-router-dom"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import ROUTER from "src/router/ROUTER"
import styles from "./HealthAllergyByClass.module.scss"

export default function HealthAllergyByClass({classList = [], loading = false, error = ""}) {
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
          {loading && <p role="status">Đang tải hồ sơ dị ứng…</p>}
          {error && <p role="alert">{error}</p>}
          {!loading && !error && classList.length===0 && <p>Chưa có ghi nhận dị ứng trong dữ liệu của trường.</p>}
          {classList.slice(0,4).map((item) => (
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
                <span className={styles.allergyType}>{item.allergies.map(line=>`${line.ingredientName}: ${line.affectedCount}`).join("; ")}</span>
              </div>

              <div className={styles.caseBadge}>
                <span>{item.allergies.length} nguyên liệu</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
