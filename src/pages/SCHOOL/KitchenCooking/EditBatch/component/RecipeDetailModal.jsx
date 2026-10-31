import React from "react"
import { X, Calculator, ShieldCheck, UtensilsCrossed, CheckCircle2 } from "lucide-react"
import styles from "./RecipeDetailModal.module.scss"

export default function RecipeDetailModal({ isOpen, onClose, portions = 60 }) {
  if (!isOpen) return null

  const RECIPE_ITEMS = [
    {
      name: "Thịt gà ta làm sạch (Bỏ xương)",
      quotaPerPortion: "100.0 g",
      totalQty: "6.0 kg",
      role: "Món chính giàu protein",
      standard: "VietGAP / Kiểm dịch thú y"
    },
    {
      name: "Gừng tươi củ nhỏ",
      quotaPerPortion: "5.0 g",
      totalQty: "0.3 kg",
      role: "Gia vị khử tanh & làm ấm",
      standard: "Rau an toàn Hải Dương"
    },
    {
      name: "Hành tím sạch",
      quotaPerPortion: "3.33 g",
      totalQty: "0.2 kg",
      role: "Hương liệu phi thơm",
      standard: "Chuỗi cung ứng an toàn"
    },
    {
      name: "Gia vị kho tổng hợp tiêu chuẩn",
      quotaPerPortion: "8.33 g",
      totalQty: "0.5 kg",
      role: "Nước mắm, đường mía, tiêu",
      standard: "ISO 22000 & HACCP"
    }
  ]

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="recipe-modal-title"
      >
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleWrap}>
            <div className={styles.iconBox}>
              <Calculator size={20} />
            </div>
            <div>
              <h2 id="recipe-modal-title" className={styles.modalTitle}>
                Định lượng công thức chuẩn: Thịt gà kho
              </h2>
              <p className={styles.modalSubtitle}>
                Công thức phê duyệt bởi BGH THCS Đoàn Thị Điểm • Học kỳ I
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

        {/* Nutritional Banner */}
        <div className={styles.statsBanner}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Quy mô mẻ</span>
            <span className={styles.statValue}>{portions} suất</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Định mức thịt gà</span>
            <span className={styles.statValue}>100g / suất</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Tổng gà cần dùng</span>
            <span className={styles.statValue}>6.0 kg</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Năng lượng món</span>
            <span className={styles.statValue}>~220 Kcal</span>
          </div>
        </div>

        {/* Recipe Items Table */}
        <div className={styles.tableWrapper}>
          <table className={styles.recipeTable}>
            <thead>
              <tr>
                <th>Thành phần nguyên liệu</th>
                <th className={styles.textRight}>Định lượng / Suất</th>
                <th className={styles.textRight}>Tổng nhu cầu ({portions} suất)</th>
                <th>Tiêu chuẩn kiểm soát</th>
              </tr>
            </thead>
            <tbody>
              {RECIPE_ITEMS.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <div className={styles.itemName}>{item.name}</div>
                    <div className={styles.itemRole}>{item.role}</div>
                  </td>
                  <td className={styles.textRight}>
                    <span className={styles.quotaCell}>{item.quotaPerPortion}</span>
                  </td>
                  <td className={styles.textRight}>
                    <strong className={styles.totalQtyCell}>{item.totalQty}</strong>
                  </td>
                  <td>
                    <div className={styles.standardCell}>
                      <ShieldCheck size={14} className={styles.shieldIcon} />
                      <span>{item.standard}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Regulatory Note */}
        <div className={styles.complianceNote}>
          <CheckCircle2 size={16} className={styles.complianceIcon} />
          <span>
            Định lượng tuân thủ tiêu chuẩn dinh dưỡng học đường theo Thông tư liên tịch Bộ GD&ĐT &amp; Bộ Y tế. Hệ thống tự động tính toán chính xác, nhân viên bếp không cần nhập lại.
          </span>
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.btnClose}
            onClick={onClose}
          >
            Đóng bảng định lượng
          </button>
        </div>
      </div>
    </div>
  )
}

