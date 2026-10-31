import React, { useState } from "react"
import {
  X,
  ArrowLeftRight,
  ShieldCheck,
  Calendar,
  Warehouse,
  Check,
  AlertCircle
} from "lucide-react"
import styles from "./SwapLotModal.module.scss"

// Danh sách các lô thay thế giả lập theo loại nguyên liệu
const AVAILABLE_LOTS_BY_INGREDIENT = {
  chicken: [
    {
      lotCode: "LOT-GA-01A",
      lotName: "Lô thịt gà A",
      supplier: "HTX Nông nghiệp Sạch Ba Vì",
      cert: "VietGAP 3981/HTXBV",
      certNote: "Kiểm định thú y đạt chuẩn",
      expiryDate: "25/10/2026",
      expiryRemaining: "Còn 2 ngày",
      stock: 18.0,
      unit: "kg",
      warehouse: "Kho lạnh B1 (Dư +12.0 kg)",
      isCurrent: true
    },
    {
      lotCode: "LOT-GA-01B",
      lotName: "Lô thịt gà B (Hữu cơ)",
      supplier: "HTX Chăn nuôi Sóc Sơn",
      cert: "VietGAP 5120/HTXSS",
      certNote: "Kiểm định thú y đạt chuẩn A+",
      expiryDate: "27/10/2026",
      expiryRemaining: "Còn 4 ngày",
      stock: 24.5,
      unit: "kg",
      warehouse: "Kho lạnh B1 (Dư +18.5 kg)",
      isCurrent: false
    },
    {
      lotCode: "LOT-GA-01C",
      lotName: "Lô thịt gà C (Gà đồi)",
      supplier: "Nông trại Gà đồi Chí Linh",
      cert: "VietGAP 4410/NTCL",
      certNote: "Kiểm định thú y đạt chuẩn",
      expiryDate: "28/10/2026",
      expiryRemaining: "Còn 5 ngày",
      stock: 30.0,
      unit: "kg",
      warehouse: "Kho lạnh B2 (Dư +24.0 kg)",
      isCurrent: false
    }
  ],
  ginger: [
    {
      lotCode: "LOT-GUNG-102",
      lotName: "Gừng tươi củ nhỏ",
      supplier: "Nông trại Hải Dương",
      cert: "Rau an toàn Hải Dương",
      certNote: "Đạt tiêu chuẩn an toàn",
      expiryDate: "30/10/2026",
      expiryRemaining: "Còn 7 ngày",
      stock: 5.0,
      unit: "kg",
      warehouse: "Kho rau củ",
      isCurrent: true
    },
    {
      lotCode: "LOT-GUNG-105",
      lotName: "Gừng sẻ Tây Bắc",
      supplier: "HTX Nông sản Sơn La",
      cert: "VietGAP 2209/SL",
      certNote: "Đặc sản vùng cao sạch",
      expiryDate: "05/11/2026",
      expiryRemaining: "Còn 12 ngày",
      stock: 8.0,
      unit: "kg",
      warehouse: "Kho rau củ",
      isCurrent: false
    }
  ]
}

export default function SwapLotModal({ isOpen, onClose, targetItem, onConfirmSwap }) {
  if (!isOpen || !targetItem) return null

  // Xác định danh sách lô khả dụng dựa trên item
  const isChicken = targetItem.lotCode?.includes("GA") || targetItem.name?.includes("gà")
  const availableLots = isChicken
    ? AVAILABLE_LOTS_BY_INGREDIENT.chicken
    : AVAILABLE_LOTS_BY_INGREDIENT.ginger

  const [selectedLotCode, setSelectedLotCode] = useState(targetItem.lotCode)

  const handleConfirm = () => {
    const selectedLot = availableLots.find((l) => l.lotCode === selectedLotCode)
    if (selectedLot) {
      onConfirmSwap(targetItem, selectedLot)
    }
    onClose()
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleWrap}>
            <div className={styles.iconBox}>
              <ArrowLeftRight size={20} />
            </div>
            <div>
              <h2 id="modal-title" className={styles.modalTitle}>
                Thay thế lô nguyên liệu
              </h2>
              <p className={styles.modalSubtitle}>
                Chọn lô nguyên liệu thay thế hợp chuẩn trong kho cho: <strong>{targetItem.name || targetItem.lotName}</strong>
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
            Quy định Nấu riêng yêu cầu <strong>01 lô duy nhất</strong> cho mỗi nguyên liệu. Lô thay thế phải có tồn kho khả dụng ≥ lượng định mức cần dùng.
          </span>
        </div>

        {/* Lots List */}
        <div className={styles.lotsList}>
          {availableLots.map((lot) => {
            const isSelected = selectedLotCode === lot.lotCode
            const isCurrent = lot.lotCode === targetItem.lotCode

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
                    {isCurrent && <span className={styles.currentBadge}>Đang phân bổ</span>}
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
          })}
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
          >
            <Check size={16} />
            <span>Xác nhận chọn lô này</span>
          </button>
        </div>
      </div>
    </div>
  )
}
