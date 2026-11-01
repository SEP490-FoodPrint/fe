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
            Hỗ trợ tạo nhiều thực đơn trong cùng 1 ngày (theo khối lớp hoặc ca ăn)
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
            placeholder="Ví dụ: Thực đơn tuần 46 - Khối 1 & 2 - Bữa trưa"
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

        {/* Khối lớp / Độ tuổi áp dụng (Nhập Text tự do theo yêu cầu) */}
        <div className={`${styles.fieldCol} ${styles.col6}`}>
          <label className={styles.fieldLabel} htmlFor="targetScope">
            Khối lớp / Độ tuổi áp dụng <span className={styles.req}>*</span>
          </label>
          <input
            id="targetScope"
            type="text"
            className={styles.textInput}
            value={formState.targetScope}
            onChange={(e) => onChangeField("targetScope", e.target.value)}
            placeholder="Tự nhập khối/độ tuổi, ví dụ: Toàn trường, Khối 1-2, Lớp Mầm non 3-4 tuổi..."
          />
        </div>

        {/* Tổng số suất dự kiến */}
        <div className={`${styles.fieldCol} ${styles.col6}`}>
          <label className={styles.fieldLabel} htmlFor="portionCount">
            Tổng số suất ăn kế hoạch <span className={styles.req}>*</span>
          </label>
          <div className={styles.portionInputWrapper}>
            <input
              id="portionCount"
              type="number"
              min="1"
              className={styles.portionNumberInput}
              value={formState.portionCount}
              onChange={(e) => onChangeField("portionCount", Number(e.target.value) || 0)}
            />
            <span className={styles.portionUnitLabel}>suất ăn</span>
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
            placeholder="Ghi chú dinh dưỡng, định hướng khẩu phần học đường..."
          />
        </div>
      </div>
    </div>
  )
}
