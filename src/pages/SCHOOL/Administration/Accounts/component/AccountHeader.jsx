import React from "react"
import { UserPlus, ShieldCheck, School } from "lucide-react"
import styles from "./AccountHeader.module.scss"

/**
 * AccountHeader - Header trên cùng của trang Quản lý tài khoản các ban
 * - Ghi rõ tiêu đề, mô tả mục đích của trang
 * - Thống kê nhanh năm học & số ban phụ trách
 * - Nút "+ Thêm tài khoản" điều hướng sang màn hình thêm tài khoản mới
 */
function AccountHeader({ onCreateAccount, totalAccounts = 0 }) {
  return (
    <div className={styles.headerContainer}>
      <div className={styles.titleArea}>
        <div className={styles.badgeRow}>
          <span className={styles.schoolBadge}>
            <School size={14} className={styles.badgeIcon} />
            <span>Trường Tiểu học FoodPrint</span>
          </span>
          <span className={styles.boardBadge}>
            <ShieldCheck size={14} className={styles.badgeIcon} />
            <span>6 Ban chuyên trách</span>
          </span>
        </div>

        <h1 className={styles.mainTitle}>Quản lý tài khoản các ban</h1>
        <p className={styles.subDescription}>
          Danh sách, phân quyền và quản lý thông tin tài khoản cho cán bộ Ban Giám Hiệu, Y tế học đường,
          Nhân viên bếp, Giáo viên chủ nhiệm, Ban đại diện phụ huynh và Bộ phận quản lý nguyên liệu.
        </p>
      </div>

      <div className={styles.actionsArea}>
        <button
          type="button"
          className={styles.addBtn}
          onClick={onCreateAccount}
          title="Chuyển sang màn hình thêm tài khoản mới"
        >
          <UserPlus size={18} className={styles.addIcon} />
          <span>Thêm tài khoản</span>
        </button>
      </div>
    </div>
  )
}

export default AccountHeader
