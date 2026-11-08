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

export default function ProposedBatchSection({ selectedDish }) {
  if (!selectedDish) {
    return (
      <section className={styles.sectionContainer}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Phương án chế biến dự kiến</h2>
        </div>

        <div className={styles.emptyState}>
          <CookingPot size={22} className={styles.emptyIcon} />
          <p className={styles.emptyDesc}>
            Vui lòng chọn món ăn ở trên để xem danh sách nguyên liệu xuất kho.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleWrap}>
          <h2 className={styles.sectionTitle}>Phương án chế biến dự kiến</h2>
          <span className={styles.lotCodeBadge}>LÔ-THK-01</span>
          <span className={styles.modeTag}>Nấu chung</span>
        </div>
      </div>

      {/* Danh sách nguyên liệu & Lô xuất kho */}
      <div className={styles.ingredientsSection}>
        <div className={styles.ingHeaderRow}>
          <div className={styles.ingTitleLeft}>
            <Layers size={14} className={styles.ingIcon} />
            <span className={styles.ingTitle}>Lô nguyên liệu xuất kho</span>
            <span className={styles.ingCountBadge}>05 lô liên kết</span>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Mã lô nguồn</th>
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
