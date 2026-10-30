import React, { useState } from "react"
import {
  CookingPot,
  Layers,
  ChevronDown,
  ChevronUp,
  CheckCircle2
} from "lucide-react"
import styles from "./ProposedBatchSection.module.scss"

export default function ProposedBatchSection() {
  const [isLotsDetailOpen, setIsLotsDetailOpen] = useState(false)

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

      {/* Thẻ tóm tắt đề xuất lô hợp nhất */}
      <div className={styles.summaryCard}>
        <div className={styles.summaryLeft}>
          <div className={styles.hubIconBox} aria-hidden="true">
            <CookingPot size={22} />
          </div>
          <div className={styles.summaryMainInfo}>
            <div className={styles.batchTitleRow}>
              <span className={styles.batchMainName}>Lô nấu chung: Thịt heo kho nước dừa</span>
              <span className={styles.statusPill}>Nấu chung hợp nhất</span>
            </div>
            <p className={styles.summaryText}>
              Bữa trưa học đường (11:15) • Quy mô: <strong>1.250 suất</strong> (100% nhu cầu điểm danh)
            </p>
          </div>
        </div>
      </div>

      {/* Khối liên kết nguồn gốc đa lô (Collapsible nhỏ gọn) */}
      <div className={styles.lotTraceabilityBox}>
        <button
          type="button"
          className={styles.lotTraceToggle}
          onClick={() => setIsLotsDetailOpen(!isLotsDetailOpen)}
          aria-expanded={isLotsDetailOpen}
        >
          <div className={styles.traceToggleLeft}>
            <Layers size={15} className={styles.traceIcon} />
            <span className={styles.traceTitle}>
              <strong>05 lô nguyên liệu</strong> liên kết số hóa
            </span>
          </div>
          <div className={styles.traceToggleRight}>
            <span className={styles.traceHint}>{isLotsDetailOpen ? "Thu gọn" : "Xem mã lô"}</span>
            {isLotsDetailOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </div>
        </button>

        {isLotsDetailOpen && (
          <div className={styles.traceLotsList}>
            <div className={styles.traceItem}>
              <span className={styles.traceItemName}>Thịt heo:</span>
              <span className={styles.traceLotBadge}>LOT-HEO-892 (50kg)</span>
              <span className={styles.traceLotBadge}>LOT-HEO-893 (35.5kg)</span>
            </div>
            <div className={styles.traceItem}>
              <span className={styles.traceItemName}>Trứng cút:</span>
              <span className={styles.traceLotBadge}>LOT-CUT-224 (2.500 quả)</span>
            </div>
            <div className={styles.traceItem}>
              <span className={styles.traceItemName}>Nước dừa:</span>
              <span className={styles.traceLotBadge}>LOT-DUA-018 (80L)</span>
            </div>
            <div className={styles.traceItem}>
              <span className={styles.traceItemName}>Gia vị kho:</span>
              <span className={styles.traceLotBadge}>LOT-GVI-045 (4.2kg)</span>
            </div>
          </div>
        )}
      </div>

      {/* Dòng ghi nhận chuẩn */}
      <div className={styles.noteBox}>
        <CheckCircle2 size={16} className={styles.noteIcon} />
        <span className={styles.noteText}>
          Phương án chế biến hợp lệ. Đầy đủ định lượng và liên kết truy xuất nguồn gốc số hóa. Sẵn sàng tạo lô.
        </span>
      </div>
    </section>
  )
}
