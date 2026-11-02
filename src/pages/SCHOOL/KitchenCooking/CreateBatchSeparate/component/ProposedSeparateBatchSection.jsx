import React, { useState } from "react";
import {
  CookingPot,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Utensils,
  Sparkles,
} from "lucide-react";
import styles from "./ProposedSeparateBatchSection.module.scss";

export default function ProposedSeparateBatchSection({
  selectedDish,
  portions = 1250,
  selectedMeal = "lunch",
}) {
  const [showDetail1, setShowDetail1] = useState(false);
  const [showDetail2, setShowDetail2] = useState(false);

  if (!selectedDish) {
    return (
      <section className={styles.sectionContainer}>
        <div className={styles.sectionHeader}>
          <div className={styles.titleWithBadge}>
            <div className={styles.numberBadge}>3</div>
            <div>
              <h2 className={styles.sectionTitle}>
                3. Phương án tách lô chế biến (Nấu riêng)
              </h2>
              <p className={styles.sectionSubtitle}>
                Phương án 02 lô nấu độc lập song song theo nguồn gốc nguyên liệu
              </p>
            </div>
          </div>
        </div>

        <div className={styles.emptyState}>
          <div className={styles.emptyIconBox}>
            <CookingPot size={26} />
          </div>
          <h3 className={styles.emptyTitle}>Chưa có phương án tách lô</h3>
          <p className={styles.emptyDesc}>
            Phương án phân tách lô chế biến độc lập sẽ được tạo tự động ngay khi
            chọn món ăn và hoàn tất đối soát nguyên liệu.
          </p>
          <div className={styles.emptyHintBadge}>
            <Sparkles size={12} />
            <span>Phân tách 1:1 theo từng nguồn nguyên liệu</span>
          </div>
        </div>
      </section>
    );
  }

  const shiftLabel =
    selectedMeal === "afternoon"
      ? "Bữa phụ chiều (15:00)"
      : "Bữa trưa học đường (11:30)";

  return (
    <section className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleWithBadge}>
          <div className={styles.numberBadge}>3</div>
          <div>
            <h2 className={styles.sectionTitle}>
              3. Phương án tách lô chế biến ({selectedDish.name})
            </h2>
            <p className={styles.sectionSubtitle}>
              Phương án 02 lô nấu độc lập song song theo nguồn gốc nguyên liệu
            </p>
          </div>
        </div>
      </div>

      {/* Thẻ tóm tắt đề xuất */}
      <div className={styles.summaryCard}>
        <div className={styles.summaryLeft}>
          <div className={styles.hubIconBox} aria-hidden="true">
            <CookingPot size={22} />
          </div>
          <div className={styles.summaryMainInfo}>
            <div className={styles.batchTitleRow}>
              <span className={styles.batchMainName}>
                Đề xuất: 02 lô chế biến độc lập song song
              </span>
              <span className={styles.statusPill}>Nấu riêng 1:1</span>
            </div>
            <p className={styles.summaryText}>
              {shiftLabel} • Tổng quy mô:{" "}
              <strong>{portions.toLocaleString("vi-VN")} suất</strong> (100% nhu
              cầu điểm danh) • Tách biệt nghiêm ngặt theo 02 nguồn gốc thịt heo
            </p>
          </div>
        </div>
      </div>

      {/* 2 Thẻ Lô Chế Biến Song Song */}
      <div className={styles.batchesGrid}>
        {/* Lô 1 */}
        <div className={styles.batchCard}>
          <div className={styles.cardHeader}>
            <div className={styles.headerLeft}>
              <div className={styles.batchIndexBadge}>01</div>
              <div className={styles.batchTitles}>
                <span className={styles.batchName}>
                  Lô nấu riêng 1 (LÔ-THK-01)
                </span>
                <span className={styles.dishName}>{selectedDish.name}</span>
              </div>
            </div>
            <span className={styles.batchSizeBadge}>731 suất</span>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.deviceRow}>
              <span className={styles.deviceLabel}>Thiết bị:</span>
              <span className={styles.deviceVal}>
                Nồi hầm công nghiệp A (200L)
              </span>
            </div>

            <div className={styles.sourceBox}>
              <div className={styles.sourceLabel}>Nguồn gốc độc quyền:</div>
              <div className={styles.sourcePillPrimary}>
                <strong>LOT-HEO-892</strong> • Thịt heo Nam Hà (50.0 kg)
              </div>
            </div>

            <button
              type="button"
              className={styles.detailToggle}
              onClick={() => setShowDetail1(!showDetail1)}
            >
              <span>
                {showDetail1 ? "Thu gọn thành phần" : "Xem định lượng chi tiết"}
              </span>
              {showDetail1 ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              )}
            </button>

            {showDetail1 && (
              <div className={styles.detailsContent}>
                <div className={styles.itemRow}>
                  <span>Thịt ba chỉ heo (LOT-HEO-892):</span>
                  <strong>50.0 kg (100%)</strong>
                </div>
                <div className={styles.itemRow}>
                  <span>Trứng cút tươi:</span>
                  <strong>1.462 quả</strong>
                </div>
                <div className={styles.itemRow}>
                  <span>Nước dừa nguyên chất:</span>
                  <strong>46.8 lít</strong>
                </div>
                <div className={styles.itemRow}>
                  <span>Gia vị an toàn:</span>
                  <strong>2.46 kg</strong>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lô 2 */}
        <div className={styles.batchCard}>
          <div className={styles.cardHeader}>
            <div className={styles.headerLeft}>
              <div className={styles.batchIndexBadge}>02</div>
              <div className={styles.batchTitles}>
                <span className={styles.batchName}>
                  Lô nấu riêng 2 (LÔ-THK-02)
                </span>
                <span className={styles.dishName}>{selectedDish.name}</span>
              </div>
            </div>
            <span className={styles.batchSizeBadge}>519 suất</span>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.deviceRow}>
              <span className={styles.deviceLabel}>Thiết bị:</span>
              <span className={styles.deviceVal}>
                Nồi hầm công nghiệp B (150L)
              </span>
            </div>

            <div className={styles.sourceBox}>
              <div className={styles.sourceLabel}>Nguồn gốc độc quyền:</div>
              <div className={styles.sourcePillSecondary}>
                <strong>LOT-HEO-893</strong> • Thịt heo Nam Hà (35.5 kg)
              </div>
            </div>

            <button
              type="button"
              className={styles.detailToggle}
              onClick={() => setShowDetail2(!showDetail2)}
            >
              <span>
                {showDetail2 ? "Thu gọn thành phần" : "Xem định lượng chi tiết"}
              </span>
              {showDetail2 ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              )}
            </button>

            {showDetail2 && (
              <div className={styles.detailsContent}>
                <div className={styles.itemRow}>
                  <span>Thịt ba chỉ heo (LOT-HEO-893):</span>
                  <strong>35.5 kg (100%)</strong>
                </div>
                <div className={styles.itemRow}>
                  <span>Trứng cút tươi:</span>
                  <strong>1.038 quả</strong>
                </div>
                <div className={styles.itemRow}>
                  <span>Nước dừa nguyên chất:</span>
                  <strong>33.2 lít</strong>
                </div>
                <div className={styles.itemRow}>
                  <span>Gia vị an toàn:</span>
                  <strong>1.74 kg</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
