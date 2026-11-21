import React from "react";
import { Chip } from "@mui/material";
import { Utensils } from "lucide-react";
import { formatAllocationDecimal } from "src/utils/allocationDecimal";
import styles from "./DishGroup.module.scss";

export default function DishGroup({ dish, children }) {
  const portions = Number.isInteger(Number(dish.totalRequiredPortions))
    ? Number(dish.totalRequiredPortions)
    : formatAllocationDecimal(dish.totalRequiredPortions);

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
            label={`${portions} suất`}
            sx={{ fontWeight: 600 }}
          />
        </div>

        <Chip
          size="small"
          variant="outlined"
          label={`${dish.batches?.length || 0} lô chế biến`}
          sx={{ fontWeight: 500 }}
        />
      </div>

      <div className={styles.batchesList}>{children}</div>
    </div>
  );
}
