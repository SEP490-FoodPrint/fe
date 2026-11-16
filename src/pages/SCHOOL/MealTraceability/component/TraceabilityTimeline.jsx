import React from "react";
import { GitCommit, ClipboardCheck, Flame, Layers, CheckCheck } from "lucide-react";
import styles from "./TraceabilityTimeline.module.scss";

export default function TraceabilityTimeline({ allocation, classInfo }) {
  const className = classInfo?.name || "Lớp 2A";
  const mealDate = allocation?.mealDate || "16/11/2026";

  return (
    <section className={styles.timelineSection}>
      <div className={styles.timelineHeader}>
        <div className={styles.headerTitleBox}>
          <div className={styles.headerIcon}>
            <GitCommit size={16} />
          </div>
          <div>
            <h2 className={styles.sectionTitle}>Tiến trình phục vụ bữa ăn</h2>
            <p className={styles.sectionSubtitle}>
              Các mốc xác nhận trên hệ thống FoodPrint cho bữa ăn ngày {mealDate}
            </p>
          </div>
        </div>
      </div>

      <div className={styles.timelineGrid}>
        {/* Step 1 */}
        <div className={styles.stepCard}>
          <div className={styles.stepIconWrap}>
            <ClipboardCheck size={20} />
          </div>
          <div className={styles.stepContent}>
            <span className={styles.stepTime}>09:00 · 16/11</span>
            <h3 className={styles.stepTitle}>Thực đơn phê duyệt</h3>
            <p className={styles.stepDesc}>
              BGH & Y tế kiểm duyệt đạt chuẩn dinh dưỡng
            </p>
            <span className={styles.stepBadge}>status: APPROVED</span>
          </div>
        </div>

        {/* Step 2 */}
        <div className={styles.stepCard}>
          <div className={styles.stepIconWrap}>
            <Flame size={20} />
          </div>
          <div className={styles.stepContent}>
            <span className={styles.stepTime}>10:30 - 11:25</span>
            <h3 className={styles.stepTitle}>Hoàn tất chế biến</h3>
            <p className={styles.stepDesc}>
              Bếp nấu chín và kiểm tra nhiệt độ đạt chuẩn
            </p>
            <span className={styles.stepBadge}>status: COMPLETED</span>
          </div>
        </div>

        {/* Step 3 */}
        <div className={styles.stepCard}>
          <div className={styles.stepIconWrap}>
            <Layers size={20} />
          </div>
          <div className={styles.stepContent}>
            <span className={styles.stepTime}>11:30 · 16/11</span>
            <h3 className={styles.stepTitle}>Phân bổ suất ăn</h3>
            <p className={styles.stepDesc}>
              Chia {allocation?.totalPortions || 30} suất cho {className} từ các lô nấu
            </p>
            <span className={styles.stepBadge}>status: CONFIRMED</span>
          </div>
        </div>

        {/* Step 4 */}
        <div className={styles.stepCard}>
          <div className={`${styles.stepIconWrap} ${styles.stepIconWrapSuccess}`}>
            <CheckCheck size={20} />
          </div>
          <div className={styles.stepContent}>
            <span className={styles.stepTime}>13:15 · 16/11</span>
            <h3 className={styles.stepTitle}>Phân phối đến lớp</h3>
            <p className={styles.stepDesc}>
              GVCN nhận suất ăn tại lớp và hoàn tất hồ sơ
            </p>
            <span className={styles.stepBadge}>status: DISTRIBUTED</span>
          </div>
        </div>
      </div>
    </section>
  );
}
