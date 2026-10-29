import React, { useContext } from "react"
import { StoreContext } from "src/contexts"
import styles from "./KitchenHeader.module.scss"

function KitchenHeader() {
  const { userStore } = useContext(StoreContext)
  const user = userStore?.user

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .slice(-2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "NV"

  return (
    <header className={styles.header}>
      {/* Search Input */}
      <div className={styles.searchContainer}>
        <div className={styles.searchBox}>
          <span className="material-symbols-outlined">search</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Tìm kiếm nhanh mẻ nấu, món ăn, lô giao..."
          />
        </div>
      </div>

      {/* Header Info & Status */}
      <div className={styles.rightSection}>
        {/* Ca làm việc */}
        <div className={styles.shiftInfo}>
          <span className={styles.pulseDot} />
          <span className={styles.shiftTime}>Ca sáng: 06:00 - 12:30</span>
          <span className={styles.sep}>|</span>
          <span className={styles.shiftSchool}>Bếp THCS Đoàn Thị Điểm</span>
        </div>

        <div className={styles.verticalDivider} />

        {/* Nhãn kiểm thực */}
        <div className={styles.inspectPill}>
          <span className="material-symbols-outlined">fact_check</span>
          <span>
            Kiểm thực 3 bước: <strong>Đang ghi nhận</strong>
          </span>
        </div>

        {/* Action Icons */}
        <div className={styles.actionGroup}>
          <button
            type="button"
            className={styles.iconBtn}
            title="Thông báo"
          >
            <span className="material-symbols-outlined">notifications</span>
            <span className={styles.notifDot} />
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            title="Trợ giúp"
          >
            <span className="material-symbols-outlined">help_outline</span>
          </button>
        </div>

        {/* User Profile Pill */}
        <div className={styles.profilePill}>
          <div className={styles.profileAvatar}>{initials}</div>
          <div className={styles.profileMeta}>
            <span className={styles.profileName}>
              {user?.fullName || "Nguyễn Văn Vận"}
            </span>
            <span className={styles.profileTitle}>
              {user?.role === "SCHOOL_KITCHEN_STAFF"
                ? "Bếp trưởng cơ sở"
                : "Nhân viên bếp"}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default KitchenHeader
