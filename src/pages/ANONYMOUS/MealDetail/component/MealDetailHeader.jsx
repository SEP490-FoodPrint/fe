import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Typography } from "@mui/material";
import styles from "./MealDetailHeader.module.scss";

function MealDetailHeader({ weekTitle, dayOfWeek, formattedDate }) {
  // Ghép thông tin đã được page xác định để hiển thị tiêu đề.
  const displayTitle = useMemo(() => {
    const parts = [];
    if (weekTitle) parts.push(weekTitle);
    if (dayOfWeek) parts.push(dayOfWeek);
    const prefix = parts.length > 0 ? parts.join(" - ") : "";
    const dateStr = formattedDate ? ` (${formattedDate})` : "";
    return `Chi tiết thực đơn ${prefix ? `${prefix}${dateStr}` : "ngày"}`;
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
