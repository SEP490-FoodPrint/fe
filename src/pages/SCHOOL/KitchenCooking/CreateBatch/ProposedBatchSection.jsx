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
              <p className={styles.sectionSubtitle}>
                Hợp nhất lô nấu theo quy chuẩn, tự động liên kết nguồn gốc đa lô
              </p>
            </div>
          </div>
        </div>

        <div className={styles.emptyState}>
          <div className={styles.emptyIconBox}>
            <CookingPot size={26} />
          </div>
          <h3 className={styles.emptyTitle}>Chưa có phương án chế biến</h3>
          <p className={styles.emptyDesc}>
            Phương án gộp lô nấu chung sẽ được tạo tự động ngay khi chọn món ăn
            và hoàn tất đối soát nguyên liệu.
          </p>
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
            <p className={styles.sectionSubtitle}>
              Hệ thống tự động dùng thuật toán hợp nhất lô: gộp thành 01 mẻ nấu
              duy nhất để tối ưu nhân lực bếp
            </p>
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
            <div className={styles.traceItem}>
              <span className={styles.traceLotBadge}>LOT-HEO-892</span>
              <span className={styles.traceItemName}>
                Thịt ba chỉ heo tươi (50.0 kg)
              </span>
            </div>
            <div className={styles.traceItem}>
              <span className={styles.traceLotBadge}>LOT-HEO-893</span>
              <span className={styles.traceItemName}>
                Thịt ba chỉ heo tươi (35.5 kg)
              </span>
            </div>
            <div className={styles.traceItem}>
              <span className={styles.traceLotBadge}>LOT-CUT-224</span>
              <span className={styles.traceItemName}>
                Trứng cút tươi sạch (2.500 quả)
              </span>
            </div>
            <div className={styles.traceItem}>
              <span className={styles.traceLotBadge}>LOT-DUA-018</span>
              <span className={styles.traceItemName}>
                Nước dừa tươi nguyên chất (80.0 lít)
              </span>
            </div>
            <div className={styles.traceItem}>
              <span className={styles.traceLotBadge}>LOT-GVI-045</span>
              <span className={styles.traceItemName}>
                Gia vị kho an toàn (4.2 kg)
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
