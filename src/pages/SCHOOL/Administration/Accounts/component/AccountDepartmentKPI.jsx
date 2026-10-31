import React from "react"
import {
  GraduationCap,
  HeartPulse,
  UtensilsCrossed,
  BookOpen,
  HeartHandshake,
  Warehouse,
  Users,
} from "lucide-react"
import { DEPARTMENT_CONFIGS } from "../mockAccountsData"
import styles from "./AccountDepartmentKPI.module.scss"

/**
 * Bản đồ icon cho 6 ban chuyên trách
 */
const DEPARTMENT_ICONS = {
  BGH: <GraduationCap size={18} />,
  Y_TE: <HeartPulse size={18} />,
  BEP: <UtensilsCrossed size={18} />,
  GVCN: <BookOpen size={18} />,
  PHU_HUYNH: <HeartHandshake size={18} />,
  QUAN_LY_NGUYEN_LIEU: <Warehouse size={18} />,
}

/**
 * AccountDepartmentKPI - Thống kê số lượng account của các ban
 * 6 ban theo đúng yêu cầu:
 * 1. BGH
 * 2. Nhân viên y tế
 * 3. Nhân viên bếp
 * 4. GVCN
 * 5. Ban đại diện phụ huynh
 * 6. Nhân viên quản lý nguyên liệu
 *
 * Tích hợp: Bấm vào thẻ để kích hoạt lọc nhanh theo ban đó ngay lập tức!
 */
function AccountDepartmentKPI({ stats, selectedDepartment, onSelectDepartment }) {
  return (
    <div className={styles.kpiWrapper} role="region" aria-label="Thống kê tài khoản các ban">
      {/* Thẻ Tất cả (Tổng quan) */}
      <button
        type="button"
        className={`${styles.kpiCard} ${selectedDepartment === "ALL" ? styles.cardActive : ""}`}
        onClick={() => onSelectDepartment("ALL")}
        title="Hiển thị tất cả tài khoản"
      >
        <div className={`${styles.iconWrap} ${styles.iconAll}`}>
          <Users size={18} />
        </div>
        <div className={styles.cardContent}>
          <div className={styles.countRow}>
            <span className={styles.countValue}>{stats.TOTAL || 0}</span>
            <span className={styles.countUnit}>tài khoản</span>
          </div>
          <span className={styles.cardLabel}>Tất cả các ban</span>
        </div>
        {selectedDepartment === "ALL" && <span className={styles.activeDot} />}
      </button>

      {/* 6 Ban chuyên trách theo yêu cầu */}
      {DEPARTMENT_CONFIGS.map((dept) => {
        const count = stats[dept.id] || 0
        const isSelected = selectedDepartment === dept.id
        const icon = DEPARTMENT_ICONS[dept.id] || <Users size={18} />

        return (
          <button
            key={dept.id}
            type="button"
            className={`${styles.kpiCard} ${isSelected ? styles.cardActive : ""}`}
            style={{
              "--dept-color": dept.color,
              "--dept-bg": dept.bgColor,
              "--dept-border": dept.borderColor,
            }}
            onClick={() => onSelectDepartment(isSelected ? "ALL" : dept.id)}
            title={`Lọc danh sách theo ${dept.label}`}
          >
            <div
              className={styles.iconWrap}
              style={{
                backgroundColor: dept.bgColor,
                color: dept.color,
              }}
            >
              {icon}
            </div>

            <div className={styles.cardContent}>
              <div className={styles.countRow}>
                <span className={styles.countValue} style={{ color: isSelected ? dept.color : undefined }}>
                  {String(count).padStart(2, "0")}
                </span>
                <span className={styles.countUnit}>tài khoản</span>
              </div>
              <span className={styles.cardLabel}>{dept.label}</span>
            </div>

            {isSelected && (
              <span
                className={styles.activeDot}
                style={{ backgroundColor: dept.color }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

export default AccountDepartmentKPI
