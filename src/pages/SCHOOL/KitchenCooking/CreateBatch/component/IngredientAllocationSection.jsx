import React from "react"
import styles from "./IngredientAllocationSection.module.scss"

export default function IngredientAllocationSection() {
  return (
    <section className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleRow}>
          <span className="material-symbols-outlined">checklist</span>
          <h2 className={styles.sectionTitle}>Đối soát lô nguyên liệu &amp; Định lượng</h2>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.ruleBadge}>
            <span className="material-symbols-outlined">blender</span>
            <span>Quy chuẩn: Nấu chung đa lô</span>
          </div>
          <button type="button" className={styles.formulaBtn}>
            <span className="material-symbols-outlined">menu_book</span>
            <span>Công thức món</span>
          </button>
        </div>
      </div>

      {/* Bảng đối soát nguyên liệu */}
      <div className={styles.tableResponsive}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thLeft}>NGUYÊN LIỆU</th>
              <th>TỔNG CẦN</th>
              <th>LÔ NGUYÊN LIỆU (HSD)</th>
              <th className={styles.textRight}>TỒN KHO</th>
              <th className={styles.textRight}>XUẤT LẤY</th>
              <th className={`${styles.thRight} ${styles.textCenter}`}>ĐỐI SOÁT</th>
            </tr>
          </thead>
          <tbody>
            {/* Hàng 1: Thịt heo - Lô 1 */}
            <tr className={styles.trGroup}>
              <td className={styles.alignTop} rowSpan={2}>
                <div className={styles.ingredientCell}>
                  <div className={`${styles.iconBox} ${styles.iconMeat}`}>
                    <span className="material-symbols-outlined">restaurant</span>
                  </div>
                  <div className={styles.nameMeta}>
                    <div className={styles.nameRow}>
                      <span className={styles.ingredientName}>Thịt ba chỉ heo tươi</span>
                      <span className={styles.splitBadge}>Gộp 2 lô</span>
                    </div>
                    <span className={styles.supplierText}>HTX Nam Hà</span>
                  </div>
                </div>
              </td>
              <td className={styles.alignTop} rowSpan={2}>
                <div className={styles.amountCol}>
                  <span className={styles.amountMain}>85.5 kg</span>
                  <span className={styles.amountSub}>1.250 suất</span>
                </div>
              </td>
              <td className={styles.lotCell}>
                <span className={styles.lotCode}>LOT-HEO-892</span>
                <span className={styles.lotDate}>(HSD: 12/11)</span>
              </td>
              <td className={`${styles.lotCell} ${styles.textRight}`}>50.0 kg</td>
              <td className={`${styles.lotCell} ${styles.textRight}`}>
                <span className={styles.takePill}>50.0 kg</span>
              </td>
              <td className={`${styles.alignMiddle} ${styles.textCenter}`} rowSpan={2}>
                <div className={styles.statusSuccess}>
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>Đủ 85.5 kg</span>
                </div>
              </td>
            </tr>

            {/* Hàng 1: Thịt heo - Lô 2 */}
            <tr className={styles.trSubRow}>
              <td className={styles.lotCell}>
                <span className={styles.lotCode}>LOT-HEO-893</span>
                <span className={styles.lotDate}>(HSD: 13/11)</span>
              </td>
              <td className={`${styles.lotCell} ${styles.textRight}`}>60.0 kg</td>
              <td className={`${styles.lotCell} ${styles.textRight}`}>
                <span className={styles.takePill}>35.5 kg</span>
              </td>
            </tr>

            {/* Hàng 2: Trứng cút */}
            <tr>
              <td>
                <div className={styles.ingredientCell}>
                  <div className={`${styles.iconBox} ${styles.iconEgg}`}>
                    <span className="material-symbols-outlined">egg</span>
                  </div>
                  <div className={styles.nameMeta}>
                    <span className={styles.ingredientName}>Trứng cút tươi sạch</span>
                    <span className={styles.supplierText}>Trang trại Ba Vì</span>
                  </div>
                </div>
              </td>
              <td>
                <div className={styles.amountCol}>
                  <span className={styles.amountMain}>2.500 quả</span>
                  <span className={styles.amountSub}>2 quả/suất</span>
                </div>
              </td>
              <td className={styles.lotCell}>
                <span className={styles.lotCode}>LOT-CUT-224</span>
                <span className={styles.lotDate}>(HSD: 20/11)</span>
              </td>
              <td className={`${styles.lotCell} ${styles.textRight}`}>3.000 quả</td>
              <td className={`${styles.lotCell} ${styles.textRight}`}>
                <span className={styles.takePill}>2.500 quả</span>
              </td>
              <td className={styles.textCenter}>
                <div className={styles.statusSuccess}>
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>Đủ 100%</span>
                </div>
              </td>
            </tr>

            {/* Hàng 3: Nước dừa */}
            <tr>
              <td>
                <div className={styles.ingredientCell}>
                  <div className={`${styles.iconBox} ${styles.iconLiquid}`}>
                    <span className="material-symbols-outlined">water_drop</span>
                  </div>
                  <div className={styles.nameMeta}>
                    <span className={styles.ingredientName}>Nước dừa tươi nguyên chất</span>
                    <span className={styles.supplierText}>Nông sản Bến Tre</span>
                  </div>
                </div>
              </td>
              <td>
                <div className={styles.amountCol}>
                  <span className={styles.amountMain}>80.0 lít</span>
                </div>
              </td>
              <td className={styles.lotCell}>
                <span className={styles.lotCode}>LOT-DUA-018</span>
                <span className={styles.lotDate}>(HSD: 15/11)</span>
              </td>
              <td className={`${styles.lotCell} ${styles.textRight}`}>120.0 lít</td>
              <td className={`${styles.lotCell} ${styles.textRight}`}>
                <span className={styles.takePill}>80.0 lít</span>
              </td>
              <td className={styles.textCenter}>
                <div className={styles.statusSuccess}>
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>Đủ 100%</span>
                </div>
              </td>
            </tr>

            {/* Hàng 4: Gia vị */}
            <tr>
              <td>
                <div className={styles.ingredientCell}>
                  <div className={`${styles.iconBox} ${styles.iconSeasoning}`}>
                    <span className="material-symbols-outlined">grain</span>
                  </div>
                  <div className={styles.nameMeta}>
                    <span className={styles.ingredientName}>Gia vị kho an toàn</span>
                    <span className={styles.supplierText}>Tổng kho thực phẩm</span>
                  </div>
                </div>
              </td>
              <td>
                <div className={styles.amountCol}>
                  <span className={styles.amountMain}>4.2 kg</span>
                </div>
              </td>
              <td className={styles.lotCell}>
                <span className={styles.lotCode}>LOT-GVI-045</span>
                <span className={styles.lotDate}>(HSD: 30/12)</span>
              </td>
              <td className={`${styles.lotCell} ${styles.textRight}`}>15.0 kg</td>
              <td className={`${styles.lotCell} ${styles.textRight}`}>
                <span className={styles.takePill}>4.2 kg</span>
              </td>
              <td className={styles.textCenter}>
                <div className={styles.statusSuccess}>
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>Đủ 100%</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Tóm tắt chân bảng */}
      <div className={styles.tableFooterBar}>
        <div className={styles.footerLeft}>
          <span className="material-symbols-outlined">check_circle</span>
          <span>Đã đối soát đủ 100% định lượng cho 1.250 suất ăn</span>
        </div>
        <span className={styles.footerMeta}>04 nhóm nguyên liệu từ 05 lô hàng đạt chuẩn</span>
      </div>
    </section>
  )
}
