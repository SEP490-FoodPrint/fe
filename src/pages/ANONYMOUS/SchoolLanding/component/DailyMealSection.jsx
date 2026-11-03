import React from "react";
import PropTypes from "prop-types";
import {
  Cake,
  CheckCircle,
  Clock,
  Coffee,
  Info,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import styles from "./DailyMealSection.module.scss";

function DailyMealSection({ dailyMeal }) {
  const hasData = Boolean(
    dailyMeal &&
      ((dailyMeal.lunch?.dishes && dailyMeal.lunch.dishes.length > 0) ||
        (dailyMeal.snack?.dishes && dailyMeal.snack.dishes.length > 0) ||
        (dailyMeal.snack?.items && dailyMeal.snack.items.length > 0)),
  );

  const lunch = dailyMeal?.lunch;
  const snack = dailyMeal?.snack;

  const dateLabel =
    dailyMeal?.dateLabel || dailyMeal?.date_label || "Thực đơn hôm nay";
  const updatedAt =
    dailyMeal?.updatedAt || dailyMeal?.updated_at || "07:15 sáng nay";

  const snackItems =
    snack?.items && snack.items.length > 0
      ? snack.items
      : (snack?.dishes || []).map((d) => ({
          id: d.id,
          name: d.name,
          desc: d.portion || "1 suất",
          icon:
            d.name.toLowerCase().includes("sữa") ||
            d.name.toLowerCase().includes("nước") ||
            d.name.toLowerCase().includes("chè")
              ? "coffee"
              : "cake",
        }));

  return (
    <section id="thuc-don-ngay" className={styles.section}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <div className={styles.datePill}>
              <span className={styles.pulseDot} />
              <span>{dateLabel}</span>
            </div>
            <h2 className={styles.sectionTitle}>Chi tiết bữa ăn hôm nay</h2>
            <p className={styles.sectionSubtitle}>
              Hình ảnh và thành phần chi tiết của từng bữa ăn trong ngày của học
              sinh tại trường.
            </p>
          </div>

          <div className={styles.updateTime}>
            <Clock size={16} className={styles.clockIcon} />
            <span>Cập nhật lúc {updatedAt}</span>
          </div>
        </div>

        {/* Nội dung: Hiển thị Empty State Banner trong container hoặc Grid món ăn */}
        {!hasData ? (
          <div className={styles.emptyContainer}>
            <div className={styles.emptyIconBox}>
              <UtensilsCrossed size={32} />
            </div>
            <h3 className={styles.emptyTitle}>
              Chưa có thực đơn cho ngày hôm nay
            </h3>
            <p className={styles.emptyDescription}>
              Nhà trường chưa cập nhật thực đơn hoặc chưa có lịch phục vụ bán trú
              vào ngày này. Phụ huynh vui lòng kiểm tra lại sau hoặc xem thực đơn
              tuần bên dưới.
            </p>
          </div>
        ) : (
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
                      {lunch?.servingWindow ||
                        lunch?.serving_window ||
                        "10:45 – 11:30"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content: Image & Dishes */}
              <div className={styles.lunchBody}>
                <div className={styles.imageCol}>
                  <div className={styles.lunchImageWrapper}>
                    <img
                      src={
                        lunch?.trayImageUrl ||
                        lunch?.tray_image_url ||
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80"
                      }
                      alt={lunch?.title || "Khay cơm trưa"}
                      className={styles.lunchImg}
                      loading="lazy"
                    />
                    <span className={styles.trayTag}>
                      {lunch?.trayType ||
                        lunch?.tray_type ||
                        "Khay chia 5 ngăn inox chuẩn y tế"}
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
                        <span className={styles.dishPortion}>
                          {dish.portion || "1 suất"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Footer notes */}
              <div className={styles.lunchFooter}>
                <div className={styles.standardRow}>
                  <CheckCircle size={18} className={styles.checkIcon} />
                  <span>
                    {lunch?.standardsNote ||
                      lunch?.standards_note ||
                      "Đạt chuẩn 4 nhóm chất dinh dưỡng"}
                  </span>
                </div>
                <div className={styles.allergyWarningRow}>
                  <Info size={16} className={styles.infoIcon} />
                  <span>
                    {lunch?.allergyWarning ||
                      lunch?.allergy_warning ||
                      "Đã kiểm thực 3 bước — An toàn dinh dưỡng học đường"}
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
                      Khung giờ phục vụ:{" "}
                      {snack?.servingWindow ||
                        snack?.serving_window ||
                        "14:30 – 15:00"}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.snackBody}>
                <div className={styles.snackImageWrapper}>
                  <img
                    src={
                      snack?.imageUrl ||
                      snack?.image_url ||
                      "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80"
                    }
                    alt={snack?.title || "Bữa phụ chiều"}
                    className={styles.snackImg}
                    loading="lazy"
                  />
                </div>

                <div className={styles.snackItemsList}>
                  <h4 className={styles.snackItemsTitle}>Khẩu phần gồm có:</h4>
                  <div className={styles.snackItemsGroup}>
                    {snackItems.map((item, idx) => (
                      <div key={item.id || idx} className={styles.snackItem}>
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
                  "Cung cấp năng lượng kịp thời cho học sinh tham gia các hoạt động ngoại khóa."}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

DailyMealSection.propTypes = {
  dailyMeal: PropTypes.object,
};

export default DailyMealSection;
