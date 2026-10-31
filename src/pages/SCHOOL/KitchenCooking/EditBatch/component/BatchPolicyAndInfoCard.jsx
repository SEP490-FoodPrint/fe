import React from "react"
import { ShieldCheck, Lock, CookingPot, Calendar, Users, CheckCircle2 } from "lucide-react"
import styles from "./BatchPolicyAndInfoCard.module.scss"

export default function BatchPolicyAndInfoCard({ batchData }) {
  return (
    <section className={styles.sectionCard}>
      {/* 1. Policy Strip */}
      <div className={styles.policyStrip}>
        <div className={styles.policyLeft}>
          <ShieldCheck size={18} className={styles.policyIcon} />
          <span className={styles.policyLabel}>Quy định chế biến:</span>
          <span className={styles.policyTag}>NẤU RIÊNG THEO LÔ NGUYÊN LIỆU</span>
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
          <Lock size={15} className={styles.lockIcon} />
          <span>Phương án khóa cố định theo biên bản kiểm soát bếp</span>
        </div>
      </div>

      {/* 2. 4 Info Cards Grid */}
      <div className={styles.gridCards}>
        {/* Card 1: Mã lô chế biến */}
        <div className={styles.infoCard}>
          <span className={styles.cardLabel}>Mã lô chế biến</span>
          <div className={styles.cardValueWrapper}>
            <span className={styles.codeValue}>{batchData.code || "CB-20261023-01A"}</span>
          </div>
          <span className={styles.cardHint}>Cố định - Lô 01 trong phương án 2 lô</span>
        </div>

        {/* Card 2: Món ăn & Ca */}
        <div className={styles.infoCard}>
          <span className={styles.cardLabel}>Món ăn &amp; Ca phục vụ</span>
          <div className={styles.cardValueWrapper}>
            <CookingPot size={20} className={styles.dishIcon} />
            <span className={styles.dishValue}>{batchData.dishName || "Thịt gà kho"}</span>
          </div>
          <span className={styles.cardHint}>Bữa trưa • 11:15 (Món mặn giàu protein)</span>
        </div>

        {/* Card 3: Ngày thực đơn */}
        <div className={styles.infoCard}>
          <span className={styles.cardLabel}>Ngày thực đơn</span>
          <div className={styles.cardValueWrapper}>
            <Calendar size={18} className={styles.calendarIcon} />
            <span className={styles.calendarValue}>{batchData.date || "23/10/2026"}</span>
          </div>
          <span className={styles.cardHint}>Tuần 43 • Học kỳ I (Ban giám hiệu duyệt)</span>
        </div>

        {/* Card 4: Số suất chế biến (Khóa cố định theo Phương án A) */}
        <div className={`${styles.infoCard} ${styles.portionCard}`}>
          <div className={styles.portionHeader}>
            <span className={styles.portionLabel}>Số suất chế biến</span>
            <span className={styles.portionTag}>Ăn bán trú</span>
          </div>

          <div className={styles.portionValueRow}>
            <div className={styles.portionDisplay}>
              <span className={styles.portionNum}>{batchData.portions || 60}</span>
              <span className={styles.portionUnit}>suất</span>
            </div>
            <div className={styles.portionLockedBadge} title="Tự động tính theo báo ăn từ GVCN">
              <CheckCircle2 size={13} />
              <span>Đã chốt báo ăn</span>
            </div>
          </div>

          <span className={styles.cardHint}>
            Phân bổ: Khối 6, 7 (Lô 01: 60 / tổng 100 suất)
          </span>
        </div>
      </div>
    </section>
  )
}

