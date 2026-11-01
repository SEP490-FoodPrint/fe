import React from "react"
import styles from "./AllergySafetyCard.module.scss"

export default function AllergySafetyCard({
  conflictDish,
  selectedOption,
  onSelectOption
}) {
  const hasConflict = Boolean(conflictDish)

  return (
    <div className={styles.stickyCard}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <div className={styles.iconCircle}>
          <span className={`material-symbols-outlined ${styles.shieldIcon}`}>health_and_safety</span>
        </div>
        <div>
          <h2 className={styles.cardTitle}>Kiểm tra dị ứng</h2>
          <p className={styles.cardSubtitle}>Đối soát tự động với hồ sơ sức khỏe 18 lớp học</p>
        </div>
      </div>

      {hasConflict ? (
        <>
          {/* Status Alert Banner */}
          <div className={styles.alertBanner}>
            <span className={`material-symbols-outlined ${styles.alertIcon}`}>warning</span>
            <div>
              <div className={styles.alertTitle}>Phát hiện 1 món có xung đột dị ứng</div>
              <div className={styles.alertDesc}>Cần chọn phương án xử lý trước khi gửi BGH phê duyệt</div>
            </div>
          </div>

          {/* Chi tiết xung đột */}
          <div className={styles.conflictDetailCard}>
            <div className={styles.conflictItemHeader}>
              <span className={styles.dishLabel}>Món ăn:</span>
              <strong className={styles.dishTarget}>{conflictDish.name}</strong>
            </div>
            <div className={styles.allergenInfo}>
              Thành phần gây dị ứng: <strong className={styles.allergenHighlight}>{conflictDish.allergenName}</strong>
            </div>

            <div className={styles.affectedBreakdown}>
              <div className={styles.breakdownHeader}>
                <span className={`material-symbols-outlined ${styles.miniIcon}`}>group</span>
                <span>{conflictDish.allergyCount} học sinh bị ảnh hưởng tại {conflictDish.allergyClasses?.length} lớp:</span>
              </div>
              <div className={styles.classesTags}>
                {conflictDish.allergyClasses?.map((cls, idx) => (
                  <span key={idx} className={styles.classTag}>{cls}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Khu vực chọn phương án */}
          <div className={styles.optionsSection}>
            <div className={styles.optionsTitle}>Chọn phương án xử lý dị ứng:</div>

            {/* Phương án 1 */}
            <label
              className={`${styles.optionCard} ${selectedOption === "OPTION_1" ? styles.selectedCard : ""}`}
              onClick={() => onSelectOption("OPTION_1")}
            >
              <input
                type="radio"
                name="allergyOption"
                checked={selectedOption === "OPTION_1"}
                onChange={() => onSelectOption("OPTION_1")}
                className={styles.radioInput}
              />
              <div className={styles.optionContent}>
                <div className={styles.optionHead}>
                  <strong className={styles.optionName}>Phương án 1: Thay thế toàn bộ món</strong>
                </div>
                <p className={styles.optionDesc}>
                  Thay đổi món "{conflictDish.name}" bằng một món đạm an toàn khác không chứa hải sản cho toàn bộ 520 suất.
                </p>
              </div>
            </label>

            {/* Phương án 2 (Khuyên dùng) */}
            <label
              className={`${styles.optionCard} ${selectedOption === "OPTION_2" ? styles.selectedCard : ""}`}
              onClick={() => onSelectOption("OPTION_2")}
            >
              <input
                type="radio"
                name="allergyOption"
                checked={selectedOption === "OPTION_2"}
                onChange={() => onSelectOption("OPTION_2")}
                className={styles.radioInput}
              />
              <div className={styles.optionContent}>
                <div className={styles.optionHead}>
                  <strong className={styles.optionName}>Phương án 2: Bố trí suất ăn riêng</strong>
                  <span className={styles.recommendedBadge}>Khuyên dùng</span>
                </div>
                <p className={styles.optionDesc}>
                  Giữ nguyên thực đơn chính cho 508 học sinh. Bếp chế biến riêng 12 suất thay thế ("Thịt bò xào rau củ") và dán tem màu vàng cam nhận diện.
                </p>
              </div>
            </label>
          </div>
        </>
      ) : (
        /* Trạng thái an toàn tuyệt đối */
        <div className={styles.allSafeBox}>
          <span className={`material-symbols-outlined ${styles.safeBigIcon}`}>verified_user</span>
          <div className={styles.safeTitle}>Thực đơn an toàn tuyệt đối</div>
          <p className={styles.safeDesc}>
            Không phát hiện dị nguyên xung đột với hồ sơ dị ứng đã khai báo của toàn trường.
          </p>
        </div>
      )}

      {/* Business Note */}
      <div className={styles.noteFooter}>
        <span className={`material-symbols-outlined ${styles.infoIcon}`}>info</span>
        <span>
          Mọi quyết định đều được ghi vết thẩm định và gửi thông báo tự động đến Giáo viên chủ nhiệm & Ban Giám hiệu.
        </span>
      </div>
    </div>
  )
}

