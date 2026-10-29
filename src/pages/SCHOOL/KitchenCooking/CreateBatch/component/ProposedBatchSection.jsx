import React, { useState } from "react"
import styles from "./ProposedBatchSection.module.scss"

export default function ProposedBatchSection() {
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  return (
    <section className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleRow}>
          <span className="material-symbols-outlined">soup_kitchen</span>
          <h2 className={styles.sectionTitle}>Phương án chế biến dự kiến</h2>
        </div>

        <div className={styles.summaryTag}>
          <span className="material-symbols-outlined">verified</span>
          <span>Đề xuất: 01 mẻ hợp nhất (1.250 suất — 100%)</span>
        </div>
      </div>

      {/* Card Mẻ hợp nhất */}
      <div className={styles.batchCard}>
        <div className={styles.batchTop}>
          <div className={styles.batchIdentity}>
            <span className={styles.batchIndex}>01</span>
            <div className={styles.identityMeta}>
              <div className={styles.batchTitleRow}>
                <h3 className={styles.batchTitle}>Mẻ chế biến 01 (Hợp nhất nấu chung)</h3>
                <span className={styles.verifiedPill}>
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>Đạt chuẩn</span>
                </span>
              </div>
              <span className={styles.batchCode}>CB-20261026-001</span>
            </div>
          </div>

          <div className={styles.portionInfo}>
            <span className={styles.portionCount}>1.250</span>
            <span className={styles.portionUnit}>suất ăn (100% nhu cầu)</span>
          </div>
        </div>

        <div className={styles.batchDetailsRow}>
          <div className={styles.detailItem}>
            <span className="material-symbols-outlined">restaurant</span>
            <span>Thịt heo: <strong>LOT-HEO-892</strong> (50.0 kg) + <strong>LOT-HEO-893</strong> (35.5 kg)</span>
          </div>
          <div className={styles.detailItem}>
            <span className="material-symbols-outlined">egg</span>
            <span>Trứng cút (2.500 quả) • Nước dừa (80.0L) • Gia vị (4.2 kg)</span>
          </div>

          <button
            type="button"
            className={styles.toggleDetailBtn}
            onClick={() => setIsDetailOpen(!isDetailOpen)}
          >
            <span>{isDetailOpen ? "Thu gọn định lượng" : "Chi tiết định lượng"}</span>
            <span className="material-symbols-outlined">
              {isDetailOpen ? "expand_less" : "expand_more"}
            </span>
          </button>
        </div>

        {isDetailOpen && (
          <div className={styles.collapsibleArea}>
            <div className={styles.detailGrid}>
              <div className={styles.detailBox}>
                <span className={styles.boxLabel}>Thịt ba chỉ (Lô 892):</span>
                <span className={styles.boxVal}>50.0 kg</span>
              </div>
              <div className={styles.detailBox}>
                <span className={styles.boxLabel}>Thịt ba chỉ (Lô 893):</span>
                <span className={styles.boxVal}>35.5 kg</span>
              </div>
              <div className={styles.detailBox}>
                <span className={styles.boxLabel}>Trứng cút (Lô 224):</span>
                <span className={styles.boxVal}>2.500 quả</span>
              </div>
              <div className={styles.detailBox}>
                <span className={styles.boxLabel}>Nước dừa tươi (Lô 018):</span>
                <span className={styles.boxVal}>80.0 lít</span>
              </div>
              <div className={styles.detailBox}>
                <span className={styles.boxLabel}>Gia vị an toàn (Lô 045):</span>
                <span className={styles.boxVal}>4.2 kg</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
