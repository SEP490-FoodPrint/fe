import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { AlertTriangle, FlaskConical } from "lucide-react";
import {
  kitchenProgressAlerts,
  progressMenuLabel,
  PROGRESS_STATUS_TEXT,
} from "src/utils/kitchenProgress";
import styles from "./KitchenProgressStrip.module.scss";

const MEALS = [
  { type: "LUNCH", key: "lunch", label: "Bữa trưa", timeKey: "lunch" },
  { type: "AFTERNOON", key: "afternoon", label: "Bữa xế", timeKey: "afternoon" },
];

const STATUS_CLASS = {
  NOT_STARTED: "chipIdle",
  IN_PROGRESS: "chipCooking",
  COOKED_NO_SAMPLE: "chipSample",
  DONE: "chipDone",
};

/**
 * Dải tiến độ chế biến hôm nay của mọi khối, theo từng bữa, kèm cảnh báo theo giờ ăn.
 * Bấm chip để chuyển bảng sang đúng khối và bữa.
 */
export default function KitchenProgressStrip({ progress, mealTimes, selectedMeal, activeMenuId, onPick, now: fixedNow }) {
  const [tick, setTick] = useState(() => Date.now());
  useEffect(() => {
    if (fixedNow !== undefined) return undefined;
    const timer = setInterval(() => setTick(Date.now()), 60000);
    return () => clearInterval(timer);
  }, [fixedNow]);
  const now = fixedNow ?? tick;
  const menus = progress?.menus || [];
  if (!menus.some((menu) => menu.meals?.length)) return null;
  const alerts = kitchenProgressAlerts(progress, mealTimes, now);

  return (
    <section className={styles.strip} aria-label="Tiến độ chế biến các khối hôm nay">
      {alerts.length > 0 && (
        <ul className={styles.alerts}>
          {alerts.map((alert, index) => (
            <li key={`${alert.menuId}-${alert.mealType}-${alert.level}-${index}`} className={`${styles.alert} ${styles[alert.level]}`} role={alert.level === "danger" ? "alert" : "status"}>
              {alert.level === "sample" ? <FlaskConical size={15} aria-hidden="true" /> : <AlertTriangle size={15} aria-hidden="true" />}
              <span>{alert.text}</span>
            </li>
          ))}
        </ul>
      )}
      {MEALS.map((meal) => {
        const entries = menus.flatMap((menu) => {
          const found = menu.meals?.find((item) => item.mealType === meal.type);
          return found ? [{ menu, meal: found }] : [];
        });
        if (!entries.length) return null;
        const current = selectedMeal === meal.key;
        return (
          <div key={meal.type} className={`${styles.row} ${current ? styles.rowCurrent : styles.rowCompact}`}>
            <span className={styles.rowTitle}>
              {meal.label}
              {mealTimes?.[meal.timeKey] ? ` · ${mealTimes[meal.timeKey]}` : ""}
            </span>
            <div className={styles.chips}>
              {entries.map(({ menu, meal: item }) => {
                const finished = item.done + item.cookedNoSample;
                const statusText =
                  item.status === "IN_PROGRESS"
                    ? `${PROGRESS_STATUS_TEXT.IN_PROGRESS} ${finished}/${item.dishCount} món`
                    : PROGRESS_STATUS_TEXT[item.status];
                const active = current && activeMenuId === menu.menuId;
                return (
                  <button
                    key={menu.menuId}
                    type="button"
                    className={`${styles.chip} ${styles[STATUS_CLASS[item.status]]} ${active ? styles.chipActive : ""}`}
                    onClick={() => onPick?.(menu.menuId, menu.isSchoolWide ? "" : menu.grades?.[0]?.id || "", meal.key)}
                    title={`Xem ${progressMenuLabel(menu)} · ${meal.label}`}
                    aria-pressed={active}
                  >
                    <span className={styles.chipLabel}>{progressMenuLabel(menu)}</span>
                    <span className={styles.chipStatus}>{statusText}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </section>
  );
}

KitchenProgressStrip.propTypes = {
  progress: PropTypes.object,
  mealTimes: PropTypes.object,
  selectedMeal: PropTypes.string,
  activeMenuId: PropTypes.string,
  onPick: PropTypes.func,
  now: PropTypes.number,
};
