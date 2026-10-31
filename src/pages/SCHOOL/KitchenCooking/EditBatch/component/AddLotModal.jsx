import React, { useState } from "react"
import {
  X,
  PlusCircle,
  ShieldCheck,
  Calendar,
  Warehouse,
  Check,
  AlertCircle
} from "lucide-react"
import styles from "./SwapLotModal.module.scss"

const AVAILABLE_EXTRA_LOTS = [
  {
    lotCode: "LOT-GA-01C",
    lotName: "Lô thịt gà C (Gà đồi Chí Linh)",
    supplier: "Nông trại Gà đồi Chí Linh",
    cert: "VietGAP 4410/NTCL",
    expiryDate: "28/10/2026",
    expiryRemaining: "Còn 5 ngày",
    stock: 30.0,
    unit: "kg",
    defaultQty: 2.0
  },
  {
    lotCode: "LOT-GA-01D",
    lotName: "Lô thịt gà D (Hữu cơ)",
    supplier: "HTX Chăn nuôi Sạch Ba Vì",
    cert: "VietGAP 5520/BV",
    expiryDate: "29/10/2026",
    expiryRemaining: "Còn 6 ngày",
    stock: 15.0,
    unit: "kg",
    defaultQty: 2.0
  }
]

export default function AddLotModal({ isOpen, onClose, onConfirmAdd, currentLotCodes = [] }) {
  if (!isOpen) return null

  const candidates = AVAILABLE_EXTRA_LOTS.filter(l => !currentLotCodes.includes(l.lotCode))
  const [selectedLotCode, setSelectedLotCode] = useState(candidates[0]?.lotCode || "")

  const handleConfirm = () => {
    const chosen = candidates.find(l => l.lotCode === selectedLotCode)
    if (chosen) {
      onConfirmAdd(chosen)
    }
    onClose()
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="add-lot-modal-title"
      >
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleWrap}>
            <div className={styles.iconBox}>
              <PlusCircle size={20} />
            </div>
            <div>
              <h2 id="add-lot-modal-title" className={styles.modalTitle}>
                Thêm lô nguyên liệu phối trộn
              </h2>
              <p className={styles.modalSubtitle}>
                Chọn thêm lô nguyên liệu hợp chuẩn trong kho để phối trộn cho mẻ Nấu chung
              </p>
            </div>
          </div>

          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Notice */}
        <div className={styles.ruleNotice}>
          <AlertCircle size={16} className={styles.noticeIcon} />
          <span className={styles.noticeText}>
            Quy định Nấu chung cho phép <strong>phối trộn nhiều lô</strong>. Lô được chọn phải còn hạn sử dụng và đủ tồn kho.
          </span>
        </div>

        {/* Lots List */}
        <div className={styles.lotsList}>
          {candidates.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>
              Không còn lô nguyên liệu khả dụng nào khác trong kho.
            </div>
          ) : (
            candidates.map((lot) => {
              const isSelected = selectedLotCode === lot.lotCode

              return (
                <div
                  key={lot.lotCode}
                  className={`${styles.lotCard} ${isSelected ? styles.lotCardSelected : ""}`}
                  onClick={() => setSelectedLotCode(lot.lotCode)}
                >
                  <div className={styles.lotRadio}>
                    <div className={`${styles.radioCircle} ${isSelected ? styles.radioActive : ""}`}>
                      {isSelected && <Check size={14} className={styles.checkIcon} />}
                    </div>
                  </div>

                  <div className={styles.lotInfo}>
                    <div className={styles.lotNameRow}>
                      <span className={styles.lotName}>{lot.lotName}</span>
                      <span className={styles.lotCodeBadge}>{lot.lotCode}</span>
                    </div>

                    <div className={styles.lotSupplier}>{lot.supplier}</div>

                    <div className={styles.lotMetaGrid}>
                      <div className={styles.metaItem}>
                        <ShieldCheck size={14} className={styles.metaIcon} />
                        <span>{lot.cert}</span>
                      </div>

                      <div className={styles.metaItem}>
                        <Calendar size={14} className={styles.metaIcon} />
                        <span>HSD: {lot.expiryDate} ({lot.expiryRemaining})</span>
                      </div>

                      <div className={styles.metaItem}>
                        <Warehouse size={14} className={styles.metaIcon} />
                        <span>Tồn: <strong>{lot.stock} {lot.unit}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.btnCancel}
            onClick={onClose}
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            className={styles.btnConfirm}
            onClick={handleConfirm}
            disabled={candidates.length === 0}
          >
            <Check size={16} />
            <span>Thêm lô này vào mẻ</span>
          </button>
        </div>
      </div>
    </div>
  )
}

