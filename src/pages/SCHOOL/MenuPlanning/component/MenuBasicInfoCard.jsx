import React from "react"
import styles from "./MenuBasicInfoCard.module.scss"

export default function MenuBasicInfoCard({
  formState,
  onChangeField
}) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <span className={`material-symbols-outlined ${styles.headerIcon}`}>tune</span>
          <h2 className={styles.cardTitle}>Thông tin thực đơn</h2>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.multiNotice}>
            <span className={`material-symbols-outlined ${styles.multiIcon}`}>info</span>
            Có thể tạo nhiều thực đơn trong cùng 1 ngày (theo khối/ca ăn)
          </span>
        </div>
      </div>

      <div className={styles.formGrid}>
        {/* Tên thực đơn */}
        <div className={`${styles.fieldCol} ${styles.col6}`}>
          <label className={styles.fieldLabel} htmlFor="menuName">
            Tên thực đơn <span className={styles.req}>*</span>
          </label>
          <input
            id="menuName"
            type="text"
            className={styles.textInput}
            value={formState.name}
            onChange={(e) => onChangeField("name", e.target.value)}
            placeholder="Ví dụ: Thực đơn tuần 46 - Khối 1-2 - Bữa trưa"
          />
        </div>

        {/* Ngày ăn */}
        <div className={`${styles.fieldCol} ${styles.col3}`}>
          <label className={styles.fieldLabel} htmlFor="menuDate">
            Ngày áp dụng <span className={styles.req}>*</span>
          </label>
          <div className={styles.inputWithIcon}>
            <span className={`material-symbols-outlined ${styles.innerIcon}`}>calendar_today</span>
            <input
              id="menuDate"
              type="text"
              className={`${styles.textInput} ${styles.plIcon}`}
              value={formState.date}
              onChange={(e) => onChangeField("date", e.target.value)}
              placeholder="DD/MM/YYYY"
            />
          </div>
        </div>

        {/* Bữa ăn */}
        <div className={`${styles.fieldCol} ${styles.col3}`}>
          <label className={styles.fieldLabel} htmlFor="mealType">
            Loại bữa ăn <span className={styles.req}>*</span>
          </label>
          <div className={styles.selectWrapper}>
            <select
              id="mealType"
              className={styles.selectInput}
              value={formState.mealType}
              onChange={(e) => onChangeField("mealType", e.target.value)}
            >
              <option value="LUNCH">Bữa trưa (10:30 - 11:30)</option>
              <option value="AFTERNOON_SNACK">Bữa xế (14:00 - 14:30)</option>
            </select>
            <span className={`material-symbols-outlined ${styles.selectChevron}`}>expand_more</span>
          </div>
        </div>

        {/* Áp dụng cho */}
        <div className={`${styles.fieldCol} ${styles.col6}`}>
          <label className={styles.fieldLabel} htmlFor="targetScope">
            Khối lớp áp dụng <span className={styles.req}>*</span>
          </label>
          <div className={styles.selectWrapper}>
            <select
              id="targetScope"
              className={styles.selectInput}
              value={formState.targetScope}
              onChange={(e) => onChangeField("targetScope", e.target.value)}
            >
              <option value="ALL">Toàn trường (Khối 1 - Khối 5) • 520 suất</option>
              <option value="K1_K2">Khối 1 & Khối 2 • 210 suất</option>
              <option value="K3_K5">Khối 3, Khối 4 & Khối 5 • 310 suất</option>
              <option value="MAM_NON">Khối Mầm non • 150 suất</option>
            </select>
            <span className={`material-symbols-outlined ${styles.selectChevron}`}>expand_more</span>
          </div>
        </div>

        {/* Tổng số suất dự kiến */}
        <div className={`${styles.fieldCol} ${styles.col6}`}>
          <label className={styles.fieldLabel}>
            Tổng số suất kế hoạch
          </label>
          <div className={styles.readonlyPill}>
            <span className={`material-symbols-outlined ${styles.readonlyIcon}`}>group</span>
            <span className={styles.readonlyNumber}>{formState.portionCount}</span>
            <span className={styles.readonlyUnit}>suất ăn học đường</span>
          </div>
        </div>

        {/* Ghi chú dinh dưỡng */}
        <div className={`${styles.fieldCol} ${styles.col12}`}>
          <label className={styles.fieldLabel} htmlFor="menuNotes">
            Ghi chú dinh dưỡng & khuyến nghị
          </label>
          <input
            id="menuNotes"
            type="text"
            className={styles.textInput}
            value={formState.notes}
            onChange={(e) => onChangeField("notes", e.target.value)}
            placeholder="Ghi chú hướng dẫn cho Bếp hoặc chỉ số dinh dưỡng..."
          />
        </div>
      </div>
    </div>
  )
}
