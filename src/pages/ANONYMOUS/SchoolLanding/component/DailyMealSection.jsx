import React from "react";
import PropTypes from "prop-types";
import {
  CheckCircle2,
  Clock,
  ShieldAlert,
  ShieldCheck,
  UtensilsCrossed,
} from "lucide-react";
import { NO_DATA_TEXT } from "src/constants/ui";
import { getSnackItems, hasDailyMealDishes } from "src/utils/publicMeal";
import styles from "./DailyMealSection.module.scss";

function DailyMealSection({ dailyMeal, selectedGradeName }) {
  const hasData = hasDailyMealDishes(dailyMeal);

  const lunch = dailyMeal?.lunch;
  const snack = dailyMeal?.snack;

  const dateLabel = dailyMeal?.dateLabel || NO_DATA_TEXT;
  const updatedAt = dailyMeal?.updatedAt || NO_DATA_TEXT;

  // Chuẩn hóa danh sách món/thức uống bữa phụ
  const snackItems = getSnackItems(snack);
  const lunchDishes = lunch?.dishes || [];

  return (
    <section id="thuc-don-ngay" className={styles.section} aria-label="Chi tiết thực đơn hôm nay">
      <div className={styles.container}>
        {/* Header Section: Trình bày thông tin trang trọng, mạch lạc */}
        <header className={styles.header}>
          <div className={styles.titleArea}>
            <div className={styles.dateMetaRow}>
              <span className={styles.dateBadge}>
                <span className={styles.statusIndicator} />
                {dateLabel}
              </span>
              {selectedGradeName && (
                <span className={styles.gradeBadge}>{selectedGradeName}</span>
              )}
            </div>
            <h2 className={styles.sectionTitle}>Chi tiết bữa ăn hôm nay</h2>
            <p className={styles.sectionSubtitle}>
              Thực đơn khẩu phần bán trú đạt chuẩn dinh dưỡng học đường và kiểm thực minh bạch mỗi ngày.
            </p>
          </div>

          <div className={styles.updateStamp}>
            <Clock size={15} className={styles.clockIcon} />
            <span>Cập nhật: {updatedAt}</span>
          </div>
        </header>

        {/* Nội dung thực đơn */}
        {!hasData ? (
          <div className={styles.emptyContainer} role="status">
            <div className={styles.emptyIconBox}>
              <UtensilsCrossed size={32} />
            </div>
            <h3 className={styles.emptyTitle}>
              Chưa có thực đơn cho ngày hôm nay
              {selectedGradeName ? ` (${selectedGradeName})` : ""}
            </h3>
            <p className={styles.emptyDescription}>
              Nhà trường chưa cập nhật thực đơn hoặc chưa có lịch phục vụ bán trú
              vào ngày này{selectedGradeName ? ` cho ${selectedGradeName}` : ""}.
              Phụ huynh vui lòng xem lịch thực đơn tuần chi tiết bên dưới.
            </p>
          </div>
        ) : (
          <div className={styles.mealCanvas}>
            {/* KHỐI 1: BỮA TRƯA CHÍNH (CÁC MÓN ĂN ĐƯỢC HIGHLIGHT VỚI SỐ THỨ TỰ) */}
            <article className={styles.lunchCard}>
              <div className={styles.cardTopBar}>
                <div className={styles.mealIdentity}>
                  <div className={styles.headingWithTags}>
                    <h3 className={styles.mealTitle}>
                      {lunch?.title || "Bữa trưa chính"}
                    </h3>
                    {lunch?.trayType && (
                      <span className={styles.trayPill}>
                        {lunch.trayType}
                      </span>
                    )}
                  </div>
                  <div className={styles.servingWindow}>
                    <span>Khung giờ phục vụ:</span>
                    <strong>{lunch?.servingWindow || NO_DATA_TEXT}</strong>
                  </div>
                </div>

                <div className={styles.dishCountBadge}>
                  <span>{lunchDishes.length} món tiêu chuẩn</span>
                </div>
              </div>

              {/* Danh sách món ăn bữa trưa dạng thẻ lớn, nổi bật và trực quan */}
              <div className={styles.dishesPanel}>
                <div className={styles.dishGrid}>
                  {lunchDishes.map((dish, idx) => {
                    const sub =
                      dish.substituteDish ||
                      dish.alternativeDish ||
                      dish.substitute;
                    return (
                      <div key={dish.id || idx} className={styles.dishCard}>
                        {/* Huy hiệu số thứ tự món nổi bật */}
                        <div className={styles.dishIndexBadge}>
                          <span className={styles.dishIndexNum}>
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                        </div>

                        <div className={styles.dishDetails}>
                          <div className={styles.dishHeadline}>
                            <h4 className={styles.dishName}>{dish.name}</h4>
                            {dish.portion && (
                              <span className={styles.portionBadge}>
                                <span className={styles.portionPrefix}>Khẩu phần:</span>
                                <strong className={styles.portionValue}>{dish.portion}</strong>
                              </span>
                            )}
                          </div>

                          {/* Hộp thông tin món thay thế dị ứng nổi bật */}
                          {sub && (
                            <div className={styles.allergySubstituteCard}>
                              <div className={styles.allergyHeader}>
                                <ShieldAlert size={14} className={styles.allergyIcon} />
                                <span className={styles.allergyTitle}>Chế độ thay thế dị ứng:</span>
                              </div>
                              <p className={styles.allergyText}>
                                Cấp riêng: <strong>{sub.name || sub}</strong>
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer kiểm thực và dinh dưỡng */}
              {/* Chỉ hiện ghi chú khi BE trả về, không tự điền cam kết mặc định. */}
              {(lunch?.standardsNote || lunch?.allergyWarning) && (
                <footer className={styles.lunchFooter}>
                  {lunch?.standardsNote && (
                    <div className={styles.assuranceItem}>
                      <CheckCircle2 size={16} className={styles.checkIcon} />
                      <span>{lunch.standardsNote}</span>
                    </div>
                  )}
                  {lunch?.allergyWarning && (
                    <div className={styles.assuranceItemSec}>
                      <ShieldCheck size={16} className={styles.shieldIcon} />
                      <span>{lunch.allergyWarning}</span>
                    </div>
                  )}
                </footer>
              )}
            </article>

            {/* KHỐI 2: BỮA PHỤ CHIỀU (ĐỒNG BỘ SỐ THỨ TỰ TỪNG MÓN NHƯ MÓN CHÍNH) */}
            <article className={styles.snackCard}>
              <div className={styles.snackTopBar}>
                <div className={styles.mealIdentity}>
                  <h3 className={styles.snackTitle}>
                    {snack?.title || "Bữa phụ chiều"}
                  </h3>
                  <div className={styles.servingWindow}>
                    <span>Khung giờ phục vụ:</span>
                    <strong>{snack?.servingWindow || NO_DATA_TEXT}</strong>
                  </div>
                </div>

                <div className={styles.snackCountBadge}>
                  <span>{snackItems.length} món phụ xế</span>
                </div>
              </div>

              <div className={styles.snackPanel}>
                <div className={styles.snackGrid}>
                  {snackItems.map((item, idx) => (
                    <div key={item.id || idx} className={styles.snackItemCard}>
                      {/* Huy hiệu số thứ tự món phụ đồng bộ như món chính */}
                      <div className={styles.snackIndexBadge}>
                        <span className={styles.snackIndexNum}>
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                      </div>

                      <div className={styles.snackMeta}>
                        <div className={styles.snackHeaderRow}>
                          <h4 className={styles.snackName}>{item.name}</h4>
                          <span className={styles.snackPill}>Món phụ</span>
                        </div>
                        {item.desc && (
                          <p className={styles.snackDesc}>{item.desc}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {snack?.note && (
                <div className={styles.snackNoteStrip}>
                  <span className={styles.noteLabel}>Lưu ý:</span>
                  <span className={styles.noteContent}>{snack.note}</span>
                </div>
              )}
            </article>
          </div>
        )}
      </div>
    </section>
  );
}

DailyMealSection.propTypes = {
  dailyMeal: PropTypes.object,
  selectedGradeName: PropTypes.string,
};

export default DailyMealSection;
