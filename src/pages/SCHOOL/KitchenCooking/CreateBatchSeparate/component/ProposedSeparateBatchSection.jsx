import React from "react";
import { CookingPot, CheckCircle2, ArrowRight } from "lucide-react";
import styles from "./ProposedSeparateBatchSection.module.scss";

export default function ProposedSeparateBatchSection({
  selectedDish,
  dishes = [],
  setSelectedDish,
}) {
  if (!selectedDish) {
    return (
      <section className={styles.sectionContainer}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Phương án tách lô chế biến</h2>
        </div>

        <div className={styles.emptyState}>
          <CookingPot size={22} className={styles.emptyIcon} />
          <p className={styles.emptyDesc}>
            Vui lòng chọn món ăn ở trên để hiển thị các lô nấu độc lập theo nguồn nguyên liệu.
          </p>
        </div>
      </section>
    );
  }

  const isCreated = selectedDish.isBatchCreated;
  const nextPendingDish = dishes.find((d) => !d.isBatchCreated && d.id !== selectedDish.id);

  return (
    <section className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleWrap}>
          <h2 className={styles.sectionTitle}>Phương án tách lô: {selectedDish.name}</h2>
          <span className={styles.batchCountTag}>02 lô độc lập</span>
        </div>

        {isCreated ? (
          <span className={styles.badgeSuccess}>
            <CheckCircle2 size={13} />
            <span>Đã tạo lô</span>
          </span>
        ) : (
          <span className={styles.badgePending}>
            <span>Chờ tạo lô</span>
          </span>
        )}
      </div>

      {/* Banner thông báo nếu món này đã được tạo lô */}
      {isCreated && (
        <div className={styles.alreadyCreatedBanner}>
          <div className={styles.createdInfoLeft}>
            <CheckCircle2 size={18} className={styles.createdCheckIcon} />
            <div className={styles.createdTextWrap}>
              <span className={styles.createdTitle}>
                Món ăn này đã được tạo 02 lô chế biến riêng biệt ({selectedDish.batchCode})
              </span>
              <span className={styles.createdSubtitle}>
                Nguyên liệu đã được phân tách độc lập cho 2 mẻ nấu.
              </span>
            </div>
          </div>

          {nextPendingDish && setSelectedDish && (
            <button
              type="button"
              className={styles.jumpNextBtn}
              onClick={() => setSelectedDish(nextPendingDish)}
            >
              <span>Tiếp tục tạo: {nextPendingDish.name}</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      )}

      {/* 2 Lô Chế Biến Song Song (Đã xóa bỏ Gia vị an toàn) */}
      <div className={styles.batchesGrid}>
        {/* Lô 1 */}
        <div className={styles.batchCard}>
          <div className={styles.batchCardHeader}>
            <div className={styles.batchTitleWrap}>
              <span className={styles.batchCode}>LÔ-THK-01</span>
              <span className={styles.batchDot}>•</span>
              <span className={styles.batchSub}>Lô nấu riêng 1</span>
            </div>
            <span className={styles.batchPortionText}>731 suất</span>
          </div>

          <table className={styles.batchTable}>
            <thead>
              <tr>
                <th scope="col">Nguyên liệu</th>
                <th scope="col" style={{ textAlign: "right" }}>Định lượng</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Thịt ba chỉ heo (LOT-HEO-892)</td>
                <td style={{ textAlign: "right" }}><strong>50.0 kg</strong></td>
              </tr>
              <tr>
                <td>Trứng cút tươi sạch (LOT-CUT-224)</td>
                <td style={{ textAlign: "right" }}>1.462 quả</td>
              </tr>
              <tr>
                <td>Nước dừa tươi nguyên chất (LOT-DUA-018)</td>
                <td style={{ textAlign: "right" }}>46.8 lít</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Lô 2 */}
        <div className={styles.batchCard}>
          <div className={styles.batchCardHeader}>
            <div className={styles.batchTitleWrap}>
              <span className={styles.batchCode}>LÔ-THK-02</span>
              <span className={styles.batchDot}>•</span>
              <span className={styles.batchSub}>Lô nấu riêng 2</span>
            </div>
            <span className={styles.batchPortionText}>519 suất</span>
          </div>

          <table className={styles.batchTable}>
            <thead>
              <tr>
                <th scope="col">Nguyên liệu</th>
                <th scope="col" style={{ textAlign: "right" }}>Định lượng</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Thịt ba chỉ heo (LOT-HEO-893)</td>
                <td style={{ textAlign: "right" }}><strong>35.5 kg</strong></td>
              </tr>
              <tr>
                <td>Trứng cút tươi sạch (LOT-CUT-224)</td>
                <td style={{ textAlign: "right" }}>1.038 quả</td>
              </tr>
              <tr>
                <td>Nước dừa tươi nguyên chất (LOT-DUA-018)</td>
                <td style={{ textAlign: "right" }}>33.2 lít</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
