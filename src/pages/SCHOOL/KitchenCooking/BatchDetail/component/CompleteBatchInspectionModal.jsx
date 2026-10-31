import React, { useState } from "react"
import {
  CookingPot,
  X,
  Thermometer,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  ClipboardCheck,
  Utensils
} from "lucide-react"
import styles from "./CompleteBatchInspectionModal.module.scss"

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
  const [hygieneArea, setHygieneArea] = useState(true)
  const [containersPass, setContainersPass] = useState(true)
  const [inspectionNote, setInspectionNote] = useState(
    "Đun nấu chín sôi kỹ > 100°C. Món ăn màu sắc tự nhiên, thơm ngon đặc trưng, đạt điều kiện ra khay phục vụ học sinh."
  )

  if (!isOpen) return null

  const isTempPass = Number(servingTemp) >= 65

  const handleSubmit = (e) => {
    e.preventDefault()

    const now = new Date()
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
    const dateStr = batchData.menuDate || "10/11/2024"

    const inspectionRecord = {
      servingTemperature: Number(servingTemp),
      isTempPass,
      sensoryPass,
      sensoryNote: sensoryPass
        ? "Màu sắc tự nhiên, thơm ngon đặc trưng, chín kỹ đồng đều"
        : "Không đạt yêu cầu cảm quan",
      hygieneStaff,
      hygieneTools,
      hygieneArea,
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
        {/* Header Modal */}
        <div className={styles.modalHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.iconCircle}>
              <ClipboardCheck size={22} />
            </div>
            <div>
              <h3 className={styles.modalTitle}>Nghiệm thu kiểm thực mẻ nấu</h3>
              <p className={styles.modalSub}>
                Kiểm thực Bước 2 &amp; 3 (Quyết định số 1246/QĐ-BYT) trước khi hoàn tất ra khay
              </p>
            </div>
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

        {/* Nội dung form nghiệm thu */}
        <form onSubmit={handleSubmit} className={styles.modalBody}>
          {/* Thông tin mẻ tóm tắt */}
          <div className={styles.batchInfoBanner}>
            <div className={styles.bannerItem}>
              <span className={styles.bannerLabel}>Món ăn:</span>
              <strong className={styles.bannerVal}>{batchData.dishName || "Thịt heo kho cút nước dừa"}</strong>
            </div>
            <div className={styles.bannerItem}>
              <span className={styles.bannerLabel}>Mã lô:</span>
              <strong className={styles.bannerValCode}>{batchData.code || "CB-20241110-001"}</strong>
            </div>
            <div className={styles.bannerItem}>
              <span className={styles.bannerLabel}>Số suất:</span>
              <strong className={styles.bannerVal}>{(batchData.portions || 1250).toLocaleString("vi-VN")} suất</strong>
            </div>
          </div>

          <div className={styles.formScrollArea}>
            {/* Mục 1: Nhiệt độ chia suất ra khay */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <Thermometer size={18} className={styles.sectionIcon} />
                <h4 className={styles.sectionTitle}>1. Nhiệt độ chia suất ra khay (Bước 3)</h4>
              </div>

              <div className={styles.tempInputWrap}>
                <div className={styles.inputGroup}>
                  <label htmlFor="servingTempInput" className={styles.inputLabel}>
                    Nhiệt độ đo thực tế tại bếp (°C):
                  </label>
                  <div className={styles.tempInputBox}>
                    <input
                      id="servingTempInput"
                      type="number"
                      step="0.5"
                      min="30"
                      max="120"
                      value={servingTemp}
                      onChange={(e) => setServingTemp(e.target.value)}
                      className={styles.numberInput}
                      required
                    />
                    <span className={styles.tempUnit}>°C</span>
                  </div>
                </div>

                <div className={styles.tempBadgeBox}>
                  {isTempPass ? (
                    <div className={styles.badgeSuccess}>
                      <CheckCircle2 size={16} />
                      <span>Đạt chuẩn ATTP (Quy chuẩn Bộ Y tế: &gt; 65°C)</span>
                    </div>
                  ) : (
                    <div className={styles.badgeWarning}>
                      <AlertTriangle size={16} />
                      <span>Cảnh báo: Dưới 65°C - Cần hâm nóng trước khi chia suất!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mục 2: Đánh giá cảm quan thành phẩm */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <Sparkles size={18} className={styles.sectionIcon} />
                <h4 className={styles.sectionTitle}>2. Đánh giá cảm quan thức ăn chín</h4>
              </div>

              <div className={styles.toggleRow}>
                <div>
                  <div className={styles.toggleTitle}>Màu sắc, mùi vị, độ chín kỹ:</div>
                  <div className={styles.toggleDesc}>
                    Món ăn có màu sắc đặc trưng, thơm ngon, chín kỹ đồng đều, không có mùi lạ hay dị vật.
                  </div>
                </div>
                <div className={styles.btnToggleGroup}>
                  <button
                    type="button"
                    className={`${styles.toggleBtn} ${sensoryPass ? styles.toggleActiveSuccess : ""}`}
                    onClick={() => setSensoryPass(true)}
                  >
                    ✓ Đạt
                  </button>
                  <button
                    type="button"
                    className={`${styles.toggleBtn} ${!sensoryPass ? styles.toggleActiveDanger : ""}`}
                    onClick={() => setSensoryPass(false)}
                  >
                    Không đạt
                  </button>
                </div>
              </div>
            </div>

            {/* Mục 3: Điều kiện vệ sinh chế biến (Bước 2) */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <ShieldCheck size={18} className={styles.sectionIcon} />
                <h4 className={styles.sectionTitle}>3. Điều kiện vệ sinh khu vực chế biến (Bước 2)</h4>
              </div>

              <div className={styles.checkItemList}>
                <div className={styles.checkItemRow}>
                  <div>
                    <span className={styles.itemTitle}>Người tham gia chế biến:</span>
                    <p className={styles.itemDesc}>Trang phục bảo hộ sạch, đeo khẩu trang, mũ trùm tóc, găng tay thực phẩm.</p>
                  </div>
                  <div className={styles.btnToggleGroup}>
                    <button
                      type="button"
                      className={`${styles.toggleBtnSmall} ${hygieneStaff ? styles.toggleActiveSuccess : ""}`}
                      onClick={() => setHygieneStaff(true)}
                    >
                      Đạt
                    </button>
                    <button
                      type="button"
                      className={`${styles.toggleBtnSmall} ${!hygieneStaff ? styles.toggleActiveDanger : ""}`}
                      onClick={() => setHygieneStaff(false)}
                    >
                      K.Đạt
                    </button>
                  </div>
                </div>

                <div className={styles.checkItemRow}>
                  <div>
                    <span className={styles.itemTitle}>Trang thiết bị, dụng cụ chế biến:</span>
                    <p className={styles.itemDesc}>Dụng cụ Inox 304 đã tiệt trùng, dao thớt sống/chín phân màu tách biệt.</p>
                  </div>
                  <div className={styles.btnToggleGroup}>
                    <button
                      type="button"
                      className={`${styles.toggleBtnSmall} ${hygieneTools ? styles.toggleActiveSuccess : ""}`}
                      onClick={() => setHygieneTools(true)}
                    >
                      Đạt
                    </button>
                    <button
                      type="button"
                      className={`${styles.toggleBtnSmall} ${!hygieneTools ? styles.toggleActiveDanger : ""}`}
                      onClick={() => setHygieneTools(false)}
                    >
                      K.Đạt
                    </button>
                  </div>
                </div>

                <div className={styles.checkItemRow}>
                  <div>
                    <span className={styles.itemTitle}>Khu vực chế biến và phụ trợ:</span>
                    <p className={styles.itemDesc}>Sàn bếp khô ráo sạch sẽ, cống thoát nước có lưới chắn, thùng rác có nắp đậy.</p>
                  </div>
                  <div className={styles.btnToggleGroup}>
                    <button
                      type="button"
                      className={`${styles.toggleBtnSmall} ${hygieneArea ? styles.toggleActiveSuccess : ""}`}
                      onClick={() => setHygieneArea(true)}
                    >
                      Đạt
                    </button>
                    <button
                      type="button"
                      className={`${styles.toggleBtnSmall} ${!hygieneArea ? styles.toggleActiveDanger : ""}`}
                      onClick={() => setHygieneArea(false)}
                    >
                      K.Đạt
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mục 4: Dụng cụ chia suất & che đậy (Bước 3) */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <Utensils size={18} className={styles.sectionIcon} />
                <h4 className={styles.sectionTitle}>4. Dụng cụ chia, chứa đựng và che đậy (Bước 3)</h4>
              </div>

              <div className={styles.toggleRow}>
                <div>
                  <div className={styles.toggleTitle}>Khay chia suất &amp; xe đẩy bảo quản:</div>
                  <div className={styles.toggleDesc}>
                    Khay inox chia ngăn tiệt trùng, có nắp đậy giữ nhiệt kín chống bụi bẩn và côn trùng.
                  </div>
                </div>
                <div className={styles.btnToggleGroup}>
                  <button
                    type="button"
                    className={`${styles.toggleBtn} ${containersPass ? styles.toggleActiveSuccess : ""}`}
                    onClick={() => setContainersPass(true)}
                  >
                    ✓ Đạt
                  </button>
                  <button
                    type="button"
                    className={`${styles.toggleBtn} ${!containersPass ? styles.toggleActiveDanger : ""}`}
                    onClick={() => setContainersPass(false)}
                  >
                    Không đạt
                  </button>
                </div>
              </div>
            </div>

            {/* Mục 5: Ghi chú xử lý */}
            <div className={styles.sectionCard}>
              <label htmlFor="noteArea" className={styles.inputLabel}>
                5. Biện pháp xử lý &amp; Ghi chú nghiệm thu:
              </label>
              <textarea
                id="noteArea"
                rows={2}
                value={inspectionNote}
                onChange={(e) => setInspectionNote(e.target.value)}
                className={styles.textareaInput}
                placeholder="Nhập ghi chú hoặc biện pháp xử lý nếu có..."
              />
            </div>
          </div>

          {/* Footer Form */}
          <div className={styles.modalFooter}>
            <div className={styles.inspectorInfo}>
              <span>Người nghiệm thu: <strong>Nguyễn Văn Vận (Bếp chính)</strong></span>
            </div>
            <div className={styles.actionBtns}>
              <button type="button" className={styles.btnCancel} onClick={onClose}>
                Hủy bỏ
              </button>
              <button type="submit" className={styles.btnSubmit}>
                <CheckCircle2 size={17} />
                <span>Lưu nghiệm thu &amp; Hoàn tất mẻ nấu</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

