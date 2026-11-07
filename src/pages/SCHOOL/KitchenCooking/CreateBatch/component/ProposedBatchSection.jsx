import React, { useState } from "react";
import {
  CookingPot,
  Layers,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import styles from "./ProposedBatchSection.module.scss";

export default function ProposedBatchSection({
  selectedDish,
  portions = 1250,
  selectedMeal = "lunch",
}) {
  const [isLotsDetailOpen, setIsLotsDetailOpen] = useState(false);

  if (!selectedDish) {
    return (
      <section className={styles.sectionContainer}>
        <div className={styles.sectionHeader}>
          <div className={styles.titleWithBadge}>
            <div className={styles.numberBadge}>3</div>
            <div>
              <h2 className={styles.sectionTitle}>3. Phương án chế biến</h2>
              
            </div>
          </div>
        </div>

        <div className={styles.emptyState}>
          <div className={styles.emptyIconBox}>
            <CookingPot size={26} />
          </div>
          <h3 className={styles.emptyTitle}>Chưa có phương án chế biến</h3>
          <p className={styles.emptyDesc}>Phương án chế biến sẽ hiển thị tự động sau khi chọn món.</p>
          <div className={styles.emptyHintBadge}>
            <Sparkles size={12} />
            <span>Tự động tối ưu số lượng mẻ nấu tối thiểu</span>
          </div>
        </div>
      </section>
    );
  }

  const shiftLabel =
    selectedMeal === "afternoon"
      ? "Bữa phụ chiều (14:30)"
      : "Bữa trưa học đường (11:00)";

  return (
    <section className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleWithBadge}>
          <div className={styles.numberBadge}>3</div>
          <div>
            <h2 className={styles.sectionTitle}>
              3. Phương án chế biến (Nấu chung)
            </h2>
            
          </div>
        </div>
      </div>

      {/* Thẻ tóm tắt đề xuất lô hợp nhất */}
      <div className={styles.summaryCard}>
        <div className={styles.summaryLeft}>
          <div className={styles.hubIconBox} aria-hidden="true">
            <CookingPot size={22} />
          </div>
          <div className={styles.summaryMainInfo}>
            <div className={styles.batchTitleRow}>
              <span className={styles.batchMainName}>
                Lô nấu chung: {selectedDish.name}
              </span>
              <span className={styles.statusPill}>Nấu chung hợp nhất</span>
            </div>
            <p className={styles.summaryText}>
              {shiftLabel} • Quy mô:{" "}
              <strong>{portions.toLocaleString("vi-VN")} suất</strong> (100% nhu
              cầu điểm danh) • Hợp nhất 02 lô thịt heo vào cùng 1 mẻ nấu
            </p>
          </div>
        </div>
      </div>

      {/* Khối liên kết nguồn gốc đa lô (Collapsible nhỏ gọn) */}
      <div className={styles.lotTraceabilityBox}>
        <button
          type="button"
          className={styles.lotTraceToggle}
          onClick={() => setIsLotsDetailOpen(!isLotsDetailOpen)}
          aria-expanded={isLotsDetailOpen}
        >
          <div className={styles.traceToggleLeft}>
            <Layers size={15} className={styles.traceIcon} />
            <span className={styles.traceTitle}>
              <strong>05 lô nguyên liệu</strong> liên kết số hóa (Hỗ trợ truy
              xuất nguồn gốc ngược)
            </span>
          </div>
          <div className={styles.traceToggleRight}>
            <span className={styles.traceHint}>
              {isLotsDetailOpen ? "Thu gọn danh sách" : "Xem chi tiết lô nguồn"}
            </span>
            {isLotsDetailOpen ? (
              <ChevronUp size={16} className={styles.traceIcon} />
            ) : (
              <ChevronDown size={16} className={styles.traceIcon} />
            )}
          </div>
        </button>

        {isLotsDetailOpen && (
          <div className={styles.traceLotsList}>
            {[
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
            ].map((lot) => (
              <div key={lot.code} className={styles.traceItem}>
                <div className={styles.traceItemLeft}>
                  <span className={styles.traceLotBadge}>{lot.code}</span>
                  <span className={styles.traceItemName}>{lot.name}</span>
                </div>
                <div className={styles.traceItemRight}>
                  <span className={styles.traceAmount}>{lot.amount}</span>
                  <span className={styles.traceCertBadge}>{lot.cert}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
