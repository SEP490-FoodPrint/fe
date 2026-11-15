import React from "react";
import { Chip } from "@mui/material";
import { Sparkles, Utensils } from "lucide-react";
import styles from "./DishGroup.module.scss";

export default function DishGroup({ dish, children }) {
  const isAuto = Boolean(dish.autoAssigned);

  return (
    <div className={styles.dishGroup} aria-label={`Món ${dish.dishName}`}>
      <div className={styles.header}>
        <div className={styles.dishInfo}>
          <span className={styles.dishIcon}>
            <Utensils size={15} aria-hidden="true" />
          </span>
          <h3 className={styles.dishName}>{dish.dishName}</h3>
          <Chip
            size="small"
            variant="outlined"
            label={`${dish.totalRequiredPortions} suất`}
            sx={{ fontWeight: 600 }}
          />
        </div>

        {isAuto ? (
          <Chip
            size="small"
            color="success"
            icon={<Sparkles size={14} />}
            label="Đã phân bổ"
            sx={{ fontWeight: 500 }}
          />
        ) : (
          <Chip
            size="small"
            color="warning"
            variant="outlined"
            label={`${dish.batches?.length || 0} lô chế biến`}
            sx={{ fontWeight: 500 }}
          />
        )}
      </div>

      <div className={styles.batchesList}>{children}</div>
    </div>
  );
}
