import React from "react"
import styles from "./IngredientAllocationSection.module.scss"

export default function IngredientAllocationSection() {
  return (
    <section className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleWithBadge}>
          <div className={styles.numberBadge}>2</div>
          <div>
            <h2 className={styles.sectionTitle}>
              2. Chọn lô nguyên liệu &amp; Đối soát định lượng
            </h2>
            <p className={styles.sectionSubtitle}>
              Định lượng được tính theo số suất dự kiến và công thức của món ăn.
            </p>
          </div>
        </div>

        <a href="#formula" className={styles.formulaLink}>
          <span className="material-symbols-outlined">menu_book</span>
          <span>Xem định lượng công thức</span>
        </a>
      </div>

      {/* Banner quy chuẩn nấu chung của nhà trường */}
      <div className={styles.policyBanner}>
        <span className={`material-symbols-outlined ${styles.policyIcon}`}>
          verified_user
        </span>
        <div className={styles.policyContent}>
          <div className={styles.policyMeta}>
            <span className={styles.policyTitle}>
              Quy định của trường: Nấu chung nhiều lô nguyên liệu
            </span>
            <span className={styles.bullet}>•</span>
            <span className={styles.policyActor}>Được thiết lập bởi nhà trường</span>
            <span className={styles.bullet}>•</span>
            <span className={styles.mealTime}>Giờ ăn: Bữa trưa — 11:15</span>
          </div>
          <p className={styles.policyDesc}>
            Có thể sử dụng nhiều lô của cùng một nguyên liệu trong một mẻ, nhưng
            bắt buộc ghi nhận riêng lượng sử dụng từ từng lô để đảm bảo tính toàn
            vẹn và khả năng truy xuất nguồn gốc hai chiều.
          </p>
        </div>
      </div>

      {/* Bảng đối soát nấu chung nguyên bản */}
      <div className={styles.tableResponsive}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thLeft}>Nguyên liệu</th>
              <th>Tổng lượng cần</th>
              <th>Lô nguyên liệu (HSD)</th>
              <th className={styles.textRight}>Tồn khả dụng</th>
              <th className={styles.textRight}>Lượng dự kiến lấy</th>
              <th className={`${styles.thRight} ${styles.textCenter}`}>
                Trạng thái đối soát
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
                </div>
              </td>
              <td className={styles.alignTop} rowSpan={2}>
                <div className={styles.totalRequired}>
                  <span className={styles.requiredAmount}>85.5 kg</span>
                  <span className={styles.portionNote}>1.250 suất</span>
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
                <span className={styles.takeBadge}>50.0 kg</span>
              </td>
              <td
                className={`${styles.alignMiddle} ${styles.textCenter}`}
                rowSpan={2}
              >
                <div className={styles.statusSuccess}>
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>Đủ 85.5 / 85.5 kg</span>
                </div>
              </td>
            </tr>

            {/* Hàng 1 con: Lô heo thứ 2 */}
            <tr className={styles.trHover}>
              <td className={styles.compactTd}>
                <div className={styles.lotInfo}>
                  <span className={styles.lotCode}>LOT-HEO-893</span>
                  <span className={styles.lotExp}>(HSD: 13/11/2024)</span>
                </div>
              </td>
              <td className={`${styles.compactTd} ${styles.textRight}`}>
                60.0 kg
              </td>
              <td className={`${styles.compactTd} ${styles.textRight}`}>
                <span className={styles.takeBadge}>35.5 kg</span>
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
                <span className={styles.requiredAmount}>2.500 quả</span>
              </td>
              <td>
                <div className={styles.lotInfo}>
                  <span className={styles.lotCode}>LOT-CUT-224</span>
                  <span className={styles.lotExp}>(HSD: 20/11/2024)</span>
                </div>
              </td>
              <td className={styles.textRight}>3.000 quả</td>
              <td className={styles.textRight}>
                <span className={styles.takeBadge}>2.500 quả</span>
              </td>
              <td className={styles.textCenter}>
                <div className={styles.statusSuccess}>
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>Đủ 2.500 / 2.500 quả</span>
                </div>
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
                <span className={styles.requiredAmount}>80.0 lít</span>
              </td>
              <td>
                <div className={styles.lotInfo}>
                  <span className={styles.lotCode}>LOT-DUA-018</span>
                  <span className={styles.lotExp}>(HSD: 15/11/2024)</span>
                </div>
              </td>
              <td className={styles.textRight}>120.0 lít</td>
              <td className={styles.textRight}>
                <span className={styles.takeBadge}>80.0 lít</span>
              </td>
              <td className={styles.textCenter}>
                <div className={styles.statusSuccess}>
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>Đủ 80.0 / 80.0 lít</span>
                </div>
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
                <span className={styles.requiredAmount}>4.2 kg</span>
              </td>
              <td>
                <div className={styles.lotInfo}>
                  <span className={styles.lotCode}>LOT-GVI-045</span>
                  <span className={styles.lotExp}>(HSD: 30/12/2024)</span>
                </div>
              </td>
              <td className={styles.textRight}>15.0 kg</td>
              <td className={styles.textRight}>
                <span className={styles.takeBadge}>4.2 kg</span>
              </td>
              <td className={styles.textCenter}>
                <div className={styles.statusSuccess}>
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>Đủ 4.2 / 4.2 kg</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Dòng tổng kết dưới bảng */}
      <div className={styles.summaryBar}>
        <div className={styles.summaryStatus}>
          <span className="material-symbols-outlined">task_alt</span>
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
