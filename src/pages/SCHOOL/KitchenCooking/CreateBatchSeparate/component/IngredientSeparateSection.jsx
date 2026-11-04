import React from "react";
import {
  ShieldCheck,
  CheckCircle2,
  PackageCheck,
  Layers,
  Split,
  Calendar,
  Sparkles,
} from "lucide-react";
import styles from "./IngredientSeparateSection.module.scss";

const INGREDIENTS_DATA = [
  {
    id: "ing-1",
    name: "Thịt ba chỉ heo tươi",
    supplier: "Hợp tác xã Nam Hà",
    totalRequired: "85.5 kg",
    portionNote: "1.250 suất (Tách 2 lô)",
    isSplit: true,
    statusText: "Đủ 85.5 / 85.5 kg",
    statusType: "success",
    lots: [
      {
        code: "LOT-HEO-892",
        exp: "12/11/2026",
        available: "50.0 kg",
        allocated: "50.0 kg",
        targetBatch: "Lô 1 (731 suất)",
      },
      {
        code: "LOT-HEO-893",
        exp: "13/11/2026",
        available: "60.0 kg",
        allocated: "35.5 kg",
        targetBatch: "Lô 2 (519 suất)",
      },
    ],
  },
  {
    id: "ing-2",
    name: "Trứng cút tươi sạch",
    supplier: "Trang trại Gia cầm Ba Vì",
    totalRequired: "2.500 quả",
    portionNote: "1.250 suất",
    isSplit: false,
    statusText: "Đủ 2.500 / 2.500 quả",
    statusType: "success",
    lots: [
      {
        code: "LOT-CUT-224",
        exp: "20/11/2026",
        available: "3.000 quả",
        allocated: "2.500 quả",
        targetBatch: "Phân bổ 2 lô",
      },
    ],
  },
  {
    id: "ing-3",
    name: "Nước dừa tươi nguyên chất",
    supplier: "Công ty Nông sản Bến Tre",
    totalRequired: "80.0 lít",
    portionNote: "1.250 suất",
    isSplit: false,
    statusText: "Đủ 80.0 / 80.0 lít",
    statusType: "success",
    lots: [
      {
        code: "LOT-DUA-018",
        exp: "15/11/2026",
        available: "120.0 lít",
        allocated: "80.0 lít",
        targetBatch: "Phân bổ 2 lô",
      },
    ],
  },
  {
    id: "ing-4",
    name: "Gia vị kho an toàn",
    supplier: "Tổng kho gia vị thực phẩm",
    totalRequired: "4.2 kg",
    portionNote: "1.250 suất",
    isSplit: false,
    statusText: "Đủ 4.2 / 4.2 kg",
    statusType: "success",
    lots: [
      {
        code: "LOT-GVI-045",
        exp: "30/12/2026",
        available: "15.0 kg",
        allocated: "4.2 kg",
        targetBatch: "Phân bổ 2 lô",
      },
    ],
  },
];

export default function IngredientSeparateSection({
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
                2. Đối soát & Phân tách lô theo nguồn gốc
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
            <span>Phân tách lô độc lập đảm bảo truy xuất nguồn gốc</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleWithBadge}>
          <div className={styles.numberBadge}>2</div>
          <div>
            <h2 className={styles.sectionTitle}>
              2. Đối soát & Phân tách lô theo nguồn gốc ({selectedDish.name})
            </h2>
            
          </div>
        </div>

        <div className={styles.autoMatchedTag}>
          <ShieldCheck size={14} />
          <span>Tách lô nguyên liệu đạt chuẩn</span>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className={styles.desktopTableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thLeft} style={{ width: "25%" }}>
                Nguyên liệu & Nhà cung cấp
              </th>
              <th className={styles.thLeft} style={{ width: "15%" }}>
                Mã lô nhập kho
              </th>
              <th className={styles.thLeft} style={{ width: "13%" }}>
                Hạn sử dụng
              </th>
              <th className={styles.thRight} style={{ width: "13%" }}>
                Tồn khả dụng
              </th>
              <th className={styles.thRight} style={{ width: "14%" }}>
                Định mức lấy
              </th>
              <th className={styles.thLeft} style={{ width: "20%" }}>
                Phân bổ mẻ nấu
              </th>
            </tr>
          </thead>
          <tbody>
            {INGREDIENTS_DATA.map((ing) => (
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
                          {ing.isSplit && (
                            <span className={styles.tagSplit}>
                              <Split size={11} />
                              <span>Tách 02 mẻ độc lập</span>
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

                    <td className={styles.alignMiddle}>
                      <span
                        className={
                          lot.targetBatch.includes("Lô 1")
                            ? styles.badgeBatch1
                            : lot.targetBatch.includes("Lô 2")
                              ? styles.badgeBatch2
                              : styles.badgeBatchShared
                        }
                      >
                        {lot.targetBatch}
                      </span>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.summaryBar}>
        <div className={styles.summaryStatus}>
          <CheckCircle2 size={16} />
          <span>Đã hoàn tất phân bổ 02 nhánh lô chế biến song song</span>
        </div>
        <div className={styles.summaryMeta}>
          Tổng cộng: <strong>85.5 kg thịt heo</strong> tách làm{" "}
          <strong>02 lô nấu độc lập</strong>
        </div>
      </div>
    </section>
  );
}
