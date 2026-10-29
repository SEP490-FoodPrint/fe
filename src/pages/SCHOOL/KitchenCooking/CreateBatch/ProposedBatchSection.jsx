import React, { useState } from "react"
import styles from "./ProposedBatchSection.module.scss"

export default function ProposedBatchSection() {
  const [isDetailOpen, setIsDetailOpen] = useState(true)

  return (
    <section className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleWithBadge}>
          <div className={styles.numberBadge}>3</div>
          <div>
            <h2 className={styles.sectionTitle}>3. Phương án chế biến dự kiến</h2>
            <p className={styles.sectionSubtitle}>
              Hợp nhất mẻ theo quy định nhưng vẫn duy trì tính toàn vẹn của chuỗi cung ứng
            </p>
          </div>
        </div>
      </div>

      {/* Thẻ tóm tắt */}
      <div className={styles.summaryCard}>
        <div className={styles.summaryLeft}>
          <div className={styles.hubIconBox}>
            <span className="material-symbols-outlined">hub</span>
          </div>
          <p className={styles.summaryText}>
            Hợp nhất toàn bộ định lượng vào <strong>01 mẻ chế biến</strong> theo
            quy định nấu chung của nhà trường, đồng thời bảo toàn định danh từng
            lô nguyên liệu.
          </p>
        </div>

        <div className={styles.summaryRight}>
          <span className={styles.summaryProposedBatch}>
            Tổng mẻ đề xuất: <strong>01 mẻ hợp nhất (Nấu chung)</strong>
          </span>
          <span className={styles.summaryTotalPortions}>
            Tổng suất: 1.250 suất (100%)
          </span>
        </div>
      </div>

      {/* Bảng phương án mẻ hợp nhất */}
      <div className={styles.tableResponsive}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thLeft}>Tên mẻ / Mã mẻ dự kiến</th>
              <th>Món ăn</th>
              <th>Số suất dự kiến</th>
              <th>Số lô nguyên liệu sử dụng</th>
              <th>Trạng thái mẻ</th>
              <th className={`${styles.thRight} ${styles.textCenter}`}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr className={styles.trHover}>
              <td>
                <div className={styles.batchNameCol}>
                  <span className={styles.batchTitle}>
                    Mẻ chế biến 01 (Hợp nhất)
                  </span>
                  <span className={styles.batchCode}>
                    Lô dự kiến: CB-20261026-001
                  </span>
                </div>
              </td>
              <td>
                <span className={styles.dishName}>
                  Thịt heo kho cút nước dừa
                </span>
              </td>
              <td>
                <div className={styles.portionCol}>
                  <span className={styles.portionMain}>1.250 suất</span>
                  <span className={styles.portionSub}>(100% tổng nhu cầu)</span>
                </div>
              </td>
              <td>
                <div className={styles.lotsCol}>
                  <span className={styles.lotsMain}>05 lô nguyên liệu</span>
                  <span className={styles.lotsSub}>
                    (Gồm 02 lô thịt heo nấu chung + Trứng cút + Nước dừa + Gia vị)
                  </span>
                </div>
              </td>
              <td>
                <div className={styles.statusBadge}>
                  <span className={styles.statusDot} />
                  <span>Đạt chuẩn Nấu chung hợp nhất</span>
                </div>
              </td>
              <td className={styles.textCenter}>
                <button
                  type="button"
                  className={styles.detailBtn}
                  onClick={() => setIsDetailOpen(!isDetailOpen)}
                >
                  <span>Chi tiết</span>
                  <span className="material-symbols-outlined">
                    {isDetailOpen ? "expand_less" : "expand_more"}
                  </span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Khối chi tiết cấu thành nguyên liệu cho mẻ hợp nhất */}
      {isDetailOpen && (
        <div className={styles.detailBox}>
          <div className={styles.detailHeader}>
            <span className={styles.detailTitle}>
              <span className="material-symbols-outlined">layers</span>
              <span>
                Chi tiết cấu thành nguyên liệu cho Mẻ hợp nhất (1.250 suất)
              </span>
            </span>
            <span className={styles.detailTag}>
              Đã ghi nhận riêng rẽ từng mã lô
            </span>
          </div>

          {/* 4 Ô thẻ con */}
          <div className={styles.cardsGrid}>
            {/* Ô 1: Thịt ba chỉ heo */}
            <div className={styles.ingredientCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardName}>Thịt ba chỉ heo</span>
                <span className={styles.cardAmount}>85.5 kg</span>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardLotRow}>
                  <span>• Lô LOT-HEO-892:</span>
                  <span className={styles.cardLotWeight}>50.0 kg</span>
                </div>
                <div className={styles.cardLotRow}>
                  <span>• Lô LOT-HEO-893:</span>
                  <span className={styles.cardLotWeight}>35.5 kg</span>
                </div>
              </div>
            </div>

            {/* Ô 2: Trứng cút tươi sạch */}
            <div className={styles.ingredientCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardName}>Trứng cút tươi sạch</span>
                <span className={styles.cardAmount}>2.500 quả</span>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardLotRow}>
                  <span>• Lô LOT-CUT-224:</span>
                  <span className={styles.cardLotWeight}>HSD 20/11</span>
                </div>
              </div>
            </div>

            {/* Ô 3: Nước dừa tươi */}
            <div className={styles.ingredientCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardName}>Nước dừa tươi</span>
                <span className={styles.cardAmount}>80.0 lít</span>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardLotRow}>
                  <span>• Lô LOT-DUA-018:</span>
                  <span className={styles.cardLotWeight}>HSD 15/11</span>
                </div>
              </div>
            </div>

            {/* Ô 4: Gia vị kho an toàn */}
            <div className={styles.ingredientCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardName}>Gia vị kho an toàn</span>
                <span className={styles.cardAmount}>4.2 kg</span>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardLotRow}>
                  <span>• Lô LOT-GVI-045:</span>
                  <span className={styles.cardLotWeight}>HSD 30/12</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dòng ghi nhận chuẩn */}
      <div className={styles.noteBox}>
        <span className={`material-symbols-outlined ${styles.noteIcon}`}>
          check_circle
        </span>
        <span className={styles.noteText}>
          Phương án chế biến hợp lệ. Đã ghi nhận riêng rẽ từng lô nguyên liệu theo
          đúng chuẩn truy xuất nguồn gốc. Sẵn sàng khởi tạo.
        </span>
      </div>
    </section>
  )
}
