import React from "react"
import {
  CookingPot,
  Calendar,
  CheckCircle2,
  Utensils,
  Layers,
  Building2,
  Lock
} from "lucide-react"
import styles from "./BatchPolicyAndInfoCard.module.scss"

export default function BatchPolicyAndInfoCard({ batchData }) {
  return (
    <section className={styles.infoCard}>
      {/* 1. Header Thẻ: Tiêu đề + Cơ sở */}
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.iconBox}>
            <CookingPot size={18} />
          </div>
          <h2 className={styles.cardTitle}>Thông tin phiên chế biến</h2>
        </div>
        <div className={styles.schoolBadge}>
          <Building2 size={14} />
          <span>{batchData.school || "Bếp THCS Đoàn Thị Điểm"}</span>
        </div>
      </div>

      {/* 2. Grid 4 Thông Tin Phiên Nấu Mạch Lạc, Không Trùng Lặp */}
      <div className={styles.infoGrid}>
        {/* Cột 1: Món ăn */}
        <div className={styles.infoItem}>
          <span className={styles.fieldLabel}>Món ăn chế biến</span>
          <div className={styles.dishValueWrap}>
            <span className={styles.dishName}>{batchData.dishName || "Thịt gà kho"}</span>
            <span className={styles.dishCategoryPill}>Món chính</span>
          </div>
          <span className={styles.subText}>Món mặn giàu đạm cho học sinh</span>
        </div>

        {/* Cột 2: Ngày & Ca phục vụ */}
        <div className={styles.infoItem}>
          <span className={styles.fieldLabel}>Ngày &amp; Ca phục vụ</span>
          <div className={styles.valueWithIcon}>
            <Calendar size={15} className={styles.itemIcon} />
            <span className={styles.fieldValueBold}>{batchData.date || "23/10/2026"}</span>
            <span className={styles.subText}>•</span>
            <span className={styles.mealSessionText}>{batchData.mealSession || "Bữa trưa (11:15)"}</span>
          </div>
          <span className={styles.subText}>Tuần 43 - Học kỳ I (BGH duyệt)</span>
        </div>

        {/* Cột 3: Số suất chế biến (Khóa tự động theo GVCN) */}
        <div className={styles.infoItem}>
          <span className={styles.fieldLabel}>Số suất chế biến</span>
          <div className={styles.portionWrap}>
            <span className={styles.portionNumber}>{(batchData.portions || 60).toLocaleString("vi-VN")}</span>
            <span className={styles.portionUnit}>suất</span>
            <span className={styles.lockedPill} title="Tự động tính theo báo ăn lớp từ GVCN">
              <CheckCircle2 size={12} />
              Đã chốt báo ăn
            </span>
          </div>
          <span className={styles.subText}>Phân bổ: Khối 6, 7 (Lô 01: 60/100 suất)</span>
        </div>

        {/* Cột 4: Chế độ chế biến */}
        <div className={styles.infoItem}>
          <span className={styles.fieldLabel}>Chế độ chế biến</span>
          <div className={styles.methodWrap}>
            <span className={styles.methodName}>Nấu riêng 1:1</span>
            <span className={styles.methodLockTag}>
              <Lock size={11} />
              Khóa theo BGH
            </span>
          </div>
          <span className={styles.subText}>Tách lô độc lập theo nguồn nguyên liệu</span>
        </div>
      </div>
    </section>
  )
}
