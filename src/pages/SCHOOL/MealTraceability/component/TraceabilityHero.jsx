import React from "react";
import { School, MapPin, Sun, Sunset, CalendarDays, Layers } from "lucide-react";
import logo from "src/assets/images/logo.png";
import styles from "./TraceabilityHero.module.scss";

const formatMealDate = (d) => {
  const [y, m, day] = String(d || "").slice(0, 10).split("-");
  return day ? `${day}/${m}/${y}` : d || "—";
};

const weekdayOf = (d) => {
  const [y, m, day] = String(d || "").slice(0, 10).split("-").map(Number);
  if (!day) return "";
  const names = ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  return names[new Date(Date.UTC(y, m - 1, day)).getUTCDay()];
};

/** Giới thiệu chung: trường, khối, ngày và bữa. Không hiển thị số suất. */
export default function TraceabilityHero({ data }) {
  if (!data) return null;
  const school = data.school || {};
  const grade = data.grade || {};
  const meal = data.meal || {};
  const isAfternoon = meal.mealType === "AFTERNOON";
  const MealIcon = isAfternoon ? Sunset : Sun;
  const gradeName = grade.name || "Khối";

  return (
    <section className={styles.heroCard}>
      <div className={styles.topAccentBar} />

      <div className={styles.heroContent}>
        <div className={styles.leftContext}>
          <div className={styles.badgeGroup}>
            <span className={styles.pillPrimary}>
              <School size={14} /> {school.code || "—"}
            </span>
            <span className={styles.pillNeutral}>
              Thông tin chung cho mọi lớp trong khối
            </span>
          </div>

          <div>
            <h1 className={styles.schoolTitle}>{school.name || "—"}</h1>
            {school.address && (
              <p className={styles.schoolAddress}>
                <MapPin size={14} />
                {school.address}
              </p>
            )}
          </div>

          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <div className={styles.metricLabel}>Khối</div>
              <div className={`${styles.metricValue} ${styles.metricHighlight}`}>
                <Layers size={16} />
                {gradeName}
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricLabel}>Ngày phục vụ</div>
              <div className={styles.metricValue}>
                <CalendarDays size={16} color="var(--text-muted)" />
                <span>
                  {formatMealDate(meal.mealDate)}
                  {weekdayOf(meal.mealDate) && (
                    <span className={styles.metricSub}>
                      {" "}· {weekdayOf(meal.mealDate)}
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricLabel}>Bữa ăn</div>
              <div className={styles.metricValue}>
                <MealIcon size={16} color="var(--color-warning)" />
                {isAfternoon ? "Bữa xế" : "Bữa trưa"}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.rightBrandBox}>
          <img
            src={logo}
            alt="FoodPrint"
            className={styles.brandLogo}
            width={72}
            height={72}
          />
          <div>
            <p className={styles.qrLabel}>Truy xuất bởi FoodPrint</p>
            <p className={styles.qrSub}>
              {gradeName} · {formatMealDate(meal.mealDate)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
