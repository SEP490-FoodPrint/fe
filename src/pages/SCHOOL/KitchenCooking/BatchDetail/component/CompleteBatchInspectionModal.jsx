import React, { useState } from "react"
import {
  X,
  Thermometer,
  CheckCircle2,
  AlertTriangle,
  Minus,
  Plus,
  ChevronDown,
  ChevronUp,
  FileText
} from "lucide-react"
import styles from "./CompleteBatchInspectionModal.module.scss"

const QUICK_TEMPS = [68, 70, 72, 75]

export default function CompleteBatchInspectionModal({
  isOpen,
  onClose,
  onConfirm,
  batchData = {}
}) {
  const [servingTemp, setServingTemp] = useState(72)
  const [sensoryPass, setSensoryPass] = useState(true)
  const [hygieneStaff, setHygieneStaff] = useState(true)
  const [hygieneTools, setHygieneTools] = useState(true)
  const [containersPass, setContainersPass] = useState(true)

  const [showNote, setShowNote] = useState(false)
  const [inspectionNote, setInspectionNote] = useState(
    "Đun nấu chín sôi kỹ > 100°C. Món ăn màu sắc tự nhiên, thơm ngon đặc trưng, đạt điều kiện ra khay phục vụ học sinh."
  )

  if (!isOpen) return null

  const tempVal = Number(servingTemp) || 0
  const isTempPass = tempVal >= 65

  const adjustTemp = (delta) => {
    setServingTemp((prev) => {
      const next = Math.round((Number(prev) + delta) * 10) / 10
      return Math.max(30, Math.min(120, next))
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const now = new Date()
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
    const dateStr = batchData.menuDate || "10/11/2024"

    const inspectionRecord = {
      servingTemperature: tempVal,
      isTempPass,
      sensoryPass,
      sensoryNote: sensoryPass
        ? "Màu sắc tự nhiên, thơm ngon đặc trưng, chín kỹ đồng đều"
        : "Không đạt yêu cầu cảm quan",
      hygieneStaff,
      hygieneTools,
      hygieneArea: true, // Tiêu chuẩn mặc định khu vực
      containersPass,
      inspectedBy: "Nguyễn Văn Vận (Bếp chính)",
      inspectedTime: timeStr,
      inspectedAt: `${dateStr} ${timeStr}`,
      note: inspectionNote
    }

    onConfirm(inspectionRecord)
  }

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Mobile drag handle */}
        <div className={styles.mobileHandle} />

        {/* Header Modal */}
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>Nghiệm thu kiểm thực mẻ nấu</h3>
            <p className={styles.modalSub}>
              {batchData.dishName || "Thịt heo kho cút nước dừa"} • {batchData.code || "CB-20241110-001"}
            </p>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nội dung form */}
        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.bodyContent}>
            {/* KHỐI 1: NHIỆT ĐỘ RA KHAY (TRỌNG TÂM) */}
            <div className={styles.tempHeroCard}>
              <div className={styles.heroTop}>
                <div className={styles.heroLabelWrap}>
                  <Thermometer size={17} className={styles.heroIcon} />
                  <span className={styles.heroLabel}>Nhiệt độ chia suất ra khay:</span>
                </div>
                <div className={isTempPass ? styles.badgePass : styles.badgeWarn}>
                  {isTempPass ? (
                    <>
                      <CheckCircle2 size={13} />
                      <span>Đạt (&gt; 65°C)</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={13} />
                      <span>Cảnh báo (&lt; 65°C)</span>
                    </>
                  )}
                </div>
              </div>

              {/* Stepper + Input */}
              <div className={styles.tempControlRow}>
                <div className={styles.stepperWrap}>
                  <button
                    type="button"
                    className={styles.stepBtn}
                    onClick={() => adjustTemp(-1)}
                    aria-label="Giảm 1 độ"
                  >
                    <Minus size={16} />
                  </button>
                  <div className={styles.tempInputWrap}>
                    <input
                      type="number"
                      step="0.5"
                      min="30"
                      max="120"
                      value={servingTemp}
                      onChange={(e) => setServingTemp(e.target.value)}
                      className={styles.tempInput}
                      id="servingTempInput"
                      required
                    />
                    <span className={styles.tempDeg}>°C</span>
                  </div>
                  <button
                    type="button"
                    className={styles.stepBtn}
                    onClick={() => adjustTemp(1)}
                    aria-label="Tăng 1 độ"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Quick chip presets */}
                <div className={styles.quickChips}>
                  {QUICK_TEMPS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`${styles.chipBtn} ${tempVal === t ? styles.chipActive : ""}`}
                      onClick={() => setServingTemp(t)}
                    >
                      {t}°C
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* KHỐI 2: 4 TIÊU CHÍ ATTP CỐT LÕI (DANH SÁCH GỌN GÀNG) */}
            <div className={styles.criteriaCard}>
              <span className={styles.cardHeaderSmall}>Tiêu chí kiểm thực mẻ nấu (QĐ 1246/QĐ-BYT):</span>

              <div className={styles.criteriaList}>
                {/* 1. Cảm quan */}
                <div className={styles.criteriaRow}>
                  <div className={styles.criteriaInfo}>
                    <span className={styles.criteriaTitle}>1. Cảm quan món ăn chín</span>
                    <span className={styles.criteriaMeta}>Màu sắc tự nhiên, mùi vị thơm ngon, chín kỹ</span>
                  </div>
                  <div className={styles.pillToggle}>
                    <button
                      type="button"
                      className={`${styles.pillBtn} ${sensoryPass ? styles.pillPass : ""}`}
                      onClick={() => setSensoryPass(true)}
                    >
                      Đạt
                    </button>
                    <button
                      type="button"
                      className={`${styles.pillBtn} ${!sensoryPass ? styles.pillFail : ""}`}
                      onClick={() => setSensoryPass(false)}
                    >
                      K.Đạt
                    </button>
                  </div>
                </div>

                {/* 2. Vệ sinh & Bảo hộ */}
                <div className={styles.criteriaRow}>
                  <div className={styles.criteriaInfo}>
                    <span className={styles.criteriaTitle}>2. Bảo hộ người nấu</span>
                    <span className={styles.criteriaMeta}>Đầy đủ găng tay, tạp dề, khẩu trang, mũ</span>
                  </div>
                  <div className={styles.pillToggle}>
                    <button
                      type="button"
                      className={`${styles.pillBtn} ${hygieneStaff ? styles.pillPass : ""}`}
                      onClick={() => setHygieneStaff(true)}
                    >
                      Đạt
                    </button>
                    <button
                      type="button"
                      className={`${styles.pillBtn} ${!hygieneStaff ? styles.pillFail : ""}`}
                      onClick={() => setHygieneStaff(false)}
                    >
                      K.Đạt
                    </button>
                  </div>
                </div>

                {/* 3. Dụng cụ Inox */}
                <div className={styles.criteriaRow}>
                  <div className={styles.criteriaInfo}>
                    <span className={styles.criteriaTitle}>3. Dụng cụ &amp; Thiết bị bếp</span>
                    <span className={styles.criteriaMeta}>Inox 304 tiệt trùng, thớt sống/chín riêng</span>
                  </div>
                  <div className={styles.pillToggle}>
                    <button
                      type="button"
                      className={`${styles.pillBtn} ${hygieneTools ? styles.pillPass : ""}`}
                      onClick={() => setHygieneTools(true)}
                    >
                      Đạt
                    </button>
                    <button
                      type="button"
                      className={`${styles.pillBtn} ${!hygieneTools ? styles.pillFail : ""}`}
                      onClick={() => setHygieneTools(false)}
                    >
                      K.Đạt
                    </button>
                  </div>
                </div>

                {/* 4. Khay chia có nắp đậy */}
                <div className={styles.criteriaRow}>
                  <div className={styles.criteriaInfo}>
                    <span className={styles.criteriaTitle}>4. Dụng cụ chia suất</span>
                    <span className={styles.criteriaMeta}>Khay chia ngăn có nắp đậy giữ nhiệt kín</span>
                  </div>
                  <div className={styles.pillToggle}>
                    <button
                      type="button"
                      className={`${styles.pillBtn} ${containersPass ? styles.pillPass : ""}`}
                      onClick={() => setContainersPass(true)}
                    >
                      Đạt
                    </button>
                    <button
                      type="button"
                      className={`${styles.pillBtn} ${!containersPass ? styles.pillFail : ""}`}
                      onClick={() => setContainersPass(false)}
                    >
                      K.Đạt
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* KHỐI 3: GHI CHÚ THÊM (THU GỌN - CHỈ MỞ KHI CẦN) */}
            <div className={styles.noteSection}>
              <button
                type="button"
                className={styles.noteToggleBtn}
                onClick={() => setShowNote(!showNote)}
              >
                <div className={styles.noteToggleLeft}>
                  <FileText size={14} />
                  <span>{showNote ? "Ẩn ghi chú nghiệm thu" : "+ Ghi chú hoặc biện pháp xử lý"}</span>
                </div>
                {showNote ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>

              {showNote && (
                <textarea
                  rows={2}
                  value={inspectionNote}
                  onChange={(e) => setInspectionNote(e.target.value)}
                  className={styles.noteTextarea}
                  placeholder="Nhập ghi chú thêm nếu có..."
                />
              )}
            </div>
          </div>

          {/* Footer Form */}
          <div className={styles.modalFooter}>
            <button type="button" className={styles.btnCancel} onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className={styles.btnSubmit}>
              <CheckCircle2 size={16} />
              <span>Xác nhận hoàn thành</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
