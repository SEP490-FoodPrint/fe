import React from "react"
import styles from "./MenuDetailAllergyCard.module.scss"

export default function MenuDetailAllergyCard({ menu }) {
  if (!menu) return null

  const hasAllergy = menu.hasAllergyMenu

  if (!hasAllergy) {
    return (
      <div className={styles.safeBanner}>
        <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
        <span className={styles.safeText}>
          Không có học sinh ghi nhận tiền sử dị ứng trong ca ăn này — 100% sử dụng suất ăn tiêu chuẩn.
        </span>
      </div>
    )
  }

  const substitute = menu.substituteDish
  const subIngredients = substitute?.ingredientDetails?.length > 0
    ? substitute.ingredientDetails
    : (substitute?.ingredients || []).map((name) => ({ name }))

  return (
    <div className={styles.allergyCard}>
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <span className={`material-symbols-outlined ${styles.headerIcon}`}>health_and_safety</span>
          <div>
            <h2 className={styles.cardTitle}>Phương án suất ăn riêng cho học sinh dị ứng</h2>
            <p className={styles.cardSubtitle}>
              Bố trí món thay thế an toàn theo hồ sơ y tế học sinh
            </p>
          </div>
        </div>
        <span className={styles.allergyBadge}>Suất riêng dị ứng</span>
      </div>

      <div className={styles.substituteBox}>
        <div className={styles.subHeader}>
          <div className={styles.subTitleWrap}>
            <span className="material-symbols-outlined text-[18px] text-[#0a8066]">restaurant</span>
            <span className={styles.subTitle}>Món ăn thay thế:</span>
            <strong className={styles.subName}>{substitute?.name || "Món ăn thay thế"}</strong>
          </div>
        </div>

        {subIngredients.length > 0 && (
          <div className={styles.subIngredientsWrap}>
            <span className={styles.subLabel}>Định lượng nguyên liệu / suất:</span>
            <div className={styles.ingTags}>
              {subIngredients.map((ing, idx) => {
                const hasQty = ing.quantityPerPortion != null && ing.quantityPerPortion !== ""
                return (
                  <div key={idx} className={styles.ingPill}>
                    <span>{ing.name}</span>
                    {hasQty && (
                      <strong className={styles.ingQtyBadge}>
                        {ing.quantityPerPortion} {ing.unit || "g"}
                      </strong>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <p className={styles.seasoningNote}>
          * Gia vị chế biến món thay thế tuân theo tiêu chuẩn kho của thực đơn chung.
        </p>
      </div>
    </div>
  )
}
