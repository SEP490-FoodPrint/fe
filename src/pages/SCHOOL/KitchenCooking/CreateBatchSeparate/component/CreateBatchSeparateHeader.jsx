import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ROUTER from "src/router/ROUTER";
import styles from "./CreateBatchSeparateHeader.module.scss";

export default function CreateBatchSeparateHeader({
  title = "Tiến độ chế biến",
  subtitle = "Khởi tạo lô và theo dõi quy trình chế biến món ăn trong ngày",
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

        <div
          className={styles.modeBadge}
          title="Chế độ nấu riêng 1:1: Mỗi lô nguyên liệu đầu vào được tự động tách thành một lô chế biến độc lập"
        >
          <span className={styles.pulseDot} />
          <span className={styles.modeMobileText}>Nấu riêng</span>
          <span className={styles.modeDesktopText}>Chế độ: Nấu riêng</span>
        </div>
      </div>
    </div>
  );
}
