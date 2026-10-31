import React from "react"
import {
  Utensils,
  Calendar,
  CheckCircle2,
  Lock,
  GitFork,
  Combine
} from "lucide-react"
import styles from "./BatchPolicyAndInfoCard.module.scss"

export default function BatchPolicyAndInfoCard({ batchData }) {
  const isCombineLots = batchData?.rule === "COMBINE_LOTS"
  const portions = batchData?.portions || (isCombineLots ? 100 : 60)

  return (
    <div className={styles.summaryBar}>
      {/* 1. Món ăn */}
      <div className={styles.metaItem}>
        <span className={styles.metaLabel}>Món ăn chế biến</span>
        <div className={styles.metaValueRow}>
          <Utensils size={14} className={styles.metaIcon} />
          <span className={styles.metaDish}>{batchData.dishName || "Thịt gà kho"}</span>
          <span className={styles.categoryTag}>Món chính</span>
        </div>
      </div>

      <div className={styles.divider} />

      {/* 2. Thời gian & Ca phục vụ */}
      <div className={styles.metaItem}>
        <span className={styles.metaLabel}>Thời gian phục vụ</span>
        <div className={styles.metaValueRow}>
          <Calendar size={14} className={styles.metaIcon} />
          <span className={styles.metaValueBold}>{batchData.date || "23/10/2026"}</span>
          <span className={styles.metaDot}>•</span>
          <span className={styles.metaValueMuted}>{batchData.mealSession || "Bữa trưa (11:15)"}</span>
        </div>
      </div>

      <div className={styles.divider} />

      {/* 3. Số suất chế biến */}
      <div className={styles.metaItem}>
        <span className={styles.metaLabel}>Số suất chế biến</span>
        <div className={styles.metaValueRow}>
          <span className={styles.metaNumber}>{portions.toLocaleString("vi-VN")}</span>
          <span className={styles.metaUnit}>suất</span>
          <span className={styles.metaStatusPill}>
            <CheckCircle2 size={11} />
            Đã chốt
          </span>
        </div>
      </div>

      <div className={styles.divider} />

      {/* 4. Quy tắc chế biến */}
      <div className={styles.metaItem}>
        <span className={styles.metaLabel}>Quy tắc mẻ</span>
        <div className={styles.metaValueRow}>
          {isCombineLots ? (
            <Combine size={14} className={styles.metaIcon} />
          ) : (
            <GitFork size={14} className={styles.metaIcon} />
          )}
          <span className={styles.metaValueBold}>
            {isCombineLots ? "Nấu chung đa lô" : "Nấu riêng 1:1"}
          </span>
          <span className={styles.lockTag}>
            <Lock size={10} />
            Khóa BGH
          </span>
        </div>
      </div>
    </div>
  )
}
