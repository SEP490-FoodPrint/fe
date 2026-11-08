import React from "react";
import { CookingPot, Layers } from "lucide-react";
import styles from "./ProposedBatchSection.module.scss";

const TRACE_LOTS = [
  {
    code: "LOT-HEO-892",
    name: "Thịt ba chỉ heo tươi",
    amount: "50.0 kg",
    cert: "VietGAP",
  },
  {
    code: "LOT-HEO-893",
    name: "Thịt ba chỉ heo tươi",
    amount: "35.5 kg",
    cert: "VietGAP",
  },
  {
    code: "LOT-CUT-224",
    name: "Trứng cút tươi sạch",
    amount: "2.500 quả",
    cert: "HACCP",
  },
  {
    code: "LOT-DUA-018",
    name: "Nước dừa tươi nguyên chất",
    amount: "80.0 lít",
    cert: "Chuẩn ATTP",
  },
  {
    code: "LOT-GVI-045",
    name: "Gia vị kho an toàn",
    amount: "4.2 kg",
    cert: "OCOP 4 sao",
  },
];

export default function ProposedBatchSection({
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
            <h2 className={styles.sectionTitle}>Phương án chế biến dự kiến</h2>
          </div>
        </div>

        <div className={styles.emptyState}>
          <CookingPot size={24} className={styles.emptyIcon} />
          <p className={styles.emptyDesc}>
            Vui lòng chọn món ăn ở trên để xem phương án chế biến và danh sách nguyên liệu.
          </p>
        </div>
      </section>
    );
  }

  const shiftLabel =
    selectedMeal === "afternoon"
      ? "Bữa phụ chiều (14:30 – 15:30)"
      : selectedMeal === "breakfast"
        ? "Bữa sáng bán trú (06:45 – 07:30)"
        : "Bữa trưa học đường (11:00 – 12:30)";

  return (
    <section className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleWithBadge}>
          <div className={styles.numberBadge}>2</div>
          <h2 className={styles.sectionTitle}>Phương án chế biến dự kiến</h2>
        </div>
        <span className={styles.modeBadge}>Nấu chung</span>
      </div>

      {/* Thông số tổng quan lô */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Món chế biến</span>
          <span className={styles.metricValue}>{selectedDish.name}</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Quy mô chế biến</span>
          <span className={styles.metricValueHighlight}>
            {portions.toLocaleString("vi-VN")} <span className={styles.metricUnit}>suất</span>
          </span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Ca phục vụ</span>
          <span className={styles.metricValue}>{shiftLabel}</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Mã lô dự kiến</span>
          <span className={styles.metricValueMono}>LÔ-THK-01</span>
        </div>
      </div>

      {/* Danh sách nguyên liệu & Lô xuất kho */}
      <div className={styles.ingredientsSection}>
        <div className={styles.ingHeaderRow}>
          <div className={styles.ingTitleLeft}>
            <Layers size={15} className={styles.ingIcon} />
            <span className={styles.ingTitle}>Lô nguyên liệu xuất kho</span>
            <span className={styles.ingCountBadge}>05 lô</span>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Mã lô</th>
                <th scope="col">Tên nguyên liệu</th>
                <th scope="col" style={{ textAlign: "right" }}>Định lượng</th>
                <th scope="col" style={{ textAlign: "center" }}>Tiêu chuẩn</th>
              </tr>
            </thead>
            <tbody>
              {TRACE_LOTS.map((lot) => (
                <tr key={lot.code}>
                  <td>
                    <span className={styles.lotCode}>{lot.code}</span>
                  </td>
                  <td className={styles.lotName}>{lot.name}</td>
                  <td className={styles.lotAmount}>{lot.amount}</td>
                  <td style={{ textAlign: "center" }}>
                    <span className={styles.certBadge}>{lot.cert}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
