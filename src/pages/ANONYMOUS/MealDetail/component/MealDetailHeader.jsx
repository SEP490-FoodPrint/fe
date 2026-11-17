import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Typography } from "@mui/material";
import { getWeekLabel } from "src/utils/weeklyMenu";
import styles from "./MealDetailHeader.module.scss";

function MealDetailHeader({ weekTitle, dayOfWeek, formattedDate }) {
  // Cấu trúc tiêu đề: Chi tiết thực đơn [Thứ x] [(ngày tháng năm)] - [Tuần]
  // Ví dụ: Chi tiết thực đơn Thứ Hai (16/11/2026) - Tuần 11
  const displayTitle = useMemo(() => {
    const cleanWeek = weekTitle
      ? getWeekLabel({ title: weekTitle })
      : "";

    const dateStr = formattedDate ? `(${formattedDate})` : "";
    const dayWithDate = [dayOfWeek, dateStr].filter(Boolean).join(" ");

    const parts = [];
    if (dayWithDate) parts.push(dayWithDate);
    if (cleanWeek) parts.push(cleanWeek);

    const suffix = parts.length > 0 ? ` ${parts.join(" - ")}` : "";
    return `Chi tiết thực đơn${suffix}`;
  }, [weekTitle, dayOfWeek, formattedDate]);

  return (
    <section className={styles.headerWrapper}>
      <div className={styles.innerContainer}>
        <div className={styles.titleRow}>
          <Typography variant="h1" className={styles.mainTitle}>
            {displayTitle}
          </Typography>
        </div>
      </div>
    </section>
  );
}

MealDetailHeader.propTypes = {
  weekTitle: PropTypes.string,
  dayOfWeek: PropTypes.string,
  formattedDate: PropTypes.string,
};

MealDetailHeader.defaultProps = {
  weekTitle: "",
  dayOfWeek: "",
  formattedDate: "",
};

export default MealDetailHeader;
