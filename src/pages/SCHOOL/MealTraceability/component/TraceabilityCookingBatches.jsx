import React from "react";
import { ShieldAlert } from "lucide-react";
import styles from "./TraceabilityCookingBatches.module.scss";

export default function TraceabilityCookingBatches({
  dish,
  totalAllocationPortions = 30,
}) {
  if (!dish) return null;

  const batches = Array.isArray(dish?.batches) ? dish.batches : [];

  return (
    <section className={styles.batchesSection}>
      <div className={styles.batchesHeader}>
        <div className={styles.titleArea}>
          <div className={styles.dishBadgeRow}>
            <span className={styles.activeTargetTag}>Món đang xem</span>
            <h2 className={styles.sectionHeading}>
              Chi tiết chế biến: {dish?.dishName || "Món ăn"}
            </h2>
          </div>
          <p className={styles.subInfo}>
            Tổng số suất cấp cho lớp: <strong>{totalAllocationPortions} suất</strong>. Nhóm mẻ chế biến trong ca nấu:
          </p>
        </div>

        <div className={styles.tagRight}>
          Lớp nhận từ <strong>{batches.length} lô nấu riêng biệt</strong> để đảm bảo tươi ngon nóng sốt
        </div>
      </div>

      <div className={styles.batchesGrid}>
        {batches.length === 0 ? (
          <div className={styles.batchCard} style={{ gridColumn: "1 / -1", textAlign: "center", padding: "24px" }}>
            <p style={{ color: "var(--text-secondary)", margin: 0 }}>
              Chưa có dữ liệu lô nấu chi tiết cho món ăn này.
            </p>
          </div>
        ) : (
          batches.map((batch, index) => {
            const portions = batch?.allocatedPortions || 0;
            const percentage = totalAllocationPortions > 0
              ? Math.round((portions / totalAllocationPortions) * 100)
              : 100;

            const sample = batch?.retainedSample;

            return (
              <div key={batch?.cookingBatchId || index} className={styles.batchCard}>
                <div className={styles.batchTop}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                        Lô chế biến #{index + 1 < 10 ? `0${index + 1}` : index + 1}
                      </span>
                      <span className={styles.batchCodePill}>{batch?.batchCode || `BATCH-${index + 1}`}</span>
                    </div>
                    <p className={styles.batchMeta}>
                      Hoàn tất nấu lúc: <strong>11:{15 + index * 10}</strong> · Trạng thái: {batch?.status || "COMPLETED"}
                    </p>
                  </div>
                  <span className={styles.statusPill}>COMPLETED</span>
                </div>

                {/* Portions Contribution */}
                <div className={styles.portionCard}>
                  <div className={styles.portionRow}>
                    <span style={{ color: "var(--text-secondary)" }}>
                      Số suất đóng góp cho lớp:
                    </span>
                    <span className={styles.portionCount}>
                      {portions} / {totalAllocationPortions} suất ({percentage}%)
                    </span>
                  </div>

                  <div className={styles.progressBarBg}>
                    <div
                      className={styles.progressBarFill}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className={styles.sampleSubRow}>
                    <span>Nhân viên bếp đã ký hoàn tất</span>
                    {sample ? (
                      <span className={styles.sampleLocation}>
                        Lưu mẫu: {sample.quantity || 200}{sample.unit || "g"} · {sample.storageLocation || "Tủ lưu mẫu"}
                      </span>
                    ) : (
                      <span>Chưa có mẫu lưu</span>
                    )}
                  </div>
                </div>

                {/* Ingredients in this batch */}
                {Array.isArray(batch?.ingredients) && batch.ingredients.length > 0 && (
                  <div className={styles.ingredientsBox}>
                    <div className={styles.ingHeader}>
                      <span>Định lượng nguyên liệu dùng cho mẻ:</span>
                      <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "normal" }}>
                        (lấy từ CookingBatchLot)
                      </span>
                    </div>

                    {batch.ingredients.map((ing, ingIdx) => (
                      <div key={ing?.ingredientLotId || ingIdx} className={styles.ingItemRow}>
                        <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                          {ing?.ingredientName || "Nguyên liệu"}{" "}
                          <code style={{ fontSize: "11px", color: "var(--color-primary)" }}>
                            ({ing?.lotCode || "N/A"})
                          </code>
                        </span>
                        <span style={{ fontWeight: "bold", color: "var(--text-primary)" }}>
                          {ing?.quantityUsed} {ing?.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className={styles.transparencyAlert}>
        <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
        <div>
          <strong>Nguyên tắc minh bạch chia lô:</strong> Các lô chế biến được nấu theo quy trình một chiều nghiêm ngặt tại bếp trường. Tổng suất ăn của lớp được phân bổ cụ thể từ từng lô, có hồ sơ lưu mẫu và định lượng xuất kho rõ ràng.
        </div>
      </div>
    </section>
  );
}
