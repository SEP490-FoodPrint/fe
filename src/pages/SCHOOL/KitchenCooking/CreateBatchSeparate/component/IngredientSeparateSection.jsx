import React from "react"
import styles from "./IngredientSeparateSection.module.scss"

export default function IngredientSeparateSection() {
  return (
    <section className={styles.compactCard}>
      <div className={styles.cardHeader}>
        <div className={styles.headerTitle}>
          <span className={`material-symbols-outlined ${styles.headerIcon}`}>
            checklist
          </span>
          <span className={styles.titleText}>
            Đối soát lô nguyên liệu &amp; Định lượng
          </span>
        </div>

        <div className={styles.headerActions}>
          <span className={styles.ruleBadge} title="Tự động tách mẻ khi nguyên liệu chính có nhiều hơn 1 lô">
            <span className="material-symbols-outlined">call_split</span>
            <span>Quy chuẩn: Tách mẻ theo lô</span>
          </span>

          <button type="button" className={styles.formulaBtn}>
            <span className="material-symbols-outlined">menu_book</span>
            <span>Công thức món</span>
          </button>
        </div>
      </div>

      {/* Bảng dữ liệu tinh gọn, không viền dọc */}
      <div className={styles.tableWrap}>
        <table className={styles.cleanTable}>
          <thead>
            <tr>
              <th className={styles.thLeft}>Nguyên liệu</th>
              <th>Tổng cần</th>
              <th>Lô nguyên liệu (HSD)</th>
              <th className={styles.textRight}>Tồn kho</th>
              <th className={styles.textRight}>Xuất lấy</th>
              <th className={`${styles.thRight} ${styles.textCenter}`}>Đối soát</th>
            </tr>
          </thead>
          <tbody>
            {/* Row 1: Thịt heo - Sublot 1 */}
            <tr className={styles.rowHighlight}>
              <td className={styles.cellTop} rowSpan={2}>
                <div className={styles.itemWithIcon}>
                  <div className={styles.iconBoxMeat}>
                    <span className="material-symbols-outlined">restaurant</span>
                  </div>
                  <div className={styles.itemMeta}>
                    <div className={styles.nameRow}>
                      <span className={styles.itemName}>Thịt ba chỉ heo tươi</span>
                      <span className={styles.splitPill}>
                        <span className="material-symbols-outlined">call_split</span>
                        <span>Tách 2 lô</span>
                      </span>
                    </div>
                    <span className={styles.supplierText}>HTX Nam Hà</span>
                  </div>
                </div>
              </td>
              <td className={styles.cellTop} rowSpan={2}>
                <div className={styles.qtyBox}>
                  <span className={styles.qtyMain}>85.5 kg</span>
                  <span className={styles.qtySub}>1.250 suất</span>
                </div>
              </td>
              <td>
                <div className={styles.lotRow}>
                  <span className={styles.lotCode}>LOT-HEO-892</span>
                  <span className={styles.expDate}>(HSD: 12/11)</span>
                </div>
              </td>
              <td className={styles.textRight}>50.0 kg</td>
              <td className={styles.textRight}>
                <span className={styles.takePill}>50.0 kg</span>
              </td>
              <td className={`${styles.cellMiddle} ${styles.textCenter}`} rowSpan={2}>
                <div className={styles.statusSuccess}>
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>Đủ 85.5 kg</span>
                </div>
              </td>
            </tr>

            {/* Row 1: Thịt heo - Sublot 2 */}
            <tr className={styles.sublotRow}>
              <td>
                <div className={styles.lotRow}>
                  <span className={styles.lotCode}>LOT-HEO-893</span>
                  <span className={styles.expDate}>(HSD: 13/11)</span>
                </div>
              </td>
              <td className={styles.textRight}>60.0 kg</td>
              <td className={styles.textRight}>
                <span className={styles.takePill}>35.5 kg</span>
              </td>
            </tr>

            {/* Row 2: Trứng cút */}
            <tr>
              <td>
                <div className={styles.itemWithIcon}>
                  <div className={styles.iconBoxEgg}>
                    <span className="material-symbols-outlined">egg</span>
                  </div>
                  <div className={styles.itemMeta}>
                    <span className={styles.itemName}>Trứng cút tươi sạch</span>
                    <span className={styles.supplierText}>Trang trại Ba Vì</span>
                  </div>
                </div>
              </td>
              <td>
                <div className={styles.qtyBox}>
                  <span className={styles.qtyMain}>2.500 quả</span>
                  <span className={styles.qtySub}>2 quả/suất</span>
                </div>
              </td>
              <td>
                <div className={styles.lotRow}>
                  <span className={styles.lotCode}>LOT-CUT-224</span>
                  <span className={styles.expDate}>(HSD: 20/11)</span>
                </div>
              </td>
              <td className={styles.textRight}>3.000 quả</td>
              <td className={styles.textRight}>
                <span className={styles.takePill}>2.500 quả</span>
              </td>
              <td className={styles.textCenter}>
                <div className={styles.statusSuccess}>
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>Đủ 100%</span>
                </div>
              </td>
            </tr>

            {/* Row 3: Nước dừa */}
            <tr>
              <td>
                <div className={styles.itemWithIcon}>
                  <div className={styles.iconBoxDrink}>
                    <span className="material-symbols-outlined">water_drop</span>
                  </div>
                  <div className={styles.itemMeta}>
                    <span className={styles.itemName}>Nước dừa tươi nguyên chất</span>
                    <span className={styles.supplierText}>Nông sản Bến Tre</span>
                  </div>
                </div>
              </td>
              <td>
                <div className={styles.qtyBox}>
                  <span className={styles.qtyMain}>80.0 lít</span>
                </div>
              </td>
              <td>
                <div className={styles.lotRow}>
                  <span className={styles.lotCode}>LOT-DUA-018</span>
                  <span className={styles.expDate}>(HSD: 15/11)</span>
                </div>
              </td>
              <td className={styles.textRight}>120.0 lít</td>
              <td className={styles.textRight}>
                <span className={styles.takePill}>80.0 lít</span>
              </td>
              <td className={styles.textCenter}>
                <div className={styles.statusSuccess}>
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>Đủ 100%</span>
                </div>
              </td>
            </tr>

            {/* Row 4: Gia vị */}
            <tr>
              <td>
                <div className={styles.itemWithIcon}>
                  <div className={styles.iconBoxSpice}>
                    <span className="material-symbols-outlined">grain</span>
                  </div>
                  <div className={styles.itemMeta}>
                    <span className={styles.itemName}>Gia vị kho an toàn</span>
                    <span className={styles.supplierText}>Tổng kho thực phẩm</span>
                  </div>
                </div>
              </td>
              <td>
                <div className={styles.qtyBox}>
                  <span className={styles.qtyMain}>4.2 kg</span>
                </div>
              </td>
              <td>
                <div className={styles.lotRow}>
                  <span className={styles.lotCode}>LOT-GVI-045</span>
                  <span className={styles.expDate}>(HSD: 30/12)</span>
                </div>
              </td>
              <td className={styles.textRight}>15.0 kg</td>
              <td className={styles.textRight}>
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

      {/* Dòng tổng kết thanh mảnh */}
      <div className={styles.summaryBar}>
        <div className={styles.summaryLeft}>
          <span className="material-symbols-outlined">task_alt</span>
          <span>Đã đối soát đủ 100% định lượng cho 1.250 suất ăn</span>
        </div>
        <span className={styles.summaryRight}>
          04 nhóm nguyên liệu từ 05 lô hàng đạt chuẩn
        </span>
      </div>
    </section>
  )
}
