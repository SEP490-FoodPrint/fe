import React, { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import KitchenService from "src/services/KitchenService";
import styles from "./BatchPlanModal.module.scss";

export default function BatchPlanModal({ open, onClose, dish, onConfirm, submitting = false }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!open || !dish) return;
    const controller = new AbortController();
    setPlan(null);
    setError("");
    setLoading(true);
    KitchenService.getBatchPlan({ menuDayId: dish.menuDayId, mealType: String(dish.mealType).toUpperCase() }, { signal: controller.signal })
      .then((data) => { if (!controller.signal.aborted) setPlan(data); })
      .catch((err) => { if (!controller.signal.aborted) setError(err.message || "Không thể tải phương án."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [open, dish, revision]);
  const confirm = async () => {
    try {
      await onConfirm?.({ ...dish, planVersion: plan.planVersion });
    } catch (err) {
      setError(err.message || "Không thể tạo lô. Vui lòng xem lại phương án.");
      setPlan(null);
    }
  };
  return <Dialog open={Boolean(open)} onClose={submitting ? undefined : onClose} fullWidth maxWidth="md" aria-labelledby="batch-plan-title">
    <DialogTitle id="batch-plan-title">Phương án phân lô chế biến</DialogTitle>
    <DialogContent dividers>
      <p>Phương án cho toàn bộ {String(dish?.mealType).toUpperCase() === "AFTERNOON" ? "bữa xế" : "bữa trưa"}. Xác nhận tạo lô sẽ chuyển các mẻ sang đang nấu.</p>
      {loading && <p role="status">Đang tính phương án từ tồn kho...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !plan && <button type="button" onClick={() => setRevision((n) => n + 1)}>Tải lại phương án</button>}
      {plan?.batches?.length === 0 && <p>Bữa này đã được lập đủ mẻ. Vui lòng tải lại tiến độ.</p>}
      {plan?.batches?.map((batch, index) => <section key={index}>
        <h3>Mẻ {index + 1} · {batch.plannedPortions} suất</h3>
        {batch.dishes.map((row) => <div key={row.dishId}>
          <h4>{row.name} · {row.plannedPortions} suất</h4>
          <table style={{ width: "100%", textAlign: "left", marginBottom: 16 }}><thead><tr><th>Nguyên liệu</th><th>Lô nguồn</th><th>Lượng dùng</th></tr></thead>
            <tbody>{row.lots.map((lot) => <tr key={lot.ingredientLotId}><td>{lot.ingredientName || "Nguyên liệu"}</td><td>{lot.lotCode || lot.ingredientLotId}</td><td>{lot.quantityUsed} {lot.unit}</td></tr>)}</tbody></table>
        </div>)}
      </section>)}
      {plan?.seasonings?.length > 0 && <section><h3>Gia vị dùng chung cho cả bữa</h3><ul>{plan.seasonings.map((lot) => <li key={lot.ingredientLotId}>{lot.ingredientName || "Gia vị"} · {lot.lotCode || lot.ingredientLotId}: {lot.quantityUsed} {lot.unit}</li>)}</ul></section>}
    </DialogContent>
    <DialogActions>
      <button className={styles.cancelBtn} type="button" onClick={onClose} disabled={submitting}>Đóng</button>
      <button className={styles.confirmBtn} type="button" disabled={submitting || loading || !plan?.batches?.length} onClick={confirm}>{submitting ? "Đang tạo lô..." : `Xác nhận tạo ${plan?.batches?.length || 0} mẻ`}</button>
    </DialogActions>
  </Dialog>;
}
