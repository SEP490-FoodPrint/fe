import React from "react"
import styles from "./MenuDetailModal.module.scss"

export default function MenuDetailModal({
  isOpen,
  onClose,
  menu,
  onEditMenu
}) {
  if (!isOpen || !menu) return null

  const canEdit = menu.status === "DRAFT" || menu.status === "REVISION_REQUESTED"

  const getStatusBadge = (status) => {
    switch (status) {
      case "REVISION_REQUESTED":
        return <span className={`${styles.badge} ${styles.badgeRevision}`}>Yêu cầu chỉnh sửa</span>
      case "APPROVED":
        return <span className={`${styles.badge} ${styles.badgeApproved}`}>Đã phê duyệt</span>
      case "PENDING_APPROVAL":
        return <span className={`${styles.badge} ${styles.badgePending}`}>Chờ BGH duyệt</span>
      case "DRAFT":
      default:
        return <span className={`${styles.badge} ${styles.badgeDraft}`}>Bản nháp</span>
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.codeRow}>
              <span className={styles.menuCode}>{menu.code}</span>
              {getStatusBadge(menu.status)}
            </div>
            <h2 className={styles.menuTitle}>{menu.name}</h2>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          {/* Section: Feedback BGH (nếu có) */}
          {menu.feedback && (
            <div
              className={`${styles.feedbackCard} ${
                menu.status === "REVISION_REQUESTED"
                  ? styles.feedbackWarning
                  : styles.feedbackNormal
              }`}
            >
              <div className={styles.feedbackHeader}>
                <span className="material-symbols-outlined text-[20px]">
                  {menu.status === "REVISION_REQUESTED" ? "report_problem" : "fact_check"}
                </span>
                <span className={styles.feedbackTitle}>Ý kiến phản hồi từ Ban Giám Hiệu</span>
              </div>
              <p className={styles.feedbackContent}>{menu.feedback}</p>
            </div>
          )}

          {/* Key Metrics Grid */}
          <div className={styles.metricsGrid}>
            <div className={styles.metricItem}>
              <span className={styles.metricLabel}>Ngày áp dụng</span>
              <span className={styles.metricValue}>{menu.date}</span>
            </div>
            <div className={styles.metricItem}>
              <span className={styles.metricLabel}>Bữa ăn</span>
              <span className={styles.metricValue}>
                {menu.mealType === "LUNCH" ? "Bữa trưa" : "Bữa chiều"}
              </span>
            </div>
            <div className={styles.metricItem}>
              <span className={styles.metricLabel}>Khối lớp áp dụng</span>
              <span className={styles.metricValue}>{menu.targetScope || "Toàn trường"}</span>
            </div>
            <div className={styles.metricItem}>
              <span className={styles.metricLabel}>Tổng số suất</span>
              <span className={styles.metricValuePrimary}>{menu.portionCount} suất</span>
            </div>
          </div>

          {/* Section: Danh sách món ăn */}
          <div className={styles.sectionBlock}>
            <h3 className={styles.sectionTitle}>
              <span className="material-symbols-outlined text-[18px] text-[#0a8066]">restaurant_menu</span>
              Cơ cấu món ăn trong thực đơn
            </h3>
            <div className={styles.dishesList}>
              {menu.dishes?.map((dish, idx) => (
                <div key={idx} className={styles.dishCard}>
                  <div className={styles.dishHeader}>
                    <span className={styles.dishIndex}>{idx + 1}</span>
                    <span className={styles.dishName}>{dish.name}</span>
                    <span className={styles.dishQty}>{dish.qty} / suất</span>
                  </div>
                  {dish.ingredients && dish.ingredients.length > 0 && (
                    <div className={styles.dishIngredients}>
                      <span className={styles.ingLabel}>Thành phần chính:</span>
                      <div className={styles.ingTags}>
                        {dish.ingredients.map((ing, iIdx) => (
                          <span key={iIdx} className={styles.ingTag}>
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section: Suất ăn dị ứng riêng */}
          {menu.hasAllergyMenu && menu.substituteDish && (
            <div className={styles.sectionBlock}>
              <h3 className={styles.sectionTitle}>
                <span className="material-symbols-outlined text-[18px] text-[#16a34a]">verified_user</span>
                Bố trí suất ăn riêng & Món thay thế cho học sinh dị ứng
              </h3>
              <div className={styles.substituteCard}>
                <div className={styles.subHeader}>
                  <span className={styles.subTag}>Suất ăn riêng</span>
                  <span className={styles.subName}>{menu.substituteDish.name}</span>
                  <span className={styles.subQty}>{menu.substituteDish.qty} / suất</span>
                </div>
                <div className={styles.subDetails}>
                  <span className={styles.ingLabel}>Thành phần an toàn:</span>
                  <div className={styles.ingTags}>
                    {menu.substituteDish.ingredients?.map((ing, sIdx) => (
                      <span key={sIdx} className={styles.ingTagSafe}>
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={styles.subNote}>
                  <span className="material-symbols-outlined text-[15px] text-[#0284c7]">info</span>
                  <span>Gia vị chế biến món thay thế giữ nguyên theo thực đơn chung.</span>
                </div>
              </div>
            </div>
          )}

          {/* Section: Gia vị bữa ăn */}
          {menu.seasonings && menu.seasonings.length > 0 && (
            <div className={styles.sectionBlock}>
              <h3 className={styles.sectionTitle}>
                <span className="material-symbols-outlined text-[18px] text-[#d97706]">soup_kitchen</span>
                Gia vị học đường dùng chung
              </h3>
              <div className={styles.seasoningTags}>
                {menu.seasonings.map((s, sIdx) => (
                  <span key={sIdx} className={styles.seasoningTag}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Đóng
          </button>
          {canEdit && (
            <button
              type="button"
              className={styles.editBtn}
              onClick={() => {
                onClose()
                onEditMenu(menu)
              }}
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              <span>Chỉnh sửa thực đơn này</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

