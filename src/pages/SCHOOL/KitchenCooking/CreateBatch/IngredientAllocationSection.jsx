import React from "react"
import {
  ShieldCheck,
  CheckCircle2,
  PackageCheck,
  Calendar,
  Layers
} from "lucide-react"
import styles from "./IngredientAllocationSection.module.scss"

const INGREDIENTS_DATA = [
  {
    id: "ing-1",
    name: "Thịt ba chỉ heo tươi",
    supplier: "Hợp tác xã Nam Hà",
    totalRequired: "85.5 kg",
    portionNote: "1.250 suất",
    isMultiLot: true,
    statusText: "Đủ 85.5 / 85.5 kg",
    statusType: "success",
    lots: [
      {
        code: "LOT-HEO-892",
        exp: "12/11/2024",
        available: "50.0 kg",
        allocated: "50.0 kg",
      },
      {
        code: "LOT-HEO-893",
        exp: "13/11/2024",
        available: "60.0 kg",
        allocated: "35.5 kg",
      },
    ],
  },
  {
    id: "ing-2",
    name: "Trứng cút tươi sạch",
    supplier: "Trang trại Gia cầm Ba Vì",
    totalRequired: "2.500 quả",
    portionNote: "1.250 suất",
    isMultiLot: false,
    statusText: "Đủ 2.500 / 2.500 quả",
    statusType: "success",
    lots: [
      {
        code: "LOT-CUT-224",
        exp: "20/11/2024",
        available: "3.000 quả",
        allocated: "2.500 quả",
      },
    ],
  },
  {
    id: "ing-3",
    name: "Nước dừa tươi nguyên chất",
    supplier: "Công ty Nông sản Bến Tre",
    totalRequired: "80.0 lít",
    portionNote: "1.250 suất",
    isMultiLot: false,
    statusText: "Đủ 80.0 / 80.0 lít",
    statusType: "success",
    lots: [
      {
        code: "LOT-DUA-018",
        exp: "15/11/2024",
        available: "120.0 lít",
        allocated: "80.0 lít",
      },
    ],
  },
  {
    id: "ing-4",
    name: "Gia vị kho an toàn",
    supplier: "Tổng kho gia vị thực phẩm",
    totalRequired: "4.2 kg",
    portionNote: "1.250 suất",
    isMultiLot: false,
    statusText: "Đủ 4.2 / 4.2 kg",
    statusType: "success",
    lots: [
      {
        code: "LOT-GVI-045",
        exp: "30/12/2024",
        available: "15.0 kg",
        allocated: "4.2 kg",
      },
    ],
  },
]

export default function IngredientAllocationSection() {
  return (
    <section className={styles.sectionContainer}>
      {/* Header phần 2 */}
      <div className={styles.sectionHeader}>
        <div className={styles.titleWithBadge}>
          <div className={styles.numberBadge}>2</div>
          <div>
            <h2 className={styles.sectionTitle}>
              <span className={styles.desktopTitle}>2. Chọn lô nguyên liệu &amp; Đối soát định lượng</span>
              <span className={styles.mobileTitle}>2. Chọn lô nguyên liệu</span>
            </h2>
            <p className={styles.sectionSubtitle}>
              Tự động tính theo định mức công thức món và số suất ăn
            </p>
          </div>
        </div>
      </div>

      {/* Banner quy chuẩn nấu chung của nhà trường */}
      <div className={styles.policyBanner}>
        <ShieldCheck size={18} className={styles.policyIcon} />
        <div className={styles.policyContent}>
          <div className={styles.policyMeta}>
            <span className={styles.policyTitle}>
              Quy định trường: Nấu chung đa lô nguyên liệu
            </span>
            <span className={styles.bullet}>•</span>
            <span className={styles.mealTime}>Giờ ăn: Bữa trưa (11:15)</span>
          </div>
          <p className={styles.policyDesc}>
            Cho phép kết hợp nhiều lô của cùng một loại nguyên liệu trong một lô chế biến,
            bắt buộc ghi nhận riêng số lượng từng lô để phục vụ truy xuất nguồn gốc số hóa.
          </p>
        </div>
      </div>

      {/* 1. Desktop View: Bảng đối soát đa lô (Hiện trên Desktop >= 768px) */}
      <div className={styles.desktopTableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thLeft}>Nguyên liệu &amp; Nhà cung cấp</th>
              <th>Định lượng cần</th>
              <th>Mã lô (HSD)</th>
              <th className={styles.textRight}>Tồn khả dụng</th>
              <th className={styles.textRight}>Dự kiến lấy</th>
              <th className={`${styles.thRight} ${styles.textCenter}`}>
                Đối soát
              </th>
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
                          {ing.isMultiLot && (
                            <span className={styles.tagMultiLot}>
                              <Layers size={11} />
                              <span>Gộp {ing.lots.length} lô</span>
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

      {/* 2. Mobile View: Thẻ nguyên liệu đối soát đa lô mật độ cao (Hiện trên Mobile < 768px) */}
      <div className={styles.mobileCardsList} role="list" aria-label="Danh sách đối soát nguyên liệu">
        {INGREDIENTS_DATA.map((ing) => (
          <div key={ing.id} className={styles.mobileIngCard} role="listitem">
            {/* Hàng 1: Tên nguyên liệu + Trạng thái đối soát */}
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

            {/* Hàng 3: Danh sách các lô xuất kho con (Dạng thẻ 2 dòng chống tràn chữ) */}
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
