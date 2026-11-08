import React from "react";
import { CookingPot, Layers, CheckCircle2, ArrowRight } from "lucide-react";
import styles from "./ProposedBatchSection.module.scss";

export default function ProposedBatchSection({
  selectedDish,
  dishes = [],
  setSelectedDish,
}) {
  if (!selectedDish) {
    return (
      <section className={styles.sectionContainer}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Phương án chế biến dự kiến</h2>
        </div>

        <div className={styles.emptyState}>
          <CookingPot size={22} className={styles.emptyIcon} />
          <p className={styles.emptyDesc}>
            Vui lòng chọn món ăn ở trên để xem danh sách nguyên liệu và phương án nấu.
          </p>
        </div>
      </section>
    );
  }

  const ingredients = selectedDish.ingredients || [];
  const isCreated = selectedDish.isBatchCreated;
  const nextPendingDish = dishes.find((d) => !d.isBatchCreated && d.id !== selectedDish.id);

  return (
    <section className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleWrap}>
          <h2 className={styles.sectionTitle}>Phương án chế biến: {selectedDish.name}</h2>
          <span className={styles.lotCodeBadge}>
            {selectedDish.batchCode || "LÔ-DỰ-KIẾN"}
          </span>
          <span className={styles.modeTag}>Nấu chung</span>
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
                Món ăn này đã có lô chế biến ({selectedDish.batchCode})
              </span>
              <span className={styles.createdSubtitle}>
                Nguyên liệu đã được phân bổ sẵn sàng cho bếp chế biến.
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

      {/* Danh sách nguyên liệu & Lô xuất kho (Đã bỏ gia vị an toàn & bỏ cột tiêu chuẩn) */}
      <div className={styles.ingredientsSection}>
        <div className={styles.ingHeaderRow}>
          <div className={styles.ingTitleLeft}>
            <Layers size={14} className={styles.ingIcon} />
            <span className={styles.ingTitle}>Lô nguyên liệu xuất kho</span>
            <span className={styles.ingCountBadge}>
              {ingredients.length.toString().padStart(2, "0")} lô nguyên liệu
            </span>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col" style={{ width: "160px" }}>Mã lô nguồn</th>
                <th scope="col">Tên nguyên liệu</th>
                <th scope="col" style={{ textAlign: "right", width: "160px" }}>
                  Định lượng xuất kho
                </th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((lot) => (
                <tr key={lot.code || lot.name}>
                  <td>
                    <span className={styles.lotCode}>{lot.code}</span>
                  </td>
                  <td className={styles.lotName}>{lot.name}</td>
                  <td className={styles.lotAmount}>{lot.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
