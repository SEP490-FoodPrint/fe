import React, { useState } from "react"
import {
  Layers,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CookingPot,
  Flame,
  Clock
} from "lucide-react"
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
              Hợp nhất lô nấu theo quy chuẩn, tự động liên kết nguồn gốc đa lô
            </p>
          </div>
        </div>
      </div>

      {/* Thẻ tóm tắt đề xuất */}
      <div className={styles.summaryCard}>
        <div className={styles.summaryLeft}>
          <div className={styles.hubIconBox} aria-hidden="true">
            <CookingPot size={20} />
          </div>
          <p className={styles.summaryText}>
            Hợp nhất toàn bộ định lượng vào <strong>01 lô chế biến</strong> theo
            quy chuẩn nấu chung của nhà trường, đồng thời bảo toàn mã định danh của từng
            lô nguyên liệu.
          </p>
        </div>

        <div className={styles.summaryRight}>
          <span className={styles.summaryProposedBatch}>
            Tổng lô đề xuất: <strong>01 lô hợp nhất</strong>
          </span>
          <span className={styles.summaryTotalPortions}>
            Quy mô: <strong>1.250 suất</strong> (100% nhu cầu)
          </span>
        </div>
      </div>

      {/* 1. Desktop View: Bảng phương án lô hợp nhất (Hiện trên Desktop >= 768px) */}
      <div className={styles.desktopTableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thLeft}>Tên lô / Mã lô dự kiến</th>
              <th>Món ăn</th>
              <th>Số suất dự kiến</th>
              <th>Lô nguyên liệu sử dụng</th>
              <th>Trạng thái</th>
              <th className={`${styles.thRight} ${styles.textCenter}`}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr className={styles.trHover}>
              <td>
                <div className={styles.batchNameCol}>
                  <span className={styles.batchTitle}>
                    Lô chế biến 01 (Hợp nhất)
                  </span>
                  <span className={styles.batchCode}>
                    Mã dự kiến: CB-20261026-001
                  </span>
                </div>
              </td>
              <td>
                <span className={styles.dishName}>
                  Thịt heo kho nước dừa
                </span>
              </td>
              <td>
                <div className={styles.portionCol}>
                  <span className={styles.portionMain}>1.250 suất</span>
                  <span className={styles.portionSub}>100% ca trưa</span>
                </div>
              </td>
              <td>
                <div className={styles.lotsCol}>
                  <span className={styles.lotsMain}>05 lô nguyên liệu</span>
                  <span className={styles.lotsSub}>
                    (02 lô thịt heo + Trứng cút + Nước dừa + Gia vị)
                  </span>
                </div>
              </td>
              <td>
                <div className={styles.statusBadge}>
                  <span className={styles.statusDot} />
                  <span>Nấu chung hợp nhất</span>
                </div>
              </td>
              <td className={styles.textCenter}>
                <button
                  type="button"
                  className={styles.detailBtn}
                  onClick={() => setIsDetailOpen(!isDetailOpen)}
                  aria-expanded={isDetailOpen}
                >
                  <span>Chi tiết</span>
                  {isDetailOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 2. Mobile View: Thẻ phương án lô chế biến (Hiện trên Mobile < 768px) */}
      <div className={styles.mobileBatchOverview}>
        <div className={styles.mobOverviewHeader}>
          <div className={styles.mobTitleBox}>
            <span className={styles.mobBatchTitle}>Lô chế biến 01 (Hợp nhất)</span>
            <span className={styles.mobBatchCode}>Mã: CB-20261026-001</span>
          </div>
          <span className={styles.statusBadge}>
            <span className={styles.statusDot} />
            <span>Nấu chung</span>
          </span>
        </div>

        <div className={styles.mobGridMeta}>
          <div className={styles.metaCell}>
            <span className={styles.cellLabel}>Món ăn:</span>
            <span className={styles.cellValue}>Thịt heo kho nước dừa</span>
          </div>
          <div className={styles.metaCell}>
            <span className={styles.cellLabel}>Số suất:</span>
            <span className={styles.cellValueHighlight}>1.250 suất (100%)</span>
          </div>
          <div className={styles.metaCellFull}>
            <span className={styles.cellLabel}>Nguyên liệu:</span>
            <span className={styles.cellValue}>05 lô (02 lô thịt + Trứng cút + Nước dừa + Gia vị)</span>
          </div>
        </div>

        <button
          type="button"
          className={styles.mobToggleDetailBtn}
          onClick={() => setIsDetailOpen(!isDetailOpen)}
          aria-expanded={isDetailOpen}
        >
          <span>{isDetailOpen ? "Thu gọn thành phần lô" : "Xem chi tiết 4 thành phần con"}</span>
          {isDetailOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      </div>

      {/* Khối chi tiết cấu thành nguyên liệu cho lô hợp nhất */}
      {isDetailOpen && (
        <div className={styles.detailBox}>
          <div className={styles.detailHeader}>
            <div className={styles.detailTitleWrap}>
              <Layers size={15} className={styles.layersIcon} />
              <span className={styles.detailTitle}>
                Cấu thành nguyên liệu lô hợp nhất (1.250 suất)
              </span>
            </div>
            <span className={styles.detailTag}>
              Đã ghi nhận riêng 05 mã lô
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
                  <span className={styles.cardLotWeight}>2.500 quả (HSD 20/11)</span>
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
                  <span className={styles.cardLotWeight}>80.0 lít (HSD 15/11)</span>
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
                  <span className={styles.cardLotWeight}>4.2 kg (HSD 30/12)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dòng ghi nhận chuẩn */}
      <div className={styles.noteBox}>
        <CheckCircle2 size={16} className={styles.noteIcon} />
        <span className={styles.noteText}>
          Phương án chế biến hợp lệ. Đã ghi nhận riêng rẽ từng lô nguyên liệu theo
          chuẩn truy xuất nguồn gốc số hóa. Sẵn sàng khởi tạo.
        </span>
      </div>
    </section>
  )
}
