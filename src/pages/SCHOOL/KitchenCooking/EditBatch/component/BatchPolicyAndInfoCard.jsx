import React from "react"
import {
  CookingPot,
  ShieldCheck,
  Calendar,
  Lock,
  CheckCircle2,
  Utensils,
  Layers
} from "lucide-react"
import styles from "./BatchPolicyAndInfoCard.module.scss"

export default function BatchPolicyAndInfoCard({ batchData }) {
  return (
    <section className={styles.infoCard}>
      {/* 1. Header Thẻ */}
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.iconBox}>
            <CookingPot size={18} />
          </div>
          <h2 className={styles.cardTitle}>Thông tin phương án chế biến</h2>
        </div>
        <div className={styles.safetyBadge}>
          <ShieldCheck size={14} />
          <span>Quy tắc: Nấu riêng theo lô nguyên liệu</span>
        </div>
      </div>

      {/* 2. Policy Strip Tinh Gọn */}
      <div className={styles.policyStrip}>
        <div className={styles.policyLeft}>
          <ShieldCheck size={15} className={styles.policyIcon} />
          <span className={styles.policyLabel}>Quy chuẩn BGH:</span>
          <span className={styles.policyTag}>NẤU RIÊNG 1:1</span>
          <span className={styles.dotSeparator}>•</span>
          <span className={styles.policyMeta}>
            Cơ sở: <strong>{batchData.school || "Bếp THCS Đoàn Thị Điểm"}</strong>
          </span>
          <span className={styles.dotSeparator}>•</span>
          <span className={styles.policyMeta}>
            Ca: <strong>{batchData.mealSession || "Bữa trưa — 11:15"}</strong>
          </span>
        </div>

        <div className={styles.policyRight}>
          <Lock size={13} className={styles.lockIcon} />
          <span>Khóa cố định theo biên bản kiểm soát bếp</span>
        </div>
      </div>

      {/* 3. Grid Thông tin chi tiết */}
      <div className={styles.infoGrid}>
        {/* Item 1: Mã lô */}
        <div className={styles.infoItem}>
          <span className={styles.fieldLabel}>Mã lô chế biến</span>
          <span className={styles.fieldValueMono}>{batchData.code || "CB-20261023-01A"}</span>
          <span className={styles.subText}>Cố định - Lô 01 trong phương án 2 lô độc lập</span>
        </div>

        {/* Item 2: Món ăn & Ca phục vụ */}
        <div className={styles.infoItem}>
          <span className={styles.fieldLabel}>Món ăn &amp; Ca phục vụ</span>
          <div className={styles.dishValueWrap}>
            <span className={styles.dishName}>{batchData.dishName || "Thịt gà kho"}</span>
            <span className={styles.dishCategoryPill}>Món chính</span>
          </div>
          <span className={styles.subText}>Bữa trưa • Giờ phục vụ: 11:15</span>
        </div>

        {/* Item 3: Ngày thực đơn */}
        <div className={styles.infoItem}>
          <span className={styles.fieldLabel}>Ngày thực đơn</span>
          <div className={styles.valueWithIcon}>
            <Calendar size={15} className={styles.itemIcon} />
            <span className={styles.fieldValueBold}>{batchData.date || "23/10/2026"}</span>
            <span className={styles.subText}>(Tuần 43 - Học kỳ I)</span>
          </div>
          <span className={styles.subText}>Thực đơn đã được BGH phê duyệt</span>
        </div>

        {/* Item 4: Số suất chế biến (Khóa tự động theo GVCN) */}
        <div className={styles.infoItem}>
          <span className={styles.fieldLabel}>Số suất chế biến</span>
          <div className={styles.portionWrap}>
            <span className={styles.portionNumber}>{(batchData.portions || 60).toLocaleString("vi-VN")}</span>
            <span className={styles.portionUnit}>suất</span>
            <span className={styles.lockedPill} title="Tự động tính toán theo báo ăn lớp từ GVCN">
              <CheckCircle2 size={12} />
              Đã chốt báo ăn
            </span>
          </div>
          <span className={styles.subText}>Phân bổ: Khối 6, 7 (Lô 01: 60 / tổng 100 suất bán trú)</span>
        </div>
      </div>
    </section>
  )
}
