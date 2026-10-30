import React from "react"
import {
  ShieldCheck,
  CheckCircle2,
  PackageCheck,
  Layers,
  Split
} from "lucide-react"
import styles from "./IngredientSeparateSection.module.scss"

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
        exp: "12/11/2024",
        available: "50.0 kg",
        allocated: "50.0 kg",
        targetBatch: "Lô 1 (731 suất)",
      },
      {
        code: "LOT-HEO-893",
        exp: "13/11/2024",
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
        exp: "20/11/2024",
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
        exp: "15/11/2024",
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
        exp: "30/12/2024",
        available: "15.0 kg",
        allocated: "4.2 kg",
        targetBatch: "Phân bổ 2 lô",
      },
    ],
  },
]

export default function IngredientSeparateSection() {
  return (
    <section className={styles.sectionContainer}>
      {/* Header phần 2 */}
      <div className={styles.sectionHeader}>
        <div className={styles.titleWithBadge}>
          <div className={styles.numberBadge}>2</div>
          <div>
            <h2 className={styles.sectionTitle}>
              2. Chọn lô nguyên liệu &amp; Đối soát định lượng
            </h2>
            <p className={styles.sectionSubtitle}>
              Tự động phân tách lô theo nguồn gốc xuất xứ nguyên liệu chính
            </p>
          </div>
        </div>
      </div>

      {/* Banner quy chuẩn nấu riêng 1:1 của nhà trường */}
      <div className={styles.policyBanner}>
        <ShieldCheck size={18} className={styles.policyIcon} />
        <div className={styles.policyContent}>
          <div className={styles.policyMeta}>
            <span className={styles.policyTitle}>
              Quy định trường: Nấu riêng 1:1 theo lô nguyên liệu
            </span>
            <span className={styles.bullet}>•</span>
            <span className={styles.mealTime}>Giờ ăn: Bữa trưa (11:15)</span>
          </div>
          <p className={styles.policyDesc}>
            Khi nguyên liệu chính có nhiều lô hàng khác nhau, hệ thống tự động tách thành các
            lô chế biến độc lập để bảo đảm tính truy xuất nguồn gốc số hóa riêng biệt 1:1.
          </p>
        </div>
      </div>

      {/* 1. Desktop View: Bảng đối soát phân tách lô (Hiện trên Desktop >= 768px) */}
      <div className={styles.desktopTableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thLeft}>Nguyên liệu &amp; Nhà cung cấp</th>
              <th>Tổng định lượng</th>
              <th>Mã lô (HSD)</th>
              <th className={styles.textRight}>Tồn khả dụng</th>
              <th className={styles.textRight}>Xuất lấy</th>
              <th>Phân bổ phiên nấu</th>
              <th className={`${styles.thRight} ${styles.textCenter}`}>Đối soát</th>
            </tr>
          </thead>
          <tbody>
            {INGREDIENTS_DATA.map((ing) => (
              <React.Fragment key={ing.id}>
                {ing.lots.map((lot, idx) => (
                  <tr key={lot.code} className={styles.trHover}>
                    {idx === 0 && (
                      <td className={styles.alignTop} rowSpan={ing.lots.length}>
                        <div className={styles.ingredientInfo}>
                          <span className={styles.ingredientName}>{ing.name}</span>
                          <span className={styles.supplierName}>{ing.supplier}</span>
                          {ing.isSplit && (
                            <span className={styles.tagSplit}>
                              <Split size={11} />
                              <span>Tách {ing.lots.length} lô</span>
                            </span>
                          )}
                        </div>
                      </td>
                    )}

                    {idx === 0 && (
                      <td className={styles.alignTop} rowSpan={ing.lots.length}>
                        <div className={styles.totalRequired}>
                          <span className={styles.requiredAmount}>{ing.totalRequired}</span>
                          <span className={styles.portionNote}>{ing.portionNote}</span>
                        </div>
                      </td>
                    )}

                    <td className={styles.compactTd}>
                      <div className={styles.lotInfo}>
                        <span className={styles.lotCode}>{lot.code}</span>
                        <span className={styles.lotExp}>(HSD: {lot.exp})</span>
                      </div>
                    </td>

                    <td className={`${styles.compactTd} ${styles.textRight}`}>
                      {lot.available}
                    </td>

                    <td className={`${styles.compactTd} ${styles.textRight}`}>
                      <span className={styles.takeBadge}>{lot.allocated}</span>
                    </td>

                    <td className={styles.compactTd}>
                      <span className={styles.targetBatchPill}>{lot.targetBatch}</span>
                    </td>

                    {idx === 0 && (
                      <td
                        className={`${styles.alignMiddle} ${styles.textCenter}`}
                        rowSpan={ing.lots.length}
                      >
                        <div className={styles.statusSuccess}>
                          <CheckCircle2 size={15} />
                          <span>{ing.statusText}</span>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* 2. Mobile View: Thẻ nguyên liệu đối soát phân tách lô (Hiện trên Mobile < 768px) */}
      <div className={styles.mobileCardsList} role="list" aria-label="Danh sách đối soát nguyên liệu">
        {INGREDIENTS_DATA.map((ing) => (
          <div key={ing.id} className={styles.mobileIngCard} role="listitem">
            {/* Hàng 1: Tên nguyên liệu + Trạng thái */}
            <div className={styles.mobileCardHeader}>
              <div className={styles.ingTitleWrap}>
                <span className={styles.mobileIngName}>{ing.name}</span>
                {ing.isSplit && (
                  <span className={styles.tagSplitSmall}>
                    <Split size={10} />
                    <span>Tách {ing.lots.length} lô</span>
                  </span>
                )}
              </div>
              <span className={styles.mobileStatusBadge}>
                <CheckCircle2 size={13} className={styles.checkIconSmall} />
                <span>Đủ</span>
              </span>
            </div>

            {/* Hàng 2: Định lượng cần & Nhà cung cấp */}
            <div className={styles.mobileMetaRow}>
              <span className={styles.metaHighlight}>Cần: {ing.totalRequired}</span>
              <span className={styles.metaDot}>•</span>
              <span className={styles.metaSupplier}>{ing.supplier}</span>
            </div>

            {/* Hàng 3: Danh sách các lô xuất kho con (Thẻ 2 dòng chống tràn chữ) */}
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
                    <div className={styles.lotBottomRight}>
                      <span className={styles.lotTargetPill}>{lot.targetBatch}</span>
                      <span className={styles.lotAllocBadge}>
                        Lấy: <strong>{lot.allocated}</strong>
                      </span>
                    </div>
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
          <span>Đã chọn đủ nguyên liệu (100% định lượng)</span>
        </div>
        <div className={styles.summaryMeta}>
          Tổng cộng: <strong>04 nhóm nguyên liệu</strong> từ{" "}
          <strong>05 lô hàng</strong> đạt chuẩn
        </div>
      </div>
    </section>
  )
}
