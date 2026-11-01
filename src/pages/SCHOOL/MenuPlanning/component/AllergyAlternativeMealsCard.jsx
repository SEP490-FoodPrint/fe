import React from "react"
import styles from "./AllergyAlternativeMealsCard.module.scss"

export default function AllergyAlternativeMealsCard({
  conflictDish,
  portionCount
}) {
  if (!conflictDish) return null

  const allergyPortions = conflictDish.allergyCount || 12
  const standardPortions = portionCount - allergyPortions

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleWithIcon}>
          <span className={`material-symbols-outlined ${styles.icon}`}>label_important</span>
          <h3 className={styles.title}>
            Bố trí suất ăn riêng cho học sinh dị ứng ({allergyPortions} suất)
          </h3>
        </div>
        <span className={styles.tag}>Phương án 2 đang áp dụng</span>
      </div>

      <div className={styles.contentGrid}>
        {/* Phân bổ suất */}
        <div className={styles.portionSplitCard}>
          <div className={styles.splitRow}>
            <span className={styles.splitLabel}>Suất ăn tiêu chuẩn toàn trường:</span>
            <strong className={styles.splitValue}>{standardPortions} suất</strong>
          </div>
          <div className={styles.splitRow}>
            <span className={styles.splitLabel}>Suất ăn riêng thay thế dị ứng:</span>
            <strong className={styles.splitValueAllergy}>{allergyPortions} suất</strong>
          </div>
        </div>

        {/* Chi tiết thay thế món */}
        <div className={styles.substituteCard}>
          <div className={styles.subHead}>
            <span className={styles.subLabel}>Món thay thế được phê duyệt:</span>
            <strong className={styles.subDishName}>Thịt bò xào rau củ thập cẩm</strong>
          </div>
          <div className={styles.subIngredients}>
            <span>• Thành phần: Thịt bò nạc Vissan (40g/suất) + Cần tây/Cà rốt Nam Hà (30g/suất)</span>
          </div>
          <div className={styles.subLabelNotice}>
            <span className={`material-symbols-outlined ${styles.tagIcon}`}>local_offer</span>
            <span>Quy chuẩn: Bếp chia khay riêng, dán <strong>Tem nhận diện màu vàng cam</strong> ghi rõ tên lớp trước khi giao.</span>
          </div>
        </div>
      </div>
    </div>
  )
}

