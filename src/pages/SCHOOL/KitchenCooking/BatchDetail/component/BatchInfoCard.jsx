import React from "react"
import {
  CookingPot,
  Utensils,
  Layers,
  Calendar,
  Hash,
  CheckCircle2,
  Clock,
} from "lucide-react"
import styles from "./BatchInfoCard.module.scss"

export default function BatchInfoCard({ batchData = {} }) {
  const portions = (batchData.portions || 0).toLocaleString("vi-VN")
  const methodLabel =
    batchData.method === "SEPARATE" ? "Nấu riêng theo lô" : "Nấu chung"

  const isCompleted = batchData.status === "COMPLETED"
  const isConfirmed = batchData.status === "CONFIRMED"

  return (
    <section className={styles.infoCard}>
      {/* 1. Hero: Tên món ăn to rõ + Mã lô + Số suất */}
      <div className={styles.heroDishBox}>
        <div className={styles.heroLeft}>
          <div className={styles.heroMetaRow}>
            <div className={styles.batchCodePill} title="Mã lô chế biến">
              <Hash size={13} className={styles.hashIcon} />
              <span className={styles.batchCodeText}>
                {batchData.code || "—"}
              </span>
            </div>
            {isCompleted ? (
              <span className={styles.statusCompletedPill}>
                <CheckCircle2 size={13} />
                Đã nấu xong {batchData.completedAt ? `(${batchData.completedAt})` : ""}
              </span>
            ) : isConfirmed ? (
              <span className={styles.statusConfirmedPill}>
                <Clock size={13} />
                Đang chế biến
              </span>
            ) : (
              <span className={styles.statusDraftPill}>
                Chờ xác nhận
              </span>
            )}
          </div>
          <h2 className={styles.dishNameTitle}>{batchData.dishName || "—"}</h2>
        </div>

        <div className={styles.heroPortionBox}>
          <span className={styles.portionLabel}>Quy mô chế biến</span>
          <div className={styles.portionValueRow}>
            <span className={styles.portionBigNumber}>{portions}</span>
            <span className={styles.portionUnit}>suất</span>
          </div>
        </div>
      </div>

      {/* 2. Ba thông số cốt lõi (Ngắn gọn, dễ đọc trên di động) */}
      <div className={styles.metricsGrid}>
        {/* Bữa ăn & Giờ phục vụ */}
        <div className={styles.metricItem}>
          <div className={styles.metricLabelRow}>
            <Utensils size={14} className={styles.metricIcon} />
            <span className={styles.metricLabel}>Bữa ăn</span>
          </div>
          <div className={styles.metricValue}>
            <strong>{batchData.mealType || "Bữa trưa"}</strong>
            <span className={styles.metricSubTime}>({batchData.servingTime || "11:15"})</span>
          </div>
        </div>

        {/* Ngày thực đơn */}
        <div className={styles.metricItem}>
          <div className={styles.metricLabelRow}>
            <Calendar size={14} className={styles.metricIcon} />
            <span className={styles.metricLabel}>Ngày nấu</span>
          </div>
          <div className={styles.metricValue}>
            <strong>{batchData.menuDate || "Hôm nay"}</strong>
          </div>
        </div>

        {/* Quy cách nấu */}
        <div className={styles.metricItem}>
          <div className={styles.metricLabelRow}>
            <Layers size={14} className={styles.metricIcon} />
            <span className={styles.metricLabel}>Quy cách</span>
          </div>
          <div className={styles.metricValue}>
            <span className={styles.methodTag}>{methodLabel}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
