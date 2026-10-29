import React from "react"
import styles from "./IngredientSeparateSection.module.scss"

export default function IngredientSeparateSection() {
  return (
    <section className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleWithBadge}>
          <div className={styles.numberBadge}>2</div>
          <div>
            <h2 className={styles.sectionTitle}>
              Chọn lô nguyên liệu &amp; Đối soát định lượng
            </h2>
            <p className={styles.sectionSubtitle}>
              Định lượng được tính theo số suất dự kiến và công thức của món ăn.
            </p>
          </div>
        </div>

        <button type="button" className={styles.recipeBtn}>
          <span className="material-symbols-outlined">receipt_long</span>
          <span>Xem định lượng công thức</span>
        </button>
      </div>

      {/* Banner quy tắc nấu riêng */}
      <div className={styles.policyBanner}>
        <div className={styles.policyTitleGroup}>
          <span className={`material-symbols-outlined ${styles.policyIcon}`}>
            policy
          </span>
          <span className={styles.policyTitle}>
            Quy định của trường: Nấu riêng theo lô nguyên liệu
          </span>
        </div>
        <div className={styles.mealTimeGroup}>
          <span className="material-symbols-outlined">schedule</span>
          <span>Giờ ăn: Bữa trưa — 11:15</span>
        </div>
      </div>

      {/* Bảng đối soát */}
      <div className={styles.tableResponsive}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thLeft}>NGUYÊN LIỆU</th>
              <th>TỔNG LƯỢNG CẦN</th>
              <th>LÔ NGUYÊN LIỆU (HSD)</th>
              <th className={styles.textRight}>TỒN KHẢ DỤNG</th>
              <th className={styles.textRight}>LƯỢNG DỰ KIẾN LẤY</th>
              <th className={`${styles.thRight} ${styles.textCenter}`}>
                TRẠNG THÁI ĐỐI SOÁT
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Hàng 1: Thịt ba chỉ heo tươi - Lô 1 */}
            <tr className={styles.trHover}>
              <td className={styles.alignTop} rowSpan={2}>
                <div className={styles.ingredientInfo}>
                  <span className={styles.ingredientName}>
                    Thịt ba chỉ heo tươi
                  </span>
                  <span className={styles.supplierName}>Hợp tác xã Nam Hà</span>
                  <span className={styles.splitBatchTag}>
                    <span className={styles.splitDot} />
                    <span>Gây tách mẻ (2 lô)</span>
                  </span>
                </div>
              </td>
              <td className={styles.alignTop} rowSpan={2}>
                <div className={styles.totalRequired}>
                  <span className={styles.requiredAmount}>85.5 kg</span>
                  <span className={styles.portionNote}>(1.250 suất)</span>
                </div>
              </td>
              <td className={styles.compactTd}>
                <div className={styles.lotInfo}>
                  <span className={styles.lotCode}>LOT-HEO-892</span>
                  <span className={styles.lotExp}>(HSD: 12/11/2024)</span>
                </div>
              </td>
              <td className={`${styles.compactTd} ${styles.textRight}`}>
                50.0 kg
              </td>
              <td className={`${styles.compactTd} ${styles.textRight}`}>
                <span className={styles.takeAmount}>50.0 kg</span>
              </td>
              <td
                className={`${styles.alignMiddle} ${styles.textCenter}`}
                rowSpan={2}
              >
                <div className={styles.statusCol}>
                  <span className={styles.statusSuccess}>
                    <span className="material-symbols-outlined">check_circle</span>
                    <span>Đủ 85.5 / 85.5 kg</span>
                  </span>
                  <span className={styles.percentText}>100% định lượng</span>
                </div>
              </td>
            </tr>

            {/* Row 1 Sublot 2 */}
            <tr className={styles.trHover}>
              <td className={`${styles.compactTd} ${styles.sublotRow}`}>
                <div className={styles.lotInfo}>
                  <span className={styles.lotCode}>LOT-HEO-893</span>
                  <span className={styles.lotExp}>(HSD: 13/11/2024)</span>
                </div>
              </td>
              <td
                className={`${styles.compactTd} ${styles.textRight} ${styles.sublotRow}`}
              >
                60.0 kg
              </td>
              <td
                className={`${styles.compactTd} ${styles.textRight} ${styles.sublotRow}`}
              >
                <span className={styles.takeAmount}>35.5 kg</span>
              </td>
            </tr>

            {/* Hàng 2: Trứng cút tươi sạch */}
            <tr className={styles.trHover}>
              <td>
                <div className={styles.ingredientInfo}>
                  <span className={styles.ingredientName}>Trứng cút tươi sạch</span>
                  <span className={styles.supplierName}>
                    Trang trại Gia cầm Ba Vì
                  </span>
                </div>
              </td>
              <td>
                <div className={styles.totalRequired}>
                  <span className={styles.requiredAmount}>2.500 quả</span>
                  <span className={styles.portionNote}>(2 quả / suất)</span>
                </div>
              </td>
              <td>
                <div className={styles.lotInfo}>
                  <span className={styles.lotCode}>LOT-CUT-224</span>
                  <span className={styles.lotExp}>(HSD: 20/11/2024)</span>
                </div>
              </td>
              <td className={styles.textRight}>3.000 quả</td>
              <td className={styles.textRight}>
                <span className={styles.takeAmount}>2.500 quả</span>
              </td>
              <td className={styles.textCenter}>
                <span className={styles.statusSuccess}>
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>Đủ 2.500 / 2.500 quả</span>
                </span>
              </td>
            </tr>

            {/* Hàng 3: Nước dừa tươi nguyên chất */}
            <tr className={styles.trHover}>
              <td>
                <div className={styles.ingredientInfo}>
                  <span className={styles.ingredientName}>
                    Nước dừa tươi nguyên chất
                  </span>
                  <span className={styles.supplierName}>
                    Công ty Nông sản Bến Tre
                  </span>
                </div>
              </td>
              <td>
                <div className={styles.totalRequired}>
                  <span className={styles.requiredAmount}>80.0 lít</span>
                  <span className={styles.portionNote}>
                    (Kho thịt truyền thống)
                  </span>
                </div>
              </td>
              <td>
                <div className={styles.lotInfo}>
                  <span className={styles.lotCode}>LOT-DUA-018</span>
                  <span className={styles.lotExp}>(HSD: 15/11/2024)</span>
                </div>
              </td>
              <td className={styles.textRight}>120.0 lít</td>
              <td className={styles.textRight}>
                <span className={styles.takeAmount}>80.0 lít</span>
              </td>
              <td className={styles.textCenter}>
                <span className={styles.statusSuccess}>
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>Đủ 80.0 / 80.0 lít</span>
                </span>
              </td>
            </tr>

            {/* Hàng 4: Gia vị kho an toàn */}
            <tr className={styles.trHover}>
              <td>
                <div className={styles.ingredientInfo}>
                  <span className={styles.ingredientName}>Gia vị kho an toàn</span>
                  <span className={styles.supplierName}>
                    Tổng kho gia vị thực phẩm
                  </span>
                </div>
              </td>
              <td>
                <div className={styles.totalRequired}>
                  <span className={styles.requiredAmount}>4.2 kg</span>
                  <span className={styles.portionNote}>
                    (Hành, tỏi, đường, mắm)
                  </span>
                </div>
              </td>
              <td>
                <div className={styles.lotInfo}>
                  <span className={styles.lotCode}>LOT-GVI-045</span>
                  <span className={styles.lotExp}>(HSD: 30/12/2024)</span>
                </div>
              </td>
              <td className={styles.textRight}>15.0 kg</td>
              <td className={styles.textRight}>
                <span className={styles.takeAmount}>4.2 kg</span>
              </td>
              <td className={styles.textCenter}>
                <span className={styles.statusSuccess}>
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>Đủ 4.2 / 4.2 kg</span>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Dòng tổng kết */}
      <div className={styles.summaryBar}>
        <div className={styles.summaryStatus}>
          <span className="material-symbols-outlined">task_alt</span>
          <span>Đã chọn đủ nguyên liệu (100% định lượng)</span>
        </div>
        <span className={styles.summaryMeta}>
          Tổng cộng: 04 nhóm nguyên liệu từ 05 lô hàng đạt chuẩn
        </span>
      </div>
    </section>
  )
}
