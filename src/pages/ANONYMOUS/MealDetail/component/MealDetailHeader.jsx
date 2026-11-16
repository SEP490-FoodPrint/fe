import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Typography } from "@mui/material";
import { getWeekLabel } from "src/utils/weeklyMenu";
import styles from "./MealDetailHeader.module.scss";

function MealDetailHeader({
  weekTitle,
  dayOfWeek,
  formattedDate,
  gradeName,
  onOpenTraceModal,
}) {
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
          <div className={styles.titleCol}>
            <Typography variant="h1" className={styles.mainTitle}>
              {displayTitle}
            </Typography>
            {gradeName && (
              <h2 className={styles.gradeTitle}>
                Khối học: {gradeName}
              </h2>
            )}
            <p className={styles.subTitle}>
              Theo dõi chi tiết khẩu phần, định lượng nguyên liệu & truy xuất an toàn thực phẩm theo từng lớp học
            </p>
          </div>

          {onOpenTraceModal && (
            <button
              type="button"
              className={styles.traceBtn}
              onClick={onOpenTraceModal}
              title="Truy xuất nguồn gốc suất ăn theo lớp học"
            >
              <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
              <span>Truy xuất suất ăn</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

MealDetailHeader.propTypes = {
  weekTitle: PropTypes.string,
  dayOfWeek: PropTypes.string,
  formattedDate: PropTypes.string,
  gradeName: PropTypes.string,
  onOpenTraceModal: PropTypes.func,
};

MealDetailHeader.defaultProps = {
  weekTitle: "",
  dayOfWeek: "",
  formattedDate: "",
  gradeName: "",
  onOpenTraceModal: null,
};

export default MealDetailHeader;
