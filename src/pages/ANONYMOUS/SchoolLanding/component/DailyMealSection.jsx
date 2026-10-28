import React from "react";
import PropTypes from "prop-types";
import {
  AlertTriangle,
  Cake,
  CheckCircle,
  Clock,
  Coffee,
  Info,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import styles from "./DailyMealSection.module.scss";

function DailyMealSection({ dailyMeal, onOpenAllergyModal }) {
  if (!dailyMeal) return null;

  const { lunch, snack } = dailyMeal;

  return (
    <section id="thuc-don-ngay" className={styles.section}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <div className={styles.datePill}>
              <span className={styles.pulseDot} />
              <span>{dailyMeal.date_label || "Thực đơn hôm nay"}</span>
            </div>
            <h2 className={styles.sectionTitle}>Chi tiết bữa ăn hôm nay</h2>
            <p className={styles.sectionSubtitle}>
              Hình ảnh và thành phần chi tiết của từng bữa ăn trong ngày của học
              sinh tại trường.
            </p>
          </div>

          <div className={styles.updateTime}>
            <Clock size={16} className={styles.clockIcon} />
            <span>Cập nhật lúc {dailyMeal.updated_at || "07:15 sáng nay"}</span>
          </div>
        </div>

        {/* Meal Cards Grid */}
        <div className={styles.grid}>
          {/* Card A: Bữa trưa chính (8 cols) */}
          <div className={styles.lunchCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitleGroup}>
                <div className={styles.lunchIconBox}>
                  <UtensilsCrossed size={22} />
                </div>
                <div>
                  <h3 className={styles.cardTitle}>
                    {lunch?.title || "Bữa trưa chính"}
                  </h3>
                  <span className={styles.servingTime}>
                    Khung giờ phục vụ:{" "}
                    {lunch?.serving_window || "10:45 – 11:30"}
                  </span>
                </div>
              </div>
            </div>

            {/* Content: Image & Dishes */}
            <div className={styles.lunchBody}>
              <div className={styles.imageCol}>
                <div className={styles.lunchImageWrapper}>
                  <img
                    src={lunch?.tray_image_url}
                    alt={lunch?.title}
                    className={styles.lunchImg}
                    loading="lazy"
                  />
                  <span className={styles.trayTag}>
                    {lunch?.tray_type || "Khay chia 5 ngăn"}
                  </span>
                </div>
              </div>

              <div className={styles.dishesCol}>
                <h4 className={styles.dishesTitle}>
                  <Sparkles size={16} />
                  <span>Món ăn trong bữa trưa:</span>
                </h4>

                <ul className={styles.dishList}>
                  {lunch?.dishes?.map((dish, idx) => (
                    <li key={dish.id || idx} className={styles.dishItem}>
                      <span className={styles.dishName}>
                        {idx + 1}. {dish.name}
                      </span>
                      <span className={styles.dishPortion}>{dish.portion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer notes */}
            <div className={styles.lunchFooter}>
              <div className={styles.standardRow}>
                <CheckCircle size={18} className={styles.checkIcon} />
                <span>{lunch?.standards_note || "Đạt chuẩn 4 nhóm chất"}</span>
              </div>
              <div className={styles.allergyWarningRow}>
                <Info size={16} className={styles.infoIcon} />
                <span>
                  {lunch?.allergy_warning ||
                    "Không chứa chất gây dị ứng phổ biến"}
                </span>
              </div>
            </div>
          </div>

          {/* Card B: Bữa xế chiều (4 cols) */}
          <div className={styles.snackCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitleGroup}>
                <div className={styles.snackIconBox}>
                  <Cake size={22} />
                </div>
                <div>
                  <h3 className={styles.cardTitle}>
                    {snack?.title || "Bữa phụ chiều"}
                  </h3>
                  <span className={styles.servingTime}>
                    {snack?.serving_window || "14:30 – 15:00"}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.snackBody}>
              <div className={styles.snackImageWrapper}>
                <img
                  src={snack?.image_url}
                  alt={snack?.title}
                  className={styles.snackImg}
                  loading="lazy"
                />
              </div>

              <div className={styles.snackItemsList}>
                <h4 className={styles.snackItemsTitle}>Khẩu phần gồm có:</h4>
                <div className={styles.snackItemsGroup}>
                  {snack?.items?.map((item) => (
                    <div key={item.id} className={styles.snackItem}>
                      <div className={styles.snackItemIcon}>
                        {item.icon === "cake" ? (
                          <Cake size={18} />
                        ) : (
                          <Coffee size={18} />
                        )}
                      </div>
                      <div className={styles.snackItemMeta}>
                        <span className={styles.snackItemName}>
                          {item.name}
                        </span>
                        <span className={styles.snackItemDesc}>
                          {item.desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.snackFooter}>
              {snack?.note ||
                "Cung cấp năng lượng kịp thời cho học sinh chiều."}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

DailyMealSection.propTypes = {
  dailyMeal: PropTypes.object,
  onOpenAllergyModal: PropTypes.func.isRequired,
};

export default DailyMealSection;
