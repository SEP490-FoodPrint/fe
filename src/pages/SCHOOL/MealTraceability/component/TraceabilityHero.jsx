import React from "react";
import { School, MapPin, Sun, CheckCircle } from "lucide-react";
import styles from "./TraceabilityHero.module.scss";

export default function TraceabilityHero({ data }) {
  if (!data) return null;

  const school = data?.school || {};
  const classInfo = data?.classInfo || {};
  const allocation = data?.allocation || {};

  const formatMealDate = (d) => {
    if (!d) return "16/11/2026";
    if (typeof d === "string" && d.includes("-")) {
      const parts = d.split("-");
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return String(d);
  };

  return (
    <section className={styles.heroCard}>
      <div className={styles.topAccentBar} />

      <div className={styles.heroContent}>
        {/* Left Side: School & Allocation Info */}
        <div className={styles.leftContext}>
          <div className={styles.badgeGroup}>
            <span className={styles.pillPrimary}>
              <School size={14} /> {school?.code || "TH-LVT-001"}
            </span>
            <span className={styles.pillNeutral}>
              Niên khóa: {classInfo?.academicYear || "2026 - 2027"}
            </span>
            <span className={styles.pillSuccess}>
              <CheckCircle size={14} />{" "}
              {allocation?.status === "DISTRIBUTED"
                ? "Đã phân phối hoàn tất"
                : allocation?.status || "Đã phân bổ"}
            </span>
          </div>

          <div>
            <h1 className={styles.schoolTitle}>
              {school?.name || "Trường Tiểu Học Lê Văn Tám"}
            </h1>
            <p className={styles.schoolAddress}>
              <MapPin size={14} />
              {school?.address ||
                "15 Đường Tân Mỹ, Phường Tân Phú, Quận 7, TP. Hồ Chí Minh"}
            </p>
          </div>

          {/* Metric Grid */}
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <div className={styles.metricLabel}>Lớp nhận suất</div>
              <div
                className={`${styles.metricValue} ${styles.metricHighlight}`}
              >
                {classInfo?.name || "Lớp 2A"}
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricLabel}>Ngày phục vụ</div>
              <div className={styles.metricValue}>
                {formatMealDate(allocation?.mealDate)}
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricLabel}>Bữa ăn</div>
              <div className={styles.metricValue}>
                <Sun size={16} color="var(--color-warning, #9b650a)" />
                {allocation?.mealType === "AFTERNOON" ? "Bữa xế" : "Bữa trưa"}
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricLabel}>Số suất ăn lớp</div>
              <div className={styles.metricValue}>
                {allocation?.totalPortions != null
                  ? allocation.totalPortions
                  : 35}{" "}
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "normal",
                    color: "var(--text-muted)",
                  }}
                >
                  suất
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: QR Code Trace Badge */}
        <div className={styles.rightQrBox}>
          <div className={styles.qrWrapper}>
            <svg
              className={styles.qrSvg}
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="100" height="100" fill="white" />
              <rect
                x="6"
                y="6"
                width="28"
                height="28"
                rx="4"
                fill="var(--color-primary, #0A8066)"
              />
              <rect x="10" y="10" width="20" height="20" rx="2" fill="white" />
              <rect
                x="14"
                y="14"
                width="12"
                height="12"
                rx="1"
                fill="var(--color-primary, #0A8066)"
              />
              <rect
                x="66"
                y="6"
                width="28"
                height="28"
                rx="4"
                fill="var(--color-primary, #0A8066)"
              />
              <rect x="70" y="10" width="20" height="20" rx="2" fill="white" />
              <rect
                x="74"
                y="14"
                width="12"
                height="12"
                rx="1"
                fill="var(--color-primary, #0A8066)"
              />
              <rect
                x="6"
                y="66"
                width="28"
                height="28"
                rx="4"
                fill="var(--color-primary, #0A8066)"
              />
              <rect x="10" y="70" width="20" height="20" rx="2" fill="white" />
              <rect
                x="14"
                y="74"
                width="12"
                height="12"
                rx="1"
                fill="var(--color-primary, #0A8066)"
              />
              <rect x="38" y="8" width="6" height="6" fill="#24312D" />
              <rect x="48" y="12" width="8" height="6" fill="#24312D" />
              <rect x="40" y="24" width="12" height="6" fill="#24312D" />
              <rect x="10" y="40" width="8" height="8" fill="#24312D" />
              <rect x="24" y="44" width="6" height="8" fill="#24312D" />
              <rect
                x="38"
                y="38"
                width="8"
                height="8"
                fill="var(--color-primary, #0A8066)"
              />
              <rect x="52" y="42" width="6" height="6" fill="#24312D" />
              <rect x="66" y="38" width="10" height="6" fill="#24312D" />
              <rect x="80" y="46" width="12" height="6" fill="#24312D" />
              <rect x="42" y="56" width="14" height="6" fill="#24312D" />
              <rect x="60" y="56" width="8" height="12" fill="#24312D" />
              <rect
                x="76"
                y="66"
                width="8"
                height="8"
                fill="var(--color-primary, #0A8066)"
              />
              <rect x="38" y="72" width="16" height="6" fill="#24312D" />
              <rect x="68" y="80" width="8" height="10" fill="#24312D" />
              <rect x="44" y="84" width="12" height="6" fill="#24312D" />
            </svg>
          </div>
          <div>
            <p className={styles.qrLabel}>QR Tra cứu suất ăn</p>
            <p className={styles.qrSub}>
              {classInfo.name} · {formatMealDate(allocation.mealDate)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
