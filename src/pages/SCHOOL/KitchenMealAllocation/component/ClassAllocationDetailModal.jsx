import React from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { Layers, X } from "lucide-react";
import styles from "./ClassAllocationDetailModal.module.scss";

export default function ClassAllocationDetailModal({ open, onClose, classData }) {
  if (!classData) return null;

  const { className, totalPortions, mealLabel, dishes = [] } = classData;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { className: styles.paper } }}
      aria-labelledby="class-allocation-detail-title"
    >
      <DialogTitle component="div" className={styles.header}>
        <div className={styles.titleArea}>
          <h2 id="class-allocation-detail-title">Chi tiết phân bổ lô — {className}</h2>
          <p>
            {mealLabel || "Bữa trưa"} · Tổng nhu cầu: <strong>{totalPortions} suất</strong>
          </p>
        </div>
        <IconButton
          aria-label="Đóng modal chi tiết"
          onClick={onClose}
          sx={{ minWidth: 44, minHeight: 44 }}
        >
          <X size={18} />
        </IconButton>
      </DialogTitle>

      <DialogContent className={styles.content}>
        {dishes.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
            Chưa có thông tin phân bổ chi tiết cho lớp này.
          </p>
        ) : (
          dishes.map((dish) => (
            <div key={dish.dishId || dish.dishName} className={styles.dishItem}>
              <div className={styles.dishHeader}>
                <strong>{dish.dishName}</strong>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
                  Tổng nhận: <b>{dish.allocatedPortions}</b> / {totalPortions} suất
                </span>
              </div>

              <div className={styles.batchesList}>
                {(dish.batches || []).length > 0 ? (
                  (dish.batches || []).map((b, idx) => (
                    <div key={idx} className={styles.batchBadge}>
                      <Layers size={13} color="var(--color-primary)" />
                      <span>{b.batchCode || b.batchName || `Lô ${idx + 1}`}:</span>
                      <b>{b.allocatedPortions} suất</b>
                    </div>
                  ))
                ) : (
                  <span style={{ color: "var(--color-warning, #d97706)", fontSize: "var(--text-xs)" }}>
                    Chưa được phân bổ lô cho món này
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </DialogContent>

      <DialogActions className={styles.footer}>
        <Button
          variant="contained"
          onClick={onClose}
          className={styles.closeButton}
        >
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}
