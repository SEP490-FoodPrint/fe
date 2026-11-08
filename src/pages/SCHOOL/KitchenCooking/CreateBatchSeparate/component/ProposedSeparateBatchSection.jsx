import React from "react";
import { CookingPot } from "lucide-react";
import styles from "./ProposedSeparateBatchSection.module.scss";

export default function ProposedSeparateBatchSection({
  selectedDish,
  portions = 1250,
  selectedMeal = "lunch",
}) {
  if (!selectedDish) {
    return (
      <section className={styles.sectionContainer}>
        <div className={styles.sectionHeader}>
          <div className={styles.titleWithBadge}>
            <div className={styles.numberBadge}>2</div>
            <h2 className={styles.sectionTitle}>Phương án tách lô chế biến</h2>
          </div>
        </div>

        <div className={styles.emptyState}>
          <CookingPot size={24} className={styles.emptyIcon} />
          <p className={styles.emptyDesc}>
            Vui lòng chọn món ăn ở trên để hệ thống tự động phân tách thành các lô nấu độc lập theo nguồn nguyên liệu.
          </p>
        </div>
      </section>
    );
  }

  const shiftLabel =
    selectedMeal === "afternoon"
      ? "Bữa phụ chiều (15:00 – 15:30)"
      : selectedMeal === "breakfast"
        ? "Bữa sáng bán trú (06:45 – 07:30)"
        : "Bữa trưa học đường (11:30 – 12:30)";

  return (
    <section className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleWithBadge}>
          <div className={styles.numberBadge}>2</div>
          <h2 className={styles.sectionTitle}>Phương án tách lô chế biến</h2>
        </div>
        <span className={styles.modeBadge}>Nấu riêng (02 lô)</span>
      </div>

      {/* Thông số tổng quan */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Món chế biến</span>
          <span className={styles.metricValue}>{selectedDish.name}</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Tổng quy mô</span>
          <span className={styles.metricValueHighlight}>
            {portions.toLocaleString("vi-VN")} <span className={styles.metricUnit}>suất</span>
          </span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Ca phục vụ</span>
          <span className={styles.metricValue}>{shiftLabel}</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Số lô phân tách</span>
          <span className={styles.metricValueMono}>02 lô độc lập</span>
        </div>
      </div>

      {/* 2 Lô Chế Biến Song Song */}
      <div className={styles.batchesGrid}>
        {/* Lô 1 */}
        <div className={styles.batchCard}>
          <div className={styles.batchCardHeader}>
            <div className={styles.batchTitleWrap}>
              <span className={styles.batchCode}>LÔ-THK-01</span>
              <span className={styles.batchSub}>Lô nấu riêng 1</span>
            </div>
            <span className={styles.batchPortionBadge}>731 suất</span>
          </div>

          <div className={styles.batchMetaRow}>
            <span className={styles.metaLabel}>Thiết bị:</span>
            <span className={styles.metaVal}>Nồi hầm công nghiệp A (200L)</span>
          </div>
          <div className={styles.batchMetaRow}>
            <span className={styles.metaLabel}>Nguồn thịt:</span>
            <span className={styles.metaLotBadge}>LOT-HEO-892 (50.0 kg)</span>
          </div>

          <div className={styles.miniTableWrap}>
            <table className={styles.miniTable}>
              <thead>
                <tr>
                  <th>Nguyên liệu</th>
                  <th style={{ textAlign: "right" }}>Định lượng</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Thịt ba chỉ heo (LOT-HEO-892)</td>
                  <td style={{ textAlign: "right" }}><strong>50.0 kg</strong></td>
                </tr>
                <tr>
                  <td>Trứng cút tươi sạch</td>
                  <td style={{ textAlign: "right" }}>1.462 quả</td>
                </tr>
                <tr>
                  <td>Nước dừa nguyên chất</td>
                  <td style={{ textAlign: "right" }}>46.8 lít</td>
                </tr>
                <tr>
                  <td>Gia vị an toàn</td>
                  <td style={{ textAlign: "right" }}>2.46 kg</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Lô 2 */}
        <div className={styles.batchCard}>
          <div className={styles.batchCardHeader}>
            <div className={styles.batchTitleWrap}>
              <span className={styles.batchCode}>LÔ-THK-02</span>
              <span className={styles.batchSub}>Lô nấu riêng 2</span>
            </div>
            <span className={styles.batchPortionBadge}>519 suất</span>
          </div>

          <div className={styles.batchMetaRow}>
            <span className={styles.metaLabel}>Thiết bị:</span>
            <span className={styles.metaVal}>Nồi hầm công nghiệp B (150L)</span>
          </div>
          <div className={styles.batchMetaRow}>
            <span className={styles.metaLabel}>Nguồn thịt:</span>
            <span className={styles.metaLotBadge}>LOT-HEO-893 (35.5 kg)</span>
          </div>

          <div className={styles.miniTableWrap}>
            <table className={styles.miniTable}>
              <thead>
                <tr>
                  <th>Nguyên liệu</th>
                  <th style={{ textAlign: "right" }}>Định lượng</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Thịt ba chỉ heo (LOT-HEO-893)</td>
                  <td style={{ textAlign: "right" }}><strong>35.5 kg</strong></td>
                </tr>
                <tr>
                  <td>Trứng cút tươi sạch</td>
                  <td style={{ textAlign: "right" }}>1.038 quả</td>
                </tr>
                <tr>
                  <td>Nước dừa nguyên chất</td>
                  <td style={{ textAlign: "right" }}>33.2 lít</td>
                </tr>
                <tr>
                  <td>Gia vị an toàn</td>
                  <td style={{ textAlign: "right" }}>1.74 kg</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
