import React, { useState } from "react"
import {
  CookingPot,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Utensils
} from "lucide-react"
import styles from "./ProposedSeparateBatchSection.module.scss"

export default function ProposedSeparateBatchSection() {
  const [showDetail1, setShowDetail1] = useState(false)
  const [showDetail2, setShowDetail2] = useState(false)

  return (
    <section className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleWithBadge}>
          <div className={styles.numberBadge}>3</div>
          <div>
            <h2 className={styles.sectionTitle}>
              3. Phương án tách lô chế biến
            </h2>
            <p className={styles.sectionSubtitle}>
              Kế hoạch 02 lô nấu độc lập song song theo nguồn gốc nguyên liệu
            </p>
          </div>
        </div>
      </div>

      {/* Thẻ tóm tắt đề xuất */}
      <div className={styles.summaryCard}>
        <div className={styles.summaryLeft}>
          <div className={styles.hubIconBox} aria-hidden="true">
            <CookingPot size={22} />
          </div>
          <div className={styles.summaryMainInfo}>
            <div className={styles.batchTitleRow}>
              <span className={styles.batchMainName}>Đề xuất: 02 lô chế biến độc lập</span>
              <span className={styles.statusPill}>Nấu riêng 1:1</span>
            </div>
            <p className={styles.summaryText}>
              Bữa trưa học đường (11:15) • Quy mô: <strong>1.250 suất</strong> (100% nhu cầu điểm danh) • Tách biệt theo 02 nguồn gốc thịt heo
            </p>
          </div>
        </div>
      </div>

      {/* 2 Thẻ Lô Chế Biến Song Song */}
      <div className={styles.batchesGrid}>
        {/* Lô 1 */}
        <div className={styles.batchCard}>
          <div className={styles.cardHeader}>
            <div className={styles.headerLeft}>
              <div className={styles.batchIndexBadge}>01</div>
              <div className={styles.batchTitles}>
                <span className={styles.batchName}>Lô nấu riêng 1</span>
                <span className={styles.dishName}>Thịt heo kho nước dừa</span>
              </div>
            </div>
            <span className={styles.lotOriginTag}>LOT-HEO-892</span>
          </div>

          <div className={styles.portionBox}>
            <div className={styles.portionMain}>
              <span className={styles.portionNum}>731</span>
              <span className={styles.portionUnit}>suất ăn</span>
            </div>
            <span className={styles.portionPercent}>58.5% tổng nhu cầu</span>
          </div>

          {/* Tóm tắt nguyên liệu */}
          <div className={styles.ingredientSummary}>
            <div className={styles.ingSummaryItem}>
              <Utensils size={13} className={styles.ingIcon} />
              <span>Thịt heo HTX Nam Hà: <strong>50.0 kg</strong> (100% Lô 892)</span>
            </div>
            <div className={styles.ingSummaryItem}>
              <ShieldCheck size={13} className={styles.ingIcon} />
              <span>Trứng cút (1.462 quả) • Nước dừa (46.8L) • Gia vị (2.46 kg)</span>
            </div>
          </div>

          {/* Nút xem chi tiết định lượng */}
          <button
            type="button"
            className={styles.toggleDetailBtn}
            onClick={() => setShowDetail1(!showDetail1)}
            aria-expanded={showDetail1}
          >
            <span>{showDetail1 ? "Thu gọn định lượng" : "Chi tiết định lượng lô 1"}</span>
            {showDetail1 ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showDetail1 && (
            <div className={styles.detailBox}>
              <div className={styles.detailRow}>
                <span>Thịt ba chỉ heo (LOT-HEO-892):</span>
                <strong>50.0 kg</strong>
              </div>
              <div className={styles.detailRow}>
                <span>Trứng cút tươi sạch:</span>
                <strong>1.462 quả</strong>
              </div>
              <div className={styles.detailRow}>
                <span>Nước dừa tươi:</span>
                <strong>46.8 lít</strong>
              </div>
              <div className={styles.detailRow}>
                <span>Gia vị kho an toàn:</span>
                <strong>2.46 kg</strong>
              </div>
            </div>
          )}
        </div>

        {/* Lô 2 */}
        <div className={styles.batchCard}>
          <div className={styles.cardHeader}>
            <div className={styles.headerLeft}>
              <div className={styles.batchIndexBadge}>02</div>
              <div className={styles.batchTitles}>
                <span className={styles.batchName}>Lô nấu riêng 2</span>
                <span className={styles.dishName}>Thịt heo kho nước dừa</span>
              </div>
            </div>
            <span className={styles.lotOriginTag}>LOT-HEO-893</span>
          </div>

          <div className={styles.portionBox}>
            <div className={styles.portionMain}>
              <span className={styles.portionNum}>519</span>
              <span className={styles.portionUnit}>suất ăn</span>
            </div>
            <span className={styles.portionPercent}>41.5% tổng nhu cầu</span>
          </div>

          {/* Tóm tắt nguyên liệu */}
          <div className={styles.ingredientSummary}>
            <div className={styles.ingSummaryItem}>
              <Utensils size={13} className={styles.ingIcon} />
              <span>Thịt heo HTX Nam Hà: <strong>35.5 kg</strong> (100% Lô 893)</span>
            </div>
            <div className={styles.ingSummaryItem}>
              <ShieldCheck size={13} className={styles.ingIcon} />
              <span>Trứng cút (1.038 quả) • Nước dừa (33.2L) • Gia vị (1.74 kg)</span>
            </div>
          </div>

          {/* Nút xem chi tiết định lượng */}
          <button
            type="button"
            className={styles.toggleDetailBtn}
            onClick={() => setShowDetail2(!showDetail2)}
            aria-expanded={showDetail2}
          >
            <span>{showDetail2 ? "Thu gọn định lượng" : "Chi tiết định lượng lô 2"}</span>
            {showDetail2 ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showDetail2 && (
            <div className={styles.detailBox}>
              <div className={styles.detailRow}>
                <span>Thịt ba chỉ heo (LOT-HEO-893):</span>
                <strong>35.5 kg</strong>
              </div>
              <div className={styles.detailRow}>
                <span>Trứng cút tươi sạch:</span>
                <strong>1.038 quả</strong>
              </div>
              <div className={styles.detailRow}>
                <span>Nước dừa tươi:</span>
                <strong>33.2 lít</strong>
              </div>
              <div className={styles.detailRow}>
                <span>Gia vị kho an toàn:</span>
                <strong>1.74 kg</strong>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dòng ghi nhận chuẩn */}
      <div className={styles.noteBox}>
        <CheckCircle2 size={16} className={styles.noteIcon} />
        <span className={styles.noteText}>
          Phương án chế biến 02 lô hợp lệ. Bảo đảm kiểm soát an toàn thực phẩm và truy xuất nguồn gốc số hóa riêng biệt 1:1. Sẵn sàng tạo lô.
        </span>
      </div>
    </section>
  )
}
