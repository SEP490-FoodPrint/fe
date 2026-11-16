import React, { useState } from "react";
import { Chip, Collapse } from "@mui/material";
import { ChevronDown, GraduationCap } from "lucide-react";
import styles from "./GradeContainer.module.scss";

export default function GradeContainer({ grade, children, defaultExpanded = true }) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const totalClasses = grade.demands?.length || 0;
  const totalPortions = (grade.demands || []).reduce(
    (sum, d) => sum + (d.totalPortions || 0),
    0,
  );

  return (
    <section className={styles.gradeContainer} aria-label={grade.gradeName}>
      <header
        className={styles.header}
        onClick={() => setExpanded((prev) => !prev)}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded((prev) => !prev);
          }
        }}
      >
        <div className={styles.titleArea}>
          <span className={styles.iconBadge}>
            <GraduationCap size={18} aria-hidden="true" />
          </span>
          <h2 className={styles.gradeTitle}>{grade.gradeName}</h2>
          <div className={styles.metaChips}>
            <Chip
              size="small"
              variant="outlined"
              label={`${totalClasses} lớp`}
              sx={{ fontWeight: 500 }}
            />
            <Chip
              size="small"
              color="primary"
              label={`${totalPortions} suất`}
              sx={{ fontWeight: 600 }}
            />
          </div>
        </div>

        <span className={styles.chevron} data-expanded={expanded}>
          <ChevronDown size={20} />
        </span>
      </header>

      <Collapse in={expanded} unmountOnExit>
        <div className={styles.dishList}>{children}</div>
      </Collapse>
    </section>
  );
}
