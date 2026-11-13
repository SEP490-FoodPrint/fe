import React from "react"
import styles from "./MenuDetailBasicInfo.module.scss"

export default function MenuDetailBasicInfo({ menu }) {
  if (!menu) return null

  return (
    <div className={styles.summaryBar}>
      {/* 1: Ngày & Bữa ăn */}
      <div className={styles.item}>
        <span className={styles.label}>Ngày & Bữa ăn</span>
        <div className={styles.valRow}>
          <span className="material-symbols-outlined text-[18px] text-[#0a8066]">calendar_today</span>
          <strong className={styles.val}>{menu.date}</strong>
          <span className={styles.mealChip}>
            {menu.mealType === "AFTERNOON" ? "Bữa chiều" : "Bữa trưa"}
          </span>
        </div>
      </div>

      <div className={styles.sep} />

      {/* 2: Khối lớp áp dụng */}
      <div className={styles.item}>
        <span className={styles.label}>Phạm vi áp dụng</span>
        <div className={styles.valRow}>
          <span className="material-symbols-outlined text-[18px] text-[#0a8066]">school</span>
          <strong className={styles.val}>{menu.targetScope || "Toàn trường"}</strong>
        </div>
      </div>

      <div className={styles.sep} />

      {/* 3: Số món */}
      <div className={styles.item}>
        <span className={styles.label}>Quy mô thực đơn</span>
        <div className={styles.valRow}>
          <span className="material-symbols-outlined text-[18px] text-[#0a8066]">restaurant_menu</span>
          <strong className={styles.val}>{menu.dishes?.length || 0} món ăn</strong>
          {menu.seasonings?.length > 0 && (
            <span className={styles.subTag}>{menu.seasonings.length} loại gia vị</span>
          )}
        </div>
      </div>

      <div className={styles.sep} />

      {/* 4: Phương án dị ứng */}
      <div className={styles.item}>
        <span className={styles.label}>Chế độ suất ăn</span>
        <div className={styles.valRow}>
          <span className={`material-symbols-outlined text-[18px] ${menu.hasAllergyMenu ? "text-amber-600" : "text-emerald-600"}`}>
            {menu.hasAllergyMenu ? "shield_with_heart" : "check_circle"}
          </span>
          <strong className={styles.val}>
            {menu.hasAllergyMenu ? "Có suất riêng dị ứng" : "Chưa có phương án suất riêng"}
          </strong>
        </div>
      </div>
    </div>
  )
}
