import React from "react";
import PropTypes from "prop-types";
import { Calendar, School } from "lucide-react";
import { Typography } from "@mui/material";
import styles from "./MealDetailHeader.module.scss";

function MealDetailHeader({ school, dateLabel, weekStartDate }) {
  const schoolName = school?.name || "Trường học";

  return (
    <section className={styles.headerWrapper}>
      <div className={styles.innerContainer}>
        {/* Title and Meta */}
        <div className={styles.titleRow}>
          <div className={styles.titleArea}>
            <div className={styles.schoolTag}>
              <School size={16} />
              <span>{schoolName}</span>
            </div>
            <Typography variant="h1" className={styles.mainTitle}>
              Chi tiết thực đơn ngày
            </Typography>
            <div className={styles.metaRow}>
              <span className={styles.dateHighlight}>{dateLabel}</span>
              {weekStartDate && (
                <>
                  <span className={styles.dividerDot}>•</span>
                  <div className={styles.weekBadge}>
                    <Calendar size={14} />
                    <span>Tuần bắt đầu: {weekStartDate}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

MealDetailHeader.propTypes = {
  school: PropTypes.shape({
    name: PropTypes.string,
    code: PropTypes.string,
  }),
  dateLabel: PropTypes.string,
  weekStartDate: PropTypes.string,
};

MealDetailHeader.defaultProps = {
  school: null,
  dateLabel: "Hôm nay",
  weekStartDate: "",
};

export default MealDetailHeader;
