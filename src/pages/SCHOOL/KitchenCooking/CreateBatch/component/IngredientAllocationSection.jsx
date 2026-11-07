import React from "react";
import {
  ShieldCheck,
  CheckCircle2,
  PackageCheck,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import styles from "./IngredientAllocationSection.module.scss";

export default function IngredientAllocationSection({
  selectedDish,
  portions = 1250,
}) {
  if (!selectedDish) {
    return (
      <section className={styles.sectionContainer}>
        <div className={styles.sectionHeader}>
          <div className={styles.titleWithBadge}>
            <div className={styles.numberBadge}>2</div>
            <div>
              <h2 className={styles.sectionTitle}>
                2. Phân bổ lô nguyên liệu & Đối soát định mức
              </h2>
              
            </div>
          </div>
        </div>

        <div className={styles.emptyState}>
          <div className={styles.emptyIconBox}>
            <PackageCheck size={26} />
          </div>
          <h3 className={styles.emptyTitle}>Chưa chọn món ăn cần chế biến</h3>
          <p className={styles.emptyDesc}>Chọn món ăn ở Bước 1 để kiểm tra và đối soát nguyên liệu.</p>
          <div className={styles.emptyHintBadge}>
            <Sparkles size={12} />
            <span>Đang chờ chọn món ăn ở Bước 1</span>
          </div>
        </div>
      </section>
    );
  }

  const ingredients = selectedDish.ingredients || [];

  return (
    <section className={styles.sectionContainer}>
      {/* Header phần 2 */}
      <div className={styles.sectionHeader}>
        <div className={styles.titleWithBadge}>
          <div className={styles.numberBadge}>2</div>
          <div>
            <h2 className={styles.sectionTitle}>
              2. Phân bổ lô nguyên liệu & Đối soát định mức ({selectedDish.name}
              )
            </h2>
            
          </div>
        </div>

        <div className={styles.autoMatchedTag}>
          <ShieldCheck size={14} />
          <span>Tự động khớp lô đủ 100%</span>
        </div>
      </div>

      {/* 1. Desktop View: Bảng đối soát chi tiết */}
      <div className={styles.desktopTableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thLeft} style={{ width: "26%" }}>
                Nguyên liệu & Nhà cung cấp
              </th>
              <th className={styles.thLeft} style={{ width: "16%" }}>
                Mã lô nhập kho
              </th>
              <th className={styles.thLeft} style={{ width: "14%" }}>
                Hạn sử dụng
              </th>
              <th className={styles.thRight} style={{ width: "14%" }}>
                Tồn kho khả dụng
              </th>
              <th className={styles.thRight} style={{ width: "15%" }}>
                Định mức phân bổ
              </th>
              <th className={styles.thLeft} style={{ width: "15%" }}>
                Đối soát
              </th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ing) => (
              <React.Fragment key={ing.id}>
                {ing.lots.map((lot, idx) => (
                  <tr key={lot.code}>
                    {idx === 0 && (
                      <td rowSpan={ing.lots.length} className={styles.alignTop}>
                        <div className={styles.ingredientInfo}>
                          <span className={styles.ingredientName}>
                            {ing.name}
                          </span>
                          <span className={styles.supplierName}>
                            {ing.supplier}
                          </span>
                          {ing.isMultiLot && (
                            <span className={styles.tagMultiLot}>
                              <Layers size={11} />
                              <span>Ghép 02 lô nguyên liệu</span>
                            </span>
                          )}
                        </div>
                      </td>
                    )}

                    <td className={styles.compactTd}>
                      <span className={styles.lotCode}>{lot.code}</span>
                    </td>

                    <td className={styles.compactTd}>
                      <span className={styles.lotExp}>{lot.exp}</span>
                    </td>

                    <td className={styles.textRight}>{lot.available}</td>

                    <td className={styles.textRight}>
                      <span className={styles.takeBadge}>{lot.allocated}</span>
                    </td>

                    {idx === 0 && (
                      <td
                        rowSpan={ing.lots.length}
                        className={styles.alignMiddle}
                      >
                        <span className={styles.statusSuccess}>
                          <CheckCircle2 size={13} />
                          <span>{ing.statusText}</span>
                        </span>
                      </td>
                    )}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* 2. Mobile Cards List */}
      <div
        className={styles.mobileCardsList}
        role="list"
        aria-label="Danh sách đối soát nguyên liệu"
      >
        {ingredients.map((ing) => (
          <div key={ing.id} className={styles.mobileIngCard} role="listitem">
            <div className={styles.mobileCardHeader}>
              <div className={styles.ingTitleWrap}>
                <span className={styles.mobileIngName}>{ing.name}</span>
                {ing.isMultiLot && (
                  <span className={styles.tagMultiLotSmall}>
                    <Layers size={10} />
                    <span>{ing.lots.length} lô</span>
                  </span>
                )}
              </div>
              <span className={styles.mobileStatusBadge}>
                <CheckCircle2 size={13} />
                <span>Đủ</span>
              </span>
            </div>

            <div className={styles.mobileMetaRow}>
              <span className={styles.metaHighlight}>
                Cần: {ing.totalRequired}
              </span>
              <span className={styles.metaDot}>•</span>
              <span className={styles.metaSupplier}>{ing.supplier}</span>
            </div>

            <div className={styles.mobileLotsWrap}>
              {ing.lots.map((lot) => (
                <div key={lot.code} className={styles.mobileLotCard}>
                  <div className={styles.lotCardTop}>
                    <span className={styles.lotCodeMonospace}>{lot.code}</span>
                    <span className={styles.lotExpText}>HSD: {lot.exp}</span>
                  </div>
                  <div className={styles.lotCardBottom}>
                    <span className={styles.lotAvailText}>
                      Tồn: <strong>{lot.available}</strong>
                    </span>
                    <span className={styles.lotAllocBadge}>
                      Lấy: <strong>{lot.allocated}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Dòng tổng kết dưới bảng */}
      <div className={styles.summaryBar}>
        <div className={styles.summaryStatus}>
          <PackageCheck size={16} />
          <span>Đã chọn đủ nguyên liệu (100% nhu cầu chế biến)</span>
        </div>
        <div className={styles.summaryMeta}>
          Tổng cộng: <strong>{ingredients.length} nhóm nguyên liệu</strong> từ{" "}
          <strong>
            {ingredients.reduce((s, i) => s + i.lots.length, 0)} lô hàng
          </strong>{" "}
          đạt chuẩn
        </div>
      </div>
    </section>
  );
}
