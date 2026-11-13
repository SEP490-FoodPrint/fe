import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw } from "lucide-react";
import ROUTER from "src/router/ROUTER";
import styles from "./CreateBatchHeader.module.scss";

export default function CreateBatchHeader({
  title = "Tiến độ chế biến",
  subtitle = "Khởi tạo lô và theo dõi quy trình chế biến món ăn trong ngày",
  onResetMock,
}) {
  const navigate = useNavigate();

  return (
    <div className={styles.headerBar}>
      <div className={styles.titleRow}>
        <div className={styles.titleLeft}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => navigate(ROUTER.SCHOOL_KITCHEN_BATCHES)}
            title="Quay lại danh sách lô"
            aria-label="Quay lại danh sách lô chế biến"
          >
            <ArrowLeft size={20} />
          </button>

          <div className={styles.titleTextWrap}>
            <h1 className={styles.heading}>{title}</h1>
            {subtitle && <p className={styles.subheading}>{subtitle}</p>}
          </div>
        </div>

        <div className={styles.headerRightGroup}>
          {onResetMock && (
            <button
              type="button"
              className={styles.resetMockBtn}
              onClick={onResetMock}
              title="Khôi phục dữ liệu mẫu 4 trạng thái: Chờ tạo lô, Đã tạo lô, Đã nấu xong, Đã lưu mẫu"
            >
              <RotateCcw size={14} />
              <span>Nạp lại dữ liệu mẫu</span>
            </button>
          )}

          <div
            className={styles.modeBadge}
            title="Chế độ cấu hình vận hành: Cho phép kết hợp nhiều lô nguyên liệu cùng loại"
          >
            <span className={styles.pulseDot} />
            <span className={styles.modeMobileText}>Nấu chung</span>
            <span className={styles.modeDesktopText}>Chế độ: Nấu chung</span>
          </div>
        </div>
      </div>
    </div>
  );
}
