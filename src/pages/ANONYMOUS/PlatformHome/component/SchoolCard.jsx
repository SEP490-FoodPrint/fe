import React from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import { ArrowRight, MapPin } from "lucide-react"
import styles from "./SchoolCard.module.scss"

function SchoolCard({ school }) {
  const getAvatarClass = color => {
    switch (color) {
      case "amber":
        return styles.avatarAmber
      case "teal":
        return styles.avatarTeal
      case "blue":
        return styles.avatarBlue
      case "purple":
        return styles.avatarPurple
      case "emerald":
      default:
        return styles.avatarEmerald
    }
  }

  const avatarColorClass = getAvatarClass(school.badge_color)

  return (
    <div className={styles.card}>
      <div>
        <div className={styles.topRow}>
          <div className={`${styles.avatarBox} ${avatarColorClass}`}>
            {school.short_name || school.code?.slice(0, 2) || "TH"}
          </div>

          <div className={styles.statusPill}>
            <span className={styles.activeDot} />
            <span>
              {school.status === "ACTIVE" ? "Đang hoạt động" : "Tạm ngưng"}
            </span>
          </div>
        </div>

        <h3 className={styles.schoolName}>{school.name}</h3>

        <div className={styles.addressRow}>
          <MapPin size={15} />
          <span>{school.address}</span>
        </div>
      </div>

      <div className={styles.footerRow}>
        <span className={styles.menuTag}>Thông tin thực đơn</span>
        <Link
          to={`/school/${school.code}`}
          className={styles.viewLink}
          title={`Xem trang ${school.name}`}
        >
          <span>Xem trang trường</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}

SchoolCard.propTypes = {
  school: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    code: PropTypes.string,
    short_name: PropTypes.string,
    address: PropTypes.string,
    status: PropTypes.string,
    badge_color: PropTypes.string,
  }).isRequired,
}

export default SchoolCard
