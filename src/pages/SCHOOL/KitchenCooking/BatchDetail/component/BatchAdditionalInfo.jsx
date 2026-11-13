import React from "react"
import { Info, Clock, Layers, FileText } from "lucide-react"
import styles from "./BatchAdditionalInfo.module.scss"

export default function BatchAdditionalInfo({ batchData = {} }) {
  const methodLabel =
    batchData.cookingModeApplied === "SEPARATE_BY_LOT" || batchData.method === "SEPARATE"
      ? "Nấu riêng theo lớp"
      : "Nấu chung"

  const hasParent = Boolean(batchData.batchGroupCode)
  const hasCreated = Boolean(batchData.createdAt && batchData.createdAt !== "Chưa ghi nhận")
  const hasConfirmed = Boolean(batchData.confirmedAt)
  const hasCompleted = Boolean(batchData.completedAtFull || batchData.completedAt)
  const hasNote = Boolean(batchData.note && batchData.note.trim())

  // Kiểm tra nếu không có thông tin phụ nào thì không render
  if (!hasCreated && !hasConfirmed && !hasCompleted && !hasParent && !hasNote && !methodLabel) {
    return null
  }

  return (
    <section className={styles.additionalSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleWrap}>
          <Info size={16} className={styles.sectionIcon} />
          <h2 className={styles.sectionTitle}>Thông tin bổ sung</h2>
        </div>
      </div>

      <div className={styles.infoGrid}>
        {/* Quy cách nấu */}
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Quy cách nấu</span>
          <span className={styles.infoValue}>{methodLabel}</span>
        </div>

        {/* Mã lô cha (nếu có) */}
        {hasParent && (
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Mã lô cha (nhóm)</span>
            <span className={styles.infoValueCode}>{batchData.batchGroupCode}</span>
          </div>
        )}

        {/* Thời gian khởi tạo */}
        {hasCreated && (
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Thời gian tạo lô</span>
            <span className={styles.infoValue}>{batchData.createdAt}</span>
          </div>
        )}

        {/* Thời gian xác nhận nấu */}
        {hasConfirmed && (
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Thời gian xác nhận nấu</span>
            <span className={styles.infoValue}>{batchData.confirmedAt}</span>
          </div>
        )}

        {/* Thời gian hoàn thành */}
        {hasCompleted && (
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Thời gian hoàn thành</span>
            <span className={styles.infoValue}>
              {batchData.completedAtFull || batchData.completedAt}
            </span>
          </div>
        )}

        {/* Ghi chú nội bộ (nếu có) */}
        {hasNote && (
          <div className={`${styles.infoItem} ${styles.fullWidth}`}>
            <span className={styles.infoLabel}>Ghi chú</span>
            <span className={styles.infoValueNote}>{batchData.note}</span>
          </div>
        )}
      </div>
    </section>
  )
}
