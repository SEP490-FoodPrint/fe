import React, { useState } from "react"
import styles from "./ProposedSeparateBatchSection.module.scss"

export default function ProposedSeparateBatchSection() {
  const [showDetail1, setShowDetail1] = useState(false)
  const [showDetail2, setShowDetail2] = useState(false)

  return (
    <section className={styles.compactCard}>
      <div className={styles.cardHeader}>
        <div className={styles.headerTitle}>
          <span className={`material-symbols-outlined ${styles.headerIcon}`}>
            hub
          </span>
          <span className={styles.titleText}>Phương án tách mẻ dự kiến</span>
        </div>

        <div className={styles.summaryBadge}>
          <span className="material-symbols-outlined">check_circle</span>
          <span>Đề xuất: 02 mẻ độc lập (1.250 suất — 100%)</span>
        </div>
      </div>

      {/* 2 Thẻ Mẻ Song Song Cực Gọn & Đẹp */}
      <div className={styles.batchesGrid}>
        {/* Mẻ 1 */}
        <div className={styles.batchCard}>
          <div className={styles.batchTop}>
            <div className={styles.badgeIndex}>
              <span>01</span>
            </div>
            <div className={styles.batchMeta}>
              <span className={styles.batchTitle}>Mẻ chế biến 1</span>
              <span className={styles.batchCode}>CB-20261026-001</span>
            </div>
            <span className={styles.verifiedPill}>
              <span className="material-symbols-outlined">verified</span>
              <span>Đạt chuẩn</span>
            </span>
          </div>

          <div className={styles.portionRow}>
            <div className={styles.portionMain}>
              <span className={styles.num}>731</span>
              <span className={styles.unit}>suất ăn</span>
            </div>
            <span className={styles.portionPercent}>58.5% tổng nhu cầu</span>
          </div>

          <div className={styles.ingredientList}>
            <div className={styles.ingItem}>
              <span className="material-symbols-outlined">restaurant</span>
              <span>
                Thịt heo: <strong className={styles.lotText}>LOT-HEO-892</strong> (50.0 kg)
              </span>
            </div>
            <div className={styles.ingItem}>
              <span className="material-symbols-outlined">egg</span>
              <span>Trứng cút (1.462 quả) • Nước dừa (46.8L) • Gia vị</span>
            </div>
          </div>

          <div className={styles.cardBottom}>
            <button
              type="button"
              className={styles.toggleDetailBtn}
              onClick={() => setShowDetail1(!showDetail1)}
            >
              <span>{showDetail1 ? "Thu gọn định lượng" : "Chi tiết định lượng"}</span>
              <span className="material-symbols-outlined">
                {showDetail1 ? "expand_less" : "expand_more"}
              </span>
            </button>
          </div>

          {showDetail1 && (
            <div className={styles.detailBox}>
              <div className={styles.detailRow}>
                <span>Thịt ba chỉ:</span>
                <strong>50.0 kg</strong>
              </div>
              <div className={styles.detailRow}>
                <span>Trứng cút sạch:</span>
                <strong>1.462 quả</strong>
              </div>
              <div className={styles.detailRow}>
                <span>Nước dừa tươi:</span>
                <strong>46.8 lít</strong>
              </div>
              <div className={styles.detailRow}>
                <span>Gia vị an toàn:</span>
                <strong>2.46 kg</strong>
              </div>
            </div>
          )}
        </div>

        {/* Mẻ 2 */}
        <div className={styles.batchCard}>
          <div className={styles.batchTop}>
            <div className={styles.badgeIndex}>
              <span>02</span>
            </div>
            <div className={styles.batchMeta}>
              <span className={styles.batchTitle}>Mẻ chế biến 2</span>
              <span className={styles.batchCode}>CB-20261026-002</span>
            </div>
            <span className={styles.verifiedPill}>
              <span className="material-symbols-outlined">verified</span>
              <span>Đạt chuẩn</span>
            </span>
          </div>

          <div className={styles.portionRow}>
            <div className={styles.portionMain}>
              <span className={styles.num}>519</span>
              <span className={styles.unit}>suất ăn</span>
            </div>
            <span className={styles.portionPercent}>41.5% tổng nhu cầu</span>
          </div>

          <div className={styles.ingredientList}>
            <div className={styles.ingItem}>
              <span className="material-symbols-outlined">restaurant</span>
              <span>
                Thịt heo: <strong className={styles.lotText}>LOT-HEO-893</strong> (35.5 kg)
              </span>
            </div>
            <div className={styles.ingItem}>
              <span className="material-symbols-outlined">egg</span>
              <span>Trứng cút (1.038 quả) • Nước dừa (33.2L) • Gia vị</span>
            </div>
          </div>

          <div className={styles.cardBottom}>
            <button
              type="button"
              className={styles.toggleDetailBtn}
              onClick={() => setShowDetail2(!showDetail2)}
            >
              <span>{showDetail2 ? "Thu gọn định lượng" : "Chi tiết định lượng"}</span>
              <span className="material-symbols-outlined">
                {showDetail2 ? "expand_less" : "expand_more"}
              </span>
            </button>
          </div>

          {showDetail2 && (
            <div className={styles.detailBox}>
              <div className={styles.detailRow}>
                <span>Thịt ba chỉ:</span>
                <strong>35.5 kg</strong>
              </div>
              <div className={styles.detailRow}>
                <span>Trứng cút sạch:</span>
                <strong>1.038 quả</strong>
              </div>
              <div className={styles.detailRow}>
                <span>Nước dừa tươi:</span>
                <strong>33.2 lít</strong>
              </div>
              <div className={styles.detailRow}>
                <span>Gia vị an toàn:</span>
                <strong>1.74 kg</strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
