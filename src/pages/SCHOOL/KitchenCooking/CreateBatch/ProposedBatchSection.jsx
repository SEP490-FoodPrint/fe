import React, { useState } from "react"
import {
  CookingPot,
  Clock,
  Thermometer,
  ShieldCheck,
  Layers,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  FileText
} from "lucide-react"
import styles from "./ProposedBatchSection.module.scss"

export default function ProposedBatchSection() {
  const [isLotsDetailOpen, setIsLotsDetailOpen] = useState(false)
  const [chefNotes, setChefNotes] = useState("")

  return (
    <section className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleWithBadge}>
          <div className={styles.numberBadge}>3</div>
          <div>
            <h2 className={styles.sectionTitle}>3. Phương án chế biến &amp; An toàn bếp</h2>
            <p className={styles.sectionSubtitle}>
              Kế hoạch thời gian, kiểm soát nhiệt độ an toàn thực phẩm và liên kết truy xuất
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

      {/* Grid Tiêu chuẩn Vận hành & ATTP */}
      <div className={styles.executionGrid}>
        {/* Card 1: Khung giờ chế biến */}
        <div className={styles.execCard}>
          <div className={styles.execCardHeader}>
            <Clock size={16} className={styles.execIconTime} />
            <span className={styles.execCardTitle}>Khung giờ chế biến</span>
          </div>
          <div className={styles.execCardBody}>
            <div className={styles.timeTimeline}>
              <div className={styles.timePoint}>
                <span className={styles.timeLabel}>Bắt đầu nấu</span>
                <span className={styles.timeValue}>08:30</span>
              </div>
              <span className={styles.timeArrow}>→</span>
              <div className={styles.timePoint}>
                <span className={styles.timeLabel}>Hoàn tất món</span>
                <span className={styles.timeValueHighlight}>10:30</span>
              </div>
            </div>
            <span className={styles.timeNotice}>Sẵn sàng chia suất trước giờ ăn 45 phút (11:15)</span>
          </div>
        </div>

        {/* Card 2: Tiêu chuẩn an toàn thực phẩm (ATTP) */}
        <div className={styles.execCard}>
          <div className={styles.execCardHeader}>
            <ShieldCheck size={16} className={styles.execIconSafety} />
            <span className={styles.execCardTitle}>Kiểm soát an toàn (ATTP)</span>
          </div>
          <div className={styles.execCardBody}>
            <div className={styles.safetySpecsList}>
              <div className={styles.specItem}>
                <Thermometer size={14} className={styles.specIcon} />
                <span className={styles.specText}>
                  Nhiệt độ sôi tâm món: <strong>≥ 85°C</strong>
                </span>
              </div>
              <div className={styles.specItem}>
                <CheckCircle2 size={14} className={styles.specIcon} />
                <span className={styles.specText}>
                  Lưu mẫu thực phẩm 24h: <strong>100g niêm phong</strong>
                </span>
              </div>
            </div>
            <span className={styles.safetyRule}>Tuân thủ quy chuẩn bếp ăn bán trú học đường</span>
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

      {/* Ghi chú bếp trưởng / Bếp chính */}
      <div className={styles.notesGroup}>
        <label className={styles.notesLabel}>
          <FileText size={13} />
          <span>Ghi chú điều phối bếp (Tùy chọn)</span>
        </label>
        <textarea
          className={styles.notesTextarea}
          placeholder="Ví dụ: Chia 2 chảo nghiêng công nghiệp, nêm nhạt phù hợp lứa tuổi tiểu học, kiểm tra màu cánh gián tự nhiên..."
          value={chefNotes}
          onChange={(e) => setChefNotes(e.target.value)}
          rows={2}
        />
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
